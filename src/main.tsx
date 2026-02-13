import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import AppErrorBoundary from "./components/AppErrorBoundary.tsx";
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
const rootEl = document.getElementById("root");

const renderFatal = (message: string) => {
  if (!rootEl) return;
  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui;">
      <div style="max-width:420px;width:100%;border:1px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;">
        <h1 style="font-size:18px;font-weight:600;margin:0 0 8px;">App failed to load</h1>
        <p style="font-size:13px;color:#6b7280;margin:0 0 12px;">
          If you are using Pi Browser on a Vercel domain, refresh and try again.
        </p>
        ${message ? `<p style="font-size:12px;color:#b91c1c;word-break:break-word;margin:0 0 12px;">${message}</p>` : ''}
        <button style="width:100%;padding:8px 12px;border:0;border-radius:8px;background:#111827;color:#fff;font-size:13px;cursor:pointer;" onclick="location.reload()">Reload</button>
      </div>
    </div>
  `;
};

if (!rootEl) {
  throw new Error("Root element not found");
}

window.addEventListener("error", (event) => {
  const message = event.error?.message || event.message || "Unknown error";
  renderFatal(message);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason || "Unknown error");
  renderFatal(reason);
});

createRoot(rootEl).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
