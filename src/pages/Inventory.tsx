// src/pages/Inventory.tsx
import React, { useState, useEffect } from "react";
import { CategoryCards } from "../components/CategoryCards";
import { ProductList } from "../components/ProductList";
import CategoryFormDrawer from "../components/CategoryFormDrawer";
import InventoryFormDrawer from "../components/InventoryFormDrawer";
import { Button } from "../components/ui/button";
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import Header from "../components/Header";

import SearchIcon from "/icons/search.svg";

export default function Inventory() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const { products, addProduct } = useProducts();
  const { categories, addCategory } = useCategories();

  // Calculate total products
  const totalProducts = products.length;

  const handleReset = () => {
    setFilterStatus(null);
    setPriceRange({ min: 0, max: 1000 });
    setSearchTerm("");
    setSelectedCategoryId(undefined);
  };

  const handleSaveProduct = (product: any) => {
    // Convert the product data to the format expected by addProduct
    const newProduct = {
      name: product.name,
      description: "", // Not provided in the drawer form
      sku: `SKU-${Date.now()}`, // Generate a temporary SKU
      category_id:
        categories.find((cat) => cat.name === product.category)?.id || 1, // Map category name to ID
      unit_price: product.retailPrice,
      current_stock: product.stockCount,
      minimum_stock: Math.max(1, Math.floor(product.stockCount * 0.2)), // Set minimum to 20% of current or at least 1
      supplier: null,
    };

    addProduct(newProduct, {
      onSuccess: () => {
        setIsDrawerOpen(false);
      },
    });
  };

  const handleSaveCategory = (categoryData: {
    name: string;
    imageUrl: string;
  }) => {
    // Convert the category data to the format expected by addCategory
    const newCategory = {
      name: categoryData.name,
      description: categoryData.imageUrl, // Store the imageUrl in the description field for now
    };

    addCategory(newCategory, {
      onSuccess: () => {
        setIsCategoryDrawerOpen(false);
      },
    });
  };

  // Prepare filters for the ProductList component
  const filters = {
    status: filterStatus,
    priceRange: priceRange,
  };

  return (
    <div style={styles.pageContainer}>
      {/* Header */}
      <Header title="Inventory" />

      <div style={styles.inner}>
        {/* Header Actions Section */}
        <div style={styles.headerActionsRow}>
          <div style={styles.totalProductsContainer}>
            <span style={styles.totalProductsLabel}>Total Products</span>
            <span style={styles.totalProductsCount}>{totalProducts}</span>
          </div>

          <div style={styles.actionButtons}>
            <Button
              style={{
                backgroundColor: "#FAC1D9",
                color: "#333333",
                fontWeight: 500,
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                whiteSpace: "nowrap",
                minWidth: "190px",
                fontSize: "15px",
                maxWidth: "100%",
                overflow: "visible",
              }}
              className="hover:bg-[#e0a9c1]"
              onClick={() => setIsCategoryDrawerOpen(true)}
            >
              Add New Category
            </Button>
            <Button
              style={{
                backgroundColor: "#FAC1D9",
                color: "#333333",
                fontWeight: 500,
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                whiteSpace: "nowrap",
                minWidth: "190px",
                fontSize: "15px",
                maxWidth: "100%",
                overflow: "visible",
              }}
              className="hover:bg-[#e0a9c1]"
              onClick={() => setIsDrawerOpen(true)}
            >
              Add New Inventory
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <div style={styles.contentLayout}>
            {/* Left Column - Filter Card */}
            <div style={styles.filterCardContainer}>
              <div style={styles.filterCard}>
                <div style={styles.filterSection}>
                  <h3 style={styles.filterTitle}>Product Status</h3>
                  <div style={styles.statusButtons}>
                    <button
                      style={{
                        ...styles.statusButton,
                        ...(filterStatus === null
                          ? styles.statusButtonActive
                          : {}),
                      }}
                      onClick={() => setFilterStatus(null)}
                    >
                      All
                      <span style={styles.statusBadge}>{products.length}</span>
                    </button>
                    <button
                      style={{
                        ...styles.statusButton,
                        ...(filterStatus === "active"
                          ? styles.statusButtonActive
                          : {}),
                      }}
                      onClick={() =>
                        setFilterStatus(
                          filterStatus === "active" ? null : "active"
                        )
                      }
                    >
                      Active
                      <span style={styles.statusBadge}>
                        {products.filter((p) => p.current_stock > 0).length}
                      </span>
                    </button>
                    <button
                      style={{
                        ...styles.statusButton,
                        ...(filterStatus === "outOfStock"
                          ? styles.statusButtonActive
                          : {}),
                      }}
                      onClick={() =>
                        setFilterStatus(
                          filterStatus === "outOfStock" ? null : "outOfStock"
                        )
                      }
                    >
                      Out of Stock
                      <span style={styles.statusBadge}>
                        {products.filter((p) => p.current_stock === 0).length}
                      </span>
                    </button>
                    <button
                      style={{
                        ...styles.statusButton,
                        ...(filterStatus === "lowStock"
                          ? styles.statusButtonActive
                          : {}),
                      }}
                      onClick={() =>
                        setFilterStatus(
                          filterStatus === "lowStock" ? null : "lowStock"
                        )
                      }
                    >
                      Low Stock
                      <span style={styles.statusBadge}>
                        {
                          products.filter(
                            (p) =>
                              p.current_stock <= p.minimum_stock &&
                              p.current_stock > 0
                          ).length
                        }
                      </span>
                    </button>
                  </div>
                </div>

                <div style={styles.filterSection}>
                  <h3 style={styles.filterTitle}>Category</h3>
                  <select
                    style={styles.dropdown}
                    value={
                      selectedCategoryId ? selectedCategoryId.toString() : ""
                    }
                    onChange={(e) =>
                      setSelectedCategoryId(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.filterSection}>
                  <h3 style={styles.filterTitle}>Price</h3>
                  <div style={styles.priceInputs}>
                    <div style={styles.priceInputGroup}>
                      <label style={styles.priceLabel}>Min ($)</label>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            min: Number(e.target.value),
                          })
                        }
                        style={styles.priceInput}
                      />
                    </div>
                  </div>
                  <div style={styles.priceInputs}>
                    <div style={styles.priceInputGroup}>
                      <label style={styles.priceLabel}>Max ($)</label>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({
                            ...priceRange,
                            max: Number(e.target.value),
                          })
                        }
                        style={styles.priceInput}
                      />
                    </div>
                  </div>
                </div>

                <button style={styles.resetButton} onClick={handleReset}>
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Right Column - Categories and Products */}
            <div style={styles.rightColumnContent}>
              {/* Search Bar positioned at top of right column to align with the All card */}
              <div style={styles.searchContainer}>
                <img src={SearchIcon} alt="Search" style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              {/* Categories Section */}
              <div style={styles.categoriesSection}>
                <CategoryCards
                  selectedCategoryId={selectedCategoryId}
                  onSelectCategory={setSelectedCategoryId}
                />
              </div>

              {/* Divider */}
              <div style={styles.divider}></div>

              {/* Products Section */}
              <div style={styles.productsSection}>
                <ProductList
                  selectedCategoryId={selectedCategoryId}
                  searchTerm={searchTerm}
                  filters={filters}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Form Drawer */}
      <InventoryFormDrawer
        product={null}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Category Form Drawer */}
      <CategoryFormDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        onSave={handleSaveCategory}
      />
    </div>
  );
}

/** Styles for Inventory.tsx **/
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1F1F1F",
    minHeight: "100vh",
    color: "#FFFFFF",
    fontFamily: "Poppins, Helvetica, sans-serif",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  },
  inner: {
    padding: "24px",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  headerActionsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    width: "100%",
    flexWrap: "wrap" as const,
    gap: "16px",
  },
  actionButtons: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: "50px",
    padding: "6px 16px",
    width: "450px",
    border: "1px solid #FFFFFF",
    height: "35px",
    marginBottom: "16px",
    position: "absolute",
    top: "0",
    transform: "translateY(-70px)",
  },
  searchIcon: {
    width: "16px",
    height: "16px",
    marginRight: "8px",
  },
  searchInput: {
    backgroundColor: "transparent",
    border: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
  },
  contentLayout: {
    display: "flex",
    gap: "24px",
    width: "100%",
    flexWrap: "wrap" as const,
    boxSizing: "border-box",
    position: "relative",
  },
  filterCardContainer: {
    width: "280px",
    flexShrink: 0,
    flexGrow: 0,
    maxWidth: "100%",
    boxSizing: "border-box",
    position: "relative",
    marginTop: "-10px",
  },
  rightColumnContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    flex: 1,
    minWidth: "0",
    maxWidth: "100%",
    boxSizing: "border-box",
    position: "relative",
  },
  totalProductsContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: "280px",
    alignItems: "center",
  },
  totalProductsLabel: {
    fontSize: "20px",
    fontWeight: 300,
    color: "#FFFFFF",
  },
  totalProductsCount: {
    fontSize: "30px",
    fontWeight: 500,
    color: "#FFFFFF",
  },
  categoriesSection: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
    width: "100%",
    marginTop: "-10px",
  },
  divider: {
    width: "100%",
    height: "1px",
    backgroundColor: "#5E5E5E",
    margin: "8px 0",
  },
  productsSection: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  filterCard: {
    backgroundColor: "#292C2D",
    borderRadius: "12px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    border: "1px solid #323232",
  },
  filterSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  filterTitle: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#FFFFFF",
    margin: 0,
  },
  statusButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  statusButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    backgroundColor: "#3D4142",
    border: "1px solid #323232",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left",
  },
  statusButtonActive: {
    borderColor: "#FAC1D9",
  },
  statusBadge: {
    backgroundColor: "#FAC1D9",
    color: "#292C2D",
    borderRadius: "5px",
    padding: "2px 8px",
    fontSize: "14px",
    fontWeight: 300,
  },
  dropdown: {
    width: "100%",
    backgroundColor: "#3D4142",
    border: "1px solid #323232",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    appearance: "none",
  },
  priceInputs: {
    display: "flex",
    width: "100%",
    paddingRight: "8px",
  },
  priceInputGroup: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginBottom: "12px",
  },
  priceLabel: {
    fontSize: "12px",
    color: "#AAAAAA",
  },
  priceInput: {
    width: "calc(100% - 8px)",
    backgroundColor: "#3D4142",
    border: "1px solid #323232",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
  },
  resetButton: {
    marginTop: "auto",
    backgroundColor: "#FAC1D9",
    color: "#333333",
    border: "none",
    borderRadius: "8px",
    padding: "14px 0",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    transition: "background-color 0.2s",
  },
};
