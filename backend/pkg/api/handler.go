package api

import (
	"main/pkg/config"
	"main/pkg/models"
	"main/pkg/runner"
	"main/pkg/utils"

	"github.com/gin-gonic/gin"
)

func Handler(c *gin.Context) {
	var req models.RequestData
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, models.ResponseError{Status: "error", Message: "Invalid JSON"})
		return
	}
	if req.Key != config.SecretKey {
		c.JSON(403, models.ResponseError{Status: "error", Message: "Invalid secret key"})
		return
	}
	if len(req.Code) > config.MaxCodeSize {
		c.JSON(400, models.ResponseError{Status: "error", Message: "Code too large"})
		return
	}
	if len(req.Inputs) > config.MaxInputs {
		c.JSON(400, models.ResponseError{Status: "error", Message: "Too many inputs"})
		return
	}

	supported := map[string]bool{"Python": true, "C": true, "C++": true, "Java": true, "JavaScript": true, "Go": true}
	if !supported[req.Language] {
		c.JSON(400, models.ResponseError{Status: "error", Message: "Unsupported language"})
		return
	}
	if err := utils.ValidateCode(req.Language, req.Code); err != nil {
		c.JSON(200, models.ResponseSuccess{Status: "success", Outputs: []string{err.Error()}})
		return
	}

	outputs, err := runner.Execute(req.Language, req.Code, req.Inputs)
	if err != nil {
		c.JSON(500, models.ResponseError{Status: "error", Message: err.Error()})
		return
	}

	c.JSON(200, models.ResponseSuccess{Status: "success", Outputs: outputs})
}