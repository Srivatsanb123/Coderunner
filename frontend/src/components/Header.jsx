// src/components/Header.jsx
import React from "react";

const Header = ({ isDarkmode, toggleTheme }) => (
  <header className="bg-indigo-500 p-2 flex justify-between items-center">
    <h1 className="font-bold text-white text-xl">CodeRunner</h1>
    <div className="flex">
      <button
        className={`px-4 py-2 ${!isDarkmode ? "border-2 border-white" : ""} bg-blue-500 hover:bg-blue-600 rounded-l-md`}
        onClick={toggleTheme}
        disabled={!isDarkmode}
        aria-label="Switch to Light Theme"
      >
        ☀️
      </button>
      <button
        className={`px-4 py-2 bg-gray-700 hover:bg-gray-800 ${isDarkmode ? "border-2 border-white" : ""} rounded-r-md`}
        onClick={toggleTheme}
        disabled={isDarkmode}
        aria-label="Switch to Dark Theme"
      >
        🌙
      </button>
    </div>
  </header>
);

export default Header;