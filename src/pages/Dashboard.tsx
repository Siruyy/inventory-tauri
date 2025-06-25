// src/pages/Dashboard.tsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useOrders } from "../hooks/useOrders";

// Import your summary-card icons
import DailySalesIcon from "/icons/Daily Sales.svg";
import MonthlyIcon from "/icons/Monthly.svg";
import StaffIcon from "/icons/staff-sidebar.svg";
import SearchIcon from "/icons/search.svg";

// Helpers
const today = dayjs();
const formatCurrency = (value: number) =>
  `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Dashboard(): JSX.Element {
  // Get user from AuthContext
  const { user } = useAuth();

  // Case-insensitive check for admin role
  const isAdmin = user?.role?.toLowerCase() === "admin";

  /* -------------------- DATA FETCHING HOOKS -------------------- */
  const { getSalesReportData, recentOrders } = useOrders();

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

  // Recent orders from backend (already limited to 20 in hook)
  const recentTransactions = (recentOrders || [])
    .sort((a, b) => b.id - a.id) // latest first
    .slice(0, 5) // top 5 for card
    .map((o) => ({
      id: o.order_id,
      date: dayjs(o.created_at).format("MMM D"),
      time: dayjs(o.created_at).format("h:mm A"),
      amount: formatCurrency(o.total),
    }));

  // Daily summary (today only)
  const { data: dailyReport, isLoading: loadingDaily } = getSalesReportData(
    today.format("YYYY-MM-DD"),
    today.format("YYYY-MM-DD"),
    "day"
  );

  // Use backend daily report for today's metrics
  const todaysTransactions = dailyReport?.sales_summary?.transactions || 0;
  const todaysSales = dailyReport?.sales_summary?.total_revenue || 0;

  /* ------------- Overview period (day / week / month) ------------- */
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  const getStartDate = (p: "day" | "week" | "month") => {
    if (p === "day") return today.format("YYYY-MM-DD");
    if (p === "week") return today.subtract(6, "day").format("YYYY-MM-DD");
    // month – first day of current month
    return today.startOf("month").format("YYYY-MM-DD");
  };

  const overviewStart = getStartDate(period);
  const overviewEnd = today.format("YYYY-MM-DD");

  const { data: overviewReport, isLoading: loadingOverview } =
    getSalesReportData(overviewStart, overviewEnd, period);

  // Staff count from localStorage (fallback to 0)
  const staffCount = (() => {
    try {
      const list = JSON.parse(localStorage.getItem("staffList") || "[]");
      return Array.isArray(list) ? list.length : 0;
    } catch (_) {
      return 0;
    }
  })();

  // Popular items – take top products from overview within range
  const popularItems = (overviewReport?.top_products || []).map((p) => ({
    id: p.product,
    name: p.product,
    serving: `Sold: ${p.quantity}`,
    price: formatCurrency(p.revenue),
    inStock: true, // TODO: connect to actual stock if desired
    imgSrc: "https://via.placeholder.com/60", // Placeholder until thumbnails are wired
  }));

  // Chart data
  const chartData = (overviewReport?.sales_by_period || []).map((row) => ({
    period: row.period,
    revenue: row.revenue,
    profit: row.profit,
  }));

  /* ---------------- CASHIER METRICS ---------------- */
  const todaysOrdersForCashier = (recentOrders || []).filter((o) => {
    const isToday = o.created_at.startsWith(today.format("YYYY-MM-DD"));
    const cashierName = (o.cashier || "").toLowerCase();
    const isMine =
      cashierName === (user?.username || "").toLowerCase() ||
      cashierName === (user?.full_name || "").toLowerCase();
    return isToday && isMine;
  });

  const cashierRevenue = todaysOrdersForCashier.reduce(
    (sum, o) => sum + (o.total || 0),
    0
  );
  const cashierTransactions = todaysOrdersForCashier.length;

  // Get staff record from localStorage to display full name and timings
  let cashierDisplay = user?.full_name || user?.username;
  let cashierShift = "";
  try {
    const staffListStr = localStorage.getItem("staffList");
    if (staffListStr && user?.username) {
      const staffArr = JSON.parse(staffListStr);
      const rec = staffArr.find((s: any) => s.username === user.username);
      if (rec) {
        cashierDisplay = rec.name || cashierDisplay;
        cashierShift = rec.timings || "";
      }
    }
  } catch (e) {
    console.error("Failed to parse staffList", e);
  }

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
            <div style={styles.summaryValue}>
              {loadingDaily ? "--" : formatCurrency(todaysSales)}
            </div>
            <div style={styles.summaryDate}>{today.format("D MMMM YYYY")}</div>
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
            <div style={styles.summaryValue}>
              {loadingDaily ? "--" : todaysTransactions}
            </div>
            <div style={styles.summaryDate}>{today.format("D MMMM YYYY")}</div>
          </div>

          {/* Staffs Card */}
          <div style={{ ...styles.summaryCard, position: "relative" }}>
            <div style={styles.iconCircle}>
              <img src={StaffIcon} alt="Staffs" style={styles.summaryIcon} />
            </div>
            <div style={styles.summaryLabel}>Staffs</div>
            <div style={styles.summaryValue}>{staffCount}</div>
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
                  ...(period === "day" ? styles.overviewButtonActive : {}),
                }}
                onClick={() => setPeriod("day")}
              >
                Daily
              </button>
              <button
                style={{
                  ...styles.overviewButton,
                  ...(period === "week" ? styles.overviewButtonActive : {}),
                }}
                onClick={() => setPeriod("week")}
              >
                Weekly
              </button>
              <button
                style={{
                  ...styles.overviewButton,
                  ...(period === "month" ? styles.overviewButtonActive : {}),
                }}
                onClick={() => setPeriod("month")}
              >
                Monthly
              </button>
            </div>
          </div>
          <div style={styles.chartPlaceholder}>
            {loadingOverview ? (
              <span style={styles.chartText}>Loading chart...</span>
            ) : chartData.length === 0 ? (
              <span style={styles.chartText}>No data available</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 0, right: 20 }}>
                  <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                  <XAxis dataKey="period" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2A2A2A",
                      border: "none",
                    }}
                    labelStyle={{ color: "#fac1d9" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#fac1d9"
                    name="Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#47B39C"
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
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
                    <span>{transaction.date}</span>
                    <span>•</span>
                    <span>{transaction.time}</span>
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
            <div style={styles.summaryValue}>
              {formatCurrency(cashierRevenue)}
            </div>
            <div style={styles.summaryDate}>
              Transactions: {cashierTransactions}
            </div>
            <div style={styles.cashierInfo}>
              {cashierDisplay}
              {cashierShift ? ` • ${cashierShift}` : ""}
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
            <div style={styles.summaryValue}>{formatCurrency(0)}</div>
            <div style={styles.summaryDate}>
              {today.subtract(1, "day").format("D MMMM YYYY")}
            </div>
            <div style={styles.cashierInfo}>--</div>
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
    paddingRight: 8,
    marginRight: -8,
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
    paddingRight: 8,
    marginRight: -8,
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
