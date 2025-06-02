// src/pages/Inventory.tsx
import React from "react";

export default function Inventory() {
  // Placeholder data
  const products = [
    { id: 1, name: "Coffee Beans", stock: 25, price: 150 },
    { id: 2, name: "Tea Leaves", stock: 40, price: 100 },
    { id: 3, name: "Pastry - Croissant", stock: 12, price: 85 },
    // …etc.
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Inventory</h1>

      <button style={styles.addButton}>+ Add Product</button>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Stock</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.stock}</td>
              <td style={styles.td}>₱{p.price}</td>
              <td style={styles.td}>
                <button style={styles.editButton}>Edit</button>
                <button style={styles.deleteButton}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: 600,
    color: "#1F2937",
    marginBottom: "0.5rem",
  },
  addButton: {
    alignSelf: "flex-end",
    padding: "0.5rem 1rem",
    backgroundColor: "#10B981", // green “+ Add Product”
    color: "#FFFFFF",
    border: "none",
    borderRadius: 4,
    fontWeight: 600,
    cursor: "pointer",
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
  editButton: {
    marginRight: "0.5rem",
    padding: "0.25rem 0.5rem",
    backgroundColor: "#3B82F6", // blue edit button
    color: "#FFF",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
  deleteButton: {
    padding: "0.25rem 0.5rem",
    backgroundColor: "#EF4444", // red delete button
    color: "#FFF",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
  },
};
