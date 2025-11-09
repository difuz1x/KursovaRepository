import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure document language is set to Ukrainian so native controls prefer uk locale
try {
  document.documentElement.lang = document.documentElement.lang || "uk";
} catch (e) {
  // ignore in non-browser environments
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
