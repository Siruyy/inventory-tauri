import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
  product_name?: string;
}

export interface Order {
  id: number;
  order_id: string;
  cashier: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  created_at: string;
}

export interface OrderWithItems {
  order: Order;
  items: OrderItem[];
}

export interface NewOrderItem {
  product_id: number;
  quantity: number;
  price: number;
}

export interface NewOrder {
  order_id: string;
  cashier: string;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
}

export interface CreateOrderRequest {
  order: NewOrder;
  items: NewOrderItem[];
}

export interface OrderHistoryRequest {
  start_date?: string;
  end_date?: string;
  status?: string;
  limit?: number;
}

export interface OrderStatistics {
  order_count: number;
  total_revenue: number;
  avg_order_value: number;
  unique_cashiers: number;
}

// Safely invoke a Tauri command, returning empty result on error
async function safeTauriInvoke<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (error) {
    console.error(`Error invoking ${cmd}:`, error);
    throw error;
  }
}

export function useOrders() {
  const queryClient = useQueryClient();

  // Get recent orders
  const {
    data: recentOrders,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useQuery<Order[]>({
    queryKey: ["recent_orders"],
    queryFn: async () => {
      try {
        return await safeTauriInvoke<Order[]>("get_recent_orders", {
          limit: 20,
        });
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  // Get order history with filters
  const getOrderHistory = (request: OrderHistoryRequest) => {
    return useQuery<Order[]>({
      queryKey: ["order_history", request],
      queryFn: async () => {
        try {
          return await safeTauriInvoke<Order[]>("get_order_history", {
            request,
          });
        } catch (error) {
          console.error("Failed to fetch order history:", error);
          return [];
        }
      },
      refetchOnWindowFocus: false,
    });
  };

  // Get order statistics
  const getOrderStatistics = (startDate?: string, endDate?: string) => {
    return useQuery<OrderStatistics>({
      queryKey: ["order_statistics", startDate, endDate],
      queryFn: async () => {
        try {
          return await safeTauriInvoke<OrderStatistics>(
            "get_order_statistics",
            {
              start_date: startDate,
              end_date: endDate,
            }
          );
        } catch (error) {
          console.error("Failed to fetch order statistics:", error);
          return {
            order_count: 0,
            total_revenue: 0,
            avg_order_value: 0,
            unique_cashiers: 0,
          };
        }
      },
      refetchOnWindowFocus: false,
    });
  };

  // Get order with items
  const getOrderWithItems = async (
    orderId: number
  ): Promise<OrderWithItems | null> => {
    try {
      return await safeTauriInvoke<OrderWithItems>("get_order_with_items", {
        order_id: orderId,
      });
    } catch (error) {
      console.error(`Failed to fetch order ${orderId}:`, error);
      return null;
    }
  };

  // Create new order
  const createOrder = useMutation({
    mutationFn: async (request: CreateOrderRequest) => {
      return safeTauriInvoke<Order>("create_order", { request });
    },
    onSuccess: () => {
      // Refetch orders after successful creation
      refetchOrders();
    },
  });

  return {
    recentOrders: recentOrders || [],
    isLoadingOrders,
    getOrderWithItems,
    createOrder,
    refetchOrders,
    getOrderHistory,
    getOrderStatistics,
  };
}
