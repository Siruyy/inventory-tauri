import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();
  const [hasPermission, setHasPermission] = useState(true);

  // Check if user has the required permission
  useEffect(() => {
    if (requiredPermission && user) {
      // Special case: Admin users always have all permissions
      if (user.role === "admin" || user.role === "Admin") {
        console.log(
          "Admin user detected in ProtectedRoute - granting all permissions"
        );
        setHasPermission(true);
        return;
      }

      try {
        const savedStaffData = localStorage.getItem("staffList");
        if (savedStaffData) {
          const staffList = JSON.parse(savedStaffData);
          const currentUser = staffList.find(
            (staff: any) =>
              staff.username === user.username || staff.email === user.email
          );

          // If user is admin in staff list, grant all permissions
          if (
            currentUser &&
            (currentUser.role === "Admin" || currentUser.role === "admin")
          ) {
            setHasPermission(true);
          }
          // Otherwise check specific permission
          else if (currentUser && currentUser.permissions) {
            setHasPermission(!!currentUser.permissions[requiredPermission]);
          } else {
            setHasPermission(false);
          }
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setHasPermission(false);
      }
    }
  }, [user, requiredPermission]);

  if (isLoading) {
    // You might want to show a loading spinner here
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    requiredRole &&
    user?.role !== requiredRole &&
    user?.role !== "admin" &&
    user?.role !== "Admin"
  ) {
    // Redirect to dashboard if user doesn't have required role
    // But allow admin users to access all roles
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission && !hasPermission) {
    // Redirect to dashboard if user doesn't have required permission
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
