// src/pages/Inventory.tsx
import React, { useState, useEffect, useCallback } from "react";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const { products, addProduct, updateProduct, updateStock, deleteProduct } =
    useProducts(selectedCategoryId);
  const { categories, addCategory, updateCategory } = useCategories();

  // Calculate total products
  const totalProducts = products.length;

  const handleReset = () => {
    setFilterStatus(null);
    setPriceRange({ min: 0, max: 1000 });
    setSearchTerm("");
    setSelectedCategoryId(undefined);
  };

  const handleCategorySelect = (categoryId: number | undefined) => {
    setSelectedCategoryId(categoryId);
  };

  // Memoized save product handler to prevent unnecessary re-renders
  const handleSaveProduct = useCallback(
    (product: any) => {
      // Log the product being saved to debug
      console.log("Saving product with data:", product);
      
      // Prevent multiple submissions
      if (isProcessing) return;

      setIsProcessing(true);

      // Find the correct category ID
      const categoryObj = categories.find(
        (cat) => cat.name === product.category
      );
      if (!categoryObj) {
        console.error("Invalid category selected:", product.category);
        console.log("Available categories:", categories);
        setIsProcessing(false);
        return;
      }

      console.log("Selected category:", product.category);
      console.log("Mapped to category ID:", categoryObj.id);

      // Check if this is an edit (has id) or a new product
      if (selectedProduct && selectedProduct.id) {
        // EDIT mode - convert the product data for update
        const updatedProduct = {
          id: parseInt(selectedProduct.id),
          name: product.name,
          description: "", // Not provided in the drawer form
          category_id: categoryObj.id,
          unit_price: product.retailPrice,
          price_bought: product.priceBought,
          current_stock: product.stockCount,
          thumbnailUrl: product.thumbnailUrl,
          barcode: product.barcode,
        };

        console.log("Updating product:", updatedProduct);

        // Use timeout to ensure UI has time to update before mutation
        setTimeout(() => {
          updateProduct(updatedProduct, {
            onSuccess: () => {
              // Use timeout to ensure state updates don't conflict
              setTimeout(() => {
                setIsDrawerOpen(false);
                setIsProcessing(false);
                setSelectedProduct(null);
              }, 100);
            },
            onError: (error: Error) => {
              console.error("Error updating product:", error);
              setIsProcessing(false);
            },
          });
        }, 50);
      } else {
        // ADD mode - convert the product data for new product
        const newProduct = {
          name: product.name,
          description: "", // Not provided in the drawer form
          sku: `SKU-${Date.now()}`, // Generate a temporary SKU
          category_id: categoryObj.id,
          unit_price: product.retailPrice,
          price_bought: product.priceBought,
          current_stock: product.stockCount,
          minimum_stock: Math.max(1, Math.floor(product.stockCount * 0.2)), // Set minimum to 20% of current or at least 1
          supplier: null,
          thumbnailUrl: product.thumbnailUrl,
          barcode: product.barcode,
        };

        console.log("Adding new product:", newProduct);

        // Use timeout to ensure UI has time to update before mutation
        setTimeout(() => {
          addProduct(newProduct, {
            onSuccess: () => {
              // Use timeout to ensure state updates don't conflict
              setTimeout(() => {
                setIsDrawerOpen(false);
                setIsProcessing(false);
                setSelectedProduct(null);
              }, 100);
            },
            onError: (error: Error) => {
              console.error("Error adding product:", error);
              setIsProcessing(false);
            },
          });
        }, 50);
      }
    },
    [addProduct, updateProduct, categories, isProcessing, selectedProduct]
  );

  // Memoized save category handler to prevent unnecessary re-renders
  const handleSaveCategory = useCallback(
    (categoryData: { name: string; imageUrl: string }) => {
      console.log("Saving category with imageUrl:", categoryData.imageUrl);
      
      // Prevent multiple submissions
      if (isProcessing) return;

      setIsProcessing(true);

      if (selectedCategory) {
        // EDIT mode - update existing category
        const updatedCategory = {
          id: selectedCategory.id,
          name: categoryData.name,
          description: null,
          icon: categoryData.imageUrl, // Use the icon field for the imageUrl, not description
        };

        console.log("Updating category with:", updatedCategory);

        // Use timeout to ensure UI has time to update before mutation
        setTimeout(() => {
          updateCategory.mutate(updatedCategory, {
            onSuccess: () => {
              // Use timeout to ensure state updates don't conflict
              setTimeout(() => {
                setIsCategoryDrawerOpen(false);
                setIsProcessing(false);
                setSelectedCategory(null);
              }, 100);
            },
            onError: () => {
              setIsProcessing(false);
            },
          });
        }, 50);
      } else {
        // ADD mode - add new category
        const newCategory = {
          name: categoryData.name,
          description: null,
          icon: categoryData.imageUrl, // Use the icon field for the imageUrl, not description
        };

        console.log("Adding new category with:", newCategory);

        // Use timeout to ensure UI has time to update before mutation
        setTimeout(() => {
          addCategory.mutate(newCategory, {
            onSuccess: () => {
              // Use timeout to ensure state updates don't conflict
              setTimeout(() => {
                setIsCategoryDrawerOpen(false);
                setIsProcessing(false);
              }, 100);
            },
            onError: () => {
              setIsProcessing(false);
            },
          });
        }, 50);
      }
    },
    [addCategory, updateCategory, isProcessing, selectedCategory]
  );

  // Handle edit product
  const handleEditProduct = useCallback(
    (product: import("../hooks/useProducts").Product) => {
      console.log("Editing product with data:", product);
      // Convert the product from DB format to the drawer format
      const formattedProduct = {
        id: product.id.toString(),
        name: product.name,
        thumbnailUrl: product.thumbnailUrl || "",
        stockCount: product.current_stock,
        status: product.current_stock > 0 ? "Active" : "Inactive",
        category: product.category_name,
        retailPrice: product.unit_price,
        priceBought: product.price_bought || 0,
        perishable: false,
        barcode: product.barcode || "",
      };

      setSelectedProduct(formattedProduct);
      setIsDrawerOpen(true);
    },
    []
  );

  // Handle edit category
  const handleEditCategory = useCallback((category: any) => {
    // Format category for the drawer
    const formattedCategory = {
      id: category.id,
      name: category.name,
      icon: category.description || "https://via.placeholder.com/40",
    };

    setSelectedCategory(formattedCategory);
    setIsCategoryDrawerOpen(true);
  }, []);

  // Handle drawer close with safety checks
  const handleCloseDrawer = useCallback(() => {
    if (!isProcessing) {
      setIsDrawerOpen(false);
      setSelectedProduct(null);
    }
  }, [isProcessing]);

  // Handle category drawer close with safety checks
  const handleCloseCategoryDrawer = useCallback(() => {
    if (!isProcessing) {
      setIsCategoryDrawerOpen(false);
      setSelectedCategory(null);
    }
  }, [isProcessing]);

  // Prepare filters for the ProductList component
  const filters = {
    status: filterStatus,
    priceRange: priceRange,
  };

  // Add effect to log when products change
  useEffect(() => {
    console.log("Inventory: Products updated:", products.length);
    console.log("Inventory: Current selectedCategoryId:", selectedCategoryId);

    // Check if products match the category
    if (selectedCategoryId) {
      const productsInCategory = products.filter(
        (p) => p.category_id === selectedCategoryId
      );
      console.log(
        `Inventory: Products matching category ${selectedCategoryId}:`,
        productsInCategory.length
      );
      console.log("Products are:", products);
    }
  }, [products, selectedCategoryId]);

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

          <div style={styles.searchContainer}>
            <img
              src={SearchIcon}
              alt="Search"
              style={styles.searchIcon}
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
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
              disabled={isProcessing}
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
              disabled={isProcessing}
            >
              Add New Product
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
                      <label style={styles.priceLabel}>Min (₱)</label>
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
                      <label style={styles.priceLabel}>Max (₱)</label>
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

            {/* Right Column - Category Cards and Product List */}
            <div style={styles.rightColumn}>
              <CategoryCards
                onSelectCategory={handleCategorySelect}
                selectedCategoryId={selectedCategoryId}
                onEditCategory={handleEditCategory}
              />
              <ProductList
                products={
                  selectedCategoryId
                    ? products.filter(
                        (p) => p.category_id === selectedCategoryId
                      )
                    : products
                }
                searchTerm={searchTerm}
                filters={filters}
                updateStock={updateStock}
                deleteProduct={deleteProduct}
                onEdit={handleEditProduct}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Form Drawer */}
      <InventoryFormDrawer
        product={selectedProduct}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveProduct}
      />

      {/* Category Form Drawer */}
      <CategoryFormDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={handleCloseCategoryDrawer}
        onSave={handleSaveCategory}
        category={selectedCategory}
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
    flexShrink: 0,
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
  rightColumn: {
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
