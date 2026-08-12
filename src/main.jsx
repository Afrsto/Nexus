import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { authService } from "@/services/authService";
import "./styles/globals.css";

void authService.init();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
