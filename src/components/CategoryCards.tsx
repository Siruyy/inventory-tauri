import React from "react";
import PenIcon from "/icons/pen.svg";

interface Category {
  name: string;
  icon: string;
  itemCount: number;
}

interface CategoryCardsProps {
  categories: Category[];
  onEditCategory: (category: Category) => void;
}

export default function CategoryCards({
  categories,
  onEditCategory,
}: CategoryCardsProps) {
  return (
    <div style={styles.container}>
      {categories.map((category, index) => (
        <div key={index} style={styles.card}>
          {/* Category Icon */}
          <div style={styles.iconContainer}>
            <img src={category.icon} alt={category.name} style={styles.icon} />
          </div>

          {/* Category Info */}
          <div style={styles.infoContainer}>
            <div style={styles.categoryName}>{category.name}</div>
            <div style={styles.itemCount}>{category.itemCount} items</div>
          </div>

          {/* Edit Icon */}
          <button
            style={styles.editButton}
            onClick={() => onEditCategory(category)}
          >
            <img src={PenIcon} alt="Edit" style={styles.editIcon} />
          </button>
        </div>
      ))}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    padding: "4px 0",
  },
  card: {
    width: "152px",
    height: "146px",
    backgroundColor: "#292C2D",
    borderRadius: "10px",
    position: "relative",
    padding: "15px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  iconContainer: {
    width: "40px",
    height: "40px",
    position: "absolute",
    right: "15px",
    top: "15px",
  },
  icon: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  infoContainer: {
    position: "absolute",
    left: "15px",
    bottom: "15px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  categoryName: {
    color: "#FFFFFF",
    fontFamily: "Poppins",
    fontSize: "16px",
    fontWeight: 500,
    lineHeight: "1.5em",
  },
  itemCount: {
    color: "#FFFFFF",
    fontFamily: "Poppins",
    fontSize: "16px",
    fontWeight: 300,
    lineHeight: "1.5em",
  },
  editButton: {
    position: "absolute",
    left: "15px",
    top: "24px",
    width: "22px",
    height: "22px",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    width: "14.29px",
    height: "14.29px",
    opacity: 0.9,
  },
};
