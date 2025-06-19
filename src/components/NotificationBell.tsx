import React, { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";
import NotificationBellIcon from "./notification-bell.svg";

const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div style={styles.container}>
      <button
        onClick={toggleDropdown}
        style={styles.bellButton}
        aria-label="Notifications"
      >
        <img
          src={NotificationBellIcon}
          alt="Notifications"
          style={styles.bellIcon}
        />
        {unreadCount > 0 && (
          <div style={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>
      <NotificationDropdown
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
      />
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "relative",
  },
  bellButton: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    position: "relative",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bellIcon: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    opacity: 0.75,
    transition: "opacity 0.2s",
  },
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#FAC1D9",
    color: "#333333",
    fontSize: "10px",
    fontWeight: "bold",
    minWidth: "16px",
    height: "16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
};

export default NotificationBell;
