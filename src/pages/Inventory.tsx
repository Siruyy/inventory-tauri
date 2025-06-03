// src/pages/Inventory.tsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";

import SearchIcon from "./search.svg";
import PenIcon from "./pen.svg";
import TrashIcon from "./trash.svg";

interface Product {
  id: string;
  name: string;
  thumbnailUrl: string;
  stockCount: number;
  status: "Active" | "Inactive" | "Draft";
  category: string;
  retailPrice: number;
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
  },
  {
    id: "P002",
    name: "Chicken Parmesan",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 10,
    status: "Active",
    category: "Chicken",
    retailPrice: 55.0,
  },
  {
    id: "P003",
    name: "Chicken Parmesan",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 10,
    status: "Active",
    category: "Chicken",
    retailPrice: 55.0,
  },
  {
    id: "P004",
    name: "Chicken Parmesan",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 10,
    status: "Active",
    category: "Chicken",
    retailPrice: 55.0,
  },
  {
    id: "P005",
    name: "Chicken Parmesan",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 10,
    status: "Active",
    category: "Chicken",
    retailPrice: 55.0,
  },
  {
    id: "P006",
    name: "Chicken Parmesan",
    thumbnailUrl: "https://via.placeholder.com/60",
    stockCount: 10,
    status: "Active",
    category: "Chicken",
    retailPrice: 55.0,
  },
];

export default function Inventory() {
  // State (no real filtering for now)
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive" | "Draft">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<"All" | "InStock" | "OutOfStock">("All");
  const [valueFilter, setValueFilter] = useState<string>("All");
  const [quantity, setQuantity] = useState<number | "">("");
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");

  const [displayedProducts, setDisplayedProducts] = useState<Product[]>(sampleProducts);
  useEffect(() => {
    // No actual filtering logic yet
    setDisplayedProducts(sampleProducts);
  }, [searchTerm, statusFilter, categoryFilter, stockFilter, valueFilter, quantity, priceMin, priceMax]);

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

  return (
    <div style={styles.pageContainer}>
      {/* Shared header */}
      <Header title="Inventory" />

      <div style={styles.inner}>
        <div style={styles.mainFlex}>
          {/** LEFT COLUMN (lowered by marginTop) **/}
          <div style={styles.leftColumn}>
            <div style={styles.totalProductsTopRow}>
              {sampleProducts.length} total products
            </div>

            <div style={styles.filterCard}>
              {/* PRODUCT STATUS */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Product Status</div>
                <div style={styles.statusButtonsRow}>
                  <button
                    onClick={() => setStatusFilter("All")}
                    style={{
                      ...styles.statusButton,
                      ...(statusFilter === "All" ? styles.statusButtonActive : {}),
                    }}
                  >
                    All <span style={styles.statusBadge}>150</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("Active")}
                    style={{
                      ...styles.statusButtonMini,
                      ...(statusFilter === "Active" ? styles.statusButtonActiveMini : {}),
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
                      ...(statusFilter === "Inactive" ? styles.statusButtonActiveMini : {}),
                    }}
                  >
                    Inactive <span style={styles.statusBadgeMini}>10</span>
                  </button>
                  <button
                    onClick={() => setStatusFilter("Draft")}
                    style={{
                      ...styles.statusButtonMini,
                      ...(statusFilter === "Draft" ? styles.statusButtonActiveMini : {}),
                    }}
                  >
                    Draft <span style={styles.statusBadgeMini}>10</span>
                  </button>
                </div>
              </div>

              {/* CATEGORY */}
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

              {/* STOCK */}
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

              {/* VALUE */}
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

              {/* QUANTITY */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Piece / Item / Quantity</div>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  style={styles.textInput}
                />
              </div>

              {/* PRICE */}
              <div style={styles.section}>
                <div style={styles.cardTitle}>Price</div>
                <div style={styles.priceRow}>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value === "" ? "" : Number(e.target.value))}
                    style={styles.textInput}
                  />
                  <span style={styles.currencySign}>$</span>
                </div>
                <div style={styles.priceRow}>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value === "" ? "" : Number(e.target.value))}
                    style={styles.textInput}
                  />
                  <span style={styles.currencySign}>$</span>
                </div>
              </div>

              {/* RESET FILTERS */}
              <button onClick={handleResetFilters} style={styles.resetButton}>
                Reset Filters
              </button>
            </div>
          </div>

          {/** RIGHT COLUMN **/}
          <div style={styles.rightColumn}>
            {/** TOP CONTROLS: search + far‐right Add button **/}
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

              <button style={styles.addButton}>Add New Inventory</button>
            </div>

            {/** PRODUCT LIST **/}
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

                  {/* Name + “Stocked Product: X In Stock” */}
                  <div style={styles.productInfo}>
                    <div style={styles.productName}>{prod.name}</div>
                    <div style={styles.productSubtext}>
                      Stocked Product:{" "}
                      <span style={styles.stockCount}>{prod.stockCount} In Stock</span>
                    </div>
                  </div>

                  {/* Meta (Status / Category / Retail Price) */}
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
                      <div style={styles.metaValue}>${prod.retailPrice.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Action Icons */}
                  <div style={styles.actionIcons}>
                    <button style={styles.iconButton}>
                      <img src={PenIcon} alt="Edit" style={styles.actionIconImage} />
                    </button>
                    <button style={styles.iconButton}>
                      <img src={TrashIcon} alt="Delete" style={styles.actionIconImage} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Inline Styles **/
const styles: { [key: string]: React.CSSProperties } = {
  // Entire page container
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#1F1F1F",
    minHeight: "100vh",
    color: "#FFFFFF",
    fontFamily: "Poppins, Helvetica, sans-serif",
    boxSizing: "border-box",
  },

  // Inner area (below the header)
  inner: {
    padding: "16px",
    flexGrow: 1,
  },

  // Main two-column flex wrapper
  mainFlex: {
    display: "flex",
    gap: "16px", // gap between left and right columns
    height: "calc(100% - 64px)", // leave room for header + top controls
  },

  /***** LEFT COLUMN *****/
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: "280px", // fixed width for filters
    gap: "16px",    // gap between “total products” & filter card
    marginTop: "10px", // lower the left column slightly so it lines up with right top controls
  },
  totalProductsTopRow: {
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#FFFFFF",
    whiteSpace: "nowrap",
    marginBottom: "10px",
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

  /***** RIGHT COLUMN *****/
  rightColumn: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  // Top controls: search + add button, spaced apart
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
  addButton: {
    marginLeft: "16px",
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

  /***** PRODUCT LIST (RIGHT) *****/
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

  /***** GENERIC FILTER CARD SUB-STYLES *****/
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
};
