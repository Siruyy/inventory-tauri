import React, { useState, useEffect } from "react";
import "./CategoryFormDrawer.css";

interface CategoryFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryData: { name: string; imageUrl: string }) => void;
  category?: { name: string; icon: string } | null;
}

export default function CategoryFormDrawer({
  isOpen,
  onClose,
  onSave,
  category = null,
}: CategoryFormDrawerProps) {
  const [categoryName, setCategoryName] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Reset form when opening drawer or changing category
  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      setImageUrl(category.icon);
    } else {
      setCategoryName("");
      setImageUrl("");
    }
  }, [category, isOpen]);

  const handleSave = () => {
    onSave({
      name: categoryName,
      imageUrl: imageUrl || "https://via.placeholder.com/240x216",
    });
    setCategoryName("");
    setImageUrl("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          style={{
            ...styles.backdrop,
            opacity: isOpen ? 1 : 0,
          }}
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          ...styles.drawer,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {category ? "Edit Category" : "Add New Category"}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>
            <span style={styles.closeIcon}>×</span>
          </button>
        </div>

        <div style={styles.divider} />

        {/* Form Content */}
        <div style={styles.content}>
          {/* Image Upload Section */}
          <div style={styles.imageSection}>
            <div style={styles.imagePreview}>
              <img
                src={imageUrl || "https://via.placeholder.com/240x216"}
                alt="Category preview"
                style={styles.previewImage}
              />
            </div>
            <button style={styles.changeImageButton}>
              Change Profile\Icon
            </button>
          </div>

          {/* Name Input Section */}
          <div style={styles.inputSection}>
            <label style={styles.label}>Name</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter Category Name"
                style={styles.input}
                className="category-input"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button style={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    transition: "opacity 0.3s ease-in-out",
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "450px",
    height: "100vh",
    backgroundColor: "#292C2D",
    zIndex: 1001,
    transition: "transform 0.3s ease-in-out",
    display: "flex",
    flexDirection: "column",
    padding: "0",
    boxSizing: "border-box",
  },
  header: {
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#FFFFFF",
    fontSize: "20px",
    fontWeight: 500,
    margin: 0,
  },
  closeButton: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#3D4142",
    border: "none",
    color: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  closeIcon: {
    fontSize: "24px",
    lineHeight: 1,
  },
  divider: {
    height: "1px",
    backgroundColor: "#5E5E5E",
    margin: "0 24px",
  },
  content: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    alignItems: "center",
    width: "100%",
    boxSizing: "border-box",
  },
  imageSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    alignItems: "center",
    marginBottom: "24px",
    width: "100%",
    padding: "0 24px",
    boxSizing: "border-box",
  },
  imagePreview: {
    width: "120px",
    height: "120px",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#383C3D",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  changeImageButton: {
    color: "#FAC1D9",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    padding: "0",
  },
  inputSection: {
    width: "100%",
    paddingTop: "0",
    paddingBottom: "0",
    paddingLeft: "4px",
    paddingRight: "24px",
    boxSizing: "border-box",
  },
  label: {
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 500,
    marginBottom: "12px",
    display: "block",
  },
  inputWrapper: {
    marginTop: "0",
    width: "100%",
  },
  input: {
    width: "100%",
    height: "40px",
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "8px",
    padding: "0 12px",
    color: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
  },
  footer: {
    marginTop: "auto",
    padding: "24px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "16px",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "none",
    color: "#FFFFFF",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
  saveButton: {
    padding: "8px 24px",
    backgroundColor: "#FAC1D9",
    border: "none",
    borderRadius: "8px",
    color: "#333333",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
  },
};
