// src/hooks/useTheme.js
import { useState, useEffect } from "react";

const lightThemeStyles = `body { background-color: #F9F9F9; }`;
const darkThemeStyles = `body.dark { background-color: #1E1E1E; }`;

export const useTheme = (initialTheme = true) => {
  const [isDarkmode, setIsDarkmode] = useState(initialTheme);

  useEffect(() => {
    document.body.classList.toggle("dark", isDarkmode);
    const styleId = "themeStyles";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = isDarkmode ? darkThemeStyles : lightThemeStyles;
  }, [isDarkmode]);

  const toggleTheme = () => setIsDarkmode(prev => !prev);

  return [isDarkmode, toggleTheme];
};