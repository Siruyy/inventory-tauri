// src/router.tsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import your shared layout component(s)
import Sidebar from "./components/Sidebar";

// Import each page component
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Staff from "./pages/Staff";
import Reports from "./pages/Reports";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route (no sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* All other paths show the Sidebar plus nested routes */}
        <Route
          path="/*"
          element={
            <div style={styles.container}>
              <Sidebar />
              <div style={styles.content}>
                <Routes>
                  {/* Redirect root to /dashboard */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Main authenticated routes */}
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="staff" element={<Staff />} />
                  <Route path="reports" element={<Reports />} />

                  {/* Logout simply navigates back to /login */}
                  <Route path="logout" element={<Navigate to="/login" replace />} />

                  {/* Catch-all: redirect unknown paths to /dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
  },
  content: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
  },
};
