import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { Notification, NotificationState } from "../types/index";

// Simple UUID generator function
const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  requestNotificationPermission: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notificationState, setNotificationState] = useState<NotificationState>(
    {
      notifications: [],
      unreadCount: 0,
    }
  );

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      // Only request permission if it's not been granted or denied
      if (
        Notification.permission !== "granted" &&
        Notification.permission !== "denied"
      ) {
        requestNotificationPermission();
      }
    }
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        const parsedData = JSON.parse(storedNotifications) as NotificationState;
        setNotificationState(parsedData);
      } catch (error) {
        console.error("Error parsing stored notifications:", error);
        localStorage.removeItem("notifications");
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notificationState));
  }, [notificationState]);

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        }
      });
    }
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "createdAt" | "read">
  ) => {
    const id = generateUUID();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setNotificationState((prev) => ({
      notifications: [newNotification, ...prev.notifications],
      unreadCount: prev.unreadCount + 1,
    }));

    // Show browser notification if supported
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotificationState((prev) => {
      const updatedNotifications = prev.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      );

      const unreadCount = updatedNotifications.filter((n) => !n.read).length;

      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  };

  const markAllAsRead = () => {
    setNotificationState((prev) => ({
      notifications: prev.notifications.map((notif) => ({
        ...notif,
        read: true,
      })),
      unreadCount: 0,
    }));
  };

  const removeNotification = (id: string) => {
    setNotificationState((prev) => {
      const updatedNotifications = prev.notifications.filter(
        (notif) => notif.id !== id
      );

      const unreadCount = updatedNotifications.filter((n) => !n.read).length;

      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
  };

  const clearAllNotifications = () => {
    setNotificationState({
      notifications: [],
      unreadCount: 0,
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications: notificationState.notifications,
        unreadCount: notificationState.unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        requestNotificationPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}

export { NotificationProvider, NotificationContext };
