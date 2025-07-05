package runner

import (
	"testing"
)

func TestExecute(t *testing.T) {
	tests := []struct {
		name     string
		lang     string
		code     string
		inputs   []string
		want     []string
		wantErr  bool
	}{
		{
			name:     "Python - hello world",
			lang:     "Python",
			code:     `print("Hello, World!")`,
			inputs:   []string{""},
			want:     []string{"Hello, World!"},
			wantErr:  false,
		},
		{
			name:     "Python - with input",
			lang:     "Python",
			code:     `x = input()
print(f"Hello, {x}!")`,
			inputs:   []string{"Gemini"},
			want:     []string{"Hello, Gemini!"},
			wantErr:  false,
		},
		{
			name:     "C - hello world",
			lang:     "C",
			code:     `#include <stdio.h>
int main() { printf("Hello, World!\n"); return 0; }`,
			inputs:   []string{""},
			want:     []string{"Hello, World!"},
			wantErr:  false,
		},
		{
			name:     "C++ - hello world",
			lang:     "C++",
			code:     `#include <iostream>
int main() { std::cout << "Hello, World!" << std::endl; return 0; }`,
			inputs:   []string{""},
			want:     []string{"Hello, World!"},
			wantErr:  false,
		},
		{
			name:     "Java - hello world",
			lang:     "Java",
			code:     `public class HelloWorld { public static void main(String[] args) { System.out.println("Hello, World!"); } }`,
			inputs:   []string{""},
			want:     []string{"Hello, World!"},
			wantErr:  false,
		},
		{
			name:     "JavaScript - hello world",
			lang:     "JavaScript",
			code:     `console.log("Hello, World!")`,
			inputs:   []string{""},
			want:     []string{"Hello, World!"},
			wantErr:  false,
		},
		{
			name:     "Go - hello world",
			lang:     "Go",
			code:     `package main
import "fmt"
func main() { fmt.Println("Hello, World!") }`,
			inputs:   []string{""},
			want:     []string{"Hello, World!"},
			wantErr:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Execute(tt.lang, tt.code, tt.inputs)
			if (err != nil) != tt.wantErr {
				t.Errorf("Execute() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if len(got) != len(tt.want) {
				t.Errorf("Execute() got = %v, want %v", got, tt.want)
				return
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("Execute() got = %v, want %v", got, tt.want)
				}
			}
		})
	}
}
