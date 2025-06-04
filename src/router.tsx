// src/router.tsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Shared layout
import Sidebar from "./components/Sidebar";

// Page components
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Staff from "./pages/Staff";
import StaffProfile from "./pages/StaffProfile";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import InventoryReport from "./pages/InventoryReport";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route (no sidebar) */}
        <Route path="/login" element={<Login />} />

        {/* All other authenticated routes use the Sidebar */}
        <Route
          path="/*"
          element={
            <div style={styles.container}>
              <Sidebar />
              <div style={styles.content}>
                <Routes>
                  {/* Redirect root "/" to "/dashboard" */}
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />

                  {/* Main Application Pages */}
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inventory" element={<Inventory />} />

                  {/* 
                    Staff: 
                      - "/staff"           → Staff list 
                      - "/staff/:id"       → StaffProfile for that ID 
                  */}
                  <Route path="staff" element={<Staff />} />
                  <Route path="staff/:id" element={<StaffProfile />} />

                  <Route path="reports" element={<Reports />} />
                  <Route path="reports/inventory" element={<InventoryReport />} />
                  <Route path="profile" element={<Profile />} />

                  {/* Logout simply navigates back to /login */}
                  <Route path="logout" element={<Navigate to="/login" replace />} />

                  {/* Catch-all: redirect any unknown paths back to /dashboard */}
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
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
    backgroundColor: "#1F1F1F",
  },
  content: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
  },
};
