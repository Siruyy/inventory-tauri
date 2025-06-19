import React, { useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import useLowStockNotifications from "../hooks/useLowStockNotifications";
import useNotificationTest from "../hooks/useNotificationTest";

// This component doesn't render anything visible
// It just manages notifications at the app level
const NotificationManager: React.FC = () => {
  const { requestNotificationPermission } = useNotifications();

  // Initialize low stock notifications
  useLowStockNotifications();

  // For testing notifications - remove in production
  useNotificationTest();

  // Request notification permission when app loads
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  // This component doesn't render anything
  return null;
};

export default NotificationManager;
