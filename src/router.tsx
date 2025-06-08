// src/router.tsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Shared layout
import Sidebar from "./components/Sidebar";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Page components
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Staff from "./pages/Staff";
import StaffProfile from "./pages/StaffProfile";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import InventoryReport from "./pages/InventoryReport";
import Orders from "./pages/Orders";

// AuthenticatedLayout component to wrap protected routes
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { logout } = useAuth();

  return (
    <div style={styles.container}>
      <Sidebar onLogout={logout} />
      <div style={styles.content}>{children}</div>
    </div>
  );
};

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
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Routes>
                  {/* Redirect root "/" to "/dashboard" */}
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />

                  {/* Main Application Pages */}
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="order" element={<Orders />} />

                  {/* Staff routes - require admin role */}
                  <Route
                    path="staff"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <Staff />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="staff/:id"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <StaffProfile />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="reports" element={<Reports />} />
                  <Route
                    path="reports/inventory"
                    element={<InventoryReport />}
                  />
                  <Route path="profile" element={<Profile />} />

                  {/* Catch-all: redirect any unknown paths back to /dashboard */}
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Routes>
              </AuthenticatedLayout>
            </ProtectedRoute>
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
    overflow: "hidden",
    boxSizing: "border-box",
  },
  content: {
    flex: 1,
    padding: "1rem",
    overflowY: "auto",
    overflowX: "hidden",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "100%",
  },
};
