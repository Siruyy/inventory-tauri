import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { formatFilePath } from "../utils/fileUtils";

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
  const [quantityInput, setQuantityInput] = useState("");
  const [currentOrder, setCurrentOrder] = useState<Order>({
    orderId: `ORD-${Date.now()}`,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    cashier: user?.full_name || "Unknown Cashier",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(
    null
  );
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});

  // Always fetch all products and filter on client side
  const { products: allProducts, isLoading, refetchProducts } = useProducts();
  const { createOrder } = useOrders();

  // Create reference to barcode scanner hook functions
  const barcodeScannerRef = useRef<{
    setQuantity: (quantity: number | null) => void;
  }>({
    setQuantity: () => {},
  });

  // Parse quantity prefix if available
  useEffect(() => {
    if (!quantityInput) {
      barcodeScannerRef.current.setQuantity(null);
      return;
    }

    const match = quantityInput.match(/^(\d+)(\*)?$/);
    if (match) {
      const quantity = parseInt(match[1]);
      barcodeScannerRef.current.setQuantity(quantity);

      // If the user typed the asterisk, clear the input after a short delay
      if (match[2]) {
        setTimeout(() => {
          setQuantityInput("");
        }, 500);
      }
    } else {
      barcodeScannerRef.current.setQuantity(null);
    }
  }, [quantityInput]);

  // Initialize barcode scanner
  const { resetBarcode, setQuantity } = useBarcodeScanner({
    onBarcodeScanned: (barcode, quantity = 1) => {
      console.log(`Barcode scanned: ${barcode}, Quantity: ${quantity}`);
      setLastScannedBarcode(barcode);

      // Find product with this barcode
      const product = allProducts.find((p) => (p as any).barcode === barcode);

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
    ignoreTextFields: true, // Don't capture input from text fields
  });

  // Store the setQuantity function in the ref
  useEffect(() => {
    if (setQuantity) {
      barcodeScannerRef.current.setQuantity = setQuantity;
    }
  }, [setQuantity]);

  // Update cashier name whenever user changes
  useEffect(() => {
    setCurrentOrder((prev) => ({
      ...prev,
      cashier: user?.full_name || "Unknown Cashier",
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

  // Filter by search query (memoized to keep reference stable)
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return categoryFilteredProducts;
    const lower = searchQuery.toLowerCase();
    return categoryFilteredProducts.filter((product) =>
      product.name.toLowerCase().includes(lower)
    );
  }, [categoryFilteredProducts, searchQuery]);

  // Preload and cache image URLs whenever the product list changes
  useEffect(() => {
    let cancelled = false;
    const loadImages = async () => {
      const urlMap: Record<number, string> = { ...imageUrls };
      const promises = filteredProducts.map(async (product) => {
        if (product.thumbnailUrl && !urlMap[product.id]) {
          try {
            const displayUrl = await formatFilePath(product.thumbnailUrl);
            urlMap[product.id] = displayUrl;
          } catch (err) {
            console.error("Failed to load image for product", product.id, err);
          }
        }
      });
      await Promise.all(promises);
      if (
        !cancelled &&
        Object.keys(urlMap).length > Object.keys(imageUrls).length
      ) {
        setImageUrls(urlMap);
      }
    };

    loadImages();
    return () => {
      cancelled = true;
    };
  }, [filteredProducts]);

  // Handle category selection
  const handleCategorySelect = (categoryId: number | undefined) => {
    console.log("Orders: Setting category ID to:", categoryId);
    setSelectedCategoryId(categoryId);
  };

  // Add product to order with quantity
  const addProductToOrderWithQuantity = (
    product: any,
    quantity: number = 1
  ) => {
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
            <div className="search-controls">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search items..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="quantity-input-container">
                <input
                  type="text"
                  placeholder="Qty (e.g. 5*)"
                  className="quantity-input"
                  value={quantityInput}
                  onChange={(e) => setQuantityInput(e.target.value)}
                  aria-label="Quantity for barcode scan"
                />
              </div>
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
              {quantityInput && parseInt(quantityInput) > 0 && (
                <span className="quantity-indicator">
                  Quantity set: {parseInt(quantityInput)}
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
                          <img
                            src={
                              imageUrls[product.id]
                                ? imageUrls[product.id]
                                : product.category_name === "Food & Beverages"
                                ? "/icons/beverage.svg"
                                : "/icons/apps.svg" /* generic fallback */
                            }
                            alt={product.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                product.category_name === "Food & Beverages"
                                  ? "/icons/beverage.svg"
                                  : "/icons/apps.svg";
                            }}
                          />
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
