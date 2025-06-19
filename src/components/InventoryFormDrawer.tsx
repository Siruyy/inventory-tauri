// src/components/InventoryFormDrawer.tsx
import React, { useState, useEffect } from "react";
import { useCategories } from "../hooks/useCategories";
import { open } from "@tauri-apps/plugin-dialog";
import { formatFilePath } from "../utils/fileUtils";

interface Product {
  id: string;
  name: string;
  thumbnailUrl: string;
  displayUrl: string;
  stockCount: number;
  status: "Active" | "Inactive" | "Draft";
  category: string;
  retailPrice: number;
  priceBought: number;
  perishable: boolean;
  barcode?: string;
}

interface InventoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product?: any;
}

export default function InventoryFormDrawer({
  product,
  isOpen,
  onClose,
  onSave,
}: InventoryFormDrawerProps) {
  // Get categories from the hook
  const { categories } = useCategories();
  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Local form state; when "product" changes (or product === null), initialize fields
  const [formValues, setFormValues] = useState<Product>({
    id: "",
    name: "",
    thumbnailUrl: "",
    displayUrl: "",
    stockCount: 0,
    status: "Active",
    category: "",
    retailPrice: 0,
    priceBought: 0,
    perishable: false,
    barcode: "",
  });

  useEffect(() => {
    if (product) {
      // EDIT mode: fill form with existing product data
      setFormValues({
        id: product.id,
        name: product.name,
        thumbnailUrl: product.thumbnailUrl,
        displayUrl: "", // Will be loaded in a separate effect
        stockCount: product.stockCount,
        status: product.status,
        category: product.category,
        retailPrice: product.retailPrice,
        priceBought: product.priceBought || 0,
        perishable: product.perishable ?? false,
        barcode: product.barcode || "",
      });
    } else {
      // ADD mode: blank/default form with first available category
      const defaultCategory = categories.length > 0 ? categories[0].name : "";
      setFormValues({
        id: "", // new ID will be assigned on save
        name: "",
        thumbnailUrl: "",
        displayUrl: "",
        stockCount: 0,
        status: "Active",
        category: defaultCategory,
        retailPrice: 0,
        priceBought: 0,
        perishable: false,
        barcode: "",
      });
    }
  }, [product, isOpen, categories.length]);

  // Load image when thumbnailUrl changes
  useEffect(() => {
    const loadImage = async () => {
      if (formValues.thumbnailUrl) {
        setIsLoadingImage(true);
        try {
          const displayUrl = await formatFilePath(formValues.thumbnailUrl);
          setFormValues(prev => ({
            ...prev,
            displayUrl
          }));
        } catch (error) {
          console.error("Error loading image:", error);
        } finally {
          setIsLoadingImage(false);
        }
      }
    };

    loadImage();
  }, [formValues.thumbnailUrl]);

  // If the drawer is closed, render nothing
  if (!isOpen) {
    return null;
  }

  const handleChange = (
    key: keyof Omit<Product, "id" | "thumbnailUrl" | "displayUrl">,
    value: string | number | boolean
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Pass only the necessary fields to the save handler (exclude displayUrl)
    const productToSave = {
      ...formValues,
      displayUrl: undefined
    };
    onSave(productToSave);
  };

  const handleImageSelect = async () => {
    try {
      // Open file dialog to select an image
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "gif", "webp"],
          },
        ],
      });

      // If user selected a file, update the thumbnailUrl
      if (selected && !Array.isArray(selected)) {
        setFormValues((prev) => ({
          ...prev,
          thumbnailUrl: selected,
          // displayUrl will be updated by the useEffect
        }));
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  return (
    <>
      {/* Inject keyframes for slideIn */}
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}
      </style>

      {/* Semi‐opaque overlay */}
      <div style={styles.overlay}>
        {/* Drawer itself */}
        <div style={styles.drawer}>
          {/* Top row: Title + Close button */}
          <div style={styles.drawerHeader}>
            <div style={styles.drawerTitle}>
              {product ? "Edit Inventory" : "Add New Inventory"}
            </div>
            <button onClick={onClose} style={styles.closeButton} disabled={isLoadingImage}>
              ×
            </button>
          </div>

          {/* Drawer body */}
          <div style={styles.drawerBody}>
            {/* Image upload / placeholder */}
            <div style={styles.imageSection}>
              <div style={styles.imagePlaceholder}>
                {isLoadingImage ? (
                  <div style={styles.loadingIndicator}>Loading...</div>
                ) : formValues.displayUrl ? (
                  <img
                    src={formValues.displayUrl}
                    alt="Thumbnail"
                    style={styles.thumbnailImage}
                    onError={(e) => {
                      console.error("Error loading image:", formValues.displayUrl);
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='216' viewBox='0 0 240 216'%3E%3Crect width='240' height='216' fill='%23383C3D'/%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div style={styles.thumbnailIconPlaceholder}>
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#888888"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14" />
                      <circle cx="12" cy="13" r="4" />
                      <polyline points="14.5 9.5 9.5 14.5 7 12" />
                    </svg>
                  </div>
                )}
              </div>
              <div 
                style={{
                  ...styles.changePicText,
                  ...(isLoadingImage ? { opacity: 0.5, cursor: 'not-allowed' } : {})
                }} 
                onClick={isLoadingImage ? undefined : handleImageSelect}
              >
                {isLoadingImage ? 'Loading...' : 'Change Profile Picture'}
              </div>
            </div>

            {/* Form fields */}
            <div style={styles.formGrid}>
              {/* NAME */}
              <div style={styles.formRow}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter inventory name"
                  style={styles.textInput}
                  disabled={isLoadingImage}
                />
              </div>

              {/* CATEGORY */}
              <div style={styles.formRow}>
                <label style={styles.label}>Category</label>
                <div style={styles.selectWrapper}>
                  <select
                    value={formValues.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    style={styles.dropdown}
                    disabled={isLoadingImage}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div style={styles.selectArrow}>▼</div>
                </div>
              </div>

              {/* QUANTITY */}
              <div style={styles.formRow}>
                <label style={styles.label}>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formValues.stockCount}
                  onChange={(e) =>
                    handleChange("stockCount", Number(e.target.value))
                  }
                  placeholder="Enter quantity"
                  style={styles.textInput}
                  disabled={isLoadingImage}
                />
              </div>

              {/* STOCK */}
              <div style={styles.formRow}>
                <label style={styles.label}>Stock</label>
                <div style={styles.selectWrapper}>
                  <select
                    value={formValues.stockCount > 0 ? "InStock" : "OutOfStock"}
                    onChange={(e) =>
                      handleChange(
                        "stockCount",
                        e.target.value === "InStock" ? 1 : 0
                      )
                    }
                    style={styles.dropdown}
                    disabled={isLoadingImage}
                  >
                    <option value="InStock">In Stock</option>
                    <option value="OutOfStock">Out of Stock</option>
                  </select>
                  <div style={styles.selectArrow}>▼</div>
                </div>
              </div>

              {/* STATUS */}
              <div style={{ ...styles.formRow, gridColumn: "span 2" }}>
                <label style={styles.label}>Status</label>
                <div style={styles.selectWrapper}>
                  <select
                    value={formValues.status}
                    onChange={(e) =>
                      handleChange("status", e.target.value as any)
                    }
                    style={styles.dropdown}
                    disabled={isLoadingImage}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </select>
                  <div style={styles.selectArrow}>▼</div>
                </div>
              </div>

              {/* PRICE */}
              <div style={{ ...styles.formRow, gridColumn: "span 2" }}>
                <label style={styles.label}>Price</label>
                <div style={styles.priceWrapper}>
                  <input
                    type="number"
                    value={formValues.retailPrice}
                    onChange={(e) =>
                      handleChange("retailPrice", Number(e.target.value))
                    }
                    placeholder="Enter inventory price"
                    style={styles.textInput}
                    disabled={isLoadingImage}
                  />
                </div>
              </div>

              {/* PRICE BOUGHT */}
              <div style={{ ...styles.formRow, gridColumn: "span 2" }}>
                <label style={styles.label}>Price Bought</label>
                <div style={styles.priceWrapper}>
                  <input
                    type="number"
                    value={formValues.priceBought}
                    onChange={(e) =>
                      handleChange("priceBought", Number(e.target.value))
                    }
                    placeholder="Enter purchase price"
                    style={styles.textInput}
                    disabled={isLoadingImage}
                  />
                </div>
              </div>

              {/* BARCODE */}
              <div style={{ ...styles.formRow, gridColumn: "span 2" }}>
                <label style={styles.label}>Barcode</label>
                <input
                  type="text"
                  value={formValues.barcode || ""}
                  onChange={(e) => handleChange("barcode", e.target.value)}
                  placeholder="Enter barcode"
                  style={styles.textInput}
                  disabled={isLoadingImage}
                />
              </div>

              {/* PERISHABLE */}
              <div
                style={{
                  ...styles.formRow,
                  gridColumn: "span 2",
                  marginTop: "24px",
                }}
              >
                <span style={styles.label}>Perishable</span>
                <div style={styles.radioGroup}>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="perishable"
                      checked={formValues.perishable === true}
                      onChange={() => handleChange("perishable", true)}
                      style={styles.radioInput}
                      disabled={isLoadingImage}
                    />{" "}
                    Yes
                  </label>
                  <label style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="perishable"
                      checked={formValues.perishable === false}
                      onChange={() => handleChange("perishable", false)}
                      style={styles.radioInput}
                      disabled={isLoadingImage}
                    />{" "}
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Drawer footer */}
          <div style={styles.drawerFooter}>
            <button 
              onClick={onClose} 
              style={styles.cancelButton}
              disabled={isLoadingImage}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              style={styles.saveButton}
              disabled={isLoadingImage}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "flex-end",
  },
  drawer: {
    width: "600px",
    backgroundColor: "#292C2D",
    height: "100%",
    boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.3)",
    animation: "slideIn 0.3s ease-out",
    display: "flex",
    flexDirection: "column",
  },
  drawerHeader: {
    padding: "20px",
    borderBottom: "1px solid #3D4142",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#FFFFFF",
    fontSize: "1.5rem",
    cursor: "pointer",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    transition: "background-color 0.2s",
  },
  drawerBody: {
    padding: "20px",
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  imageSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  imagePlaceholder: {
    width: "150px",
    height: "150px",
    backgroundColor: "#3D4142",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: "10px",
    objectFit: "cover",
  },
  thumbnailIconPlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  changePicText: {
    fontSize: "0.9rem",
    color: "#FAC1D9",
    cursor: "pointer",
  },
  loadingIndicator: {
    color: "#FFFFFF",
    fontSize: "16px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: "20px",
    rowGap: "20px",
    width: "100%",
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#FFFFFF",
    fontSize: "1rem",
    fontWeight: 500,
  },
  textInput: {
    padding: "12px 16px",
    backgroundColor: "#3D4142",
    border: "1px solid #323232",
    borderRadius: "10px",
    color: "#DDDDDD",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
  },
  dropdown: {
    padding: "12px 16px",
    backgroundColor: "#3D4142",
    border: "1px solid #323232",
    borderRadius: "10px",
    color: "#DDDDDD",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
    appearance: "none", // Remove default arrow
  },
  selectWrapper: {
    position: "relative",
    width: "100%",
  },
  selectArrow: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#777979",
    fontSize: "0.7rem",
    pointerEvents: "none",
  },
  priceWrapper: {
    position: "relative",
    width: "100%",
  },
  currencySign: {
    position: "absolute",
    right: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#FAC1D9",
    fontSize: "1rem",
  },
  radioGroup: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
    marginTop: "8px",
  },
  radioOption: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  radioButton: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "2px solid #777979",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#FAC1D9",
  },
  radioLabel: {
    color: "#DDDDDD",
    fontSize: "0.9rem",
  },
  drawerFooter: {
    padding: "20px",
    borderTop: "1px solid #3D4142",
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
  },
  cancelButton: {
    padding: "12px 24px",
    backgroundColor: "transparent",
    border: "1px solid #3D4142",
    borderRadius: "8px",
    color: "#FFFFFF",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  saveButton: {
    padding: "12px 24px",
    backgroundColor: "#FAC1D9",
    border: "none",
    borderRadius: "8px",
    color: "#292C2D",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  radioInput: {
    accentColor: "#FAC1D9",
    cursor: "pointer",
    width: "16px",
    height: "16px",
  },
};
