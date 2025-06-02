// src/pages/Dashboard.tsx
import React from "react";

export default function Dashboard() {
  // Placeholder data; you’ll fetch real data later via Tauri commands
  const totalProducts = 128;
  const lowStockItems = 7;
  const totalSalesToday = 3450; // e.g., in currency units

  return (
    <div style={styles.container}>
      {/* Page Title */}
      <h1 style={styles.title}>Dashboard</h1>

      {/* Summary Cards */}
      <div style={styles.cardsContainer}>
        <div style={styles.card}>
          <h2 style={styles.cardNumber}>{totalProducts}</h2>
          <p style={styles.cardLabel}>Total Products</p>
        </div>
        <div style={styles.card}>
          <h2 style={styles.cardNumber}>{lowStockItems}</h2>
          <p style={styles.cardLabel}>Low-Stock Alerts</p>
        </div>
        <div style={styles.card}>
          <h2 style={styles.cardNumber}>₱{totalSalesToday.toLocaleString()}</h2>
          <p style={styles.cardLabel}>Sales Today</p>
        </div>
      </div>

      {/* Recent Orders Table (example placeholder) */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Orders</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Order ID</th>
              <th style={styles.th}>Customer</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>#1001</td>
              <td style={styles.td}>Juan Dela Cruz</td>
              <td style={styles.td}>₱450</td>
              <td style={styles.td}>2025-06-02</td>
            </tr>
            <tr>
              <td style={styles.td}>#1002</td>
              <td style={styles.td}>Maria Santos</td>
              <td style={styles.td}>₱780</td>
              <td style={styles.td}>2025-06-02</td>
            </tr>
            <tr>
              <td style={styles.td}>#1003</td>
              <td style={styles.td}>Pedro Reyes</td>
              <td style={styles.td}>₱1,200</td>
              <td style={styles.td}>2025-06-01</td>
            </tr>
            {/* Add more rows as desired */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: "1rem",
  },
  cardsContainer: {
    display: "flex",
    gap: "1.5rem",
    flexWrap: "wrap",
  },
  card: {
    flex: "1 1 200px",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: "1.5rem",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
    textAlign: "center",
  },
  cardNumber: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 700,
    color: "#111827",
  },
  cardLabel: {
    margin: 0,
    marginTop: "0.5rem",
    fontSize: "0.9rem",
    color: "#6B7280",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: "1rem",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  },
  sectionTitle: {
    fontSize: "1.25rem",
    fontWeight: 500,
    color: "#1F2937",
    marginBottom: "0.75rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "0.75rem",
    backgroundColor: "#F3F4F6",
    color: "#374151",
    borderBottom: "2px solid #E5E7EB",
  },
  td: {
    padding: "0.75rem",
    borderBottom: "1px solid #E5E7EB",
    color: "#4B5563",
  },
};
