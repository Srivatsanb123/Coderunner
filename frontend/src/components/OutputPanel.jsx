// src/components/OutputPanel.jsx

import React from "react";
import LoadingSpinner from "./LoadingSpinner";

const OutputPanel = ({ userOutput, loading, isDarkmode }) => (
  // 👇 --- CHANGE THIS LINE: Add flex-grow and the critical min-h-0 --- 👇
  <div className="flex flex-col space-y-2 flex-grow min-h-0">
    <h3 className="font-medium">Output:</h3>
    {loading ? (
      <LoadingSpinner />
    ) : (
      // 👇 --- CHANGE THIS LINE: This inner div will now scroll correctly --- 👇
      <div className="space-y-4 overflow-y-auto ">
        {userOutput.map((output, index) => (
          <div key={index} className="flex items-start gap-4 mr-1">
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
);

export default OutputPanel;