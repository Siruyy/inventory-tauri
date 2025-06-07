import React, { useState } from "react";
import Header from "../components/Header";
import CategoryCards from "../components/CategoryCards";
import "../styles/Orders.css";

// Sample category data
const sampleCategories = [
  { name: "All", icon: "/icons/apps.svg", itemCount: 65 },
  { name: "Beverages", icon: "/icons/beverage.svg", itemCount: 20 },
  { name: "Main Course", icon: "/icons/food.svg", itemCount: 15 },
  { name: "Desserts", icon: "/icons/dessert.svg", itemCount: 10 },
  { name: "Appetizers", icon: "/icons/appetizer.svg", itemCount: 12 },
  { name: "Sides", icon: "/icons/sides.svg", itemCount: 8 },
];

// Sample menu items data
const sampleMenuItems = [
  {
    id: "1",
    name: "Iced Coffee",
    price: 3.99,
    category: "Beverages",
    image: "/icons/beverage.svg",
  },
  {
    id: "2",
    name: "Chicken Rice",
    price: 12.99,
    category: "Main Course",
    image: "/icons/food.svg",
  },
  {
    id: "3",
    name: "Chocolate Cake",
    price: 6.99,
    category: "Desserts",
    image: "/icons/dessert.svg",
  },
];

interface OrderItem {
  id: string;
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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentOrder, setCurrentOrder] = useState<Order>({
    orderId: `ORD-${Date.now()}`,
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    cashier: "John Doe", // TODO: Replace with actual logged-in user
  });

  const handleCategoryClick = (category: {
    name: string;
    icon: string;
    itemCount: number;
  }) => {
    setSelectedCategory(category.name);
  };

  const filteredMenuItems = sampleMenuItems.filter(
    (item) =>
      (selectedCategory === "All" || item.category === selectedCategory) &&
      (!searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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

            {/* Categories Section */}
            <div className="categories-section">
              <CategoryCards
                categories={sampleCategories}
                onEditCategory={handleCategoryClick}
                hideEditButton={true}
              />
            </div>

            {/* Menu Items Section with Scrollable Container */}
            <div className="menu-items-section">
              <div className="menu-items-grid">
                {filteredMenuItems.map((item) => (
                  <div key={item.id} className="menu-item-card">
                    <div className="menu-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="menu-item-info">
                      <h3>{item.name}</h3>
                      <p>${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
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
                  <span className="item-price">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${currentOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>${currentOrder.tax.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${currentOrder.total.toFixed(2)}</span>
              </div>
            </div>
            <button className="complete-order-btn">Complete Order</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
