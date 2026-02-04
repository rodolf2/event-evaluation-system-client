import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@flaticon/flaticon-uicons/css/all/all.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { UIProvider } from "./contexts/UIContext";
import { BrowserRouter as Router } from "react-router-dom";
 
// Security Guard: Disable console logs in production and show warning
if (import.meta.env.PROD) {
  const warningStyle = "color: red; font-size: 2rem; font-weight: bold; text-shadow: 2px 2px black;";
  const infoStyle = "background: red; color: white; font-size: 1.2rem; font-weight: bold; padding: 4px;";
  
  // Show warning once
  setTimeout(() => {
    console.clear();
    console.log("%cSTOP!", warningStyle);
    console.log("%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a feature or \"hack\" someone's account, it is a scam and will give them access to your account.", infoStyle);
  }, 1000);

  // Override console methods to prevent data leakage
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;
  // console.error is left active for critical telemetry if needed
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <UIProvider>
        <Router>
          <App />
        </Router>
      </UIProvider>
    </AuthProvider>
  </StrictMode>
);
