import React from "react";
import { languageOptions } from "../constants/languages";
import OutputPanel from "./OutputPanel";
import { X } from 'lucide-react';

const ControlsPanel = ({
  width,
  isDarkmode,
  userLang,
  setUserLang,
  userInput,
  setUserInput,
  userOutput,
  loading,
  runCode,
}) => {
  const addTestCase = () => {
    if (userInput.length < 10) {
      setUserInput([...userInput, ""]);
    }
  };

  const deleteTestCase = (index) => {
    if (userInput.length > 1) {
      setUserInput(userInput.filter((_, i) => i !== index));
    }
  };

  const handleTestCaseChange = (e, index) => {
    const updatedInputs = [...userInput];
    updatedInputs[index] = e.target.value;
    setUserInput(updatedInputs);
  };

  return (
    <div className="flex flex-col flex-grow p-4 space-y-4 overflow-hidden" style={{ width }}>
      {/* Language Selection */}
      <div className="flex items-center space-x-4 flex-shrink-0">
        <label htmlFor="languageSelect" className="font-medium">Language:</label>
        <select
          id="languageSelect"
          value={userLang.value}
          onChange={(e) => setUserLang(languageOptions.find(opt => opt.value === e.target.value))}
          className={`p-2 rounded border ${isDarkmode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-400"}`}
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Test Cases Management */}
      <div className="flex flex-col space-y-2 flex-shrink-0">
        <h3 className="flex items-center font-medium">
          Test Cases
          <button
            onClick={addTestCase}
            className="ml-2 p-1 text-lg leading-none text-white bg-blue-500 hover:bg-blue-600 rounded transition"
            title="Add Test Case"
          >
            ➕
          </button>
          <button
            onClick={runCode}
            disabled={loading}
            title="Run All (Ctrl + ↵)"
            className={`p-2 ml-auto font-bold rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${isDarkmode ? "text-green-400 hover:bg-gray-700" : "text-green-600 hover:bg-gray-200"}`}
          >
            {loading ? "Running..." : "▷ Run all"}
          </button>
        </h3>
        <div className="flex overflow-x-auto space-x-4 pb-2 no-scrollbar">
          {userInput.map((testCase, index) => (
            <div
              key={index}
              className={`relative flex-shrink-0 w-64 p-2 rounded-md ${isDarkmode ? "bg-gray-800" : "bg-gray-200"}`}
            >
              <textarea
                value={testCase}
                onChange={(e) => handleTestCaseChange(e, index)}
                className={`w-full h-20 p-2 rounded border resize-none ${isDarkmode ? "bg-gray-600 text-white border-gray-500" : "bg-gray-100 text-black border-gray-400"}`}
                placeholder={`Test Case ${index + 1}`}
              />
              {userInput.length > 1 && (
                <button
                  onClick={() => deleteTestCase(index)}
                  className="absolute top-1 right-1 flex items-center justify-center w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 transition"
                  aria-label="Delete test case"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Output Panel */}
      <OutputPanel userOutput={userOutput} loading={loading} isDarkmode={isDarkmode} />
    </div>
  );
};

export default ControlsPanel;
