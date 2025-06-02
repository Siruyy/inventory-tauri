// src/components/Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.logo}>IMS</h2>
      <nav style={styles.nav}>
        <ul style={styles.list}>
          <li>
            <NavLink
              to="/dashboard"
              style={({ isActive }) =>
                isActive
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/inventory"
              style={({ isActive }) =>
                isActive
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
            >
              Inventory
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/menu"
              style={({ isActive }) =>
                isActive
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
            >
              Menu
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/staff"
              style={({ isActive }) =>
                isActive
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
            >
              Staff
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/order"
              style={({ isActive }) =>
                isActive
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
            >
              Order
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/reports"
              style={({ isActive }) =>
                isActive
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
            >
              Reports
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/pos"
              style={({ isActive }) =>
                isActive
                  ? { ...styles.link, ...styles.activeLink }
                  : styles.link
              }
            >
              POS
            </NavLink>
          </li>
          <li>
            {/* Logout can just redirect to /login or clear session */}
            <NavLink
              to="/logout"
              style={styles.link}
            >
              Logout
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: 240,
    backgroundColor: "#2E3B4E",
    color: "#FFF",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    padding: "1rem",
  },
  logo: {
    fontSize: "1.5rem",
    marginBottom: "2rem",
    textAlign: "center",
  },
  nav: {
    flex: 1,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  link: {
    display: "block",
    color: "#BBB",
    textDecoration: "none",
    padding: "0.75rem 1rem",
    borderRadius: 4,
    marginBottom: "0.5rem",
  },
  activeLink: {
    backgroundColor: "#1C2533",
    color: "#FFF",
  },
};
