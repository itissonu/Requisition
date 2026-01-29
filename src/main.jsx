import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter,HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css"; // Tailwind entry
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider> 
        <HashRouter>
          <App />
        </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);
