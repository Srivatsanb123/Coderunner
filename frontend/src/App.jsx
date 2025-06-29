import React, { useState, useEffect } from "react";
import axios from "axios";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/ext-searchbox";

const languageOptions = [
  { value: "python", label: "Python", mode: "python", apiValue: "Python" },
  { value: "javascript", label: "JavaScript", mode: "javascript", apiValue: "JavaScript" },
  { value: "java", label: "Java", mode: "java", apiValue: "Java" },
  { value: "c", label: "C", mode: "c_cpp", apiValue: "C" },
  { value: "cpp", label: "C++", mode: "c_cpp", apiValue: "C++" },
  { value: "go", label: "Go", mode: "golang", apiValue: "Go" },
];

const lightThemeStyles = `body { background-color: #F9F9F9; }`;
const darkThemeStyles = `body.dark { background-color: #1E1E1E; }`;

export default function CodeRunner() {
  const [userCode, setUserCode] = useState("");
  const [userLang, setUserLang] = useState(languageOptions[0]);
  const [isDarkmode, setIsDarkmode] = useState(true);
  const [userInput, setUserInput] = useState([""]);
  const [userOutput, setUserOutput] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editorWidth, setEditorWidth] = useState("60%");

  const editorOptions = {
    autoScrollEditorIntoView: true,
    copyWithEmptySelection: true,
    fontSize: 16,
  };

  const handleDrag = (clientX) => {
    document.body.style.userSelect = "none";
    const newWidth = `${Math.min(
      Math.max((clientX / window.innerWidth) * 100, 30),
      70
    )}%`;
    setEditorWidth(newWidth);
  };

  const onMouseMove = (e) => handleDrag(e.clientX);
  const onTouchMove = (e) => handleDrag(e.touches[0].clientX);

  const stopDrag = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", stopDrag);
    document.body.style.userSelect = "";
  };

  const startDrag = () => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", stopDrag);
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [userCode, userInput, userLang]);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkmode);
    const style = document.getElementById("themeStyles");
    if (style) {
      style.textContent = isDarkmode ? darkThemeStyles : lightThemeStyles;
    } else {
      const newStyle = document.createElement("style");
      newStyle.id = "themeStyles";
      newStyle.textContent = isDarkmode ? darkThemeStyles : lightThemeStyles;
      document.head.appendChild(newStyle);
    }
  }, [isDarkmode]);

  useEffect(() => {
    const savedCode = localStorage.getItem("userCode");
    if (savedCode) setUserCode(savedCode);
  }, []);

  useEffect(() => {
    localStorage.setItem("userCode", userCode);
  }, [userCode]);

  const toggleTheme = () => setIsDarkmode(!isDarkmode);

  const saveCodeToFile = () => {
    const blob = new Blob([userCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = document.getElementById("filename").value || "code.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadCodeFromFile = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => setUserCode(evt.target.result);
    reader.readAsText(e.target.files[0]);
  };

  const addTestCase = () => {
    if (userInput.length < 10) setUserInput([...userInput, ""]);
  };

  const deleteTestCase = (index) => {
    if (userInput.length === 1) return;
    setUserInput(userInput.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (e, index) => {
    const updated = [...userInput];
    updated[index] = e.target.value;
    setUserInput(updated);
  };

  const runCode = () => {
    if (!userCode) return;
    setLoading(true);
    axios
      .post(import.meta.env.VITE_API_URL, {
        code: userCode,
        language: userLang.apiValue,
        inputs: userInput,
        key: import.meta.env.VITE_API_KEY,
      })
      .then((res) => {
        if (res.data.status === "error") setUserOutput([res.data.message]);
        else setUserOutput(res.data.outputs);
      })
      .catch((err) => {
        setUserOutput(["Error executing code."]);
      })
      .finally(() => setLoading(false));
  };


  return (
    <div
      className={`flex flex-col h-screen overflow-auto ${
        isDarkmode ? "text-white bg-gray-900" : "text-black bg-gray-100"
      }`}
    >
      <div className="bg-indigo-500 p-2 flex justify-between items-center">
        <h1 className="font-bold text-white text-xl">CodeRunner</h1>
        <div className="flex">
          <button
            className={`px-4 py-2 ${
              !isDarkmode ? "border-2 border-white" : ""
            } bg-blue-500 hover:bg-blue-600 rounded-l-md`}
            onClick={toggleTheme}
            disabled={!isDarkmode}
          >
            ☀️
          </button>
          <button
            className={`px-4 py-2  bg-gray-700 hover:bg-gray-800 ${
              isDarkmode ? "border-2 border-white" : ""
            } rounded-r-md`}
            onClick={toggleTheme}
            disabled={isDarkmode}
          >
            🌙
          </button>
        </div>
      </div>
      <div className="flex flex-grow">
        {/* Left Panel */}
        <div
          className="flex flex-col min-w-[30%] max-w-[70%]"
          style={{ width: editorWidth }}
        >
          <AceEditor
            mode={userLang.mode}
            theme={`${isDarkmode ? "github_dark" : "github"}`}
            width="100%"
            height="100%"
            showPrintMargin={false}
            value={userCode}
            onChange={setUserCode}
            editorProps={{ $blockScrolling: true }}
            setOptions={editorOptions}
          />
        </div>

        <div
          className={`w-4 cursor-col-resize flex justify-center items-center ${
            isDarkmode ? "bg-gray-600" : "bg-gray-200"
          }`}
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          ||
        </div>

        {/* Right Panel */}
        <div
          className="flex flex-col p-4 space-y-4 overflow-y-auto"
          style={{ width: `calc(100% - ${editorWidth})` }}
        >
          <div
            className="flex items-center space-x-4"
            style={{ width: `calc(100% - ${editorWidth})` }}
          >
            <label
              htmlFor="filename"
              className="font-medium whitespace-nowrap flex-none"
            >
              Filename:
            </label>
            <input
              type="text"
              id="filename"
              className={`p-2 rounded border flex-grow ${
                isDarkmode ? "bg-gray-800 text-white" : "bg-gray-200 text-black"
              }`}
              placeholder="Enter filename"
            />
            <button
              onClick={saveCodeToFile}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex-none"
            >
              Save Code
            </button>
          </div>

          <div className="flex flex-row space-x-4 items-center">
            <label htmlFor="uploadFile" className="font-medium">
              Load File:
            </label>
            <input
              type="file"
              id="uploadFile"
              className={`p-2 rounded border  file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold ${isDarkmode?"file:bg-blue-50":"file:bg-gray-200"} file:text-blue-700 hover:file:bg-blue-100`}
              onChange={loadCodeFromFile}
            />
          </div>
          <div className="flex flex-row space-x-4 items-center">
            <label htmlFor="languageSelect" className="font-medium">
              Language:
            </label>
            <select
              id="languageSelect"
              value={userLang.value}
              onChange={(e) => {
                const selectedLanguage = languageOptions.find(
                  (option) => option.value === e.target.value
                );
                setUserLang(selectedLanguage);
              }}
              className={`p-2 rounded border  ${
                isDarkmode ? "bg-gray-800" : ""
              }`}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-2">
            <h3 className="font-medium">
              Test Cases{" "}
              <button
                onClick={addTestCase}
                className="text-white hover:bg-slate-400 rounded"
              >
                ➕
              </button>
              <button
                onClick={runCode}
                disabled={loading}
                title="Run All(Ctrl + ↵)"
                className={`p-2 m-2 ${
                  isDarkmode ? "text-green-400 hover:bg-gray-600" : "text-green-600 hover:bg-gray-300"
                } rounded disabled:opacity-50 font-bold`}
              >
                {loading ? "Running..." : "▷ Run all"}
              </button>
            </h3>
            <div className="overflow-x-auto no-scrollbar flex space-x-4">
              {userInput.map((testCase, index) => (
                <div
                  key={index}
                  className={`relative flex-shrink-0 w-64 p-2 ${
                    isDarkmode ? "bg-gray-800" : "bg-gray-200 text-black"
                  } rounded-md`}
                >
                  <textarea
                    value={testCase}
                    onChange={(e) => handleTestCaseChange(e, index)}
                    className={`w-full h-20 p-2 rounded border resize-none ${
                      isDarkmode
                        ? "bg-gray-600 text-white"
                        : "bg-gray-300 text-black placeholder-gray-600"
                    }`}
                    placeholder={`Test Case ${index + 1}`}
                  />
                  {userInput.length > 1 && (
                    <button
                      onClick={() => deleteTestCase(index)}
                      className={`absolute top-1 right-1 w-6 h-fit ${
                        isDarkmode
                          ? "bg-gray-800 text-gray-200"
                          : "bg-gray-200 text-gray-800"
                      } flex items-center justify-center`}
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <h3 className="font-medium">Output:</h3>
            {loading ? (
              <div
                role="status"
                className="flex items-center border-2 border-gray-500 justify-center p-4"
              >
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
<div className="space-y-4">
  {userOutput.map((output, index) => (
    <div key={index} className="flex items-start gap-4">
      <div
        className={`min-w-[2rem] text-center font-semibold py-2 px-3 rounded ${
          isDarkmode ? "bg-gray-700 text-white" : "bg-gray-300 text-black"
        }`}
      >
        {index + 1}:
      </div>
      <textarea
        readOnly
        className={`w-full h-32 p-2 rounded text-nowrap border resize-none shadow-sm focus:outline-none ${
          isDarkmode ? "bg-gray-800 text-white border-gray-600" : "bg-gray-200 border-gray-400"
        }`}
        value={output}
      />
    </div>
  ))}
</div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
}
