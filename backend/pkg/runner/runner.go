package runner

import (
	"bytes"
	"context"
	"main/pkg/config"
	"main/pkg/utils"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/google/uuid"
)

func Execute(lang, code string, inputs []string) ([]string, error) {
	jobID := uuid.New().String()
	jobDir := filepath.Join(config.BaseDir, jobID)
	defer utils.Cleanup(jobDir)

	if err := os.MkdirAll(jobDir, 0755); err != nil {
		return nil, err
	}

	var filePath string
	var compileArgs []string
	switch lang {
	case "Python":
		filePath = filepath.Join(jobDir, "program.py")
	case "C":
		filePath = filepath.Join(jobDir, "program.c")
		compileArgs = []string{"gcc", "-Wall", filePath, "-o", filepath.Join(jobDir, "program"+config.ExecExt)}
	case "C++":
		filePath = filepath.Join(jobDir, "program.cpp")
		compileArgs = []string{"g++", "-Wall", filePath, "-o", filepath.Join(jobDir, "program"+config.ExecExt)}
	case "Java":
		className := utils.ExtractJavaClassName(code)
		className = filepath.Base(className)
		if className == "" {
			return nil, os.ErrNotExist
		}
		filePath = filepath.Join(jobDir, className+".java")
		compileArgs = []string{"javac", filePath}
	case "JavaScript":
		filePath = filepath.Join(jobDir, "program.js")
	case "Go":
		filePath = filepath.Join(jobDir, "program.go")
		compileArgs = []string{"go", "build", "-o", filepath.Join(jobDir, "program"+config.ExecExt), filePath}
	}

	if err := os.WriteFile(filePath, []byte(code), 0644); err != nil {
		return nil, err
	}

	var compileMsg string
	if len(compileArgs) > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), config.CompileTimeout)
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
			return []string{msg}, nil
		}
	}

	var (
		wg      sync.WaitGroup
		outputs = make([]string, len(inputs))
	)

	for i, input := range inputs {
		wg.Add(1)
		go func(i int, input string, compileMsg string) {
			defer wg.Done()
			ctx, cancel := context.WithTimeout(context.Background(), config.ExecTimeout)
			defer cancel()
			var cmd *exec.Cmd
			switch lang {
			case "Python":
				cmd = exec.CommandContext(ctx, config.PythonCmd, filePath)
			case "C", "C++", "Go":
				cmd = exec.CommandContext(ctx, filepath.Join(jobDir, "program"+config.ExecExt))
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
	return outputs, nil
}
