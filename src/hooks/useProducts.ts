import { invoke } from "@tauri-apps/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  location: string | null;
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
  location: string | null;
}

export function useProducts(categoryId?: number) {
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", categoryId],
    queryFn: () =>
      categoryId
        ? invoke("get_products_by_category", { categoryId })
        : invoke("get_all_products"),
  });

  const addProduct = useMutation({
    mutationFn: (newProduct: NewProduct) =>
      invoke("add_product", { product: newProduct }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => invoke("delete_product", { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateStock = useMutation({
    mutationFn: ({ id, newStock }: { id: number; newStock: number }) =>
      invoke("update_product_stock", { id, newStock }),
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
