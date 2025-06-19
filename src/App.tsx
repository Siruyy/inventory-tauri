// src/App.tsx
import React, { Component, ErrorInfo } from "react";
import Router from "./router";
import AuthProvider from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import NotificationManager from "./components/NotificationManager";
// Temporarily disable toast
import { Toaster } from "sonner";

// Error boundary to catch rendering errors
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to the console
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#282c34",
            color: "white",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <h1>Something went wrong</h1>
          <p>The application encountered an error. Please try again.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#FAC1D9",
              color: "#333",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <NotificationManager />
          <Router />
          <Toaster richColors position="top-right" duration={5000} />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
