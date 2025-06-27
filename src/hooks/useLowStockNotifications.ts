import { useEffect, useState } from "react";
import { useProducts, Product } from "./useProducts";
import { useNotifications } from "../context/NotificationContext";

export const useLowStockNotifications = () => {
  const { products, isLoading } = useProducts();
  const { addNotification } = useNotifications();
  const [notifiedProductIds, setNotifiedProductIds] = useState<Set<number>>(
    new Set()
  );
  // Track out-of-stock notifications separately with timestamps
  const [outOfStockNotifications, setOutOfStockNotifications] = useState<
    Record<number, number>
  >({});

  // Load already notified products from localStorage
  useEffect(() => {
    try {
      // Load regular low stock notifications
      const storedNotifiedIds = localStorage.getItem(
        "notifiedLowStockProducts"
      );
      if (storedNotifiedIds) {
        const parsedIds = JSON.parse(storedNotifiedIds);
        if (Array.isArray(parsedIds)) {
          setNotifiedProductIds(new Set(parsedIds));
        }
      }

      // Load out-of-stock notifications with timestamps
      const storedOutOfStockData = localStorage.getItem(
        "outOfStockNotifications"
      );
      if (storedOutOfStockData) {
        const parsedData = JSON.parse(storedOutOfStockData);
        if (typeof parsedData === 'object') {
          setOutOfStockNotifications(parsedData);
        }
      }
    } catch (error) {
      console.error("Error loading notified product IDs:", error);
    }
  }, []);

  // Function to reset notification state
  const clearLowStockNotifications = () => {
    setNotifiedProductIds(new Set());
    setOutOfStockNotifications({});
    localStorage.removeItem("notifiedLowStockProducts");
    localStorage.removeItem("outOfStockNotifications");
    console.log("Low stock notifications have been reset");
  };

  useEffect(() => {
    if (!isLoading && products && products.length > 0) {
      // Check for low stock products
      const lowStockProducts = products.filter(
        (product) => 
          product.current_stock <= product.minimum_stock && 
          product.current_stock > 0
      );
      
      // Separately check for out of stock products
      const outOfStockProducts = products.filter(
        (product) => product.current_stock === 0
      );

      // Set for tracking products we'll notify about in this run
      const productsToNotify: Product[] = [];
      
      // Current timestamp for cooldown checking
      const currentTime = Date.now();
      
      // Cooldown period - 24 hours in milliseconds
      const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; 

      // Process low stock products (but not out of stock)
      lowStockProducts.forEach(product => {
        // Only notify if not previously notified
        if (!notifiedProductIds.has(product.id)) {
          productsToNotify.push(product);
        }
      });

      // Process out of stock products with cooldown
      outOfStockProducts.forEach(product => {
        const lastNotified = outOfStockNotifications[product.id] || 0;
        // Notify if:
        // 1. Never notified before, OR
        // 2. Last notification was more than the cooldown period ago
        if (!lastNotified || (currentTime - lastNotified > COOLDOWN_PERIOD)) {
          productsToNotify.push(product);
        }
      });

      // If we have products to notify about
      if (productsToNotify.length > 0) {
        // Group by category for better organization
        const productsByCategory: Record<string, Product[]> = {};
        const newNotifiedIds = new Set(notifiedProductIds);
        const newOutOfStockNotifications = {...outOfStockNotifications};
        let hasNewNotifications = false;

        productsToNotify.forEach((product) => {
          // Mark that we found new products to notify about
          hasNewNotifications = true;

          // Track according to stock status
          if (product.current_stock === 0) {
            // For out of stock, save the timestamp
            newOutOfStockNotifications[product.id] = currentTime;
          } else {
            // For low stock, just mark as notified
            newNotifiedIds.add(product.id);
          }

          const categoryName =
            product.category_name || `Category ${product.category_id}`;
          if (!productsByCategory[categoryName]) {
            productsByCategory[categoryName] = [];
          }
          productsByCategory[categoryName].push(product);
        });

        // Create notifications for each category
        Object.entries(productsByCategory).forEach(
          ([category, categoryProducts]) => {
            if (categoryProducts.length === 0) return;

            // Count out of stock products separately
            const outOfStockCount = categoryProducts.filter(p => p.current_stock === 0).length;
            const lowStockCount = categoryProducts.length - outOfStockCount;
            
            // Create appropriate message based on stock status
            let message = '';
            
            if (outOfStockCount > 0 && lowStockCount > 0) {
              message = `${outOfStockCount} product${
                outOfStockCount > 1 ? "s" : ""
              } in ${category} ${
                outOfStockCount > 1 ? "are" : "is"
              } OUT OF STOCK and ${lowStockCount} ${
                lowStockCount > 1 ? "are" : "is"
              } running low.`;
            } else if (outOfStockCount > 0) {
              message = `${outOfStockCount} product${
                outOfStockCount > 1 ? "s" : ""
              } in ${category} ${
                outOfStockCount > 1 ? "are" : "is"
              } OUT OF STOCK!`;
            } else {
              message = `${lowStockCount} product${
                lowStockCount > 1 ? "s" : ""
              } in ${category} ${
                lowStockCount > 1 ? "are" : "is"
              } running low on stock.`;
            }

            addNotification({
              title: outOfStockCount > 0 ? `Out of Stock in ${category}` : `Low Stock in ${category}`,
              message,
              type: outOfStockCount > 0 ? "error" : "warning",
              link: "/inventory",
            });
          }
        );

        // If we have new notifications, update state and localStorage
        if (hasNewNotifications) {
          setNotifiedProductIds(newNotifiedIds);
          setOutOfStockNotifications(newOutOfStockNotifications);
          
          // Save to localStorage
          localStorage.setItem(
            "notifiedLowStockProducts",
            JSON.stringify([...newNotifiedIds])
          );
          localStorage.setItem(
            "outOfStockNotifications",
            JSON.stringify(newOutOfStockNotifications)
          );
        }
      }
    }
  }, [products, isLoading, addNotification, notifiedProductIds, outOfStockNotifications]);

  return { clearLowStockNotifications };
};

export default useLowStockNotifications;
