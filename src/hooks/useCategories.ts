import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewCategory {
  name: string;
  description: string | null;
}

// Mock categories for development
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    description: "Electronic devices and components",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Office Supplies",
    description: "Items used in an office environment",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Furniture",
    description: "Desks, chairs, and other furniture",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Food & Beverages",
    description: "Consumable food and drink items",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Clothing",
    description: "Apparel and wearable items",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useCategories() {
  const queryClient = useQueryClient();

  // Use mock data for now
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => Promise.resolve(mockCategories),
    // Commented out real API call for now
    // queryFn: () => invoke("get_all_categories"),
  });

  const addCategory = useMutation({
    mutationFn: (newCategory: NewCategory) => {
      // Mock adding a category
      console.log("Adding category:", newCategory);
      return Promise.resolve();
      // Return to real API call later
      // return invoke("add_category", { category: newCategory })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => {
      // Mock deleting a category
      console.log("Deleting category:", id);
      return Promise.resolve();
      // Return to real API call later
      // return invoke("delete_category", { id })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    categories: categories || [],
    isLoading,
    addCategory: addCategory.mutate,
    deleteCategory: deleteCategory.mutate,
  };
}
