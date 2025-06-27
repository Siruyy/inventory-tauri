import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Temporarily disable toast notifications
import { toast } from "sonner";

// Add debug logs
console.log("Loading useCategories module");

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  icon?: string | null;
}

export interface NewCategory {
  name: string;
  description: string | null;
  icon?: string | null;
}

export interface UpdateCategory {
  id: number;
  name: string;
  description: string | null;
  icon?: string | null;
}

// Mock categories for development - for reference only, not used anymore
// We're keeping this commented out for reference in case we need to roll back
/*
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

export function useCategories() {
  console.log("useCategories hook called");
  const queryClient = useQueryClient();

  // Use real database data with better error handling
  const {
    data: categories,
    isLoading,
    refetch: refetchCategoriesOriginal,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        return await safeTauriInvoke<Category[]>("get_all_categories");
      } catch (error) {
        console.error("Failed to fetch categories:", error);
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
  const refetchCategories = debounce(async () => {
    console.log("Debounced refetch categories called");
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay
    refetchCategoriesOriginal();
  }, 300);

  // Optimistic add category
  const addCategory = useMutation({
    mutationFn: async (newCategory: NewCategory) => {
      // Delay execution slightly to allow UI to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
      return safeTauriInvoke<Category>("add_category", {
        category: newCategory,
      });
    },
    onMutate: async (newCategory) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData<Category[]>([
        "categories",
      ]);

      // Optimistically update to the new value
      if (previousCategories) {
        queryClient.setQueryData<Category[]>(["categories"], (old) => [
          ...(old || []),
          {
            id: -1, // Temporary ID
            name: newCategory.name,
            description: newCategory.description,
            icon: newCategory.icon,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Category,
        ]);
      }

      return { previousCategories };
    },
    onSuccess: (data) => {
      console.log("Category added successfully");

      // Show success toast notification
      toast.success("Category added successfully", {
        description: `${data.name} has been added to your categories.`,
        duration: 5000,
      });

      // Wait a bit before refetching to allow the UI to stabilize
      setTimeout(() => {
        refetchCategories();
      }, 200);
    },
    onError: (error, _newCategory, context) => {
      console.error("Failed to add category:", error);

      // Show error toast notification
      toast.error("Failed to add category", {
        description:
          "There was an error adding the category. Please try again.",
        duration: 5000,
      });

      // Revert back to the previous state if available
      if (context?.previousCategories) {
        queryClient.setQueryData<Category[]>(
          ["categories"],
          context.previousCategories
        );
      }
    },
  });

  // Optimistic update category
  const updateCategory = useMutation({
    mutationFn: async (updatedCategory: UpdateCategory) => {
      // Delay execution slightly to allow UI to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
      return safeTauriInvoke<Category>("update_category", {
        category: updatedCategory,
      });
    },
    onMutate: async (updatedCategory) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData<Category[]>([
        "categories",
      ]);

      // Optimistically update to the new value
      if (previousCategories) {
        queryClient.setQueryData<Category[]>(["categories"], (old) =>
          (old || []).map((category) =>
            category.id === updatedCategory.id
              ? {
                  ...category,
                  name: updatedCategory.name,
                  description: updatedCategory.description,
                  icon: updatedCategory.icon,
                  updated_at: new Date().toISOString(),
                }
              : category
          )
        );
      }

      return { previousCategories };
    },
    onSuccess: (data) => {
      console.log("Category updated successfully");

      // Show success toast notification
      toast.success("Category updated successfully", {
        description: `${data.name} has been updated.`,
        duration: 5000,
      });

      // Wait a bit before refetching to allow the UI to stabilize
      setTimeout(() => {
        refetchCategories();
      }, 200);
    },
    onError: (error, _updatedCategory, context) => {
      console.error("Failed to update category:", error);

      // Show error toast notification
      toast.error("Failed to update category", {
        description:
          "There was an error updating the category. Please try again.",
        duration: 5000,
      });

      // Revert back to the previous state if available
      if (context?.previousCategories) {
        queryClient.setQueryData<Category[]>(
          ["categories"],
          context.previousCategories
        );
      }
    },
  });

  // Optimistic delete category
  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      // Delay execution slightly to allow UI to settle
      await new Promise((resolve) => setTimeout(resolve, 50));
      return safeTauriInvoke<void>("delete_category", { id });
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // Snapshot the previous values
      const previousCategories = queryClient.getQueryData<Category[]>([
        "categories",
      ]);

      // Optimistically update
      if (previousCategories) {
        queryClient.setQueryData<Category[]>(["categories"], (old) =>
          (old || []).filter((category) => category.id !== id)
        );
      }

      return { previousCategories };
    },
    onSuccess: () => {
      console.log("Category deleted successfully");

      // Show success toast notification
      toast.success("Category deleted successfully", {
        description: "The category has been removed.",
        duration: 5000,
      });

      // Wait a bit before refetching to allow the UI to stabilize
      setTimeout(() => {
        refetchCategories();
        queryClient.invalidateQueries({ queryKey: ["products"] });
      }, 200);
    },
    onError: (error, _id, context) => {
      console.error("Failed to delete category:", error);

      // Extract detailed error message from the backend
      const errorMessage = 
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : "There was an error deleting the category. Please try again.";

      // Show error toast notification with detailed message
      toast.error("Failed to delete category", {
        description: errorMessage,
        duration: 8000, // Increased duration for longer messages
      });

      // Revert back to the previous state if available
      if (context?.previousCategories) {
        queryClient.setQueryData<Category[]>(
          ["categories"],
          context.previousCategories
        );
      }
    },
  });

  // Return hook functions and data - add updateCategory
  return {
    categories: categories || [],
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetchCategories,
  };
}
