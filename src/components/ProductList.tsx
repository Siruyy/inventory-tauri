import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Product } from "../hooks/useProducts";
import { useState, useMemo } from "react";
import PenIcon from "/icons/pen.svg";
import TrashIcon from "/icons/trash.svg";

interface FilterOptions {
  status: string | null;
  priceRange: { min: number; max: number };
}

interface ProductListProps {
  products: Product[];
  searchTerm?: string;
  filters?: FilterOptions;
  updateStock: (vars: { id: number; newStock: number }) => void;
  deleteProduct: (id: number) => void;
  onEdit?: (product: Product) => void;
}

export function ProductList({
  products,
  searchTerm = "",
  filters,
  updateStock,
  deleteProduct,
  onEdit,
}: ProductListProps) {
  const [editingStock, setEditingStock] = useState<{
    id: number;
    value: number;
  } | null>(null);

  // Filter products based on search term and other filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.supplier &&
            product.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filters
    if (filters?.status) {
      switch (filters.status) {
        case "active":
          filtered = filtered.filter((product) => product.current_stock > 0);
          break;
        case "outOfStock":
          filtered = filtered.filter((product) => product.current_stock === 0);
          break;
        case "lowStock":
          filtered = filtered.filter(
            (product) =>
              product.current_stock <= product.minimum_stock &&
              product.current_stock > 0
          );
          break;
      }
    }

    // Apply price range filter
    if (filters?.priceRange) {
      filtered = filtered.filter(
        (product) =>
          product.unit_price >= filters.priceRange.min &&
          product.unit_price <= filters.priceRange.max
      );
    }

    return filtered;
  }, [products, searchTerm, filters]);

  const handleUpdateStock = (product: Product) => {
    if (editingStock && editingStock.id === product.id) {
      updateStock({ id: product.id, newStock: editingStock.value });
      setEditingStock(null);
    }
  };

  const tableStyles = {
    container: {
      width: "100%",
      border: "1px solid #323232",
      borderRadius: "8px",
      backgroundColor: "#292C2D",
      display: "block",
      maxWidth: "100%",
      overflowX: "auto" as const,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
      borderSpacing: 0,
      minWidth: "1150px",
    },
    header: {
      backgroundColor: "#33363A",
    },
    headerCell: {
      padding: "16px 12px",
      color: "#DDDDDD",
      textAlign: "center" as const,
      fontWeight: 500,
      borderRight: "1px solid #444444",
      borderBottom: "1px solid #444444",
      whiteSpace: "nowrap" as const,
      overflow: "hidden" as const,
      textOverflow: "ellipsis" as const,
    },
    lastHeaderCell: {
      padding: "16px 12px",
      color: "#DDDDDD",
      textAlign: "center" as const,
      fontWeight: 500,
      borderBottom: "1px solid #444444",
      whiteSpace: "nowrap" as const,
      overflow: "hidden" as const,
      textOverflow: "ellipsis" as const,
    },
    cell: {
      padding: "16px 12px",
      borderBottom: "1px solid #323232",
      borderRight: "1px solid #323232",
      textAlign: "left" as const,
      whiteSpace: "nowrap" as const,
      overflow: "hidden" as const,
      textOverflow: "ellipsis" as const,
    },
    cellRight: {
      padding: "16px 12px",
      textAlign: "left" as const,
      borderBottom: "1px solid #323232",
      borderRight: "1px solid #323232",
      whiteSpace: "nowrap" as const,
      overflow: "hidden" as const,
      textOverflow: "ellipsis" as const,
    },
    lastCell: {
      padding: "16px 12px",
      borderBottom: "1px solid #323232",
      textAlign: "center" as const,
      whiteSpace: "nowrap" as const,
      overflow: "hidden" as const,
      textOverflow: "ellipsis" as const,
    },
  };

  return (
    <div style={tableStyles.container}>
      <table style={tableStyles.table}>
        <thead style={tableStyles.header}>
          <tr>
            <th style={{ ...tableStyles.headerCell, width: "16%" }}>Name</th>
            <th style={{ ...tableStyles.headerCell, width: "10%" }}>SKU</th>
            <th style={{ ...tableStyles.headerCell, width: "12%" }}>
              Supplier
            </th>
            <th style={{ ...tableStyles.headerCell, width: "12%" }}>
              Category
            </th>
            <th style={{ ...tableStyles.headerCell, width: "10%" }}>
              Current Stock
            </th>
            <th style={{ ...tableStyles.headerCell, width: "10%" }}>Status</th>
            <th style={{ ...tableStyles.headerCell, width: "10%" }}>
              Unit Price
            </th>
            <th style={{ ...tableStyles.lastHeaderCell, width: "8%" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                style={{
                  ...tableStyles.cell,
                  textAlign: "center",
                  padding: "24px",
                  borderRight: "none",
                }}
              >
                No products found. Try adjusting your search or filters.
              </td>
            </tr>
          ) : (
            filteredProducts.map((product, index) => (
              <tr
                key={product.id}
                style={{
                  transition: "background-color 0.2s",
                  backgroundColor: index % 2 === 0 ? "#292C2D" : "#33363A",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "#414548")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    index % 2 === 0 ? "#292C2D" : "#33363A")
                }
              >
                <td style={{ ...tableStyles.cell, fontWeight: 500 }}>
                  {product.name}
                </td>
                <td style={tableStyles.cell}>{product.sku}</td>
                <td style={tableStyles.cell}>{product.location || "—"}</td>
                <td style={tableStyles.cell}>{product.category_name}</td>
                <td style={tableStyles.cell}>
                  {editingStock?.id === product.id ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <Input
                        type="number"
                        min="0"
                        className="w-20 bg-[#1F1F1F] border-[#323232] text-[#FFFFFF]"
                        value={editingStock.value}
                        onChange={(e) =>
                          setEditingStock({
                            id: product.id,
                            value: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                      <Button
                        size="sm"
                        className="bg-[#FAC1D9] text-[#333333] hover:bg-[#e0a9c1]"
                        onClick={() => handleUpdateStock(product)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    product.current_stock
                  )}
                </td>
                <td style={{ ...tableStyles.cell, textAlign: "center" }}>
                  <span
                    style={{
                      backgroundColor:
                        product.current_stock > 0 ? "#2E7D32" : "#D32F2F",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    {product.current_stock > 0 ? "Active" : "Out of Stock"}
                  </span>
                </td>
                <td style={tableStyles.cellRight}>
                  ₱{product.unit_price.toFixed(2)}
                </td>
                <td style={tableStyles.lastCell}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <button
                      style={{ background: "none", border: "none" }}
                      onClick={() => {
                        if (onEdit) {
                          onEdit(product);
                        } else {
                          setEditingStock({
                            id: product.id,
                            value: product.current_stock,
                          });
                        }
                      }}
                    >
                      <img
                        src={PenIcon}
                        alt="Edit"
                        style={{ width: "16px", height: "16px" }}
                      />
                    </button>
                    <button
                      style={{ background: "none", border: "none" }}
                      onClick={() => deleteProduct(product.id)}
                    >
                      <img
                        src={TrashIcon}
                        alt="Delete"
                        style={{ width: "16px", height: "16px" }}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
