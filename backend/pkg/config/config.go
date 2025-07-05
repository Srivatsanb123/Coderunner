package config

import (
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
)

const (
	BaseDir        = "jobs"
	ExecTimeout    = 10 * time.Second
	CompileTimeout = 10 * time.Second
	MaxCodeSize    = 10000
	MaxInputs      = 20
)

var (
	ExecExt = func() string {
		if os.PathSeparator == '\\' {
			return ".exe"
		}
		return ""
	}()

	PythonCmd = func() string {
		if os.PathSeparator == '\\' {
			return "python"
		}
		return "python3"
	}()

	SecretKey string
)

func LoadConfig() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}
	SecretKey = os.Getenv("KEY")
}