package models

type RequestData struct {
	Code     string   `json:"code"`
	Language string   `json:"language"`
	Inputs   []string `json:"inputs"`
	Key      string   `json:"key"`
}

type ResponseSuccess struct {
	Status  string   `json:"status"`
	Outputs []string `json:"outputs"`
}

type ResponseError struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}