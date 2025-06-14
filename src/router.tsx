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

        {/* Redirect root "/" to "/dashboard" */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Inventory route */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Inventory />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Order route */}
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Orders />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Staff routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute requiredRole="admin">
              <AuthenticatedLayout>
                <Staff />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/:id"
          element={
            <ProtectedRoute requiredRole="admin">
              <AuthenticatedLayout>
                <StaffProfile />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Reports routes */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Reports />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/inventory"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <InventoryReport />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Profile />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect any unknown paths back to /dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
