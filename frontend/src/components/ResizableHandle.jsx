// src/components/ResizableHandle.jsx
import React from "react";

const ResizableHandle = ({ onDragStart, isDarkmode }) => (
  <div
    className={`w-4 cursor-col-resize flex justify-center items-center ${isDarkmode ? "bg-gray-600" : "bg-gray-200"}`}
    onMouseDown={onDragStart}
    onTouchStart={onDragStart}
  >
    ||
  </div>
);

export default ResizableHandle;