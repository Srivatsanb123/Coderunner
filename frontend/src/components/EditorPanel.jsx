// src/components/EditorPanel.jsx
import React from "react";
import AceEditor from "react-ace";

// Import all necessary modes, themes, and extensions
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-golang";
import "ace-builds/src-noconflict/ext-searchbox";

const editorOptions = {
  autoScrollEditorIntoView: true,
  copyWithEmptySelection: true,
  fontSize: 16,
};

const EditorPanel = ({ width, mode, theme, userCode, setUserCode }) => (
  <div className="flex flex-col min-w-[30%] max-w-[70%]" style={{ width }}>
    <AceEditor
      mode={mode}
      theme={theme}
      width="100%"
      height="100%"
      showPrintMargin={false}
      value={userCode}
      onChange={setUserCode}
      editorProps={{ $blockScrolling: true }}
      setOptions={editorOptions}
    />
  </div>
);

export default EditorPanel;