package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"main/pkg/config"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	gin.SetMode(gin.TestMode)
	config.LoadConfig()
	// Set a default secret key for testing if not loaded from .env
	if config.SecretKey == "" {
		config.SecretKey = "test-secret-key"
	}

	r := gin.Default()
	r.POST("/", Handler)

	// Create a string for code that is too large
	longCode := strings.Repeat("a", config.MaxCodeSize+1)

	// Create a slice of strings for too many inputs
	manyInputs := make([]string, config.MaxInputs+1)
	for i := range manyInputs {
		manyInputs[i] = "input"
	}
	manyInputsJson, _ := json.Marshal(manyInputs)

	tests := []struct {
		name           string
		body           string
		wantStatusCode int
		wantBody       string
	}{
		{
			name:           "Valid request",
			body:           `{"code": "print(\"Hello, World!\")", "language": "Python", "inputs": [""], "key": "` + config.SecretKey + `"}`,
			wantStatusCode: http.StatusOK,
			wantBody:       `{"status":"success","outputs":["Hello, World!"]}`,
		},
		{
			name:           "Invalid JSON",
			body:           `{"key": "` + config.SecretKey + `", "code": "print()",,}`, // Malformed JSON
			wantStatusCode: http.StatusBadRequest,
			wantBody:       `{"status":"error","message":"Invalid JSON"}`,
		},
		{
			name:           "Invalid secret key",
			body:           `{"code": "print()", "language": "Python", "key": "invalid-key"}`,
			wantStatusCode: http.StatusForbidden,
			wantBody:       `{"status":"error","message":"Invalid secret key"}`,
		},
		{
			name:           "Unsupported language",
			body:           `{"code": "print()", "language": "Rust", "key": "` + config.SecretKey + `"}`,
			wantStatusCode: http.StatusBadRequest,
			wantBody:       `{"status":"error","message":"Unsupported language"}`,
		},
		{
			name:           "Code too large",
			body:           `{"code": "` + longCode + `", "language": "Python", "key": "` + config.SecretKey + `"}`,
			wantStatusCode: http.StatusBadRequest,
			wantBody:       `{"status":"error","message":"Code too large"}`,
		},
		{
			name:           "Too many inputs",
			body:           `{"code": "print()", "language": "Python", "inputs": ` + string(manyInputsJson) + `, "key": "` + config.SecretKey + `"}`,
			wantStatusCode: http.StatusBadRequest,
			wantBody:       `{"status":"error","message":"Too many inputs"}`,
		},
		{
			name:           "Restricted import",
			body:           `{"code": "import os", "language": "Python", "key": "` + config.SecretKey + `"}`,
			wantStatusCode: http.StatusOK,
			wantBody:       `{"status":"success","outputs":["import of 'os' is not allowed"]}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req, _ := http.NewRequest(http.MethodPost, "/", bytes.NewBufferString(tt.body))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			r.ServeHTTP(w, req)

			assert.Equal(t, tt.wantStatusCode, w.Code)
			assert.JSONEq(t, tt.wantBody, w.Body.String())
		})
	}
}