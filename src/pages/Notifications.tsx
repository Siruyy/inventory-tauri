import React from "react";
import { useNotifications } from "../context/NotificationContext";
import Header from "../components/Header";

const Notifications: React.FC = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
  } = useNotifications();

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

  return (
    <div style={styles.container}>
      <Header title="Notifications" />

      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>All Notifications</h2>

          {notifications.length > 0 && (
            <div style={styles.actions}>
              <button
                onClick={markAllAsRead}
                style={{ ...styles.actionButton, marginRight: "10px" }}
              >
                Mark all as read
              </button>
              <button
                onClick={clearAllNotifications}
                style={styles.actionButton}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <p>You don't have any notifications yet.</p>
          </div>
        ) : (
          <div style={styles.notificationList}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  ...styles.notificationItem,
                  ...(notification.read ? styles.read : styles.unread),
                }}
              >
                <div style={styles.notificationIcon}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div style={styles.notificationContent}>
                  <div style={styles.notificationTitle}>
                    {notification.title}
                  </div>
                  <div style={styles.notificationMessage}>
                    {notification.message}
                  </div>
                  <div style={styles.notificationTime}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={styles.notificationActions}>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      style={styles.markReadButton}
                    >
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    backgroundColor: "#1F1F1F",
  },
  content: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: {
    color: "#FFFFFF",
    fontSize: "24px",
    fontWeight: 600,
    margin: 0,
  },
  actions: {
    display: "flex",
  },
  actionButton: {
    backgroundColor: "#333333",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 0",
    color: "#888888",
    textAlign: "center",
  },
  notificationList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  notificationItem: {
    padding: "16px",
    borderRadius: "8px",
    display: "flex",
    position: "relative",
  },
  unread: {
    backgroundColor: "#333333",
    borderLeft: "4px solid #FAC1D9",
  },
  read: {
    backgroundColor: "#2A2A2A",
    borderLeft: "4px solid transparent",
  },
  notificationIcon: {
    marginRight: "16px",
    fontSize: "24px",
    display: "flex",
    alignItems: "flex-start",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: "16px",
    fontWeight: 600,
    color: "#FFFFFF",
    marginBottom: "8px",
  },
  notificationMessage: {
    fontSize: "14px",
    color: "#CCCCCC",
    marginBottom: "8px",
    lineHeight: "1.4",
  },
  notificationTime: {
    fontSize: "12px",
    color: "#888888",
  },
  notificationActions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginLeft: "16px",
  },
  markReadButton: {
    backgroundColor: "transparent",
    color: "#FAC1D9",
    border: "1px solid #FAC1D9",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  deleteButton: {
    backgroundColor: "transparent",
    color: "#888888",
    border: "1px solid #444444",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
  },
};

export default Notifications;
