import React from "react";
import PenIcon from "/icons/pen.svg";
import { useCategories, type Category } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";

interface CategoryCardsProps {
  selectedCategoryId?: number;
  onSelectCategory: (categoryId?: number) => void;
}

export function CategoryCards({
  selectedCategoryId,
  onSelectCategory,
}: CategoryCardsProps) {
  const { categories } = useCategories();
  const { products } = useProducts();

  // Count products per category
  const getProductCountForCategory = (categoryId: number) => {
    return products.filter((product) => product.category_id === categoryId)
      .length;
  };

  return (
    <div style={styles.container}>
      {/* All category card */}
      <div
        style={{
          ...styles.card,
          ...styles.allCategoryCard,
          ...(selectedCategoryId === undefined ? styles.selectedCard : {}),
        }}
        onClick={() => onSelectCategory(undefined)}
      >
        <div style={styles.allCategoryContent}>
          <div style={styles.allCategoryIcon}>All</div>
          <div style={styles.categoryName}>All Items</div>
          <div style={{ ...styles.itemCount, marginTop: "4px" }}>
            {products.length} item{products.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Category cards */}
      {categories.map((category: Category) => {
        const productCount = getProductCountForCategory(category.id);
        return (
          <div
            key={category.id}
            style={{
              ...styles.card,
              ...(selectedCategoryId === category.id
                ? styles.selectedCard
                : {}),
            }}
            onClick={() => onSelectCategory(category.id)}
          >
            {/* Category Icon */}
            <div style={styles.iconContainer}>
              <img
                src={category.description || "https://via.placeholder.com/40"}
                alt={category.name}
                style={styles.icon}
              />
            </div>

            {/* Category Info */}
            <div style={styles.infoContainer}>
              <div style={styles.categoryName}>{category.name}</div>
              <div style={styles.itemCount}>
                {productCount} item{productCount !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Edit Icon */}
            <button
              style={styles.editButton}
              onClick={(e) => {
                e.stopPropagation();
                // We'll implement edit functionality later
              }}
            >
              <img src={PenIcon} alt="Edit" style={styles.editIcon} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    padding: "4px 0",
    overflowX: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "#3A3D40 #1F1F1F",
    msOverflowStyle: "none", // IE and Edge
    paddingBottom: "8px",
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
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    border: "none",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    flexShrink: 0,
  },
  selectedCard: {
    borderColor: "#FAC1D9",
    backgroundColor: "#33363A",
    border: "1px solid #FAC1D9",
  },
  iconContainer: {
    width: "40px",
    height: "40px",
    position: "absolute",
    right: "15px",
    top: "15px",
    backgroundColor: "#3A3D40",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: "24px",
    height: "24px",
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
    color: "#AAAAAA",
    fontFamily: "Poppins",
    fontSize: "14px",
    fontWeight: 300,
    lineHeight: "1.5em",
  },
  editButton: {
    position: "absolute",
    left: "15px",
    top: "15px",
    width: "28px",
    height: "28px",
    padding: 0,
    border: "none",
    background: "rgba(250, 193, 217, 0.15)",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  editIcon: {
    width: "14px",
    height: "14px",
    opacity: 0.9,
  },
  allCategoryCard: {
    backgroundColor: "#292C2D",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  allCategoryContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  allCategoryIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "#3A3D40",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: "16px",
  },
};
