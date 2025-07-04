package main

import (
	"bytes"
	"context"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
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
	maxCodeSize    = 10000
	maxInputs      = 20
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

type responseSuccess struct {
	Status  string   `json:"status"`
	Outputs []string `json:"outputs"`
}

type responseError struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}
	secretKey = os.Getenv("KEY")
	os.MkdirAll(baseDir, 0755)
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
		c.JSON(400, responseError{Status: "error", Message: "Invalid JSON"})
		return
	}
	if req.Key != secretKey {
		c.JSON(403, responseError{Status: "error", Message: "Invalid secret key"})
		return
	}
	if len(req.Code) > maxCodeSize {
		c.JSON(400, responseError{Status: "error", Message: "Code too large"})
		return
	}
	if len(req.Inputs) > maxInputs {
		c.JSON(400, responseError{Status: "error", Message: "Too many inputs"})
		return
	}

	jobID := uuid.New().String()
	supported := map[string]bool{"Python": true, "C": true, "C++": true, "Java": true, "JavaScript": true, "Go": true}
	if !supported[req.Language] {
		c.JSON(400, responseError{Status: "error", Message: "Unsupported language"})
		return
	}
	if err := validateCode(req.Language, req.Code); err != nil {
		c.JSON(400, responseError{Status: "error", Message: err.Error()})
		return
	}

	jobDir := filepath.Join(baseDir, jobID)
	defer cleanup(jobDir)
	if err := os.MkdirAll(jobDir, 0755); err != nil {
		c.JSON(500, responseError{Status: "error", Message: err.Error()})
		return
	}

	var filePath string
	var compileArgs []string
	switch req.Language {
	case "Python":
		filePath = filepath.Join(jobDir, "program.py")
	case "C":
		filePath = filepath.Join(jobDir, "program.c")
		compileArgs = []string{"gcc", "-Wall", filePath, "-o", filepath.Join(jobDir, "program"+execExt)}
	case "C++":
		filePath = filepath.Join(jobDir, "program.cpp")
		compileArgs = []string{"g++", "-Wall", filePath, "-o", filepath.Join(jobDir, "program"+execExt)}
	case "Java":
		className := extractJavaClassName(req.Code)
		className = filepath.Base(className)
		if className == "" {
			c.JSON(400, responseError{Status: "error", Message: "No public class found in Java code"})
			return
		}
		filePath = filepath.Join(jobDir, className+".java")
		compileArgs = []string{"javac", filePath}
	case "JavaScript":
		filePath = filepath.Join(jobDir, "program.js")
	case "Go":
		filePath = filepath.Join(jobDir, "program.go")
		compileArgs = []string{"go", "build", "-o", filepath.Join(jobDir, "program"+execExt), filePath}
	}

	if err := os.WriteFile(filePath, []byte(req.Code), 0644); err != nil {
		c.JSON(500, responseError{Status: "error", Message: err.Error()})
		return
	}

	var compileMsg string
	if len(compileArgs) > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), compileTimeout)
		defer cancel()
		cmd := exec.CommandContext(ctx, compileArgs[0], compileArgs[1:]...)
		var buf bytes.Buffer
		cmd.Stdout = &buf
		cmd.Stderr = &buf
		err := cmd.Run()
		compileMsg = strings.TrimSpace(buf.String())
		if err != nil {
			msg := compileMsg
			if msg == "" {
				msg = err.Error()
			} else {
				msg += "\n" + err.Error()
			}
			c.JSON(200, responseSuccess{Status: "success", Outputs: []string{msg}})
			return
		}
	}

	var (
		wg      sync.WaitGroup
		outputs = make([]string, len(req.Inputs))
	)

	for i, input := range req.Inputs {
		wg.Add(1)
		go func(i int, input string, compileMsg string) {
			defer wg.Done()
			ctx, cancel := context.WithTimeout(context.Background(), execTimeout)
			defer cancel()
			var cmd *exec.Cmd
			switch req.Language {
			case "Python":
				cmd = exec.CommandContext(ctx, pythonCmd, filePath)
			case "C", "C++", "Go":
				cmd = exec.CommandContext(ctx, filepath.Join(jobDir, "program"+execExt))
			case "Java":
				className := strings.TrimSuffix(filepath.Base(filePath), ".java")
				cmd = exec.CommandContext(ctx, "java", "-cp", jobDir, className)
			case "JavaScript":
				cmd = exec.CommandContext(ctx, "node", filePath)
			}
			if input != "" {
				cmd.Stdin = bytes.NewBufferString(input)
			}
			var out bytes.Buffer
			cmd.Stdout = &out
			cmd.Stderr = &out
			err := cmd.Run()
			var result string
			if ctx.Err() == context.DeadlineExceeded {
				result = "Error: Code execution timed out"
			} else if err != nil {
				if out.Len() > 0 {
					result = out.String() + "\n" + err.Error()
				} else {
					result = err.Error()
				}
			} else {
				result = out.String()
			}
			outputs[i] = strings.TrimSpace(result)
		}(i, input, compileMsg)
	}

	wg.Wait()
	c.JSON(200, responseSuccess{Status: "success", Outputs: outputs})
}

func extractJavaClassName(code string) string {
	re := regexp.MustCompile(`(?m)public\s+class\s+(\w+)`)
	match := re.FindStringSubmatch(code)
	if len(match) >= 2 {
		return match[1]
	}
	return ""
}

func cleanup(jobDir string) {
	_ = os.RemoveAll(jobDir)
}

func validateCode(lang, code string) error {
	return nil
}
