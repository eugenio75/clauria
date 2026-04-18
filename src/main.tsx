import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Capture incoming handoff parameter from sister products (e.g. SarAI)
// Stored only in sessionStorage — never persisted, never sent to DB.
try {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get("return");
  if (returnTo === "sarai") {
    sessionStorage.setItem("return_to", "sarai");
  }
} catch {
  // ignore
}

createRoot(document.getElementById("root")!).render(<App />);
