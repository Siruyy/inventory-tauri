// src/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

// Import your SVG icons
import DashboardSvg from "../pages/dashboard.svg";
import StaffSvg from "../pages/staff-sidebar.svg";
import InventorySvg from "../pages/inventory.svg";
import ReportsSvg from "../pages/report.svg";
import OrderSvg from "../pages/order.svg";
import LogoutSvg from "../pages/logout.svg";

export default function Sidebar() {
  interface NavItemProps {
    to: string;
    label: string;
    Icon: string; // path to SVG
    first?: boolean;
  }

  // Render exactly one separator *before* each item except the very first
  const NavItem: React.FC<NavItemProps> = ({ to, label, Icon, first }) => (
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

  return (
    <aside style={styles.container}>
      {/* “IMS” at top */}
      <div style={styles.logoContainer}>
        <span style={styles.logoText}>IMS</span>
      </div>

      {/* Main navigation */}
      <nav style={styles.navContainer}>
        <NavItem to="/dashboard" label="Dashboard" Icon={DashboardSvg} first />
        <NavItem to="/staff" label="Staff" Icon={StaffSvg} />
        <NavItem to="/inventory" label="Inventory" Icon={InventorySvg} />
        <NavItem to="/reports" label="Reports" Icon={ReportsSvg} />
        <NavItem to="/order" label="Order" Icon={OrderSvg} />
      </nav>

      {/* Spacer so Logout sits at bottom; no separator above Logout */}
      <div style={styles.spacer} />

      {/* Logout link */}
      <div style={styles.logoutContainer}>
        <NavLink
          to="/logout"
          style={({ isActive }) =>
            isActive
              ? { ...styles.navButton, ...styles.navButtonActive }
              : styles.navButton
          }
        >
          <img src={LogoutSvg} alt="Logout" style={styles.navIcon} />
          <span style={styles.navLabel}>Logout</span>
        </NavLink>
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
    paddingTop: 12, // reduced from 16
    paddingBottom: 8,
    display: "flex",
    justifyContent: "center",
  },
  logoText: {
    fontFamily: "Poppins, Helvetica, sans-serif",
    fontWeight: 700,
    fontSize: "1.3rem", // reduced from 1.5rem
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
    width: "75%",    // 75% of 140px = 105px (smaller than 80%)
    height: 64,      // reduced from 80
    borderRadius: 8,
    padding: 6,      // reduced from 8
    boxSizing: "border-box",
    transition: "background-color 0.2s, color 0.2s",
  },
  navButtonActive: {
    backgroundColor: "#fac1d9",
    color: "#292c2d",
  },
  navIcon: {
    width: 28,       // reduced from 32
    height: 28,      // reduced from 32
    marginBottom: 2, // reduced from 4
    objectFit: "contain",
  },
  navLabel: {
    fontFamily: "Poppins, Helvetica, sans-serif",
    fontWeight: 500,
    fontSize: "0.8rem", // reduced from 0.9rem
    textAlign: "center",
  },
  separator: {
    borderTop: "1px solid #3a3a3a",
    width: "50%",        // reduced from 60%
    margin: "8px 0",     // reduced vertical margin from 12px
    alignSelf: "center",
  },
  spacer: {
    flexGrow: 1, // pushes the Logout link to the very bottom
  },
  logoutContainer: {
    display: "flex",
    justifyContent: "center",
    paddingBottom: 12, // reduced from 16
  },
};
