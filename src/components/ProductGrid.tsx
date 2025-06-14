import React, { useState } from "react";
import { Product, useProducts } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";
import SearchIcon from "/icons/search.svg";

interface ProductGridProps {
  selectedCategoryId?: number;
}

export function ProductGrid({ selectedCategoryId }: ProductGridProps) {
  const { products, updateStock, deleteProduct } =
    useProducts(selectedCategoryId);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleUpdateStock = (product: Product, newStock: number) => {
    updateStock(
      { id: product.id, newStock },
      {
        onSuccess: () => {
          // Handle success if needed
        },
      }
    );
  };

  const handleEditProduct = (product: Product) => {
    // This will be implemented later with the product edit form
    console.log("Edit product:", product);
  };

  return (
    <div style={styles.container}>
      {/* Search and Filters Bar */}
      <div style={styles.controlsBar}>
        <div style={styles.searchContainer}>
          <img src={SearchIcon} alt="Search" style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, SKU or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filters}>
          {/* Placeholder for additional filters */}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div style={styles.grid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEditProduct}
              onDelete={deleteProduct}
            />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p>No products found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "100%",
  },
  controlsBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#292C2D",
    borderRadius: "8px",
    padding: "8px 16px",
    width: "400px",
    position: "relative",
  },
  searchIcon: {
    width: "18px",
    height: "18px",
    opacity: 0.7,
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
  filters: {
    display: "flex",
    gap: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
    width: "100%",
  },
  emptyState: {
    width: "100%",
    textAlign: "center",
    padding: "40px 0",
    color: "#AAAAAA",
    fontSize: "16px",
  },
};
