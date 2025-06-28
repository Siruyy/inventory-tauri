import { useEffect } from "react";
import { useProducts } from "./useProducts";
import { useNotifications } from "../context/NotificationContext";

export const useLowStockNotifications = (threshold = 10) => {
  const { products, isLoading } = useProducts();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!isLoading && products && products.length > 0) {
      // Check for low stock products
      const lowStockProducts = products.filter(
        (product) => product.current_stock <= threshold
      );

      if (lowStockProducts.length > 0) {
        // Group by category for better organization
        const productsByCategory: Record<string, any[]> = {};

        lowStockProducts.forEach((product) => {
          const categoryName = product.category_name || `Category ${product.category_id}`;
          if (!productsByCategory[categoryName]) {
            productsByCategory[categoryName] = [];
          }
          productsByCategory[categoryName].push(product);
        });

        // Create notifications for each category
        Object.entries(productsByCategory).forEach(([category, products]) => {
          const productCount = products.length;

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
        });
      }
    }
  }, [products, isLoading, addNotification, threshold]);
};

export default useLowStockNotifications;
