// App.jsx
import React, { useState, useEffect, useCallback } from "react";

import { useTheme } from "./hooks/useTheme";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useResizablePanels } from "./hooks/useResizablePanels";

import Header from "./components/Header";
import EditorPanel from "./components/EditorPanel";
import ResizableHandle from "./components/ResizableHandle";
import ControlsPanel from "./components/ControlsPanel";

import { executeCode } from "./api/codeExecution";

import { languageOptions } from "./constants/languages";

export default function App() {

  const [isDarkmode, toggleTheme] = useTheme(true);

  const [userCode, setUserCode] = useLocalStorage("userCode", "// Start coding here...");

  const { editorWidth, startDrag } = useResizablePanels("60%");
  
  const [userLang, setUserLang] = useLocalStorage("userLanguage", languageOptions[0]);
  
  const [userInput, setUserInput] = useState([""]);
  const [userOutput, setUserOutput] = useState([]);
  const [loading, setLoading] = useState(false);

  const runCode = useCallback(async () => {
    if (!userCode) return;
    setLoading(true);
    setUserOutput([]); // Clear previous output immediately
    const { outputs } = await executeCode(userLang.apiValue, userCode, userInput);
    setUserOutput(outputs);
    setLoading(false);
  }, [userCode, userLang.apiValue, userInput]);

  const loadCodeFromFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setUserCode(evt.target.result);
      reader.readAsText(file);
    }
  };
  const saveCodeToFile = () => {
    const filename = document.getElementById("filename").value || "code.txt";
    const userCode = localStorage.getItem("userCode");
    const codeToSave = userCode ? JSON.parse(userCode) : "";

    const blob = new Blob([codeToSave], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [runCode]); // Re-attach listener only if the runCode function changes


  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDarkmode ? "text-white bg-gray-900" : "text-black bg-gray-100"}`}>
      <Header isDarkmode={isDarkmode} toggleTheme={toggleTheme} />
      
      <main className="flex flex-grow overflow-hidden">
        <EditorPanel
          width={editorWidth}
          mode={userLang.mode}
          theme={isDarkmode ? "github_dark" : "github"}
          userCode={userCode}
          setUserCode={setUserCode}
        />
        
        <ResizableHandle onDragStart={startDrag} isDarkmode={isDarkmode} />

        <div className="flex flex-col overflow-hidden" style={{ width: `calc(100% - ${editorWidth})` }}>
            <div className={`p-4 flex flex-row space-x-4 items-center border-b flex-shrink-0 ${isDarkmode ? 'border-gray-700' : 'border-gray-200'}`}>
                <label htmlFor="uploadFile" className="font-medium whitespace-nowrap">Load File:</label>
                <input
                    type="file"
                    id="uploadFile"
                    className={`p-1 rounded border file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold ${isDarkmode ? "file:bg-gray-600 file:text-gray-100 hover:file:bg-gray-500" : "file:bg-gray-200 file:text-blue-700 hover:file:bg-blue-100"} ${isDarkmode ? 'border-gray-600' : 'border-gray-400'}`}
                    onChange={loadCodeFromFile}
                />

            </div>
                  {/* File Save Controls */}
                  <div className={`p-4 flex flex-row space-x-4 items-center border-b flex-shrink-0 ${isDarkmode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <label htmlFor="filename" className="font-medium whitespace-nowrap">Filename:</label>
                    <input
                      type="text"
                      id="filename"
                      className={`p-2 rounded border flex-grow ${isDarkmode ? "bg-gray-800 text-white border-gray-600" : "bg-gray-200 text-black border-gray-400"}`}
                      placeholder="code.txt"
                    />
                    <button
                      onClick={saveCodeToFile}
                      className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Save
                    </button>
                  </div>
            <ControlsPanel
                width="100%"
                isDarkmode={isDarkmode}
                userLang={userLang}
                setUserLang={setUserLang}
                userInput={userInput}
                setUserInput={setUserInput}
                userOutput={userOutput}
                loading={loading}
                runCode={runCode}
            />
        </div>
      </main>
    </div>
  );
}