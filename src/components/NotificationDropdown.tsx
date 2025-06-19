import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markAsRead, markAllAsRead, removeNotification } =
    useNotifications();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);

    if (notification.link) {
      navigate(notification.link);
    }

    onClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "success":
        return "✅";
      default:
        return "ℹ️";
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={dropdownRef} style={styles.dropdown}>
      <div style={styles.header}>
        <h3 style={styles.title}>Notifications</h3>
        {notifications.length > 0 && (
          <div style={styles.actions}>
            <button onClick={() => markAllAsRead()} style={styles.actionButton}>
              Mark all as read
            </button>
          </div>
        )}
      </div>

      <div style={styles.notificationList}>
        {notifications.length === 0 ? (
          <div style={styles.emptyState}>No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                ...styles.notificationItem,
                ...(notification.read ? styles.read : styles.unread),
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <div style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </div>
              <div style={styles.notificationContent}>
                <div style={styles.notificationTitle}>{notification.title}</div>
                <div style={styles.notificationMessage}>
                  {notification.message}
                </div>
                <div style={styles.notificationTime}>
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                style={styles.deleteButton}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div style={styles.footer}>
        <button
          onClick={() => {
            navigate("/notifications");
            onClose();
          }}
          style={styles.viewAllButton}
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  dropdown: {
    position: "absolute",
    top: "60px",
    right: "20px",
    width: "350px",
    maxHeight: "500px",
    backgroundColor: "#2A2A2A",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 1000,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #3A3A3A",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  actionButton: {
    background: "none",
    border: "none",
    color: "#FAC1D9",
    fontSize: "12px",
    cursor: "pointer",
    padding: "4px",
  },
  notificationList: {
    overflowY: "auto",
    maxHeight: "380px",
  },
  emptyState: {
    padding: "24px 16px",
    textAlign: "center",
    color: "#888888",
    fontSize: "14px",
  },
  notificationItem: {
    padding: "12px 16px",
    borderBottom: "1px solid #3A3A3A",
    cursor: "pointer",
    display: "flex",
    alignItems: "flex-start",
    position: "relative",
    transition: "background-color 0.2s",
  },
  unread: {
    backgroundColor: "#333333",
  },
  read: {
    backgroundColor: "transparent",
  },
  notificationIcon: {
    marginRight: "12px",
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#FFFFFF",
    marginBottom: "4px",
  },
  notificationMessage: {
    fontSize: "13px",
    color: "#CCCCCC",
    marginBottom: "4px",
  },
  notificationTime: {
    fontSize: "11px",
    color: "#888888",
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "#888888",
    fontSize: "16px",
    cursor: "pointer",
    padding: "4px",
    marginLeft: "8px",
  },
  footer: {
    padding: "12px 16px",
    borderTop: "1px solid #3A3A3A",
    display: "flex",
    justifyContent: "center",
  },
  viewAllButton: {
    background: "none",
    border: "none",
    color: "#FAC1D9",
    fontSize: "14px",
    cursor: "pointer",
    padding: "8px",
    width: "100%",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
};

export default NotificationDropdown;
