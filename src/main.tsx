import "./App.css"; // ← Import global CSS first
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

// Add error handling
console.log("Application starting...");

// Create error handler
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
});

// Create unhandled rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

try {
  console.log("Mounting React app...");
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("Root element not found!");
  } else {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log("React app mounted successfully");
  }
} catch (error) {
  console.error("Failed to render app:", error);
}
