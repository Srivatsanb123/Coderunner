package utils

import (
	"fmt"
	"os"
	"regexp"
)

func ExtractJavaClassName(code string) string {
	re := regexp.MustCompile(`(?m)public\s+class\s+(\w+)`)
	match := re.FindStringSubmatch(code)
	if len(match) >= 2 {
		return match[1]
	}
	return ""
}

func Cleanup(jobDir string) {
	_ = os.RemoveAll(jobDir)
}

func ValidateCode(lang, code string) error {
	var restrictedImports []string
	switch lang {
	case "Python":
		restrictedImports = []string{"os", "sys", "subprocess", "socket", "shutil", "ctypes", "multiprocessing", "threading"}
	case "JavaScript":
		restrictedImports = []string{"fs", "child_process", "os", "net", "http", "https", "dgram", "dns", "tls", "repl", "vm", "worker_threads"}
	case "Go":
		restrictedImports = []string{"os", "os/exec", "syscall", "net", "net/http", "unsafe"}
	case "Java":
		restrictedImports = []string{"java.io", "java.net", "java.lang.reflect", "java.lang.Runtime", "java.lang.System", "java.lang.ProcessBuilder", "java.lang.Thread"}
	case "C", "C++":
		restrictedImports = []string{"<sys/types.h>", "<sys/socket.h>", "<netdb.h>", "<arpa/inet.h>", "<netinet/in.h>", "<unistd.h>", "<stdio.h>", "<stdlib.h>", "<process.h>", "<windows.h>", "<winsock2.h>", "<ws2tcpip.h>"}
	}

	for _, imp := range restrictedImports {
		if regexp.MustCompile(`(?m)` + regexp.QuoteMeta(imp)).MatchString(code) {
			return fmt.Errorf("import of '%s' is not allowed", imp)
		}
	}

	return nil
}