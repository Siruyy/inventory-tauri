import { invoke } from "@tauri-apps/api";
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

export function useCategories() {
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => invoke("get_all_categories"),
  });

  const addCategory = useMutation({
    mutationFn: (newCategory: NewCategory) =>
      invoke("add_category", { category: newCategory }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => invoke("delete_category", { id }),
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
