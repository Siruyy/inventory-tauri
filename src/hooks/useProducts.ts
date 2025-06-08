import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockCategories } from "./useCategories"; // Import mockCategories

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  category_id: number;
  category_name: string;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  supplier: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewProduct {
  name: string;
  description: string | null;
  sku: string;
  category_id: number;
  unit_price: number;
  current_stock: number;
  minimum_stock: number;
  supplier: string | null;
}

// Mock products for development - moved outside to persist between renders
let mockProducts: Product[] = [
  {
    id: 1,
    name: "Laptop",
    description: "High-performance business laptop",
    sku: "E-LAPTOP-001",
    category_id: 1,
    category_name: "Electronics",
    unit_price: 999.99,
    current_stock: 15,
    minimum_stock: 5,
    supplier: "Supplier A",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Smartphone",
    description: "Latest model smartphone",
    sku: "E-PHONE-002",
    category_id: 1,
    category_name: "Electronics",
    unit_price: 699.99,
    current_stock: 25,
    minimum_stock: 10,
    supplier: "Supplier A",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Office Chair",
    description: "Ergonomic office chair",
    sku: "F-CHAIR-001",
    category_id: 3,
    category_name: "Furniture",
    unit_price: 199.99,
    current_stock: 2,
    minimum_stock: 3,
    supplier: "Supplier B",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Coffee Beans",
    description: "Premium arabica coffee beans 1kg",
    sku: "FB-COFFEE-001",
    category_id: 4,
    category_name: "Food & Beverages",
    unit_price: 19.99,
    current_stock: 0,
    minimum_stock: 10,
    supplier: "Supplier C",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "T-Shirt",
    description: "Cotton t-shirt, various colors",
    sku: "C-TSHIRT-001",
    category_id: 5,
    category_name: "Clothing",
    unit_price: 14.99,
    current_stock: 60,
    minimum_stock: 15,
    supplier: "Supplier D",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useProducts(categoryId?: number) {
  const queryClient = useQueryClient();

  // Use mockProducts for now
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", categoryId],
    queryFn: () => {
      // Return mock data filtered by category if specified
      if (categoryId) {
        return Promise.resolve(
          mockProducts.filter((p) => p.category_id === categoryId)
        );
      }
      return Promise.resolve([...mockProducts]);
    },
    // Commented out real API calls for now
    // queryFn: () =>
    //   categoryId
    //     ? invoke("get_products_by_category", { categoryId })
    //     : invoke("get_all_products"),
  });

  const addProduct = useMutation({
    mutationFn: (newProduct: NewProduct) => {
      // Mock adding a product by updating the mockProducts array
      const newId =
        mockProducts.length > 0
          ? Math.max(...mockProducts.map((p) => p.id)) + 1
          : 1;

      const timestamp = new Date().toISOString();

      // Find the category name based on category_id by looking up in mockCategories
      const category = mockCategories.find(
        (cat: { id: number }) => cat.id === newProduct.category_id
      );
      const categoryName = category
        ? category.name
        : `Category ${newProduct.category_id}`;

      const newProductWithId: Product = {
        id: newId,
        name: newProduct.name,
        description: newProduct.description,
        sku: newProduct.sku,
        category_id: newProduct.category_id,
        category_name: categoryName,
        unit_price: newProduct.unit_price,
        current_stock: newProduct.current_stock,
        minimum_stock: newProduct.minimum_stock,
        supplier: newProduct.supplier,
        created_at: timestamp,
        updated_at: timestamp,
      };

      // Add the new product to our mock data
      mockProducts.push(newProductWithId);

      console.log("Added product:", newProductWithId);
      return Promise.resolve();
      // Return to real API call later
      // return invoke("add_product", { product: newProduct })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => {
      // Mock deleting a product by updating the mockProducts array
      mockProducts = mockProducts.filter((product) => product.id !== id);
      console.log("Deleted product:", id);
      return Promise.resolve();
      // Return to real API call later
      // return invoke("delete_product", { id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateStock = useMutation({
    mutationFn: ({ id, newStock }: { id: number; newStock: number }) => {
      // Mock updating stock by modifying the product in mockProducts
      const productIndex = mockProducts.findIndex((p) => p.id === id);
      if (productIndex >= 0) {
        mockProducts[productIndex] = {
          ...mockProducts[productIndex],
          current_stock: newStock,
          updated_at: new Date().toISOString(),
        };
        console.log("Updated stock for product", id, "to", newStock);
      }
      return Promise.resolve();
      // Return to real API call later
      // return invoke("update_product_stock", { id, newStock })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    products: products || [],
    isLoading,
    addProduct: addProduct.mutate,
    deleteProduct: deleteProduct.mutate,
    updateStock: updateStock.mutate,
  };
}
