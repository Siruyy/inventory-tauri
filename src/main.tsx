import "./App.css"; // ← Import global CSS first
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Configure the query client with more conservative settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Don't retry failed queries
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      staleTime: 10000, // Consider data fresh for 10 seconds
      gcTime: 300000, // Keep unused data in cache for 5 minutes
    },
    mutations: {
      retry: false, // Don't retry failed mutations
    },
  },
});

// Add enhanced error handling
console.log("Application starting...");

// Create error handler
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
  // Try to recover the app on errors
  if (document.getElementById("root")) {
    try {
      mountApp();
    } catch (e) {
      console.error("Failed to recover from error:", e);
    }
  }
});

// Create unhandled rejection handler
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

// Create a function to mount the app
function mountApp() {
  try {
    console.log("Mounting React app...");
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      console.error("Root element not found!");
    } else {
      // Create app with error handling wrapper
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
}

// Initial app mounting
mountApp();
