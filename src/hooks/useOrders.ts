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
  };
}
