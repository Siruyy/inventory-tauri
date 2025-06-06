// src/pages/Inventory.tsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import InventoryFormDrawer from "../components/InventoryFormDrawer";
import CategoryFormDrawer from "../components/CategoryFormDrawer";
import CategoryCards from "../components/CategoryCards";

import SearchIcon from "/icons/search.svg";
import PenIcon from "/icons/pen.svg";
import TrashIcon from "/icons/trash.svg";

interface Product {
  id: string;
  name: string;
  thumbnailUrl: string;
  stockCount: number;
  status: "Active" | "Inactive" | "Draft";
  category: string;
  retailPrice: number;
  perishable: boolean;
}

const sampleProducts: Product[] = [
  {
    id: "P001",
    name: "Chicken Parmesan",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 10,
    status: "Active",
    category: "Chicken",
    retailPrice: 55.0,
    perishable: true,
  },
  {
    id: "P002",
    name: "Beef Burger",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 5,
    status: "Active",
    category: "Beef",
    retailPrice: 45.0,
    perishable: true,
  },
  {
    id: "P003",
    name: "Veggie Salad",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 12,
    status: "Inactive",
    category: "Vegetarian",
    retailPrice: 30.0,
    perishable: false,
  },
  {
    id: "P004",
    name: "Grilled Salmon",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 0,
    status: "Draft",
    category: "Seafood",
    retailPrice: 75.0,
    perishable: true,
  },
  {
    id: "P005",
    name: "Chicken Wings",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 20,
    status: "Active",
    category: "Chicken",
    retailPrice: 60.0,
    perishable: true,
  },
  {
    id: "P006",
    name: "Tofu Stir‐Fry",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 8,
    status: "Active",
    category: "Vegetarian",
    retailPrice: 35.0,
    perishable: false,
  },
];

export default function Inventory() {
  // ─────────────────────────────────────────────────────────
  // Search + filter state
  // ─────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive" | "Draft"
  >("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<
    "All" | "InStock" | "OutOfStock"
  >("All");
  const [valueFilter, setValueFilter] = useState<string>("All");
  const [quantity, setQuantity] = useState<number | "">("");
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");

  // Displayed products (normally you'd filter based on above, but here we just show all)
  const [displayedProducts, setDisplayedProducts] =
    useState<Product[]>(sampleProducts);
  useEffect(() => {
    // In a real app, apply searchTerm & filters here.
    setDisplayedProducts(sampleProducts);
  }, [
    searchTerm,
    statusFilter,
    categoryFilter,
    stockFilter,
    valueFilter,
    quantity,
    priceMin,
    priceMax,
  ]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter("All");
    setStockFilter("All");
    setValueFilter("All");
    setQuantity("");
    setPriceMin("");
    setPriceMax("");
  };

  // ─────────────────────────────────────────────────────────
  // Drawer state: editingProduct = null → "Add New Inventory"
  //                     otherwise → "Edit" mode
  // ─────────────────────────────────────────────────────────
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openDrawerForProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsDrawerOpen(true);
  };

  const openDrawerForAdd = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingProduct(null);
  };

  const handleSaveDrawer = (updatedProduct: Product) => {
    console.log("Save inventory:", updatedProduct);
    // TODO: Replace with actual API call or state update
    closeDrawer();
  };

  const handleScanBarcode = () => {
    console.log("Scan barcode logic goes here…");
    // Later, integrate your barcode scanning logic here
  };

  // Category data with placeholder icons
  const categories = [
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
    {
      name: "Category Name",
      icon: "https://via.placeholder.com/40",
      itemCount: 20,
    },
  ];

  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    name: string;
    icon: string;
    itemCount: number;
  } | null>(null);

  const handleSaveCategory = (categoryData: {
    name: string;
    imageUrl: string;
  }) => {
    console.log("Save category:", categoryData);
    // TODO: Replace with actual API call or state update
    setIsCategoryDrawerOpen(false);
    setEditingCategory(null);
  };

  const handleEditCategory = (category: {
    name: string;
    icon: string;
    itemCount: number;
  }) => {
    setEditingCategory(category);
    setIsCategoryDrawerOpen(true);
  };

  return (
    <div style={styles.pageContainer}>
      {/* Shared Header */}
      <Header title="Inventory" />

      {/* Main content area */}
      <div style={styles.inner}>
        <div style={styles.mainFlex}>
          {/** ───────── LEFT COLUMN: totals + filter card ───────── **/}
          <div style={styles.leftColumn}>
            <div style={styles.totalProductsTopRow}>
              {sampleProducts.length} total products
            </div>
            <div style={styles.filterCard}>
              {/* Product Status */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Product Status</div>
                <div style={styles.statusButtonsRow}>
                  <button
                    onClick={() => setStatusFilter("All")}
                    style={{
                      ...styles.statusButton,
                      ...(statusFilter === "All"
                        ? styles.statusButtonActive
                        : {}),
                    }}
                  >
                    All <span style={styles.statusBadge}>150</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("Active")}
                    style={{
                      ...styles.statusButtonMini,
                      ...(statusFilter === "Active"
                        ? styles.statusButtonActiveMini
                        : {}),
                    }}
                  >
                    Active <span style={styles.statusBadgeMini}>120</span>
                  </button>
                </div>
                <div style={styles.statusButtonsRow}>
                  <button
                    onClick={() => setStatusFilter("Inactive")}
                    style={{
                      ...styles.statusButtonMini,
                      ...(statusFilter === "Inactive"
                        ? styles.statusButtonActiveMini
                        : {}),
                    }}
                  >
                    Inactive <span style={styles.statusBadgeMini}>10</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("Draft")}
                    style={{
                      ...styles.statusButtonMini,
                      ...(statusFilter === "Draft"
                        ? styles.statusButtonActiveMini
                        : {}),
                    }}
                  >
                    Draft <span style={styles.statusBadgeMini}>10</span>
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Category</div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={styles.dropdown}
                >
                  <option>All</option>
                  <option>Chicken</option>
                  <option>Beef</option>
                  <option>Vegetarian</option>
                </select>
              </div>

              {/* Stock Filter */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Stock</div>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  style={styles.dropdown}
                >
                  <option value="All">All</option>
                  <option value="InStock">In Stock</option>
                  <option value="OutOfStock">Out of Stock</option>
                </select>
              </div>

              {/* Value Filter */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Value</div>
                <select
                  value={valueFilter}
                  onChange={(e) => setValueFilter(e.target.value)}
                  style={styles.dropdown}
                >
                  <option>All</option>
                  <option>Litre</option>
                  <option>Piece</option>
                  <option>Kg</option>
                </select>
              </div>

              {/* Quantity Input */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Piece / Item / Quantity</div>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  style={styles.textInput}
                />
              </div>

              {/* Price Filter */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Price</div>
                <div style={styles.priceRow}>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceMin}
                    onChange={(e) =>
                      setPriceMin(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    style={styles.textInput}
                  />
                  <span style={styles.currencySign}>$</span>
                </div>
                <div style={styles.priceRow}>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceMax}
                    onChange={(e) =>
                      setPriceMax(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    style={styles.textInput}
                  />
                  <span style={styles.currencySign}>$</span>
                </div>
              </div>

              {/* Reset Filters Button */}
              <button onClick={handleResetFilters} style={styles.resetButton}>
                Reset Filters
              </button>
            </div>
          </div>

          {/** ───────── RIGHT COLUMN: search/add + product list ───────── **/}
          <div style={styles.rightColumn}>
            {/* Top Controls: Search bar + Add New Inventory */}
            <div style={styles.topControls}>
              <div style={styles.searchWrapper}>
                <img src={SearchIcon} alt="Search" style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <div style={styles.buttonGroup}>
                <button
                  style={styles.addButton}
                  onClick={() => setIsCategoryDrawerOpen(true)}
                >
                  Add New Category
                </button>
                <button style={styles.addButton} onClick={openDrawerForAdd}>
                  Add New Inventory
                </button>
              </div>
            </div>

            {/* Category Cards */}
            <CategoryCards
              categories={categories}
              onEditCategory={handleEditCategory}
            />

            {/* Product List */}
            <div style={styles.productList}>
              {displayedProducts.map((prod) => (
                <div key={prod.id} style={styles.productCard}>
                  {/* Thumbnail */}
                  <div style={styles.productThumbWrapper}>
                    <img
                      src={prod.thumbnailUrl}
                      alt={prod.name}
                      style={styles.productThumb}
                    />
                  </div>

                  {/* Name + Subtext */}
                  <div style={styles.productInfo}>
                    <div style={styles.productName}>{prod.name}</div>
                    <div style={styles.productSubtext}>
                      Stocked Product:{" "}
                      <span style={styles.stockCount}>
                        {prod.stockCount} In Stock
                      </span>
                    </div>
                  </div>

                  {/* Meta Columns: Status / Category / Retail Price */}
                  <div style={styles.productMeta}>
                    <div style={styles.metaColumn}>
                      <div style={styles.metaLabel}>Status</div>
                      <div style={styles.metaValue}>{prod.status}</div>
                    </div>
                    <div style={styles.metaColumn}>
                      <div style={styles.metaLabel}>Category</div>
                      <div style={styles.metaValue}>{prod.category}</div>
                    </div>
                    <div style={styles.metaColumn}>
                      <div style={styles.metaLabel}>Retail Price</div>
                      <div style={styles.metaValue}>
                        ${prod.retailPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Action Icons: Edit + Delete */}
                  <div style={styles.actionIcons}>
                    <button
                      style={styles.iconButton}
                      onClick={() => openDrawerForProduct(prod)}
                    >
                      <img
                        src={PenIcon}
                        alt="Edit"
                        style={styles.actionIconImage}
                      />
                    </button>
                    <button style={styles.iconButton}>
                      <img
                        src={TrashIcon}
                        alt="Delete"
                        style={styles.actionIconImage}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/** ───────────── Add/Edit Drawer ───────────── **/}
      <InventoryFormDrawer
        product={editingProduct}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onSave={handleSaveDrawer}
        onScanBarcode={handleScanBarcode}
      />

      {/** ───────────── Category Drawer ───────────── **/}
      <CategoryFormDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => {
          setIsCategoryDrawerOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        category={editingCategory}
      />
    </div>
  );
}

/** Inline Styles for Inventory.tsx **/
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1F1F1F",
    minHeight: "100vh",
    color: "#FFFFFF",
    fontFamily: "Poppins, Helvetica, sans-serif",
    boxSizing: "border-box",
  },
  inner: {
    padding: "16px",
    flexGrow: 1,
  },
  mainFlex: {
    display: "flex",
    gap: "16px", // space between left and right columns
    height: "calc(100% - 64px)", // leave room for header + top controls
  },

  /***** LEFT COLUMN *****/
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: "280px", // fixed width for filter card
    gap: "16px", // space between "total products" and card
    marginTop: "8px", // align with the top of search bar on right
  },
  totalProductsTopRow: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#FFFFFF",
    whiteSpace: "nowrap",
    marginBottom: "11px",
  },
  filterCard: {
    backgroundColor: "#2A2A2A",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxSizing: "border-box",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardTitle: {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "#DDDDDD",
  },
  statusButtonsRow: {
    display: "flex",
    gap: "8px",
  },
  statusButton: {
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    backgroundColor: "#2A2A2A",
    border: "1px solid #323232",
    borderRadius: "8px",
    color: "#DDDDDD",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  statusButtonActive: {
    backgroundColor: "#292C2D",
    borderColor: "#FAC1D9",
    color: "#FFFFFF",
  },
  statusButtonMini: {
    flexGrow: 1,
    padding: "8px 12px",
    backgroundColor: "#2A2A2A",
    border: "1px solid #323232",
    borderRadius: "8px",
    color: "#DDDDDD",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
  statusButtonActiveMini: {
    backgroundColor: "#292C2D",
    borderColor: "#FAC1D9",
    color: "#FFFFFF",
  },
  statusBadge: {
    marginLeft: "8px",
    backgroundColor: "#FAC1D9",
    color: "#292C2D",
    borderRadius: "12px",
    padding: "0 6px",
    fontSize: "0.75rem",
    fontWeight: 500,
  },
  statusBadgeMini: {
    marginLeft: "4px",
    backgroundColor: "#FAC1D9",
    color: "#292C2D",
    borderRadius: "12px",
    padding: "0 4px",
    fontSize: "0.65rem",
    fontWeight: 500,
  },
  dropdown: {
    backgroundColor: "#292C2D",
    border: "1px solid #323232",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#DDDDDD",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
  },
  textInput: {
    width: "100%",
    backgroundColor: "#292C2D",
    border: "1px solid #323232",
    borderRadius: "8px",
    padding: "8px 12px",
    color: "#DDDDDD",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  currencySign: {
    position: "absolute",
    right: "12px",
    color: "#DDDDDD",
    fontSize: "0.875rem",
  },
  resetButton: {
    marginTop: "auto",
    backgroundColor: "#FAC1D9",
    color: "#292C2D",
    border: "none",
    borderRadius: "8px",
    padding: "10px 0",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    transition: "background-color 0.2s",
  },

  /***** RIGHT COLUMN *****/
  rightColumn: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  topControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchWrapper: {
    position: "relative",
    flexGrow: 1,
    maxWidth: "400px",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "16px",
    height: "16px",
    opacity: 0.6,
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px 8px 36px",
    borderRadius: "20px",
    border: "1px solid #323232",
    backgroundColor: "#292C2D",
    color: "#DDDDDD",
    fontSize: "0.875rem",
    outline: "none",
    boxSizing: "border-box",
  },
  buttonGroup: {
    display: "flex",
    gap: "16px",
    marginLeft: "16px",
  },
  addButton: {
    backgroundColor: "#FAC1D9",
    color: "#292C2D",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "0.875rem",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background-color 0.2s",
  },

  productList: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
    padding: "4px 0",
  },
  productCard: {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto auto",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    borderRadius: "8px",
    padding: "12px 16px",
    gap: "16px",
  },
  productThumbWrapper: {
    width: "60px",
    height: "60px",
    flexShrink: 0,
  },
  productThumb: {
    width: "100%",
    height: "100%",
    borderRadius: "8px",
    objectFit: "cover",
  },
  productInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  productName: {
    color: "#FFFFFF",
    fontSize: "0.875rem",
    fontWeight: 600,
  },
  productSubtext: {
    color: "#DDDDDD",
    fontSize: "0.75rem",
  },
  stockCount: {
    color: "#FAC1D9",
    fontWeight: 500,
  },
  productMeta: {
    display: "flex",
    gap: "24px",
    marginLeft: "auto",
    marginRight: "16px",
  },
  metaColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metaLabel: {
    fontSize: "0.65rem",
    color: "#AAAAAA",
  },
  metaValue: {
    fontSize: "0.75rem",
    color: "#DDDDDD",
    fontWeight: 500,
  },
  actionIcons: {
    display: "flex",
    gap: "8px",
  },
  iconButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  actionIconImage: {
    width: "16px",
    height: "16px",
    opacity: 0.8,
  },
};
