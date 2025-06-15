// src/components/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Import your SVG icons
import DashboardSvg from "/icons/dashboard.svg";
import StaffSvg from "/icons/staff-sidebar.svg";
import InventorySvg from "/icons/inventory.svg";
import ReportsSvg from "/icons/report.svg";
import OrderSvg from "/icons/order.svg";
import LogoutSvg from "/icons/logout.svg";

interface SidebarProps {
  onLogout: () => void;
}

interface UserPermissions {
  staff: boolean;
  inventory: boolean;
  reports: boolean;
  order: boolean;
  "role-access": boolean;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({
    staff: true,
    inventory: true,
    reports: true,
    order: true,
    "role-access": true,
  });

  // Load user permissions from localStorage
  useEffect(() => {
    if (user) {
      try {
        const savedStaffData = localStorage.getItem("staffList");
        if (savedStaffData) {
          const staffList = JSON.parse(savedStaffData);
          const currentUser = staffList.find(
            (staff: any) =>
              staff.username === user.username || staff.email === user.email
          );

          // Special case: If user is admin, grant all permissions
          if (
            user.role === "admin" ||
            (currentUser &&
              (currentUser.role === "Admin" || currentUser.role === "admin"))
          ) {
            console.log("Admin user detected - granting all permissions");
            setPermissions({
              staff: true,
              inventory: true,
              reports: true,
              order: true,
              "role-access": true,
            });

            // Update the staff record if needed
            if (
              currentUser &&
              (!currentUser.permissions ||
                !currentUser.permissions.staff ||
                !currentUser.permissions.inventory ||
                !currentUser.permissions.reports ||
                !currentUser.permissions.order)
            ) {
              console.log("Updating admin permissions in localStorage");
              currentUser.permissions = {
                staff: true,
                inventory: true,
                reports: true,
                order: true,
                "role-access": true,
              };

              localStorage.setItem("staffList", JSON.stringify(staffList));
            }
          }
          // Regular user - use stored permissions
          else if (currentUser && currentUser.permissions) {
            setPermissions(currentUser.permissions);
          }
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
      }
    }
  }, [user]);

  interface NavItemProps {
    to: string;
    label: string;
    Icon: string; // path to SVG
    first?: boolean;
    permissionKey?: keyof UserPermissions;
  }

  // Render exactly one separator *before* each item except the very first
  const NavItem: React.FC<NavItemProps> = ({
    to,
    label,
    Icon,
    first,
    permissionKey,
  }) => {
    // If this item requires a permission and user doesn't have it, don't render
    if (permissionKey && !permissions[permissionKey]) {
      return null;
    }

    return (
      <React.Fragment>
        {!first && <div style={styles.separator} />}
        <NavLink
          to={to}
          style={({ isActive }) =>
            isActive
              ? { ...styles.navButton, ...styles.navButtonActive }
              : styles.navButton
          }
        >
          <img src={Icon} alt={label} style={styles.navIcon} />
          <span style={styles.navLabel}>{label}</span>
        </NavLink>
      </React.Fragment>
    );
  };

  return (
    <aside style={styles.container}>
      {/* "IMS" at top */}
      <div style={styles.logoContainer}>
        <span style={styles.logoText}>IMS</span>
      </div>

      {/* Main navigation */}
      <nav style={styles.navContainer}>
        <NavItem to="/dashboard" label="Dashboard" Icon={DashboardSvg} first />
        {permissions.staff && (
          <NavItem to="/staff" label="Staff" Icon={StaffSvg} />
        )}
        {permissions.inventory && (
          <NavItem to="/inventory" label="Inventory" Icon={InventorySvg} />
        )}
        {permissions.reports && (
          <NavItem to="/reports" label="Reports" Icon={ReportsSvg} />
        )}
        {permissions.order && (
          <NavItem to="/order" label="Order" Icon={OrderSvg} />
        )}
      </nav>

      {/* Spacer so Logout sits at bottom; no separator above Logout */}
      <div style={styles.spacer} />

      {/* Logout button */}
      <div style={styles.logoutContainer}>
        <button onClick={onLogout} style={styles.navButton}>
          <img src={LogoutSvg} alt="Logout" style={styles.navIcon} />
          <span style={styles.navLabel}>Logout</span>
        </button>
      </div>
    </aside>
  );
}

const sidebarWidth = 140; // slightly smaller than 160

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: sidebarWidth,
    minHeight: "100vh",
    backgroundColor: "#292c2d",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  logoContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    display: "flex",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "Poppins, Helvetica, sans-serif",
    fontWeight: 700,
    fontSize: "1.3rem",
    color: "#fac1d9",
  },
  navContainer: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  navButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textDecoration: "none",
    backgroundColor: "transparent",
    color: "#cccccc",
    width: "75%",
    height: 64,
    borderRadius: 8,
    padding: 6,
    boxSizing: "border-box",
    transition: "background-color 0.2s, color 0.2s",
    border: "none",
    cursor: "pointer",
  },
  navButtonActive: {
    backgroundColor: "#fac1d9",
    color: "#292c2d",
  },
  navIcon: {
    width: 28,
    height: 28,
    marginBottom: 2,
    objectFit: "contain",
  },
  navLabel: {
    fontFamily: "Poppins, Helvetica, sans-serif",
    fontWeight: 500,
    fontSize: "0.8rem",
    textAlign: "center",
  },
  separator: {
    borderTop: "1px solid #3a3a3a",
    width: "50%",
    margin: "8px 0",
    alignSelf: "center",
  },
  spacer: {
    flexGrow: 1,
  },
  logoutContainer: {
    display: "flex",
    justifyContent: "center",
    paddingBottom: 12,
  },
};
