import "./App.css"; // ← Import global CSS first
import "./styles.css"; // custom scrollbar and other global styles
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

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

// Track if the app has been mounted to prevent multiple mounts
let appMounted = false;

// Add enhanced error handling
console.log("Application starting...");

// Create error handler
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
  // Only attempt recovery if the app hasn't been mounted yet
  if (document.getElementById("root") && !appMounted) {
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
    // Don't mount if already mounted
    if (appMounted) {
      console.log("App already mounted, skipping...");
      return;
    }

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
            <Toaster position="top-right" richColors />
          </QueryClientProvider>
        </React.StrictMode>
      );

      // Mark as mounted
      appMounted = true;
      console.log("React app mounted successfully");
    }
  } catch (error) {
    console.error("Failed to render app:", error);
  }
}

// Initial app mounting
mountApp();
