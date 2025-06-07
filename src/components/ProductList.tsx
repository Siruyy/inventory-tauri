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
import { Product, useProducts } from "../hooks/useProducts";
import { useState } from "react";

interface ProductListProps {
  selectedCategoryId?: number;
}

export function ProductList({ selectedCategoryId }: ProductListProps) {
  const { products, updateStock, deleteProduct } =
    useProducts(selectedCategoryId);
  const [editingStock, setEditingStock] = useState<{
    id: number;
    value: number;
  } | null>(null);

  const handleUpdateStock = (product: Product) => {
    if (editingStock && editingStock.id === product.id) {
      updateStock(
        { id: product.id, newStock: editingStock.value },
        {
          onSuccess: () => setEditingStock(null),
        }
      );
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>{product.category_name}</TableCell>
              <TableCell className="text-right">
                ${product.unit_price.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {editingStock?.id === product.id ? (
                  <div className="flex items-center justify-end space-x-2">
                    <Input
                      type="number"
                      min="0"
                      className="w-20"
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
                      onClick={() => handleUpdateStock(product)}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <span
                    className={
                      product.current_stock <= product.minimum_stock
                        ? "text-red-500 font-medium"
                        : ""
                    }
                    onClick={() =>
                      setEditingStock({
                        id: product.id,
                        value: product.current_stock,
                      })
                    }
                  >
                    {product.current_stock}
                  </span>
                )}
              </TableCell>
              <TableCell>{product.location}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteProduct(product.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
