import React from "react";
import { Product } from "../hooks/useProducts";
import PenIcon from "/icons/pen.svg";
import TrashIcon from "/icons/trash.svg";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onUpdateStock: (product: Product, newStock: number) => void;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onUpdateStock,
}: ProductCardProps) {
  const stockStatus =
    product.current_stock <= product.minimum_stock ? "low" : "normal";

  return (
    <div style={styles.card}>
      {/* Product Image */}
      <div style={styles.imageContainer}>
        <img
          src="https://via.placeholder.com/120"
          alt={product.name}
          style={styles.productImage}
        />
      </div>

      {/* Product Details */}
      <div style={styles.detailsContainer}>
        <h3 style={styles.productName}>{product.name}</h3>
        <p style={styles.productSku}>SKU: {product.sku}</p>
        <div style={styles.priceStockContainer}>
          <div style={styles.priceContainer}>
            <span style={styles.priceCurrency}>₱</span>
            <span style={styles.priceValue}>
              {product.unit_price.toFixed(2)}
            </span>
          </div>
          <div style={styles.stockContainer}>
            <span
              style={{
                ...styles.stockValue,
                ...(stockStatus === "low" ? styles.stockLow : {}),
              }}
            >
              {product.current_stock}
            </span>
            <span style={styles.stockLabel}>in stock</span>
          </div>
        </div>

        {/* Location */}
        {product.supplier && (
          <p style={styles.location}>
            <span style={styles.locationLabel}>Supplier:</span>{" "}
            {product.supplier}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div style={styles.actionContainer}>
        <button style={styles.actionButton} onClick={() => onEdit(product)}>
          <img src={PenIcon} alt="Edit" style={styles.actionIcon} />
        </button>
        <button
          style={styles.actionButton}
          onClick={() => onDelete(product.id)}
        >
          <img src={TrashIcon} alt="Delete" style={styles.actionIcon} />
        </button>
      </div>

      {/* Category Badge */}
      <div style={styles.categoryBadge}>{product.category_name}</div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    width: "280px",
    height: "320px",
    backgroundColor: "#292C2D",
    borderRadius: "12px",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s ease-in-out",
    border: "1px solid #323232",
  },
  imageContainer: {
    width: "100%",
    height: "140px",
    backgroundColor: "#353535",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  detailsContainer: {
    padding: "16px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  productName: {
    color: "#FFFFFF",
    fontSize: "18px",
    fontWeight: 600,
    margin: 0,
    padding: 0,
    lineHeight: "1.3em",
    marginBottom: "4px",
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  productSku: {
    color: "#AAAAAA",
    fontSize: "12px",
    fontWeight: 400,
    margin: 0,
    padding: 0,
    marginBottom: "12px",
  },
  priceStockContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
  },
  priceCurrency: {
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 500,
    marginRight: "2px",
  },
  priceValue: {
    color: "#FFFFFF",
    fontSize: "22px",
    fontWeight: 700,
  },
  stockContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  stockValue: {
    color: "#FFFFFF",
    fontSize: "18px",
    fontWeight: 600,
  },
  stockLow: {
    color: "#F87171",
  },
  stockLabel: {
    color: "#AAAAAA",
    fontSize: "12px",
    fontWeight: 400,
  },
  location: {
    color: "#DDDDDD",
    fontSize: "12px",
    fontWeight: 400,
    margin: 0,
    padding: 0,
  },
  locationLabel: {
    color: "#AAAAAA",
  },
  actionContainer: {
    position: "absolute",
    right: "10px",
    bottom: "10px",
    display: "flex",
    gap: "8px",
  },
  actionButton: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    backgroundColor: "rgba(250, 193, 217, 0.15)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  actionIcon: {
    width: "16px",
    height: "16px",
  },
  categoryBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(250, 193, 217, 0.25)",
    color: "#FAC1D9",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
  },
};
