import React, { useState, useEffect } from "react";
import { useCategories, type Category } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import { formatFilePath } from "../utils/fileUtils";

interface OrderCategoryCardsProps {
  selectedCategoryId?: number;
  onSelectCategory: (categoryId?: number) => void;
}

export function OrderCategoryCards({
  selectedCategoryId,
  onSelectCategory,
}: OrderCategoryCardsProps) {
  const { categories } = useCategories();
  // Always fetch all products for category cards
  const { products: allProducts } = useProducts();
  const [categoryIcons, setCategoryIcons] = useState<Record<number, string>>({});

  // Load category icons
  useEffect(() => {
    const loadIcons = async () => {
      console.log("OrderCategoryCards - Loading category icons...");
      const iconMap: Record<number, string> = {};
      
      for (const category of categories) {
        if (category.icon) {
          try {
            const formattedPath = await formatFilePath(category.icon);
            iconMap[category.id] = formattedPath;
          } catch (error) {
            console.error(`Error loading icon for category ${category.id}:`, error);
          }
        }
      }
      
      setCategoryIcons(iconMap);
    };

    loadIcons();
  }, [categories]);

  // Count products per category
  const getProductCountForCategory = (categoryId: number) => {
    return allProducts.filter((product) => product.category_id === categoryId)
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
            {allProducts.length} item{allProducts.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Category cards */}
      {categories.map((category: Category) => {
        const productCount = getProductCountForCategory(category.id);
        const iconUrl = categoryIcons[category.id] || "";

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
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={category.name}
                  style={styles.icon}
                  onError={(e) => {
                    console.error("Error loading image:", category.icon);
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23383C3D'/%3E%3C/svg%3E";
                  }}
                />
              ) : (
                <div style={styles.placeholderIcon}>
                  {category.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Category Info */}
            <div style={styles.infoContainer}>
              <div style={styles.categoryName}>{category.name}</div>
              <div style={styles.itemCount}>
                {productCount} item{productCount !== 1 ? "s" : ""}
              </div>
            </div>
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
    position: "relative",
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
  placeholderIcon: {
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
