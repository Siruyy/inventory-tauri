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
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format, subMonths, differenceInDays } from "date-fns";
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
import { invoke } from "@tauri-apps/api/core";
import { useOrders } from "../hooks/useOrders";

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

// Debug function to check date filtering
const debugDateFiltering = async (date: string) => {
  try {
    return await invoke("debug_date_filtering", {
      date_str: date,
      dateStr: date,
    });
  } catch (error) {
    console.error("Error debugging date filtering:", error);
    return null;
  }
};

// Add new styled components for date filter
const FilterContainer = styled(Box)({
  display: "flex",
  gap: "16px",
  marginBottom: "24px",
  alignItems: "center",
  flexWrap: "wrap",
});

const DatePickerContainer = styled(Box)({
  display: "flex",
  gap: "16px",
  alignItems: "center",
});

const StyledDatePicker = styled(DatePicker)({
  "& .MuiInputBase-root": {
    color: "#FFFFFF",
    backgroundColor: "#2A2A2A",
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
});

const StyledButton = styled(Button)({
  backgroundColor: "#fac1d9",
  color: "#1F1F1F",
  "&:hover": {
    backgroundColor: "#f7a8c9",
  },
  padding: "8px 16px",
  borderRadius: "8px",
});

const ResetButton = styled(Button)({
  color: "#AAAAAA",
  borderColor: "#444444",
  "&:hover": {
    borderColor: "#AAAAAA",
  },
});

// Add new styled component for filter status
const FilterStatus = styled(Typography)({
  fontSize: "14px",
  color: "#AAAAAA",
  marginTop: "8px",
  fontStyle: "italic",
});

// Add a component to display the filtered date range
const FilteredDateInfo = styled(Typography)({
  fontSize: "14px",
  color: "#fac1d9",
  marginTop: "8px",
  fontWeight: "bold",
});

export default function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(
    subMonths(new Date(), 1)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [appliedStartDate, setAppliedStartDate] = useState<string | undefined>(
    format(subMonths(new Date(), 1), "yyyy-MM-dd")
  );
  const [appliedEndDate, setAppliedEndDate] = useState<string | undefined>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [filterApplied, setFilterApplied] = useState(false);

  // Get filtered sales report from React Query
  const {
    data: salesReportData,
    isLoading: isLoadingSalesReport,
    refetch: refetchSalesReport,
  } = useOrders().getSalesReportData(appliedStartDate, appliedEndDate, "day");

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

  const formattedTopProducts = formatTopProducts(salesReportData);
  const revenueDistributionData = formatRevenueDistribution(salesReportData);
  const salesTrendData = formatSalesTrend(salesReportData);
  const salesHistory = formatDetailedSales(salesReportData);

  // Apply date filters
  const handleApplyFilter = async () => {
    const formattedStartDate = startDate
      ? format(startDate, "yyyy-MM-dd")
      : undefined;
    const formattedEndDate = endDate
      ? format(endDate, "yyyy-MM-dd")
      : undefined;

    setAppliedStartDate(formattedStartDate);
    setAppliedEndDate(formattedEndDate);
    setFilterApplied(true);
  };

  // Reset date filters
  const handleResetFilter = () => {
    const defaultStartDate = subMonths(new Date(), 1);
    const defaultEndDate = new Date();

    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setAppliedStartDate(format(defaultStartDate, "yyyy-MM-dd"));
    setAppliedEndDate(format(defaultEndDate, "yyyy-MM-dd"));
    setFilterApplied(false);
  };

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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <FilterContainer>
                <Typography variant="body1" color="#AAAAAA">
                  Filter by date range:
                </Typography>
                <DatePickerContainer>
                  <StyledDatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        InputLabelProps: { style: { color: "#AAAAAA" } },
                      },
                    }}
                    format="yyyy-MM-dd"
                  />
                  <Typography color="#AAAAAA">to</Typography>
                  <StyledDatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                        InputLabelProps: { style: { color: "#AAAAAA" } },
                      },
                    }}
                    format="yyyy-MM-dd"
                  />
                </DatePickerContainer>
                <Stack direction="row" spacing={2}>
                  <StyledButton variant="contained" onClick={handleApplyFilter}>
                    Apply Filter
                  </StyledButton>
                  <ResetButton variant="outlined" onClick={handleResetFilter}>
                    Reset
                  </ResetButton>
                </Stack>
              </FilterContainer>

              <FilterStatus>
                {filterApplied
                  ? `Filtered data from ${appliedStartDate} to ${appliedEndDate} (exact dates used in query)`
                  : "Showing data from the last month"}
              </FilterStatus>

              {filterApplied && (
                <FilteredDateInfo>
                  Filtered data from {appliedStartDate} to {appliedEndDate}
                </FilteredDateInfo>
              )}
            </LocalizationProvider>

            {/* Display error if any */}
            {isLoadingSalesReport ? (
              <LoadingIndicator />
            ) : (
              <>
                {/* Overview Cards */}
                <SummaryContainer>
                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Sales</CardTitle>
                    <CardValue variant="h5">
                      {salesReportData
                        ? formatCurrency(
                            salesReportData.sales_summary.total_revenue
                          )
                        : "₱0.00"}
                    </CardValue>
                  </SummaryCard>

                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Profit</CardTitle>
                    <CardValue variant="h5">
                      {salesReportData
                        ? formatCurrency(
                            salesReportData.sales_summary.total_profit
                          )
                        : "₱0.00"}
                    </CardValue>
                  </SummaryCard>

                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Total Transactions</CardTitle>
                    <CardValue variant="h5">
                      {salesReportData
                        ? salesReportData.sales_summary.transactions
                        : 0}
                    </CardValue>
                  </SummaryCard>

                  <SummaryCard elevation={0}>
                    <CardTitle variant="body2">Avg. Order Value</CardTitle>
                    <CardValue variant="h5">
                      {salesReportData &&
                      salesReportData.sales_summary.transactions > 0
                        ? formatCurrency(
                            salesReportData.sales_summary.total_revenue /
                              salesReportData.sales_summary.transactions
                          )
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
                      {salesHistory.length > 0 ? (
                        salesHistory.map((sale, index) =>
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
              </>
            )}
          </TabPanel>
        )}

        {/* Inventory Tab (placeholder) */}
        {tabValue === 1 && (
          <TabPanel>
            <PlaceholderTab>
              <CircularProgress
                size={40}
                sx={{ color: "#fac1d9", marginBottom: "16px" }}
              />
              <Typography variant="h6">
                Inventory Reports Coming Soon
              </Typography>
              <Typography variant="body2">
                This section is under development
              </Typography>
            </PlaceholderTab>
          </TabPanel>
        )}

        {/* Staff Tab (placeholder) */}
        {tabValue === 2 && (
          <TabPanel>
            <PlaceholderTab>
              <CircularProgress
                size={40}
                sx={{ color: "#fac1d9", marginBottom: "16px" }}
              />
              <Typography variant="h6">Staff Reports Coming Soon</Typography>
              <Typography variant="body2">
                This section is under development
              </Typography>
            </PlaceholderTab>
          </TabPanel>
        )}
      </Box>
    </Container>
  );
}
