// src/components/InventoryFormDrawer.tsx
import React, { useState, useEffect } from "react";
import { useCategories } from "../hooks/useCategories";
import { open } from "@tauri-apps/plugin-dialog";

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

interface InventoryFormDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Product) => void;
  onScanBarcode?: () => void;
}

export default function InventoryFormDrawer({
  product,
  isOpen,
  onClose,
  onSave,
  onScanBarcode,
}: InventoryFormDrawerProps) {
  // Get categories from the hook
  const { categories } = useCategories();

  // Local form state; when "product" changes (or product === null), initialize fields
  const [formValues, setFormValues] = useState<Product>({
    id: "",
    name: "",
    thumbnailUrl: "",
    stockCount: 0,
    status: "Active",
    category: "All",
    retailPrice: 0,
    perishable: false,
  });

  useEffect(() => {
    if (product) {
      // EDIT mode: fill form with existing product data
      setFormValues({
        id: product.id,
        name: product.name,
        thumbnailUrl: product.thumbnailUrl,
        stockCount: product.stockCount,
        status: product.status,
        category: product.category,
        retailPrice: product.retailPrice,
        perishable: product.perishable ?? false,
      });
    } else {
      // ADD mode: blank/default form
      setFormValues({
        id: "", // new ID will be assigned on save
        name: "",
        thumbnailUrl: "",
        stockCount: 0,
        status: "Active",
        category: "All",
        retailPrice: 0,
        perishable: false,
      });
    }
  }, [product, isOpen]);

  // If the drawer is closed, render nothing
  if (!isOpen) {
    return null;
  }

  const handleChange = (
    key: keyof Omit<Product, "id" | "thumbnailUrl">,
    value: string | number | boolean
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSave(formValues);
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
            <button onClick={onClose} style={styles.closeButton}>
              ×
            </button>
          </div>

          {/* Drawer body */}
          <div style={styles.drawerBody}>
            {/* Image upload / placeholder */}
            <div style={styles.imageSection}>
              <div style={styles.imagePlaceholder}>
                {formValues.thumbnailUrl ? (
                  <img
                    src={formValues.thumbnailUrl}
                    alt="Thumbnail"
                    style={styles.thumbnailImage}
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
              <div style={styles.changePicText} onClick={handleImageSelect}>
                Change Profile Picture
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
                  >
                    <option value="All">All</option>
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
                <div style={styles.selectWrapper}>
                  <select
                    value={formValues.stockCount}
                    onChange={(e) =>
                      handleChange("stockCount", Number(e.target.value))
                    }
                    style={styles.dropdown}
                  >
                    {[...Array(51).keys()].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <div style={styles.selectArrow}>▼</div>
                </div>
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
                  />
                </div>
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
                    />{" "}
                    No
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Cancel / Save */}
          <div style={styles.drawerFooter}>
            <button onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button onClick={handleSave} style={styles.saveButton}>
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
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: 1000,
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "640px", // Wider drawer to match Figma design
    backgroundColor: "#292C2D",
    boxShadow: "-4px 0 8px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    borderTopLeftRadius: "30px", // Rounded corners to match Figma
    borderBottomLeftRadius: "30px", // Rounded corners to match Figma
    boxSizing: "border-box",
    animation: "slideIn 0.3s ease-out forwards", // Slide‐in animation
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 30px",
    borderBottom: "1px solid #5E5E5E",
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: "1.5rem",
    fontWeight: 500,
  },
  closeButton: {
    backgroundColor: "#3D4142",
    border: "none",
    color: "#FFFFFF",
    fontSize: "1.2rem",
    fontWeight: 600,
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    lineHeight: 1,
  },
  drawerBody: {
    padding: "24px 30px",
    flexGrow: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  // IMAGE SECTION
  imageSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    marginBottom: "32px",
  },
  imagePlaceholder: {
    width: "240px",
    height: "216px",
    backgroundColor: "#383C3D",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  // FORM GRID
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
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#777979",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  radioInput: {
    accentColor: "#FAC1D9",
    cursor: "pointer",
    width: "16px",
    height: "16px",
  },

  // FOOTER (Cancel + Save)
  drawerFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "16px",
    padding: "24px 30px",
    borderTop: "1px solid #5E5E5E",
  },
  cancelButton: {
    background: "transparent",
    border: "none",
    color: "#FFFFFF",
    fontSize: "1rem",
    cursor: "pointer",
  },
  saveButton: {
    backgroundColor: "#FAC1D9",
    color: "#292C2D",
    border: "none",
    borderRadius: "10px",
    padding: "16px 48px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
  },
};
