// src/pages/Inventory.tsx
import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import InventoryFormDrawer from "../components/InventoryFormDrawer";
import CategoryFormDrawer from "../components/CategoryFormDrawer";
import { CategoryCards } from "../components/CategoryCards";
import { ProductList } from "../components/ProductList";
import { AddCategoryDialog } from "../components/AddCategoryDialog";
import { AddProductDialog } from "../components/AddProductDialog";

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <div className="space-x-4">
          <AddCategoryDialog />
          <AddProductDialog />
        </div>
      </div>

      <CategoryCards
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <ProductList selectedCategoryId={selectedCategoryId} />
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
