package utils

import (
	"testing"
)

func TestExtractJavaClassName(t *testing.T) {
	tests := []struct {
		name string
		code string
		want string
	}{
		{
			name: "Valid class",
			code: `public class HelloWorld { public static void main(String[] args) { System.out.println("Hello, World!"); } }`,
			want: "HelloWorld",
		},
		{
			name: "No public class",
			code: `class HelloWorld { public static void main(String[] args) { System.out.println("Hello, World!"); } }`,
			want: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ExtractJavaClassName(tt.code); got != tt.want {
				t.Errorf("ExtractJavaClassName() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestValidateCode(t *testing.T) {
	tests := []struct {
		name    string
		lang    string
		code    string
		wantErr bool
	}{
		{
			name:    "Python - valid",
			lang:    "Python",
			code:    `import math\nprint(math.pi)`,
			wantErr: false,
		},
		{
			name:    "Python - restricted",
			lang:    "Python",
			code:    `import os\nprint(os.getcwd())`,
			wantErr: true,
		},
		{
			name:    "JavaScript - valid",
			lang:    "JavaScript",
			code:    `console.log("Hello, World!")`,
			wantErr: false,
		},
		{
			name:    "JavaScript - restricted",
			lang:    "JavaScript",
			code:    `const fs = require('fs');`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := ValidateCode(tt.lang, tt.code); (err != nil) != tt.wantErr {
				t.Errorf("ValidateCode() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
