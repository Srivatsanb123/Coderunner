// src/api/codeExecution.js
import axios from "axios";

export const executeCode = async (language, code, inputs) => {
  try {
    const response = await axios.post(import.meta.env.VITE_API_URL, {
      language: language,
      code: code,
      inputs: inputs,
      key: import.meta.env.VITE_API_KEY,
    });

    if (response.data.status === "error") {
      // Return a structured error response
      return { error: true, outputs: [response.data.message] };
    }
    return { error: false, outputs: response.data.outputs };
  } catch (err) {
    console.error("API Error:", err);
    return { error: true, outputs: ["Error: Could not connect to the execution service."] };
  }
};