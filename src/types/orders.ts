export interface TopProduct {
  product: string;
  quantity: number;
  revenue: number;
}

export interface SalesByCategory {
  category: string;
  revenue: number;
}

export interface SalesByPeriod {
  period: string;
  revenue: number;
  profit: number;
}

export interface DetailedSale {
  id: string;
  product: string;
  date: string;
  quantity: number;
  price: number;
  revenue: number;
  profit: number;
}

export interface SalesSummary {
  total_revenue: number;
  total_profit: number;
  transactions: number;
}

export interface SalesReportData {
  sales_summary: SalesSummary;
  sales_by_period: SalesByPeriod[];
  sales_by_category: SalesByCategory[];
  top_products: TopProduct[];
  detailed_sales: DetailedSale[];
}
