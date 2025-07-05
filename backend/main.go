package main

import (
	"main/pkg/api"
	"main/pkg/config"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadConfig()
	os.MkdirAll(config.BaseDir, 0755)
	r := gin.Default()
	r.Use(cors.Default())
	r.POST("/", api.Handler)
	if err := r.Run(":5000"); err != nil {
		panic(err)
	}
}