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

// Mock categories for development - moved outside to persist between renders
export let mockCategories: Category[] = [
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
    queryFn: () => Promise.resolve([...mockCategories]), // Return a copy of the array
    // Commented out real API call for now
    // queryFn: () => invoke("get_all_categories"),
  });

  const addCategory = useMutation({
    mutationFn: (newCategory: NewCategory) => {
      // Mock adding a category by updating the mockCategories array
      const newId =
        mockCategories.length > 0
          ? Math.max(...mockCategories.map((c) => c.id)) + 1
          : 1;

      const timestamp = new Date().toISOString();

      const newCategoryWithId: Category = {
        id: newId,
        name: newCategory.name,
        description: newCategory.description,
        created_at: timestamp,
        updated_at: timestamp,
      };

      // Add the new category to our mock data
      mockCategories.push(newCategoryWithId);

      console.log("Added category:", newCategoryWithId);
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
      // Mock deleting a category by updating the mockCategories array
      mockCategories = mockCategories.filter((category) => category.id !== id);
      console.log("Deleted category:", id);
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
