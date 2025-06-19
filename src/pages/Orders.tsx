import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { OrderCategoryCards } from "../components/OrderCategoryCards";
import { useProducts } from "../hooks/useProducts";
import {
  useOrders,
  type NewOrder,
  type NewOrderItem,
  type CreateOrderRequest,
} from "../hooks/useOrders";
import { useAuth } from "../context/AuthContext";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import "../styles/Orders.css";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  cashier: string;
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentOrder, setCurrentOrder] = useState<Order>({
    orderId: `ORD-${Date.now()}`,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    cashier: user?.full_name || "Unknown Cashier",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);

  // Always fetch all products and filter on client side
  const { products: allProducts, isLoading, refetchProducts } = useProducts();
  const { createOrder } = useOrders();
  
  // Initialize barcode scanner
  useBarcodeScanner({
    onBarcodeScanned: (barcode, quantity = 1) => {
      console.log(`Barcode scanned: ${barcode}, Quantity: ${quantity}`);
      setLastScannedBarcode(barcode);
      
      // Find product with this barcode
      const product = allProducts.find(
        (p) => (p as any).barcode === barcode
      );
      
      if (product) {
        console.log(`Found product for barcode: ${product.name} x${quantity}`);
        addProductToOrderWithQuantity(product, quantity);
      } else {
        console.log("No product found for barcode:", barcode);
        // Optional: Show notification that barcode wasn't found
      }
    },
    minLength: 3, // Minimum barcode length
    enabled: true, // Enable barcode scanning
    supportQuantityPrefix: true, // Enable quantity prefix support
  });

  // Update cashier name whenever user changes
  useEffect(() => {
    setCurrentOrder(prev => ({
      ...prev,
      cashier: user?.full_name || "Unknown Cashier"
    }));
  }, [user]);

  // Filter products by category client-side instead of relying on backend
  const categoryFilteredProducts =
    selectedCategoryId !== undefined
      ? allProducts.filter(
          (product) => product.category_id === selectedCategoryId
        )
      : allProducts;

  // Add debugging for category selection
  useEffect(() => {
    console.log("Orders: Selected category changed to:", selectedCategoryId);
    console.log("All products:", allProducts.length);

    if (selectedCategoryId) {
      const filteredCount = allProducts.filter(
        (p) => p.category_id === selectedCategoryId
      ).length;
      console.log(`Products in category ${selectedCategoryId}:`, filteredCount);
    }
  }, [selectedCategoryId, allProducts]);

  // Filter by search query
  const filteredProducts = categoryFilteredProducts.filter(
    (product) =>
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle category selection
  const handleCategorySelect = (categoryId: number | undefined) => {
    console.log("Orders: Setting category ID to:", categoryId);
    setSelectedCategoryId(categoryId);
  };

  // Add product to order with quantity
  const addProductToOrderWithQuantity = (product: any, quantity: number = 1) => {
    setCurrentOrder((prevOrder) => {
      // Check if the product is already in the order
      const existingItemIndex = prevOrder.items.findIndex(
        (item) => item.id === product.id
      );

      let updatedItems;

      if (existingItemIndex >= 0) {
        // Increase quantity if already in order
        updatedItems = [...prevOrder.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Add new item to order with specified quantity
        updatedItems = [
          ...prevOrder.items,
          {
            id: product.id,
            name: product.name,
            quantity: quantity,
            price: product.unit_price,
          },
        ];
      }

      // Calculate updated totals
      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;

      return {
        ...prevOrder,
        items: updatedItems,
        subtotal,
        tax,
        total,
      };
    });
  };

  // Update the existing addProductToOrder to use the new function
  const addProductToOrder = (product: any) => {
    addProductToOrderWithQuantity(product, 1);
  };

  // Remove product from order
  const removeProductFromOrder = (productId: number) => {
    setCurrentOrder((prevOrder) => {
      const updatedItems = prevOrder.items
        .map((item) => {
          if (item.id === productId) {
            return {
              ...item,
              quantity: item.quantity - 1,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      const subtotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;

      return {
        ...prevOrder,
        items: updatedItems,
        subtotal,
        tax,
        total,
      };
    });
  };

  // Handle completing the order
  const completeOrder = async () => {
    if (currentOrder.items.length === 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create request for backend
      const newOrder: NewOrder = {
        order_id: currentOrder.orderId,
        cashier: currentOrder.cashier,
        subtotal: currentOrder.subtotal,
        tax: currentOrder.tax,
        total: currentOrder.total,
        status: "completed",
      };

      const orderItems: NewOrderItem[] = currentOrder.items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const request: CreateOrderRequest = {
        order: newOrder,
        items: orderItems,
      };

      // Send to backend
      await createOrder.mutateAsync(request);

      // After successful order creation, refresh product data (since quantities changed)
      refetchProducts();

      // Reset the order
      setCurrentOrder({
        orderId: `ORD-${Date.now()}`,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        cashier: user?.full_name || "Unknown Cashier",
      });

      // Show success message
      alert("Order completed successfully!");
    } catch (error) {
      console.error("Failed to complete order:", error);
      alert("Failed to complete order. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="orders-container">
      <div className="main-content">
        <Header title="Orders" />
        <div className="orders-content">
          <div className="orders-left-panel">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search items..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Barcode Scanner Status */}
            <div className="barcode-scanner-status">
              <span className="scanner-indicator">
                Barcode Scanner: <span className="scanner-active">Active</span>
              </span>
              {lastScannedBarcode && (
                <span className="last-scanned">
                  Last scanned: {lastScannedBarcode}
                </span>
              )}
            </div>

            {/* Categories Section - Using OrderCategoryCards to hide edit/delete buttons */}
            <div className="categories-section">
              <OrderCategoryCards
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={handleCategorySelect}
              />
            </div>

            {/* Menu Items Section with Scrollable Container */}
            <div className="menu-items-section">
              {isLoading ? (
                <div className="loading-indicator">Loading products...</div>
              ) : (
                <div className="menu-items-grid">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="menu-item-card"
                        onClick={() => addProductToOrder(product)}
                      >
                        <div className="menu-item-image">
                          {product.thumbnailUrl ? (
                            <img
                              src={product.thumbnailUrl}
                              alt={product.name}
                              onError={(e) => {
                                // Fallback to category-based icons
                                (e.target as HTMLImageElement).src = 
                                  product.category_name === "Food & Beverages"
                                    ? "/icons/beverage.svg"
                                    : product.category_name === "Clothing"
                                    ? "/icons/clothing.svg"
                                    : "/icons/item.svg";
                              }}
                            />
                          ) : (
                            // Use product icon or a placeholder based on category
                            <img
                              src={
                                product.category_name === "Food & Beverages"
                                  ? "/icons/beverage.svg"
                                  : product.category_name === "Clothing"
                                  ? "/icons/clothing.svg"
                                  : "/icons/item.svg"
                              }
                              alt={product.name}
                            />
                          )}
                        </div>
                        <div className="menu-item-info">
                          <h3>{product.name}</h3>
                          <p>₱{product.unit_price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-products-message">
                      No products found in this category
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="order-slip-panel">
            <div className="order-header">
              <h2>Order #{currentOrder.orderId}</h2>
              <p>Cashier: {currentOrder.cashier}</p>
            </div>
            <div className="order-items">
              {currentOrder.items.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <div className="item-actions">
                    <span className="item-price">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="remove-item-btn"
                      onClick={() => removeProductFromOrder(item.id)}
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
              {currentOrder.items.length === 0 && (
                <div className="empty-order">
                  <p>No items added yet</p>
                  <p>Click on products to add them to your order</p>
                </div>
              )}
            </div>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₱{currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>₱{currentOrder.tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₱{currentOrder.total.toFixed(2)}</span>
              </div>
            </div>
            <button
              className="complete-order-btn"
              onClick={completeOrder}
              disabled={currentOrder.items.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Complete Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
