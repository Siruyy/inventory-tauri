import React, { useState } from "react";
import PenIcon from "/icons/pen.svg";
import TrashIcon from "/icons/trash.svg";
import { useCategories, type Category } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";
import { toast } from "sonner";

interface CategoryCardsProps {
  selectedCategoryId?: number;
  onSelectCategory: (categoryId?: number) => void;
}

export function CategoryCards({
  selectedCategoryId,
  onSelectCategory,
}: CategoryCardsProps) {
  const { categories, deleteCategory, refetchCategories } = useCategories();
  const { products, refetchProducts } = useProducts();
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);

  console.log("CategoryCards - categories:", categories);
  console.log("CategoryCards - products:", products);
  console.log("CategoryCards - selectedCategoryId:", selectedCategoryId);

  // Count products per category
  const getProductCountForCategory = (categoryId: number) => {
    const count = products.filter(
      (product) => product.category_id === categoryId
    ).length;
    console.log(`Category ${categoryId} has ${count} products`);
    return count;
  };

  // First step in delete process - mark category for deletion and show confirmation
  const handleDeleteClick = (e: React.MouseEvent, categoryId: number) => {
    e.stopPropagation();

    if (isProcessing) return;

    console.log("Marking category for deletion:", categoryId);
    setDeletingCategoryId(categoryId);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    if (deletingCategoryId !== null && !isProcessing) {
      console.log("Confirming deletion for category:", deletingCategoryId);
      setIsProcessing(true);

      try {
        await deleteCategory(deletingCategoryId);
        console.log("Category deleted successfully");
        // Explicitly refetch after deletion to ensure UI is up to date
        refetchCategories();
        refetchProducts();

        // Show success toast
        toast.success("Category deleted successfully");
      } catch (error) {
        console.error("Error deleting category:", error);

        // Show error toast with the specific error message from the backend
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete category. Please try again.";

        toast.error("Failed to delete category", {
          description: errorMessage,
          duration: 5000,
        });
      } finally {
        setDeletingCategoryId(null);
        setIsProcessing(false);
      }
    }
  };

  // Cancel deletion
  const cancelDelete = () => {
    if (!isProcessing) {
      console.log("Canceling deletion");
      setDeletingCategoryId(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Confirmation Dialog */}
      {deletingCategoryId !== null && (
        <div style={styles.confirmationOverlay}>
          <div style={styles.confirmationDialog}>
            <h3 style={styles.confirmationTitle}>Delete Category?</h3>
            <p style={styles.confirmationText}>
              Are you sure you want to delete this category? This action cannot
              be undone.
            </p>
            <div style={styles.confirmationButtons}>
              <button
                style={styles.cancelButton}
                onClick={cancelDelete}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.deleteButton,
                  ...(isProcessing ? { opacity: 0.7 } : {}),
                }}
                onClick={confirmDelete}
                disabled={isProcessing}
              >
                {isProcessing ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Edit & Delete Icons */}
            <div style={styles.actionButtons}>
              <button
                style={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  // We'll implement edit functionality later
                }}
              >
                <img src={PenIcon} alt="Edit" style={styles.actionIcon} />
              </button>
              <button
                style={styles.actionButton}
                onClick={(e) => handleDeleteClick(e, category.id)}
              >
                <img src={TrashIcon} alt="Delete" style={styles.actionIcon} />
              </button>
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
  // Add new styles for confirmation dialog
  confirmationOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  confirmationDialog: {
    backgroundColor: "#292C2D",
    borderRadius: "8px",
    padding: "24px",
    width: "400px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
  },
  confirmationTitle: {
    color: "#FFFFFF",
    fontSize: "20px",
    fontWeight: 600,
    marginTop: 0,
    marginBottom: "16px",
  },
  confirmationText: {
    color: "#DDDDDD",
    fontSize: "16px",
    marginBottom: "24px",
    lineHeight: 1.5,
  },
  confirmationButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  cancelButton: {
    backgroundColor: "#3A3D40",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  },
  deleteButton: {
    backgroundColor: "#E53935",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: 500,
  },
  // Existing styles
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
  actionButtons: {
    position: "absolute",
    left: "15px",
    top: "15px",
    display: "flex",
    gap: "8px",
  },
  actionButton: {
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
  actionIcon: {
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
