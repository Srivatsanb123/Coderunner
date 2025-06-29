package main

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
)

const (
	baseDir        = "jobs"
	execTimeout    = 10 * time.Second
	compileTimeout = 10 * time.Second
)

var (
	execExt = func() string {
		if os.PathSeparator == '\\' {
			return ".exe"
		}
		return ""
	}()
	pythonCmd = func() string {
		if os.PathSeparator == '\\' {
			return "python"
		}
		return "python3"
	}()
	secretKey string
)

type requestData struct {
	Code     string   `json:"code"`
	Language string   `json:"language"`
	Inputs   []string `json:"inputs"`
	Key      string   `json:"key"`
}

type responseData struct {
	JobID   string   `json:"job_id,omitempty"`
	Status  string   `json:"status"`
	Outputs []string `json:"outputs,omitempty"`
	Message string   `json:"message,omitempty"`
}

func main() {
	_ = godotenv.Load()
	secretKey = os.Getenv("KEY")

	if err := os.MkdirAll(baseDir, 0755); err != nil {
		panic(err)
	}

	r := gin.Default()
	r.Use(cors.Default())
	r.POST("/", handler)

	if err := r.Run(":5000"); err != nil {
		panic(err)
	}
}

func handler(c *gin.Context) {
	var req requestData
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(200, errorResp("Invalid JSON"))
		return
	}
	if req.Key != secretKey {
		c.JSON(200, errorResp("Invalid secret key"))
		return
	}

	jobID := uuid.New().String()
	filePath, jobDir, err := prepareFile(req.Language, req.Code, jobID)
	if err != nil {
		c.JSON(200, errorResp(err.Error()))
		return
	}
	defer cleanup(jobDir)

	var outputs []string
	for _, in := range req.Inputs {
		out := executeCode(req.Language, filePath, in, jobDir)
		outputs = append(outputs, out)
	}

	c.JSON(200, responseData{
		JobID:   jobID,
		Status:  "completed",
		Outputs: outputs,
	})
}

func prepareFile(lang, code, jobID string) (string, string, error) {
	supported := map[string]bool{"Python": true, "C": true, "C++": true, "Java": true, "JavaScript": true, "Go": true}
	if !supported[lang] {
		return "", "", errors.New("unsupported language")
	}
	if err := validateCode(lang, code); err != nil {
		return "", "", err
	}

	jobDir := filepath.Join(baseDir, jobID)
	if err := os.MkdirAll(jobDir, 0755); err != nil {
		return "", "", err
	}

	var file string
	var args []string

	switch lang {
	case "Python":
		file = filepath.Join(jobDir, "program.py")
	case "C":
		file = filepath.Join(jobDir, "program.c")
		args = []string{"gcc", file, "-o", filepath.Join(jobDir, "program"+execExt)}
	case "C++":
		file = filepath.Join(jobDir, "program.cpp")
		args = []string{"g++", file, "-o", filepath.Join(jobDir, "program"+execExt)}
	case "Java":
		classRe := regexp.MustCompile(`(?m)public\s+class\s+(\w+)`)
		match := classRe.FindStringSubmatch(code)
		if len(match) < 2 {
			return "", "", errors.New("no public class found in Java code")
		}
		file = filepath.Join(jobDir, match[1]+".java")
		args = []string{"javac", file}
	case "JavaScript":
		file = filepath.Join(jobDir, "program.js")
	case "Go":
		file = filepath.Join(jobDir, "program.go")
		args = []string{"go", "build", "-o", filepath.Join(jobDir, "program"+execExt), file}
	}

	if err := os.WriteFile(file, []byte(code), 0644); err != nil {
		return "", "", err
	}

	if len(args) > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), compileTimeout)
		defer cancel()
		cmd := exec.CommandContext(ctx, args[0], args[1:]...)
		if out, err := cmd.CombinedOutput(); err != nil {
			return "", "", fmt.Errorf("compile error: %s", string(out))
		}
	}

	return file, jobDir, nil
}

func executeCode(lang, file, input, jobDir string) string {
	ctx, cancel := context.WithTimeout(context.Background(), execTimeout)
	defer cancel()

	var cmd *exec.Cmd
	switch lang {
	case "Python":
		cmd = exec.CommandContext(ctx, pythonCmd, file)
	case "C", "C++", "Go":
		cmd = exec.CommandContext(ctx, filepath.Join(jobDir, "program"+execExt))
	case "Java":
		className := strings.TrimSuffix(filepath.Base(file), ".java")
		cmd = exec.CommandContext(ctx, "java", "-cp", jobDir, className)
	case "JavaScript":
		cmd = exec.CommandContext(ctx, "node", file)
	default:
		return "Error: unsupported language\n"
	}

	if input != "" {
		cmd.Stdin = bytes.NewBufferString(input)
	}
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &out

	if err := cmd.Run(); err != nil {
		if ctx.Err() == context.DeadlineExceeded {
			return "Error: Code execution timed out\n"
		}
		return out.String() + err.Error() + "\n"
	}
	return out.String()
}

func cleanup(jobDir string) {
	_ = os.RemoveAll(jobDir)
}

func errorResp(msg string) responseData {
	return responseData{Status: "error", Message: msg}
}

func validateCode(lang, code string) error {
	return nil
}
