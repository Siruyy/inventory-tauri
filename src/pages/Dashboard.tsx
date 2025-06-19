// src/pages/Dashboard.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

// Import your summary-card icons
import DailySalesIcon from "/icons/Daily Sales.svg";
import MonthlyIcon from "/icons/Monthly.svg";
import StaffIcon from "/icons/staff-sidebar.svg";
import SearchIcon from "/icons/search.svg";

export default function Dashboard(): JSX.Element {
  // Get user from AuthContext
  const { user } = useAuth();

  // Case-insensitive check for admin role
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Sample data for "Popular Item" list
  const popularItems = [
    {
      id: "#1001",
      name: "Chicken Parmesan",
      serving: "Serving: 1 person",
      price: "₱55.00",
      inStock: true,
      imgSrc: "https://via.placeholder.com/60",
    },
    {
      id: "#1002",
      name: "Beef Tapa",
      serving: "Serving: 2 person",
      price: "₱75.00",
      inStock: true,
      imgSrc: "https://via.placeholder.com/60",
    },
    {
      id: "#1003",
      name: "Pasta Carbonara",
      serving: "Serving: 1 person",
      price: "₱65.00",
      inStock: false,
      imgSrc: "https://via.placeholder.com/60",
    },
    {
      id: "#1004",
      name: "Fried Chicken",
      serving: "Serving: 3 person",
      price: "₱120.00",
      inStock: true,
      imgSrc: "https://via.placeholder.com/60",
    },
  ];

  // Sample cashier data
  const currentCashier = {
    name: "John Doe",
    shift: "09:00 AM - 05:00 PM",
    onDutySales: "₱12,450.00",
    transactionCount: 32,
  };

  const previousCashier = {
    name: "Jane Smith",
    shift: "01:00 AM - 09:00 AM",
    closingBalance: "₱8,750.00",
    date: "9 February 2024",
  };

  // Sample recent transactions
  const recentTransactions = [
    {
      id: "#TR5423",
      time: "11:24 AM",
      amount: "₱325.00",
      items: 4,
      status: "completed",
    },
    {
      id: "#TR5422",
      time: "11:18 AM",
      amount: "₱180.50",
      items: 2,
      status: "completed",
    },
    {
      id: "#TR5421",
      time: "11:05 AM",
      amount: "₱450.00",
      items: 3,
      status: "completed",
    },
  ];

  // Render admin dashboard
  const renderAdminDashboard = () => {
    return (
      <>
        {/* Top Summary Cards for Admin */}
        <div style={styles.summaryRow}>
          {/* Daily Sales Card */}
          <div style={{ ...styles.summaryCard, position: "relative" }}>
            <div style={styles.iconCircle}>
              <img
                src={DailySalesIcon}
                alt="Daily Sales"
                style={styles.summaryIcon}
              />
            </div>
            <div style={styles.summaryLabel}>Daily Sales</div>
            <div style={styles.summaryValue}>$2k</div>
            <div style={styles.summaryDate}>9 February 2024</div>
          </div>

          {/* Daily Transactions Card */}
          <div style={{ ...styles.summaryCard, position: "relative" }}>
            <div style={styles.iconCircle}>
              <img
                src={SearchIcon}
                alt="Daily Transactions"
                style={styles.summaryIcon}
              />
            </div>
            <div style={styles.summaryLabel}>Daily Transactions</div>
            <div style={styles.summaryValue}>42</div>
            <div style={styles.summaryDate}>9 February 2024</div>
          </div>

          {/* Staffs Card */}
          <div style={{ ...styles.summaryCard, position: "relative" }}>
            <div style={styles.iconCircle}>
              <img src={StaffIcon} alt="Staffs" style={styles.summaryIcon} />
            </div>
            <div style={styles.summaryLabel}>Staffs</div>
            <div style={styles.summaryValue}>5</div>
            <div style={styles.summaryDate}></div>
          </div>
        </div>

        {/* Popular Item Section */}
        <div style={styles.popularContainer}>
          <div style={styles.popularHeader}>
            <span style={styles.popularTitle}>Popular Item</span>
            <NavLink to="/inventory" style={styles.popularSeeAll}>
              See All
            </NavLink>
          </div>
          <div style={styles.popularList}>
            {popularItems.map((item) => (
              <div key={item.id} style={styles.popularItem}>
                <img
                  src={item.imgSrc}
                  alt={item.name}
                  style={styles.popularItemImage}
                />
                <div style={styles.popularItemDetails}>
                  <span style={styles.popularItemName}>{item.name}</span>
                  <span style={styles.popularItemServing}>{item.serving}</span>
                </div>
                <div style={styles.popularItemRight}>
                  <span
                    style={
                      item.inStock
                        ? styles.popularInStock
                        : styles.popularOutOfStock
                    }
                  >
                    {item.inStock ? "In Stock" : "Out of stock"}
                  </span>
                  <span style={styles.popularItemPrice}>{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overview Section */}
        <div style={styles.overviewContainer}>
          <div style={styles.overviewHeader}>
            <span style={styles.overviewTitle}>Overview</span>
            <div style={styles.overviewControls}>
              <button
                style={{
                  ...styles.overviewButton,
                  ...styles.overviewButtonActive,
                }}
              >
                Monthly
              </button>
              <button style={styles.overviewButton}>Daily</button>
              <button style={styles.overviewButton}>Weekly</button>
              <button style={styles.exportButton}>Export</button>
            </div>
          </div>
          <div style={styles.chartPlaceholder}>
            <span style={styles.chartText}>
              [Your Sales vs. Revenue Chart Here]
            </span>
          </div>
        </div>
      </>
    );
  };

  // Render cashier dashboard
  const renderCashierDashboard = () => {
    return (
      <>
        {/* Top Summary Cards for Cashier */}
        <div style={styles.summaryRow}>
          {/* Recent Transactions Card */}
          <div style={{ ...styles.summaryCard, position: "relative" }}>
            <div style={styles.iconCircle}>
              <img
                src={SearchIcon}
                alt="Recent Transactions"
                style={styles.summaryIcon}
              />
            </div>
            <div style={styles.summaryLabel}>Recent Transactions</div>
            <div style={styles.recentTransactions}>
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} style={styles.transactionItem}>
                  <div style={styles.transactionId}>{transaction.id}</div>
                  <div style={styles.transactionDetails}>
                    <span>{transaction.time}</span>
                    <span>•</span>
                    <span>{transaction.items} items</span>
                  </div>
                  <div style={styles.transactionAmount}>
                    {transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On-duty Sales Card */}
          <div style={{ ...styles.summaryCard, position: "relative" }}>
            <div style={styles.iconCircle}>
              <img
                src={MonthlyIcon}
                alt="On-duty Sales"
                style={styles.summaryIcon}
              />
            </div>
            <div style={styles.summaryLabel}>On-duty Sales</div>
            <div style={styles.summaryValue}>{currentCashier.onDutySales}</div>
            <div style={styles.summaryDate}>
              Transactions: {currentCashier.transactionCount}
            </div>
            <div style={styles.cashierInfo}>
              {currentCashier.name} • {currentCashier.shift}
            </div>
          </div>

          {/* Previous Cashier Balance Card */}
          <div style={{ ...styles.summaryCard, position: "relative" }}>
            <div style={styles.iconCircle}>
              <img
                src={StaffIcon}
                alt="Previous Cashier"
                style={styles.summaryIcon}
              />
            </div>
            <div style={styles.summaryLabel}>Previous Cashier Balance</div>
            <div style={styles.summaryValue}>
              {previousCashier.closingBalance}
            </div>
            <div style={styles.summaryDate}>{previousCashier.date}</div>
            <div style={styles.cashierInfo}>
              {previousCashier.name} • {previousCashier.shift}
            </div>
          </div>
        </div>

        {/* Popular Item Section */}
        <div style={styles.popularContainer}>
          <div style={styles.popularHeader}>
            <span style={styles.popularTitle}>Popular Item</span>
            <NavLink to="/inventory" style={styles.popularSeeAll}>
              See All
            </NavLink>
          </div>
          <div style={styles.popularList}>
            {popularItems.map((item) => (
              <div key={item.id} style={styles.popularItem}>
                <img
                  src={item.imgSrc}
                  alt={item.name}
                  style={styles.popularItemImage}
                />
                <div style={styles.popularItemDetails}>
                  <span style={styles.popularItemName}>{item.name}</span>
                  <span style={styles.popularItemServing}>{item.serving}</span>
                </div>
                <div style={styles.popularItemRight}>
                  <span
                    style={
                      item.inStock
                        ? styles.popularInStock
                        : styles.popularOutOfStock
                    }
                  >
                    {item.inStock ? "In Stock" : "Out of stock"}
                  </span>
                  <span style={styles.popularItemPrice}>{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={styles.pageContainer}>
      {/* Reusable Header (no back arrow on Dashboard) */}
      <Header title="Dashboard" />

      {/* Render dashboard based on user role */}
      {isAdmin ? renderAdminDashboard() : renderCashierDashboard()}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  /* Page Container (dark gray) */
  pageContainer: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "#1F1F1F",
    boxSizing: "border-box",
    color: "#FFFFFF",
    overflowY: "auto",
    fontFamily: "Poppins, Helvetica, sans-serif",
  },

  /* Summary Cards Row */
  summaryRow: {
    display: "flex",
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#2A2A2A", // same dark gray used elsewhere
    color: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start", // label at top
    minHeight: 100,
  },
  iconCircle: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#fac1d9",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  summaryIcon: {
    width: 16,
    height: 16,
    objectFit: "contain",
  },
  summaryLabel: {
    fontWeight: 400,
    fontSize: "1rem",
    marginBottom: 8,
    color: "#EEEEEE", // slightly lighter gray for label
  },
  summaryValue: {
    fontWeight: 600,
    fontSize: "1.5rem",
    marginBottom: 8,
  },
  summaryDate: {
    fontWeight: 300,
    fontSize: "0.875rem",
    color: "#CCCCCC",
    marginBottom: 4,
  },
  cashierInfo: {
    fontWeight: 300,
    fontSize: "0.75rem",
    color: "#CCCCCC",
  },

  /* Recent Transactions */
  recentTransactions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 4,
    overflowY: "auto",
    maxHeight: 150,
  },
  transactionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 0",
    borderBottom: "1px solid #3A3A3A",
  },
  transactionId: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#fac1d9",
    width: "25%",
  },
  transactionDetails: {
    display: "flex",
    justifyContent: "center",
    gap: 6,
    fontSize: "0.75rem",
    color: "#CCCCCC",
    width: "45%",
  },
  transactionAmount: {
    fontWeight: 500,
    fontSize: "0.875rem",
    textAlign: "right",
    width: "30%",
  },

  /* Popular Item Section */
  popularContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 16,
    boxSizing: "border-box",
    marginBottom: 24,
  },
  popularHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  popularTitle: {
    fontWeight: 500,
    fontSize: "1.125rem",
  },
  popularSeeAll: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "#fac1d9",
    textDecoration: "none",
  },
  popularList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    maxHeight: 280,
    overflowY: "auto",
  },
  popularItem: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#3A3A3A",
    borderRadius: 6,
    padding: 8,
    boxSizing: "border-box",
  },
  popularItemImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    objectFit: "cover",
    marginRight: 12,
  },
  popularItemDetails: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  popularItemName: {
    fontWeight: 500,
    fontSize: "1rem",
    color: "#FFFFFF",
  },
  popularItemServing: {
    fontWeight: 300,
    fontSize: "0.875rem",
    color: "#CCCCCC",
  },
  popularItemRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  popularInStock: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#4CAF50",
  },
  popularOutOfStock: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#F44336",
  },
  popularItemPrice: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#FFFFFF",
  },

  /* Overview Section */
  overviewContainer: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 16,
    boxSizing: "border-box",
    marginBottom: 24,
  },
  overviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  overviewTitle: {
    fontWeight: 500,
    fontSize: "1.125rem",
  },
  overviewControls: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  overviewButton: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#CCCCCC",
    backgroundColor: "transparent",
    border: "1px solid #CCCCCC",
    borderRadius: 4,
    padding: "4px 8px",
    cursor: "pointer",
    transition: "background-color 0.2s, color 0.2s",
  },
  overviewButtonActive: {
    backgroundColor: "#fac1d9",
    color: "#292c2d",
    borderColor: "#fac1d9",
  },
  exportButton: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#fac1d9",
    backgroundColor: "transparent",
    border: "1px solid #fac1d9",
    borderRadius: 4,
    padding: "4px 8px",
    cursor: "pointer",
    transition: "background-color 0.2s, color 0.2s",
  },
  chartPlaceholder: {
    width: "100%",
    height: 240,
    backgroundColor: "#1F1F1F",
    borderRadius: 4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  chartText: {
    fontWeight: 300,
    fontSize: "0.95rem",
    color: "#888888",
  },
};
