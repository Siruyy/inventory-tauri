// src/components/Header.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";

// Make sure these three SVG files live in the same folder as Header.tsx,
// or adjust the import paths accordingly.
import BackArrow from "./back-arrow.svg";
import NotificationBell from "./notification-bell.svg";
import ProfileIcon from "./profile-icon.svg";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps): JSX.Element {
  const location = useLocation();

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        {title !== "Dashboard" && (
          <NavLink
            to="/dashboard"
            style={styles.backLink}
            title="Back to Dashboard"
          >
            <img src={BackArrow} alt="Back" style={styles.backIcon} />
          </NavLink>
        )}
        <h1 style={styles.title}>{title}</h1>
      </div>
      <div style={styles.right}>
        <NavLink
          to="/notifications"
          style={
            location.pathname === "/notifications"
              ? { ...styles.iconLink, ...styles.iconActive }
              : styles.iconLink
          }
          title="Notifications"
        >
          <img
            src={NotificationBell}
            alt="Notifications"
            style={styles.iconImage}
          />
        </NavLink>
        <NavLink
          to="/profile"
          style={
            location.pathname === "/profile"
              ? { ...styles.iconLink, ...styles.iconActive }
              : styles.iconLink
          }
          title="Profile"
        >
          <img src={ProfileIcon} alt="Profile" style={styles.iconImage} />
        </NavLink>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    backgroundColor: "#1F1F1F",
    boxSizing: "border-box",
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  backLink: {
    display: "inline-block",
    marginRight: 12,
    width: 24,
    height: 24,
  },
  backIcon: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    cursor: "pointer",
    opacity: 0.75,
    transition: "opacity 0.2s",
  },
  title: {
    fontFamily: "Poppins, Helvetica, sans-serif",
    fontWeight: 600,
    fontSize: "1.25rem",
    color: "#FFFFFF",
    margin: 0,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  iconLink: {
    display: "inline-block",
    width: 28,
    height: 28,
  },
  iconActive: {
    opacity: 1,
  },
  iconImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    cursor: "pointer",
    opacity: 0.75,
    transition: "opacity 0.2s",
  },
};
