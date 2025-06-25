import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Tabs,
  Tab,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TextField,
  Button,
  Stack,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Avatar,
  TablePagination,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format, subMonths, differenceInDays, subDays } from "date-fns";
import Header from "../components/Header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  PieLabelRenderProps,
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import type { SalesReportData } from "../hooks/useOrders";
import { useOrders } from "../hooks/useOrders";
import { useProducts, Product } from "../hooks/useProducts";
import { toast } from "sonner";
import * as XLSX from "xlsx";

// Colors for the pie chart
const COLORS = [
  "#FF6B8B",
  "#FFC154",
  "#47B39C",
  "#4F9DF3",
  "#9B5DE5",
  "#F15BB5",
];

// Styled components
const Container = styled("div")({
  minHeight: "100vh",
  backgroundColor: "#1F1F1F",
  color: "#FFFFFF",
});

const TabPanel = styled(Box)({
  padding: "24px 0",
});

const StyledTabs = styled(Tabs)({
  backgroundColor: "#2A2A2A",
  borderRadius: "8px 8px 0 0",
  "& .MuiTabs-indicator": {
    backgroundColor: "#fac1d9",
  },
});

const StyledTab = styled(Tab)({
  color: "#FFFFFF",
  "&.Mui-selected": {
    color: "#fac1d9",
  },
});

const SummaryContainer = styled("div")({
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
  flexWrap: "wrap",
});

const SummaryCard = styled(Paper)({
  flex: "1 1 200px",
  padding: "20px",
  borderRadius: "8px",
  backgroundColor: "#2A2A2A",
  display: "flex",
  flexDirection: "column",
  color: "#FFFFFF",
});

const CardTitle = styled(Typography)({
  fontSize: "14px",
  color: "#AAAAAA",
  marginBottom: "8px",
});

const CardValue = styled(Typography)({
  fontSize: "24px",
  fontWeight: "600",
  color: "#FFFFFF",
});

const TableTitle = styled(Typography)({
  fontSize: "18px",
  fontWeight: "500",
  marginTop: "32px",
  marginBottom: "16px",
});

const StyledTableContainer = styled(TableContainer)({
  backgroundColor: "#2A2A2A",
  borderRadius: "8px",
  marginBottom: "24px",
});

const StyledTableCell = styled(TableCell)({
  color: "#FFFFFF",
  borderBottom: "1px solid #444444",
});

const StyledTableHeaderCell = styled(TableCell)({
  color: "#FFFFFF",
  backgroundColor: "#333333",
  fontWeight: "600",
  borderBottom: "1px solid #444444",
});

const PlaceholderTab = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "64px 0",
  color: "#AAAAAA",
});

const ChartContainer = styled(Paper)({
  backgroundColor: "#2A2A2A",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "24px",
  height: "350px",
});

const ChartTitle = styled(Typography)({
  fontSize: "18px",
  fontWeight: "500",
  marginBottom: "20px",
  color: "#FFFFFF",
});

// New flexbox chart layout components
const ChartsRow = styled("div")({
  display: "flex",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "24px",
});

const ChartColumnLarge = styled("div")({
  flex: "6 1 500px",
});

const ChartColumnSmall = styled("div")({
  flex: "4 1 400px",
  minWidth: "400px",
});

interface LabelProps extends PieLabelRenderProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
  name: string;
}

// Custom tooltip for pie chart
const renderCustomizedLabel = (props: LabelProps) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
  const RADIAN = Math.PI / 180;
  // Adjust radius for better label positioning
  const radius = outerRadius * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show labels for larger segments (over 5%)
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#FFFFFF"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={10}
      fontWeight="bold"
      filter="drop-shadow(0px 0px 1px #000)"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

// Add new styled components for the Top Products section
const TopProductsContainer = styled(Paper)({
  backgroundColor: "#2A2A2A",
  padding: "20px",
  borderRadius: "8px",
  marginBottom: "24px",
});

const TopProductsHeader = styled(Typography)({
  fontSize: "18px",
  fontWeight: "500",
  marginBottom: "20px",
  color: "#FFFFFF",
});

const ProductNameLabel = styled("span")({
  fontWeight: "500",
  fontSize: "12px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: "150px",
  display: "inline-block",
});

const ProductValueLabel = styled("span")({
  fontWeight: "bold",
  fontSize: "12px",
});

// Add styling for sales history table
const StyledTableRowEven = styled(TableRow)({
  backgroundColor: "#2A2A2A",
});

const StyledTableRowOdd = styled(TableRow)({
  backgroundColor: "#333333",
});

const EnhancedTableCell = styled(StyledTableCell)({
  padding: "16px 24px", // Increase padding for larger rows
  fontSize: "14px", // Slightly larger font
});

const EnhancedHeaderCell = styled(StyledTableHeaderCell)({
  padding: "16px 24px",
  fontSize: "14px",
  fontWeight: "600",
});

// Loading indicator component
const LoadingIndicator = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "200px",
    }}
  >
    <CircularProgress sx={{ color: "#fac1d9" }} />
  </Box>
);

// Helper to format currency
const formatCurrency = (value: number) => {
  return `₱${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Add new styled components for date filter
const FilterContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  margin: "8px 0 24px",
  gap: "16px",
  backgroundColor: "#2A2A2A",
  padding: "16px",
  borderRadius: "8px",
  flexWrap: "wrap",
});

const DatePickerContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "16px",
  flex: 1,
});

const StyledDatePicker = styled(DatePicker)({
  "& .MuiInputBase-root": {
    color: "#FFFFFF",
    backgroundColor: "#333333",
    borderRadius: "8px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#444444",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#666666",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#fac1d9",
    },
  },
  "& .MuiIconButton-root": {
    color: "#AAAAAA",
  },
  "& .MuiInputLabel-root": {
    color: "#AAAAAA",
  },
  "& .MuiInputBase-input": {
    color: "#FFFFFF !important",
  },
  "& .MuiPickersDay-root": {
    color: "#FFFFFF",
  },
  // Add styles for the calendar popup
  "& .MuiCalendarPicker-root": {
    backgroundColor: "#333333",
    color: "#FFFFFF",
  },
  "& .MuiPickersDay-today": {
    border: "1px solid #fac1d9",
  },
  "& .MuiPickersDay-daySelected": {
    backgroundColor: "#fac1d9",
    color: "#000000",
  },
});

const StyledButton = styled(Button)({
  backgroundColor: "#fac1d9",
  color: "#000000",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "#f8aac8",
  },
});

const ResetButton = styled(Button)({
  color: "#AAAAAA",
  borderColor: "#444444",
  padding: "8px 16px",
  "&:hover": {
    borderColor: "#FFFFFF",
  },
});

// Add styled component for export button
const ExportButton = styled(Button)({
  backgroundColor: "#41C463",
  color: "#000000",
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "#35A052",
  },
});

// Styled components for Staff tab
const StatusChip = styled("span")<{ status: string }>(({ status }) => ({
  padding: "4px 10px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "500",
  backgroundColor:
    status === "Present"
      ? "rgba(71, 179, 156, 0.2)"
      : status === "Absent"
      ? "rgba(255, 107, 139, 0.2)"
      : "rgba(255, 193, 84, 0.2)",
  color:
    status === "Present"
      ? "#47B39C"
      : status === "Absent"
      ? "#FF6B8B"
      : "#FFC154",
  border:
    status === "Present"
      ? "1px solid #47B39C"
      : status === "Absent"
      ? "1px solid #FF6B8B"
      : "1px solid #FFC154",
}));

// Mock attendance data
interface StaffAttendanceRecord {
  id: number;
  staffName: string;
  role: string;
  date: string;
  shiftTime: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "Present" | "Absent" | "Half-shift";
}

// Define StaffMember type near other interfaces
interface StaffMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  phone?: string;
  age?: number;
  timings: string; // e.g., "08:00 to 16:00" or "08:00 - 16:00"
  avatar?: string;
  isAvailable?: boolean;
}

export default function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [appliedStartDate, setAppliedStartDate] = useState<string | undefined>(
    undefined
  );
  const [appliedEndDate, setAppliedEndDate] = useState<string | undefined>(
    undefined
  );
  const [filterApplied, setFilterApplied] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  // NEW: inventory-specific date filter state
  const [invStartDate, setInvStartDate] = useState<Date | null>(null);
  const [invEndDate, setInvEndDate] = useState<Date | null>(null);
  const [appliedInvStartDate, setAppliedInvStartDate] = useState<
    string | undefined
  >(undefined);
  const [appliedInvEndDate, setAppliedInvEndDate] = useState<
    string | undefined
  >(undefined);
  const [invFilterApplied, setInvFilterApplied] = useState(false);

  // Staff-specific date filter state
  const [staffStartDate, setStaffStartDate] = useState<Date | null>(null);
  const [staffEndDate, setStaffEndDate] = useState<Date | null>(null);
  const [appliedStaffStartDate, setAppliedStaffStartDate] = useState<
    string | undefined
  >(undefined);
  const [appliedStaffEndDate, setAppliedStaffEndDate] = useState<
    string | undefined
  >(undefined);
  const [staffFilterApplied, setStaffFilterApplied] = useState(false);

  // Products data
  const { products } = useProducts();

  // Derive delivery information per product
  const enrichedProducts = (products ?? []).map((p) => {
    // Use existing delivery_date if any, else fallback to created_at, else mock recent date
    let deliveryDate: string | undefined = (p as any).delivery_date;
    if (!deliveryDate && p.created_at) {
      deliveryDate = p.created_at.slice(0, 10);
    }
    if (!deliveryDate) {
      // Assign a mock date within the last 30 days
      deliveryDate = format(
        subDays(new Date(), Math.floor(Math.random() * 30) + 1),
        "yyyy-MM-dd"
      );
    }
    return { ...p, deliveryDate };
  });

  // Apply the inventory date range filter
  const filteredProducts = enrichedProducts.filter((p) => {
    if (!invFilterApplied || !appliedInvStartDate || !appliedInvEndDate)
      return true;
    return (
      p.deliveryDate >= appliedInvStartDate &&
      p.deliveryDate <= appliedInvEndDate
    );
  });

  // Build delivery history rows (for table)
  const deliveryHistory = filteredProducts
    .map((p) => ({
      id: p.id,
      product_name: p.name,
      supplier: p.supplier ?? "Unknown Supplier",
      quantity: p.current_stock,
      date: p.deliveryDate,
      cost: p.unit_price * p.current_stock,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get orders hooks
  const orders = useOrders();

  // Get filtered sales report from React Query
  const {
    data: salesReportData,
    isLoading: isLoadingSalesReport,
    refetch: refetchSalesReport,
  } = orders.getSalesReportData(appliedStartDate, appliedEndDate, "day");

  // Load staff list from localStorage (same key used in Staff page)
  const [staffList] = useState<StaffMember[]>(() => {
    try {
      const raw = localStorage.getItem("staffList");
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });

  // Mock staff attendance data
  const [staffAttendance, setStaffAttendance] = useState<
    StaffAttendanceRecord[]
  >(() => {
    // Create attendance records for the last 7 days
    const records: StaffAttendanceRecord[] = [];
    const staffNames = staffList.length
      ? staffList.map((s) => ({
          name: s.name,
          role: s.role,
          timings: s.timings,
        }))
      : [{ name: "John Smith", role: "Cashier", timings: "08:00 - 16:00" }];

    // Generate records for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");

      staffNames.forEach((staff, index) => {
        // Create random attendance status
        const randomStatus = Math.random();
        let status: "Present" | "Absent" | "Half-shift";
        let checkIn: string | null = null;
        let checkOut: string | null = null;

        const parsedTimings =
          staff.timings ?? `${8 + (index % 3)}:00 - ${16 + (index % 3)}:00`;
        const [startT, endT] = parsedTimings
          .replace("to", "-")
          .split("-")
          .map((t) => t.trim());
        const [startHour] = startT.split(":").map(Number);
        const [endHour] = endT.split(":").map(Number);
        const shiftStartHour = startHour;
        const shiftEndHour = endHour;
        const shiftTime = `${startT} - ${endT}`;

        if (randomStatus > 0.8) {
          status = "Absent";
        } else if (randomStatus > 0.2) {
          status = "Present";
          checkIn = `${shiftStartHour.toString().padStart(2, "0")}:${Math.floor(
            Math.random() * 15
          )
            .toString()
            .padStart(2, "0")}`;
          checkOut = `${shiftEndHour.toString().padStart(2, "0")}:${Math.floor(
            Math.random() * 15
          )
            .toString()
            .padStart(2, "0")}`;
        } else {
          status = "Half-shift";
          checkIn = `${shiftStartHour.toString().padStart(2, "0")}:${Math.floor(
            Math.random() * 15
          )
            .toString()
            .padStart(2, "0")}`;
          // Half-shift means they checked in but didn't check out
          checkOut = null;
        }

        records.push({
          id: records.length + 1,
          staffName: staff.name,
          role: staff.role,
          date,
          shiftTime,
          checkIn,
          checkOut,
          status,
        });
      });
    }

    // Add a few specific records to ensure variety in today's data for the pie chart
    const today = format(new Date(), "yyyy-MM-dd");

    // Add 2 present, 1 absent, 1 half-shift for today
    records.push(
      {
        id: records.length + 1,
        staffName: "Emma Wilson",
        role: "Cashier",
        date: today,
        shiftTime: "08:00 - 16:00",
        checkIn: "08:05",
        checkOut: "16:10",
        status: "Present",
      },
      {
        id: records.length + 2,
        staffName: "James Rodriguez",
        role: "Inventory",
        date: today,
        shiftTime: "09:00 - 17:00",
        checkIn: "09:02",
        checkOut: "17:05",
        status: "Present",
      },
      {
        id: records.length + 3,
        staffName: "Jessica Taylor",
        role: "Cashier",
        date: today,
        shiftTime: "10:00 - 18:00",
        checkIn: null,
        checkOut: null,
        status: "Absent",
      },
      {
        id: records.length + 4,
        staffName: "Alex Chen",
        role: "Manager",
        date: today,
        shiftTime: "09:00 - 17:00",
        checkIn: "09:10",
        checkOut: null,
        status: "Half-shift",
      }
    );

    return records;
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format top products data for chart
  const formatTopProducts = (data?: SalesReportData) => {
    if (!data?.top_products) return [];

    return data.top_products
      .slice(0, 5) // Take only top 5
      .map((product: any) => ({
        name: product.product,
        quantity: product.quantity,
        revenue: product.revenue,
        formattedRevenue: formatCurrency(product.revenue),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Format revenue distribution data for pie chart
  const formatRevenueDistribution = (data?: SalesReportData) => {
    if (!data?.sales_by_category) return [];

    return data.sales_by_category.map((category: any) => ({
      name: category.category,
      value: category.revenue,
    }));
  };

  // Format sales trend data for line chart
  const formatSalesTrend = (data?: SalesReportData) => {
    if (!data?.sales_by_period) return [];

    return data.sales_by_period.map((period: any) => ({
      name: period.period,
      sales: period.revenue,
      profit: period.profit,
    }));
  };

  // Format sales history for table
  const formatDetailedSales = (data?: SalesReportData) => {
    if (!data?.detailed_sales) return [];

    return data.detailed_sales
      .map((sale) => ({
        id: sale.id,
        product: sale.product,
        date: sale.date,
        quantity: sale.quantity,
        price: formatCurrency(sale.price),
        totalPrice: formatCurrency(sale.revenue),
        profit: formatCurrency(sale.profit),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const rawDetailed = salesReportData?.detailed_sales ?? [];
  const filteredRawDetailed = rawDetailed.filter((sale) => {
    if (!filterApplied || !appliedStartDate || !appliedEndDate) return true;
    const saleDateOnly = sale.date.slice(0, 10);
    return saleDateOnly >= appliedStartDate && saleDateOnly <= appliedEndDate;
  });

  // Summary metrics
  const totalRevenue = filteredRawDetailed.reduce(
    (sum, s) => sum + s.revenue,
    0
  );
  const totalProfit = filteredRawDetailed.reduce((sum, s) => sum + s.profit, 0);
  const transactions = new Set(filteredRawDetailed.map((s) => s.id)).size;

  // Recompute charts from filtered data
  const filteredTopProducts = [...filteredRawDetailed]
    .reduce((map, s) => {
      const entry = map.get(s.product) || { quantity: 0, revenue: 0 };
      entry.quantity += s.quantity;
      entry.revenue += s.revenue;
      map.set(s.product, entry);
      return map;
    }, new Map())
    .entries();
  const topProductsArray = Array.from(filteredTopProducts)
    .map(([product, data]) => ({
      name: product,
      quantity: data.quantity,
      revenue: data.revenue,
      formattedRevenue: formatCurrency(data.revenue),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // category pie
  const revenueByCategory = [...filteredRawDetailed].reduce((map, s) => {
    const rev = map.get(s.category) || 0;
    map.set(s.category, rev + s.revenue);
    return map;
  }, new Map());
  const revenueDistributionData = Array.from(revenueByCategory).map(
    ([category, value]) => ({ name: category, value })
  );

  // trend by day
  const trendMap = new Map();
  filteredRawDetailed.forEach((s) => {
    const day = s.date.slice(0, 10);
    const t = trendMap.get(day) || { sales: 0, profit: 0 };
    t.sales += s.revenue;
    t.profit += s.profit;
    trendMap.set(day, t);
  });
  const salesTrendData = Array.from(trendMap).map(([day, data]) => ({
    name: day,
    sales: data.sales,
    profit: data.profit,
  }));

  const formattedTopProducts = topProductsArray;
  const salesHistory = filteredRawDetailed
    .map((sale) => ({
      id: sale.id,
      product: sale.product,
      date: sale.date,
      quantity: sale.quantity,
      price: formatCurrency(sale.price),
      totalPrice: formatCurrency(sale.revenue),
      profit: formatCurrency(sale.profit),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Pagination state
  const [salesPage, setSalesPage] = useState(0);
  const [salesRowsPerPage, setSalesRowsPerPage] = useState(25);

  const [invPage, setInvPage] = useState(0);
  const [invRowsPerPage, setInvRowsPerPage] = useState(25);

  const [staffPage, setStaffPage] = useState(0);
  const [staffRowsPerPage, setStaffRowsPerPage] = useState(25);

  // After staffAttendance variable and before pagedStaffAttendance computation
  const filteredStaffAttendance = staffAttendance.filter((rec) => {
    if (!staffFilterApplied || !appliedStaffStartDate || !appliedStaffEndDate)
      return true;
    return rec.date >= appliedStaffStartDate && rec.date <= appliedStaffEndDate;
  });

  // Compute pagedStaffAttendance using filtered list
  const pagedStaffAttendance = filteredStaffAttendance
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(
      staffPage * staffRowsPerPage,
      staffPage * staffRowsPerPage + staffRowsPerPage
    );

  // Compute paged arrays
  const pagedSalesHistory = salesHistory.slice(
    salesPage * salesRowsPerPage,
    salesPage * salesRowsPerPage + salesRowsPerPage
  );

  const pagedDeliveryHistory = deliveryHistory.slice(
    invPage * invRowsPerPage,
    invPage * invRowsPerPage + invRowsPerPage
  );

  // Add state for export loading
  const [isExporting, setIsExporting] = useState(false);

  // Apply date filters
  const handleApplyFilter = async () => {
    setIsFiltering(true);

    if (tabValue === 0) {
      // Sales tab logic (unchanged)
      const formattedStartDate = startDate
        ? format(startDate, "yyyy-MM-dd")
        : undefined;
      const formattedEndDate = endDate
        ? format(endDate, "yyyy-MM-dd")
        : undefined;

      setAppliedStartDate(formattedStartDate);
      setAppliedEndDate(formattedEndDate);
      setFilterApplied(true);
    } else if (tabValue === 1) {
      // Inventory tab logic
      const formattedStartDate = invStartDate
        ? format(invStartDate, "yyyy-MM-dd")
        : undefined;
      const formattedEndDate = invEndDate
        ? format(invEndDate, "yyyy-MM-dd")
        : undefined;

      setAppliedInvStartDate(formattedStartDate);
      setAppliedInvEndDate(formattedEndDate);
      setInvFilterApplied(true);
    } else if (tabValue === 2) {
      const formattedStartDate = staffStartDate
        ? format(staffStartDate, "yyyy-MM-dd")
        : undefined;
      const formattedEndDate = staffEndDate
        ? format(staffEndDate, "yyyy-MM-dd")
        : undefined;

      setAppliedStaffStartDate(formattedStartDate);
      setAppliedStaffEndDate(formattedEndDate);
      setStaffFilterApplied(true);
    }

    setIsFiltering(false);
  };

  // Reset date filters
  const handleResetFilter = async () => {
    setIsFiltering(true);

    if (tabValue === 0) {
      setStartDate(null);
      setEndDate(null);
      setAppliedStartDate(undefined);
      setAppliedEndDate(undefined);
      setFilterApplied(false);
    } else if (tabValue === 1) {
      setInvStartDate(null);
      setInvEndDate(null);
      setAppliedInvStartDate(undefined);
      setAppliedInvEndDate(undefined);
      setInvFilterApplied(false);
    } else if (tabValue === 2) {
      setStaffStartDate(null);
      setStaffEndDate(null);
      setAppliedStaffStartDate(undefined);
      setAppliedStaffEndDate(undefined);
      setStaffFilterApplied(false);
    }

    setIsFiltering(false);
  };

  // Add export function
  const handleExportData = async () => {
    if (!salesReportData) return;
    try {
      setIsExporting(true);
      const wb = XLSX.utils.book_new();
      const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const rangeLabel =
        appliedStartDate && appliedEndDate
          ? `${appliedStartDate} to ${appliedEndDate}`
          : "All Time";

      // Filter the detailed sales based on date range if filters are applied
      const filteredDetailedSales =
        appliedStartDate && appliedEndDate
          ? salesReportData.detailed_sales.filter((sale) => {
              const saleDate = sale.date.split(" ")[0]; // Extract just the date part
              return saleDate >= appliedStartDate && saleDate <= appliedEndDate;
            })
          : salesReportData.detailed_sales;

      // Calculate summary metrics based on filtered data
      const filteredSummary = {
        total_sales: filteredDetailedSales.length,
        total_revenue: filteredDetailedSales.reduce(
          (sum, sale) => sum + sale.revenue,
          0
        ),
        total_profit: filteredDetailedSales.reduce(
          (sum, sale) => sum + sale.profit,
          0
        ),
        items_sold: filteredDetailedSales.reduce(
          (sum, sale) => sum + sale.quantity,
          0
        ),
        transactions: filteredDetailedSales.length,
      };

      const summaryAOA: any[] = [
        ["Sales Report Summary"],
        ["Exported on:", now],
        ["Date Range:", rangeLabel],
        [],
        ["Total Sales Amount", filteredSummary.total_sales],
        ["Total Revenue", filteredSummary.total_revenue],
        ["Total Profit", filteredSummary.total_profit],
        ["Total Items Sold", filteredSummary.items_sold],
        ["Total Transactions", filteredSummary.transactions],
      ];

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(summaryAOA),
        "Summary"
      );

      const detailAOA: any[] = [
        [
          "ID",
          "Product",
          "Category",
          "Date",
          "Price",
          "Quantity",
          "Revenue",
          "Profit",
          "Margin",
        ],
      ];

      filteredDetailedSales.forEach((s) => {
        detailAOA.push([
          s.id,
          s.product,
          s.category,
          s.date,
          s.price,
          s.quantity,
          s.revenue,
          s.profit,
          s.margin,
        ]);
      });

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(detailAOA),
        "Detailed Sales"
      );

      const wbArray = XLSX.write(wb, { type: "array", bookType: "xlsx" });
      const blob = new Blob([wbArray], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sales_Report_${format(new Date(), "yyyy-MM-dd")}${
        appliedStartDate && appliedEndDate
          ? `_${appliedStartDate}_to_${appliedEndDate}`
          : ""
      }.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      setIsExporting(false);
      toast.success("Sales report exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export");
    }
  };

  // Function to check and update attendance status automatically
  useEffect(() => {
    const autoUpdateAttendance = () => {
      const now = new Date();
      const todayFormatted = format(now, "yyyy-MM-dd");
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      setStaffAttendance((prev) =>
        prev.map((record) => {
          // Only process today's records
          if (record.date !== todayFormatted) return record;

          // Parse shift times
          const [startTime, endTime] = record.shiftTime.split(" - ");
          const [startHour, startMinute] = startTime.split(":").map(Number);
          const [endHour, endMinute] = endTime.split(":").map(Number);

          // Convert to minutes for comparison
          const shiftStartMinutes = startHour * 60 + startMinute;
          const shiftEndMinutes = endHour * 60 + endMinute;
          const currentMinutes = currentHour * 60 + currentMinute;

          // Logic to determine status:

          // If current time is past shift end time
          if (currentMinutes > shiftEndMinutes) {
            // If they checked in and checked out, they're present
            if (record.checkIn && record.checkOut) {
              return { ...record, status: "Present" };
            }
            // If they checked in but didn't check out, they're half-shift
            else if (record.checkIn) {
              return { ...record, status: "Half-shift" };
            }
            // If they didn't check in at all, they're absent
            else {
              return { ...record, status: "Absent" };
            }
          }

          // If current time is between shift start and end
          else if (currentMinutes >= shiftStartMinutes) {
            // If they already checked in, leave status as is
            if (record.checkIn) {
              return record;
            }
            // If they're more than 30 mins late, mark as absent
            else if (currentMinutes > shiftStartMinutes + 30) {
              return { ...record, status: "Absent" };
            }
          }

          // For all other cases, return record unchanged
          return record;
        })
      );
    };

    // Run once and set interval
    autoUpdateAttendance();
    const interval = setInterval(autoUpdateAttendance, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Function to prepare category data for pie chart (inventory)
  const getCategoryData = (productsArr: typeof filteredProducts) => {
    const categoryMap = new Map<number, { name: string; value: number }>();

    productsArr.forEach((product) => {
      const value = product.unit_price * product.current_stock;
      const categoryId = product.category_id;
      const categoryName = product.category_name || `Category ${categoryId}`;

      if (categoryMap.has(categoryId)) {
        const existing = categoryMap.get(categoryId)!;
        existing.value += value;
      } else {
        categoryMap.set(categoryId, { name: categoryName, value });
      }
    });

    return Array.from(categoryMap.values());
  };

  // Metrics derived from filtered records
  const totalStaffCount = Array.from(
    new Set(pagedStaffAttendance.map((s) => s.staffName))
  ).length;
  const presentCount = pagedStaffAttendance.filter(
    (r) => r.status === "Present"
  ).length;
  const absentCount = pagedStaffAttendance.filter(
    (r) => r.status === "Absent"
  ).length;
  const halfShiftCount = pagedStaffAttendance.filter(
    (r) => r.status === "Half-shift"
  ).length;

  return (
    <Container>
      <Header title="Reports" />

      <Box sx={{ width: "100%", padding: "0 20px" }}>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          TabIndicatorProps={{ children: <span /> }}
        >
          <StyledTab label="Sales & Revenue" />
          <StyledTab label="Inventory" />
          <StyledTab label="Staff" />
        </StyledTabs>

        {/* Sales & Revenue Tab */}
        {tabValue === 0 && (
          <TabPanel
            key={`${appliedStartDate || "none"}_${
              appliedEndDate || "none"
            }_${"day"}`}
          >
            {/* Date Range Filter */}
            <FilterContainer>
              <Typography
                variant="body1"
                sx={{
                  color: "#AAAAAA",
                  fontWeight: "medium",
                  minWidth: "150px",
                }}
              >
                Filter by date range:
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePickerContainer>
                  <StyledDatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputProps: {
                          style: { color: "#FFFFFF" },
                        },
                      },
                    }}
                    format="yyyy-MM-dd"
                  />
                  <Typography color="#FFFFFF">to</Typography>
                  <StyledDatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputProps: {
                          style: { color: "#FFFFFF" },
                        },
                      },
                    }}
                    format="yyyy-MM-dd"
                  />
                </DatePickerContainer>
              </LocalizationProvider>
              <Stack direction="row" spacing={2}>
                <StyledButton variant="contained" onClick={handleApplyFilter}>
                  Apply Filter
                </StyledButton>
                <ResetButton variant="outlined" onClick={handleResetFilter}>
                  Reset
                </ResetButton>
                <ExportButton
                  variant="contained"
                  onClick={handleExportData}
                  disabled={isExporting || isLoadingSalesReport}
                >
                  {isExporting ? "Exporting..." : "Export"}
                </ExportButton>
              </Stack>
            </FilterContainer>

            {/* Display error if any */}
            {isLoadingSalesReport || isFiltering ? (
              <LoadingIndicator />
            ) : (
              <>
                {/* Overview Cards */}
                <SummaryContainer>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Sales</CardTitle>
                    <CardValue variant="h5">
                      {formatCurrency(totalRevenue)}
                    </CardValue>
                  </SummaryCard>

                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Profit</CardTitle>
                    <CardValue variant="h5">
                      {formatCurrency(totalProfit)}
                    </CardValue>
                  </SummaryCard>

                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Transactions</CardTitle>
                    <CardValue variant="h5">{transactions}</CardValue>
                  </SummaryCard>

                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Avg. Order Value</CardTitle>
                    <CardValue variant="h5">
                      {transactions > 0
                        ? formatCurrency(totalRevenue / transactions)
                        : "₱0.00"}
                    </CardValue>
                  </SummaryCard>
                </SummaryContainer>

                {/* Charts */}
                <ChartsRow>
                  {/* Sales Trend Chart */}
                  <ChartColumnLarge>
                    <ChartContainer elevation={0}>
                      <ChartTitle>Sales & Profit Trend</ChartTitle>
                      <ResponsiveContainer width="100%" height="85%">
                        <LineChart
                          data={salesTrendData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#444444"
                          />
                          <XAxis dataKey="name" tick={{ fill: "#AAAAAA" }} />
                          <YAxis tick={{ fill: "#AAAAAA" }} />
                          <Tooltip
                            formatter={(value: number) => [
                              formatCurrency(value),
                              "",
                            ]}
                            contentStyle={{
                              backgroundColor: "#333333",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "4px",
                            }}
                          />
                          <Legend wrapperStyle={{ color: "#AAAAAA" }} />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#fac1d9"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                            name="Sales"
                          />
                          <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#00C49F"
                            strokeWidth={2}
                            name="Profit"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartColumnLarge>

                  {/* Revenue Distribution Chart */}
                  <ChartColumnSmall>
                    <ChartContainer elevation={0}>
                      <ChartTitle>Revenue Distribution</ChartTitle>
                      <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                          <defs>
                            {/* Add gradients for more appealing colors */}
                            {revenueDistributionData.map((entry, index) => (
                              <linearGradient
                                key={`gradient-${index}`}
                                id={`gradient-${index}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={COLORS[index % COLORS.length]}
                                  stopOpacity={1}
                                />
                                <stop
                                  offset="100%"
                                  stopColor={COLORS[index % COLORS.length]}
                                  stopOpacity={0.7}
                                />
                              </linearGradient>
                            ))}
                            {/* Add shadow filter for depth */}
                            <filter
                              id="shadow"
                              x="-20%"
                              y="-20%"
                              width="140%"
                              height="140%"
                            >
                              <feDropShadow
                                dx="0"
                                dy="0"
                                stdDeviation="4"
                                floodColor="#000"
                                floodOpacity="0.3"
                              />
                            </filter>
                          </defs>
                          <Pie
                            data={revenueDistributionData}
                            cx="45%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius="65%"
                            innerRadius="45%"
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                            filter="url(#shadow)"
                            animationDuration={1000}
                            animationBegin={200}
                            animationEasing="ease"
                          >
                            {revenueDistributionData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={`url(#gradient-${index})`}
                                stroke="#2A2A2A"
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [
                              formatCurrency(value),
                              "Revenue",
                            ]}
                            contentStyle={{
                              backgroundColor: "#333333",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "4px",
                              boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
                            }}
                            wrapperStyle={{ color: "#FFFFFF" }}
                            itemStyle={{ color: "#FFFFFF" }}
                            labelStyle={{ color: "#FFFFFF" }}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{
                              fontSize: "12px",
                              color: "#FFFFFF",
                              right: 10,
                              top: 0,
                              lineHeight: "24px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartColumnSmall>
                </ChartsRow>

                {/* Top Selling Products - Bar Chart */}
                <TopProductsHeader variant="h6">
                  Top 5 Selling Products
                </TopProductsHeader>
                <TopProductsContainer elevation={0}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={formattedTopProducts}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        stroke="#444444"
                      />
                      <XAxis
                        type="number"
                        tick={{ fill: "#AAAAAA" }}
                        axisLine={{ stroke: "#444444" }}
                        tickLine={{ stroke: "#444444" }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: "#FFFFFF" }}
                        width={150}
                        axisLine={{ stroke: "#444444" }}
                        tickLine={{ stroke: "#444444" }}
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => {
                          return name === "revenue"
                            ? [formatCurrency(value), "Revenue"]
                            : [value, "Quantity Sold"];
                        }}
                        contentStyle={{
                          backgroundColor: "#333333",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "4px",
                          boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        wrapperStyle={{
                          paddingBottom: "10px",
                          color: "#FFFFFF",
                        }}
                      />
                      <defs>
                        <linearGradient
                          id="quantityGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#47B39C"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#47B39C"
                            stopOpacity={1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="revenueGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop
                            offset="0%"
                            stopColor="#FF6B8B"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="100%"
                            stopColor="#FF6B8B"
                            stopOpacity={1}
                          />
                        </linearGradient>
                      </defs>
                      <Bar
                        dataKey="quantity"
                        name="Quantity Sold"
                        barSize={20}
                        radius={[0, 4, 4, 0]}
                        fill="url(#quantityGradient)"
                        animationDuration={1500}
                      >
                        <LabelList
                          dataKey="quantity"
                          position="right"
                          fill="#FFFFFF"
                          style={{ fontWeight: "bold" }}
                        />
                      </Bar>
                      <Bar
                        dataKey="revenue"
                        name="Revenue (₱)"
                        barSize={20}
                        radius={[0, 4, 4, 0]}
                        fill="url(#revenueGradient)"
                        animationDuration={1500}
                        animationBegin={300}
                      >
                        <LabelList
                          dataKey="formattedRevenue"
                          position="right"
                          fill="#FFFFFF"
                          style={{ fontWeight: "bold" }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </TopProductsContainer>

                {/* Sales History */}
                <TableTitle variant="h6">Sales History</TableTitle>
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <EnhancedHeaderCell>Product</EnhancedHeaderCell>
                        <EnhancedHeaderCell>Date</EnhancedHeaderCell>
                        <EnhancedHeaderCell align="right">
                          Quantity
                        </EnhancedHeaderCell>
                        <EnhancedHeaderCell align="right">
                          Price per Unit
                        </EnhancedHeaderCell>
                        <EnhancedHeaderCell align="right">
                          Total Price
                        </EnhancedHeaderCell>
                        <EnhancedHeaderCell align="right">
                          Profit
                        </EnhancedHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedSalesHistory.length > 0 ? (
                        pagedSalesHistory.map((sale, index) =>
                          index % 2 === 0 ? (
                            <StyledTableRowEven key={sale.id}>
                              <EnhancedTableCell>
                                {sale.product}
                              </EnhancedTableCell>
                              <EnhancedTableCell>{sale.date}</EnhancedTableCell>
                              <EnhancedTableCell align="right">
                                {sale.quantity}
                              </EnhancedTableCell>
                              <EnhancedTableCell align="right">
                                {sale.price}
                              </EnhancedTableCell>
                              <EnhancedTableCell align="right">
                                {sale.totalPrice}
                              </EnhancedTableCell>
                              <EnhancedTableCell align="right">
                                {sale.profit}
                              </EnhancedTableCell>
                            </StyledTableRowEven>
                          ) : (
                            <StyledTableRowOdd key={sale.id}>
                              <EnhancedTableCell>
                                {sale.product}
                              </EnhancedTableCell>
                              <EnhancedTableCell>{sale.date}</EnhancedTableCell>
                              <EnhancedTableCell align="right">
                                {sale.quantity}
                              </EnhancedTableCell>
                              <EnhancedTableCell align="right">
                                {sale.price}
                              </EnhancedTableCell>
                              <EnhancedTableCell align="right">
                                {sale.totalPrice}
                              </EnhancedTableCell>
                              <EnhancedTableCell align="right">
                                {sale.profit}
                              </EnhancedTableCell>
                            </StyledTableRowOdd>
                          )
                        )
                      ) : (
                        <TableRow>
                          <EnhancedTableCell colSpan={6} align="center">
                            No sales data available
                          </EnhancedTableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </StyledTableContainer>

                <TablePagination
                  component="div"
                  count={salesHistory.length}
                  page={salesPage}
                  onPageChange={(_, newPage) => setSalesPage(newPage)}
                  rowsPerPage={salesRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setSalesRowsPerPage(parseInt(e.target.value, 10));
                    setSalesPage(0);
                  }}
                  rowsPerPageOptions={[25, 50, 100]}
                  sx={{ color: "#FFFFFF" }}
                />
              </>
            )}
          </TabPanel>
        )}

        {/* Inventory Tab */}
        {tabValue === 1 && (
          <TabPanel>
            {/* Date Range Filter */}
            <FilterContainer>
              <Typography
                variant="body1"
                sx={{
                  color: "#AAAAAA",
                  fontWeight: "medium",
                  minWidth: "150px",
                }}
              >
                Filter by date range:
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePickerContainer>
                  <StyledDatePicker
                    label="Start Date"
                    value={invStartDate}
                    onChange={(newValue) => setInvStartDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputProps: {
                          style: { color: "#FFFFFF" },
                        },
                      },
                    }}
                    format="yyyy-MM-dd"
                  />
                  <Typography color="#FFFFFF">to</Typography>
                  <StyledDatePicker
                    label="End Date"
                    value={invEndDate}
                    onChange={(newValue) => setInvEndDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputProps: {
                          style: { color: "#FFFFFF" },
                        },
                      },
                    }}
                    format="yyyy-MM-dd"
                  />
                </DatePickerContainer>
              </LocalizationProvider>
              <Stack direction="row" spacing={2}>
                <StyledButton variant="contained" onClick={handleApplyFilter}>
                  Apply Filter
                </StyledButton>
                <ResetButton variant="outlined" onClick={handleResetFilter}>
                  Reset
                </ResetButton>
              </Stack>
            </FilterContainer>

            {isLoadingSalesReport ? (
              <LoadingIndicator />
            ) : (
              <>
                {/* Summary Cards */}
                <SummaryContainer>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Inventory Value</CardTitle>
                    <CardValue variant="h5">
                      {formatCurrency(
                        filteredProducts.reduce(
                          (sum, product) =>
                            sum + product.unit_price * product.current_stock,
                          0
                        )
                      )}
                    </CardValue>
                  </SummaryCard>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Items</CardTitle>
                    <CardValue variant="h5">
                      {filteredProducts.reduce(
                        (sum, product) => sum + product.current_stock,
                        0
                      )}
                    </CardValue>
                  </SummaryCard>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Low Stock Items</CardTitle>
                    <CardValue variant="h5">
                      {
                        filteredProducts.filter(
                          (product) =>
                            product.current_stock <= product.minimum_stock
                        ).length
                      }
                    </CardValue>
                  </SummaryCard>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Stock Turnover Rate</CardTitle>
                    <CardValue variant="h5">5.2x</CardValue>
                  </SummaryCard>
                </SummaryContainer>

                {/* Charts */}
                <ChartsRow>
                  <ChartColumnLarge>
                    <ChartContainer>
                      <ChartTitle>Stock Level Trends</ChartTitle>
                      <ResponsiveContainer width="100%" height="85%">
                        <LineChart
                          data={[
                            { date: "Jan", stock: 120 },
                            { date: "Feb", stock: 150 },
                            { date: "Mar", stock: 180 },
                            { date: "Apr", stock: 140 },
                            { date: "May", stock: 160 },
                            { date: "Jun", stock: 200 },
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="date" stroke="#AAA" />
                          <YAxis stroke="#AAA" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#333",
                              border: "1px solid #444",
                              borderRadius: "4px",
                              color: "#FFFFFF",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="stock"
                            name="Total Stock"
                            stroke="#FAC1D9"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartColumnLarge>

                  <ChartColumnSmall>
                    <ChartContainer>
                      <ChartTitle>Inventory Value by Category</ChartTitle>
                      <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                          <defs>
                            {/* Add gradients for more appealing colors */}
                            {getCategoryData(filteredProducts).map(
                              (entry, index) => (
                                <linearGradient
                                  key={`gradient-${index}`}
                                  id={`inventory-gradient-${index}`}
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="0%"
                                    stopColor={COLORS[index % COLORS.length]}
                                    stopOpacity={1}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor={COLORS[index % COLORS.length]}
                                    stopOpacity={0.7}
                                  />
                                </linearGradient>
                              )
                            )}
                            {/* Add shadow filter for depth */}
                            <filter
                              id="inventory-shadow"
                              x="-20%"
                              y="-20%"
                              width="140%"
                              height="140%"
                            >
                              <feDropShadow
                                dx="0"
                                dy="0"
                                stdDeviation="4"
                                floodColor="#000"
                                floodOpacity="0.3"
                              />
                            </filter>
                          </defs>
                          <Pie
                            data={getCategoryData(filteredProducts)}
                            cx="45%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius="65%"
                            innerRadius="45%"
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                            filter="url(#inventory-shadow)"
                            animationDuration={1000}
                            animationBegin={200}
                            animationEasing="ease"
                          >
                            {getCategoryData(filteredProducts).map(
                              (entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={`url(#inventory-gradient-${index})`}
                                  stroke="#2A2A2A"
                                  strokeWidth={1}
                                />
                              )
                            )}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(Number(value))}
                            contentStyle={{
                              backgroundColor: "#333333",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "4px",
                              boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
                            }}
                            wrapperStyle={{ color: "#FFFFFF" }}
                            itemStyle={{ color: "#FFFFFF" }}
                            labelStyle={{ color: "#FFFFFF" }}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{
                              fontSize: "12px",
                              color: "#FFFFFF",
                              right: 10,
                              top: 0,
                              lineHeight: "24px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartColumnSmall>
                </ChartsRow>

                {/* Product Delivery History Table */}
                <TableTitle variant="h6">Product Delivery History</TableTitle>
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <EnhancedHeaderCell>Product</EnhancedHeaderCell>
                        <EnhancedHeaderCell>Supplier</EnhancedHeaderCell>
                        <EnhancedHeaderCell align="right">
                          Quantity
                        </EnhancedHeaderCell>
                        <EnhancedHeaderCell align="right">
                          Cost
                        </EnhancedHeaderCell>
                        <EnhancedHeaderCell align="right">
                          Date
                        </EnhancedHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedDeliveryHistory.map((record) => (
                        <TableRow key={record.id}>
                          <EnhancedTableCell>
                            {record.product_name}
                          </EnhancedTableCell>
                          <EnhancedTableCell>
                            {record.supplier}
                          </EnhancedTableCell>
                          <EnhancedTableCell align="right">
                            {record.quantity}
                          </EnhancedTableCell>
                          <EnhancedTableCell align="right">
                            {formatCurrency(record.cost)}
                          </EnhancedTableCell>
                          <EnhancedTableCell align="right">
                            {record.date}
                          </EnhancedTableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>

                <TablePagination
                  component="div"
                  count={deliveryHistory.length}
                  page={invPage}
                  onPageChange={(_, newPage) => setInvPage(newPage)}
                  rowsPerPage={invRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setInvRowsPerPage(parseInt(e.target.value, 10));
                    setInvPage(0);
                  }}
                  rowsPerPageOptions={[25, 50, 100]}
                  sx={{ color: "#FFFFFF" }}
                />
              </>
            )}
          </TabPanel>
        )}

        {/* Staff Tab */}
        {tabValue === 2 && (
          <TabPanel>
            {/* Date Range Filter */}
            <FilterContainer>
              <Typography
                variant="body1"
                sx={{
                  color: "#AAAAAA",
                  fontWeight: "medium",
                  minWidth: "150px",
                }}
              >
                Filter by date range:
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePickerContainer>
                  <StyledDatePicker
                    label="Start Date"
                    value={staffStartDate}
                    onChange={(newValue) => setStaffStartDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputProps: {
                          style: { color: "#FFFFFF" },
                        },
                      },
                    }}
                    format="yyyy-MM-dd"
                  />
                  <Typography color="#FFFFFF">to</Typography>
                  <StyledDatePicker
                    label="End Date"
                    value={staffEndDate}
                    onChange={(newValue) => setStaffEndDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        InputProps: {
                          style: { color: "#FFFFFF" },
                        },
                      },
                    }}
                    format="yyyy-MM-dd"
                  />
                </DatePickerContainer>
              </LocalizationProvider>
              <Stack direction="row" spacing={2}>
                <StyledButton variant="contained" onClick={handleApplyFilter}>
                  Apply Filter
                </StyledButton>
                <ResetButton variant="outlined" onClick={handleResetFilter}>
                  Reset
                </ResetButton>
              </Stack>
            </FilterContainer>

            {isLoadingSalesReport ? (
              <LoadingIndicator />
            ) : (
              <>
                {/* Summary Cards */}
                <SummaryContainer>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Staff</CardTitle>
                    <CardValue variant="h5">{totalStaffCount}</CardValue>
                  </SummaryCard>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Present Today</CardTitle>
                    <CardValue variant="h5">{presentCount}</CardValue>
                  </SummaryCard>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Absent Today</CardTitle>
                    <CardValue variant="h5">{absentCount}</CardValue>
                  </SummaryCard>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Half-Shift Today</CardTitle>
                    <CardValue variant="h5">{halfShiftCount}</CardValue>
                  </SummaryCard>
                </SummaryContainer>

                {/* Charts */}
                <ChartsRow>
                  <ChartColumnLarge>
                    <ChartContainer>
                      <ChartTitle>Staff Attendance Trend</ChartTitle>
                      <ResponsiveContainer width="100%" height="85%">
                        <LineChart
                          data={[
                            {
                              date: "Mon",
                              present: 12,
                              absent: 3,
                              halfShift: 1,
                            },
                            {
                              date: "Tue",
                              present: 14,
                              absent: 2,
                              halfShift: 0,
                            },
                            {
                              date: "Wed",
                              present: 13,
                              absent: 3,
                              halfShift: 0,
                            },
                            {
                              date: "Thu",
                              present: 15,
                              absent: 0,
                              halfShift: 1,
                            },
                            {
                              date: "Fri",
                              present: 14,
                              absent: 1,
                              halfShift: 1,
                            },
                            {
                              date: "Sat",
                              present: 11,
                              absent: 4,
                              halfShift: 1,
                            },
                            {
                              date: "Sun",
                              present: 10,
                              absent: 5,
                              halfShift: 1,
                            },
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="date" stroke="#AAA" />
                          <YAxis stroke="#AAA" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#333",
                              border: "1px solid #444",
                              borderRadius: "4px",
                              color: "#FFFFFF",
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="present"
                            name="Present"
                            stroke="#47B39C"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="absent"
                            name="Absent"
                            stroke="#FF6B8B"
                            activeDot={{ r: 6 }}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="halfShift"
                            name="Half-Shift"
                            stroke="#FFC154"
                            activeDot={{ r: 6 }}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartColumnLarge>

                  <ChartColumnSmall>
                    <ChartContainer>
                      <ChartTitle>Today's Attendance Breakdown</ChartTitle>
                      <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                          <defs>
                            {/* Add gradients for more appealing colors */}
                            {[
                              { name: "Present", value: presentCount },
                              { name: "Absent", value: absentCount },
                              { name: "Half-shift", value: halfShiftCount },
                            ].map((entry, index) => (
                              <linearGradient
                                key={`gradient-${index}`}
                                id={`staff-gradient-${index}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor={COLORS[index % COLORS.length]}
                                  stopOpacity={1}
                                />
                                <stop
                                  offset="100%"
                                  stopColor={COLORS[index % COLORS.length]}
                                  stopOpacity={0.7}
                                />
                              </linearGradient>
                            ))}
                            {/* Add shadow filter for depth */}
                            <filter
                              id="staff-shadow"
                              x="-20%"
                              y="-20%"
                              width="140%"
                              height="140%"
                            >
                              <feDropShadow
                                dx="0"
                                dy="0"
                                stdDeviation="4"
                                floodColor="#000"
                                floodOpacity="0.3"
                              />
                            </filter>
                          </defs>
                          <Pie
                            data={[
                              { name: "Present", value: presentCount },
                              { name: "Absent", value: absentCount },
                              { name: "Half-shift", value: halfShiftCount },
                            ]}
                            cx="45%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius="65%"
                            innerRadius="45%"
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                            filter="url(#staff-shadow)"
                            animationDuration={1000}
                            animationBegin={200}
                            animationEasing="ease"
                          >
                            {[
                              { name: "Present", value: presentCount },
                              { name: "Absent", value: absentCount },
                              { name: "Half-shift", value: halfShiftCount },
                            ].map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={`url(#staff-gradient-${index})`}
                                stroke="#2A2A2A"
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => value}
                            contentStyle={{
                              backgroundColor: "#333333",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "4px",
                              boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
                            }}
                            wrapperStyle={{ color: "#FFFFFF" }}
                            itemStyle={{ color: "#FFFFFF" }}
                            labelStyle={{ color: "#FFFFFF" }}
                          />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{
                              fontSize: "12px",
                              color: "#FFFFFF",
                              right: 10,
                              top: 0,
                              lineHeight: "24px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </ChartColumnSmall>
                </ChartsRow>

                {/* Staff Attendance History Table */}
                <TableTitle variant="h6">Staff Attendance History</TableTitle>
                <StyledTableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <EnhancedHeaderCell>Staff Name</EnhancedHeaderCell>
                        <EnhancedHeaderCell>Role</EnhancedHeaderCell>
                        <EnhancedHeaderCell>Date</EnhancedHeaderCell>
                        <EnhancedHeaderCell>Shift Time</EnhancedHeaderCell>
                        <EnhancedHeaderCell>Check In</EnhancedHeaderCell>
                        <EnhancedHeaderCell>Check Out</EnhancedHeaderCell>
                        <EnhancedHeaderCell>Status</EnhancedHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pagedStaffAttendance.map((record, index) =>
                        index % 2 === 0 ? (
                          <StyledTableRowEven key={record.id}>
                            <EnhancedTableCell>
                              {record.staffName}
                            </EnhancedTableCell>
                            <EnhancedTableCell>{record.role}</EnhancedTableCell>
                            <EnhancedTableCell>{record.date}</EnhancedTableCell>
                            <EnhancedTableCell>
                              {record.shiftTime}
                            </EnhancedTableCell>
                            <EnhancedTableCell>
                              {record.checkIn || "-"}
                            </EnhancedTableCell>
                            <EnhancedTableCell>
                              {record.checkOut || "-"}
                            </EnhancedTableCell>
                            <EnhancedTableCell>
                              <StatusChip status={record.status}>
                                {record.status}
                              </StatusChip>
                            </EnhancedTableCell>
                          </StyledTableRowEven>
                        ) : (
                          <StyledTableRowOdd key={record.id}>
                            <EnhancedTableCell>
                              {record.staffName}
                            </EnhancedTableCell>
                            <EnhancedTableCell>{record.role}</EnhancedTableCell>
                            <EnhancedTableCell>{record.date}</EnhancedTableCell>
                            <EnhancedTableCell>
                              {record.shiftTime}
                            </EnhancedTableCell>
                            <EnhancedTableCell>
                              {record.checkIn || "-"}
                            </EnhancedTableCell>
                            <EnhancedTableCell>
                              {record.checkOut || "-"}
                            </EnhancedTableCell>
                            <EnhancedTableCell>
                              <StatusChip status={record.status}>
                                {record.status}
                              </StatusChip>
                            </EnhancedTableCell>
                          </StyledTableRowOdd>
                        )
                      )}
                    </TableBody>
                  </Table>
                </StyledTableContainer>

                <TablePagination
                  component="div"
                  count={filteredStaffAttendance.length}
                  page={staffPage}
                  onPageChange={(_, newPage) => setStaffPage(newPage)}
                  rowsPerPage={staffRowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setStaffRowsPerPage(parseInt(e.target.value, 10));
                    setStaffPage(0);
                  }}
                  rowsPerPageOptions={[25, 50, 100]}
                  sx={{ color: "#FFFFFF" }}
                />
              </>
            )}
          </TabPanel>
        )}
      </Box>
    </Container>
  );
}
