import { useEffect, useRef } from "react";
import { useNotifications } from "../context/NotificationContext";

// This hook is for testing notifications only
export const useNotificationTest = () => {
  const { addNotification } = useNotifications();
  const notificationSentRef = useRef(false);

  useEffect(() => {
    // Only send test notifications if we haven't sent them before
    if (notificationSentRef.current) return;

    // Add a test notification after 5 seconds
    const timer1 = setTimeout(() => {
      addNotification({
        title: "Test Notification",
        message:
          "This is a test notification to verify the notification system is working.",
        type: "info",
      });
      notificationSentRef.current = true;
    }, 5000);

    // Add another test notification after 15 seconds
    const timer2 = setTimeout(() => {
      addNotification({
        title: "Low Stock Warning",
        message: "Coffee Beans are running low on stock (2 remaining).",
        type: "warning",
        link: "/inventory",
      });
    }, 15000);

    // Add an error notification after 25 seconds
    const timer3 = setTimeout(() => {
      addNotification({
        title: "Order Failed",
        message: "Order #1234 failed to process. Please check payment details.",
        type: "error",
        link: "/orders",
      });
    }, 25000);

    // Add a success notification after 35 seconds
    const timer4 = setTimeout(() => {
      addNotification({
        title: "Order Completed",
        message: "Order #5678 has been successfully processed.",
        type: "success",
        link: "/orders",
      });
    }, 35000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [addNotification]);
};

export default useNotificationTest;
