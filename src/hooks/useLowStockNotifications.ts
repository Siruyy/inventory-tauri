import { useEffect, useState } from "react";
import { useProducts, Product } from "./useProducts";
import { useNotifications } from "../context/NotificationContext";

export const useLowStockNotifications = () => {
  const { products, isLoading } = useProducts();
  const { addNotification } = useNotifications();
  const [notifiedProductIds, setNotifiedProductIds] = useState<Set<number>>(
    new Set()
  );

  // Load already notified products from localStorage
  useEffect(() => {
    try {
      const storedNotifiedIds = localStorage.getItem(
        "notifiedLowStockProducts"
      );
      if (storedNotifiedIds) {
        const parsedIds = JSON.parse(storedNotifiedIds);
        if (Array.isArray(parsedIds)) {
          setNotifiedProductIds(new Set(parsedIds));
        }
      }
    } catch (error) {
      console.error("Error loading notified product IDs:", error);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && products && products.length > 0) {
      // Check for low stock products
      const lowStockProducts = products.filter(
        (product) => product.current_stock <= product.minimum_stock
      );

      if (lowStockProducts.length > 0) {
        // Group by category for better organization
        const productsByCategory: Record<string, Product[]> = {};
        const newNotifiedIds = new Set(notifiedProductIds);
        let hasNewNotifications = false;

        lowStockProducts.forEach((product) => {
          // Skip products we've already notified about
          if (notifiedProductIds.has(product.id)) {
            return;
          }

          // Mark that we found new products to notify about
          hasNewNotifications = true;

          // Add to notified set
          newNotifiedIds.add(product.id);

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

            const productCount = categoryProducts.length;

            addNotification({
              title: `Low Stock in ${category}`,
              message: `${productCount} product${
                productCount > 1 ? "s" : ""
              } in ${category} ${
                productCount > 1 ? "are" : "is"
              } running low on stock.`,
              type: "warning",
              link: "/inventory",
            });
          }
        );

        // If we have new notifications, update state and localStorage
        if (hasNewNotifications) {
          setNotifiedProductIds(newNotifiedIds);
          localStorage.setItem(
            "notifiedLowStockProducts",
            JSON.stringify([...newNotifiedIds])
          );
        }
      }
    }
  }, [products, isLoading, addNotification, notifiedProductIds]);
};

export default useLowStockNotifications;
