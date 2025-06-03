// src/components/InventoryFormDrawer.tsx
import React, { useState, useEffect } from "react";

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
  // Local form state; when “product” changes (or product === null), initialize fields
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
        id: "",                // new ID will be assigned on save
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
              <button
                onClick={() => onScanBarcode && onScanBarcode()}
                style={styles.scanButton}
              >
                Scan Barcode
              </button>
              <div style={styles.changePicText}>Change Profile Picture</div>
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
                <select
                  value={formValues.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  style={styles.dropdown}
                >
                  <option>All</option>
                  <option>Chicken</option>
                  <option>Beef</option>
                  <option>Vegetarian</option>
                </select>
              </div>

              {/* QUANTITY */}
              <div style={styles.formRow}>
                <label style={styles.label}>Quantity</label>
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
              </div>

              {/* STOCK */}
              <div style={styles.formRow}>
                <label style={styles.label}>Stock</label>
                <select
                  value={formValues.stockCount > 0 ? "InStock" : "OutOfStock"}
                  onChange={(e) =>
                    handleChange("stockCount", e.target.value === "InStock" ? 1 : 0)
                  }
                  style={styles.dropdown}
                >
                  <option value="InStock">In Stock</option>
                  <option value="OutOfStock">Out of Stock</option>
                </select>
              </div>

              {/* STATUS */}
              <div style={styles.formRow}>
                <label style={styles.label}>Status</label>
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
              </div>

              {/* PRICE */}
              <div style={styles.formRow}>
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
                  <span style={styles.currencySign}>$</span>
                </div>
              </div>

              {/* PERISHABLE */}
              <div style={styles.formRow}>
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
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "480px",                     // ← Wider drawer
    backgroundColor: "#2A2A2A",
    boxShadow: "-4px 0 8px rgba(0,0,0,0.5)",
    display: "flex",
    flexDirection: "column",
    borderTopLeftRadius: "16px",        // ← Rounded top‐left corner
    borderBottomLeftRadius: "16px",     // ← Rounded bottom‐left corner
    boxSizing: "border-box",
    animation: "slideIn 0.3s ease-out forwards", // ← Slide‐in animation
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",               // ← Extra left/right padding
    borderBottom: "1px solid #323232",
  },
  drawerTitle: {
    color: "#FFFFFF",
    fontSize: "1.1rem",
    fontWeight: 600,
  },
  closeButton: {
    backgroundColor: "#383838",         // Circle background
    border: "none",
    color: "#FFFFFF",
    fontSize: "1.2rem",
    fontWeight: 600,
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    lineHeight: 1,
  },
  drawerBody: {
    padding: "16px 24px",               // ← Extra left/right padding
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
    alignItems: "flex-start",
    gap: "8px",
  },
  imagePlaceholder: {
    width: "120px",
    height: "120px",
    backgroundColor: "#383838",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: "8px",
    objectFit: "cover",
  },
  thumbnailIconPlaceholder: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  scanButton: {
    marginTop: "8px",
    backgroundColor: "#FAC1D9",
    color: "#292C2D",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "background-color 0.2s",
  },
  changePicText: {
    fontSize: "0.75rem",
    color: "#FAC1D9",
    textDecoration: "underline",
    cursor: "pointer",
  },

  // FORM GRID
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: "16px",
    rowGap: "16px",
  },
  formRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    color: "#FFFFFF",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
  textInput: {
    padding: "8px 12px",
    backgroundColor: "#383838",
    border: "1px solid #323232",
    borderRadius: "6px",
    color: "#DDDDDD",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  dropdown: {
    padding: "8px 12px",
    backgroundColor: "#383838",
    border: "1px solid #323232",
    borderRadius: "6px",
    color: "#DDDDDD",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  priceWrapper: {
    position: "relative",
  },
  currencySign: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#DDDDDD",
    fontSize: "0.9rem",
  },
  radioGroup: {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#DDDDDD",
    fontSize: "0.85rem",
    cursor: "pointer",
  },
  radioInput: {
    accentColor: "#FAC1D9",
    cursor: "pointer",
  },

  // FOOTER (Cancel + Save)
  drawerFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "16px",
    padding: "16px 24px",               // ← Extra left/right padding
    borderTop: "1px solid #323232",
  },
  cancelButton: {
    background: "transparent",
    border: "none",
    color: "#FFFFFF",
    fontSize: "0.9rem",
    cursor: "pointer",
    textDecoration: "underline",
  },
  saveButton: {
    backgroundColor: "#FAC1D9",
    color: "#292C2D",
    border: "none",
    borderRadius: "8px",
    padding: "8px 20px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },
};
