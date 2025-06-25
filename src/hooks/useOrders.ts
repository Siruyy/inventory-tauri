import { invoke } from "@tauri-apps/api/core";
import { useQuery, useMutation } from "@tanstack/react-query";
// Temporarily disable toast notifications
import { toast } from "sonner";

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

// Sales Report Data Types
export interface SalesReportData {
  sales_summary: SalesSummary;
  sales_by_period: PeriodSales[];
  sales_by_category: CategorySales[];
  top_products: ProductSales[];
  detailed_sales: DetailedSale[];
}

export interface SalesSummary {
  total_sales: number;
  total_revenue: number;
  total_profit: number;
  items_sold: number;
  transactions: number;
}

export interface PeriodSales {
  period: string;
  sales: number;
  revenue: number;
  profit: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
  profit: number;
  percentage: number;
}

export interface ProductSales {
  product: string;
  quantity: number;
  revenue: number;
  profit: number;
}

export interface DetailedSale {
  id: number;
  product: string;
  category: string;
  date: string;
  price: number;
  profit: number;
  margin: string;
  revenue: number;
  quantity: number;
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
  // Remove the unused queryClient variable
  // const queryClient = useQueryClient();

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

  // Get sales report data
  const getSalesReportData = (
    startDate?: string,
    endDate?: string,
    period: "day" | "week" | "month" | "year" = "month"
  ) => {
    // React Query key changes whenever startDate, endDate, or period change
    return useQuery<SalesReportData>({
      queryKey: ["sales_report", startDate, endDate, period],
      queryFn: async () => {
        try {
          console.log("Fetching sales report data with params:", {
            startDate,
            endDate,
            period,
          });

          // Build args object, only include dates if defined
          const args: Record<string, unknown> = { period };
          if (startDate !== undefined) args.startDate = startDate;
          if (endDate !== undefined) args.endDate = endDate;

          console.log("Invoking get_sales_report_data with args:", args);

          const result = await safeTauriInvoke<SalesReportData>(
            "get_sales_report_data",
            args
          );

          console.log("Received sales report data:", result);
          return result;
        } catch (error) {
          console.error("Failed to fetch sales report data:", error);
          throw error;
        }
      },
      refetchOnWindowFocus: false,
      // staleTime and cacheTime left default so query updates when key changes
    });
  };

  return {
    recentOrders: recentOrders || [],
    isLoadingOrders,
    getOrderWithItems,
    createOrder,
    refetchOrders,
    getOrderHistory,
    getOrderStatistics,
    getSalesReportData,
  };
}
