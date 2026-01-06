import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { runPiSetupVerification } from './lib/pi-config-verification.ts';
import { enableProductionLoggingSecurity } from './lib/env-security.ts';

// Enable production logging security
enableProductionLoggingSecurity();

// Run Pi Network setup verification in development mode
if (import.meta.env.DEV) {
  // Delay verification to allow console to be ready
  setTimeout(runPiSetupVerification, 1000);
}
createRoot(document.getElementById("root")!).render(<App />);
