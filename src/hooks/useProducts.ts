import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Add debug logs
console.log("Loading useProducts module");

export interface Product {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  category_id: number;
  category_name?: string;
  unit_price: number;
  price_bought: number;
  current_stock: number;
  minimum_stock: number;
  supplier: string | null;
  created_at: string;
  updated_at: string;
  thumbnailUrl?: string;
  barcode?: string;
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
  barcode?: string;
}

export interface UpdateProduct {
  id: number;
  name: string;
  description?: string | null;
  category_id: number;
  unit_price: number;
  current_stock: number;
  minimum_stock?: number;
  supplier?: string | null;
  barcode?: string;
}

// Mock products for development - for reference only, not used anymore
// We're keeping this commented out for reference in case we need to roll back
/*
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
*/

// Helper function to wrap Tauri invocations with better error handling
async function safeTauriInvoke<T>(command: string, args?: any): Promise<T> {
  console.log(`Calling Tauri command: ${command}`, args);
  try {
    const result = await invoke<T>(command, args);
    console.log(`Command ${command} succeeded:`, result);
    return result;
  } catch (error) {
    console.error(`Command ${command} failed:`, error);
    throw error;
  }
}

// Helper to debounce function calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

export function useProducts(categoryId?: number) {
  console.log("useProducts hook called with categoryId:", categoryId);
  const queryClient = useQueryClient();

  // Use real database data with better error handling
  const {
    data: products,
    isLoading,
    refetch: refetchProductsOriginal,
  } = useQuery<Product[]>({
    queryKey: ["products", categoryId],
    queryFn: async () => {
      try {
        let result;
        if (categoryId) {
          console.log(`Fetching products for category ID: ${categoryId}`);
          try {
            // Use invoke directly to ensure proper parameter passing
            console.log("Passing params to Tauri:", {
              category_id: categoryId,
            });
            result = await invoke<Product[]>("get_products_by_category", {
              category_id: categoryId,
            });
            console.log(
              `Got ${result.length} products for category ${categoryId}:`,
              result
            );
          } catch (error) {
            console.error("Error calling get_products_by_category:", error);
            // Fall back to all products
            result = await safeTauriInvoke<Product[]>("get_all_products");
          }
        } else {
          console.log("Fetching all products");
          result = await safeTauriInvoke<Product[]>("get_all_products");
          console.log(`Got ${result.length} products:`, result);
        }
        return result;
      } catch (error) {
        console.error("Failed to fetch products:", error);
        return []; // Return empty array on error
      }
    },
    // Disable automatic refetching
    refetchOnWindowFocus: false,
    // Add more options to prevent crashes
    retry: false,
    // Add staleTime to prevent excessive refreshing
    staleTime: 2000,
  });

  // Debounce the refetch to prevent rapid re-renders causing crashes
  const refetchProducts = debounce(async () => {
    console.log("Debounced refetch products called");
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
    refetchProductsOriginal();
  }, 300);

  const addProduct = useMutation({
    mutationFn: async (newProduct: NewProduct) => {
      // Delay execution slightly to allow UI to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
      return safeTauriInvoke<Product>("add_product", { product: newProduct });
    },
    onMutate: async (newProduct) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["products", categoryId] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData<Product[]>([
        "products",
        categoryId,
      ]);

      // Optimistically update to the new value
      if (previousProducts) {
        queryClient.setQueryData<Product[]>(["products", categoryId], (old) => [
          ...(old || []),
          {
            id: -1, // Temporary ID
            name: newProduct.name,
            description: newProduct.description,
            sku: newProduct.sku,
            category_id: newProduct.category_id,
            category_name: "Loading...", // Will be updated when we refetch
            unit_price: newProduct.unit_price,
            current_stock: newProduct.current_stock,
            minimum_stock: newProduct.minimum_stock,
            supplier: newProduct.supplier,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Product,
        ]);
      }

      return { previousProducts };
    },
    onSuccess: (data) => {
      console.log("Product added successfully");

      // Show success toast notification
      toast.success("Product added successfully", {
        description: `${data.name} has been added to your inventory.`,
        duration: 5000,
      });

      // Wait a bit before refetching to allow the UI to stabilize
      setTimeout(() => {
        refetchProducts();
      }, 200);
    },
    onError: (error, _newProduct, context) => {
      console.error("Failed to add product:", error);

      // Show error toast notification
      toast.error("Failed to add product", {
        description: "There was an error adding the product. Please try again.",
        duration: 5000,
      });

      // Revert back to the previous state if available
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(
          ["products"],
          context.previousProducts
        );
      }
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      // Delay execution slightly to allow UI to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
      return safeTauriInvoke<void>("delete_product", { id });
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["products", categoryId] });

      // Snapshot the previous values
      const previousProducts = queryClient.getQueryData<Product[]>([
        "products",
        categoryId,
      ]);

      // Optimistically update
      if (previousProducts) {
        queryClient.setQueryData<Product[]>(["products", categoryId], (old) =>
          (old || []).filter((product) => product.id !== id)
        );
      }

      return { previousProducts };
    },
    onSuccess: () => {
      console.log("Product deleted successfully");

      // Show success toast notification
      toast.success("Product deleted successfully", {
        description: "The product has been removed from your inventory.",
        duration: 5000,
      });

      // Wait a bit before refetching to allow the UI to stabilize
      setTimeout(() => {
        refetchProducts();
      }, 200);
    },
    onError: (error, _id, context) => {
      console.error("Failed to delete product:", error);

      // Extract the error message from the error object
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "There was an error deleting the product. Please try again.";

      // Show error toast notification with the specific error message
      toast.error("Failed to delete product", {
        description: errorMessage,
        duration: 8000,
      });

      // Revert back to the previous state if available
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(
          ["products"],
          context.previousProducts
        );
      }
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({ id, newStock }: { id: number; newStock: number }) => {
      return safeTauriInvoke<void>("update_product_stock", {
        id,
        new_stock: newStock,
      });
    },
    onMutate: async ({ id, newStock }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData<Product[]>([
        "products",
      ]);

      // Optimistically update to the new value
      if (previousProducts) {
        queryClient.setQueryData<Product[]>(["products"], (old) =>
          (old || []).map((product) =>
            product.id === id
              ? { ...product, current_stock: newStock }
              : product
          )
        );
      }

      return { previousProducts };
    },
    onSuccess: (_, { newStock }) => {
      console.log(`Stock updated successfully to ${newStock}`);

      // Show success toast notification
      toast.success("Stock updated successfully", {
        description: `The stock has been updated to ${newStock}.`,
        duration: 5000,
      });

      // Refetch products to update the UI
      refetchProducts();
    },
    onError: (error, _variables, context) => {
      console.error("Failed to update stock:", error);

      // Show error toast notification
      toast.error("Failed to update stock", {
        description: "There was an error updating the stock. Please try again.",
        duration: 5000,
      });

      // Revert back to the previous state if available
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(
          ["products"],
          context.previousProducts
        );
      }
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (updatedProduct: UpdateProduct) => {
      // Delay execution slightly to allow UI to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
      return safeTauriInvoke<Product>("update_product", {
        product: updatedProduct,
      });
    },
    onMutate: async (updatedProduct) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["products", categoryId] });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData<Product[]>([
        "products",
        categoryId,
      ]);

      // Optimistically update
      if (previousProducts) {
        queryClient.setQueryData<Product[]>(["products", categoryId], (old) =>
          (old || []).map((product) => {
            if (product.id === updatedProduct.id) {
              return {
                ...product,
                ...updatedProduct,
                updated_at: new Date().toISOString(),
              };
            }
            return product;
          })
        );
      }

      return { previousProducts };
    },
    onSuccess: (data) => {
      console.log("Product updated successfully");

      // Show success toast notification
      toast.success("Product updated successfully", {
        description: `${data.name} has been updated in your inventory.`,
        duration: 5000,
      });

      // Wait a bit before refetching to allow the UI to stabilize
      setTimeout(() => {
        refetchProducts();
      }, 200);
    },
    onError: (error, _updatedProduct, context) => {
      console.error("Failed to update product:", error);

      // Show error toast notification
      toast.error("Failed to update product", {
        description:
          "There was an error updating the product. Please try again.",
        duration: 5000,
      });

      // Revert back to the previous state if available
      if (context?.previousProducts) {
        queryClient.setQueryData<Product[]>(
          ["products"],
          context.previousProducts
        );
      }
    },
  });

  return {
    products: products || [],
    isLoading,
    addProduct: addProduct.mutate,
    updateProduct: updateProduct.mutate,
    deleteProduct: deleteProduct.mutate,
    updateStock: updateStock.mutate,
    refetchProducts,
  };
}
