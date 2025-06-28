import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
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
  Grid,
  Box,
  TablePagination,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { format, subDays } from "date-fns";
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
  PieLabelRenderProps,
} from "recharts";
import { invoke } from "@tauri-apps/api/core";
import { useProducts, Product } from "../hooks/useProducts";

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

const ContentWrapper = styled("div")({
  padding: "24px",
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

const LoadingIndicator = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "200px",
});

// Define interface for delivery history
interface DeliveryRecord {
  id: number;
  product_name: string;
  supplier: string;
  quantity: number;
  date: string;
  cost: number;
}

// Temporary mock data for delivery history
const mockDeliveryHistory: DeliveryRecord[] = [
  {
    id: 1,
    product_name: "Coffee Beans (Arabica)",
    supplier: "Mountain Coffee Co.",
    quantity: 20,
    date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
    cost: 240.0,
  },
  {
    id: 2,
    product_name: "Milk (Whole)",
    supplier: "Dairy Delight",
    quantity: 30,
    date: format(subDays(new Date(), 3), "yyyy-MM-dd"),
    cost: 90.0,
  },
  {
    id: 3,
    product_name: "Sugar (White)",
    supplier: "Sweet Supplies Inc.",
    quantity: 15,
    date: format(subDays(new Date(), 4), "yyyy-MM-dd"),
    cost: 45.0,
  },
  {
    id: 4,
    product_name: "Tea Bags (Assorted)",
    supplier: "Global Tea Traders",
    quantity: 25,
    date: format(subDays(new Date(), 5), "yyyy-MM-dd"),
    cost: 75.0,
  },
  {
    id: 5,
    product_name: "Chocolate Syrup",
    supplier: "Dessert Delights",
    quantity: 10,
    date: format(subDays(new Date(), 7), "yyyy-MM-dd"),
    cost: 60.0,
  },
];

// Mock stock trend data
const mockStockTrend = [
  { date: "Jan", stock: 120 },
  { date: "Feb", stock: 150 },
  { date: "Mar", stock: 180 },
  { date: "Apr", stock: 140 },
  { date: "May", stock: 160 },
  { date: "Jun", stock: 200 },
];

export default function InventoryReport() {
  const { products, isLoading } = useProducts();
  const [startDate, setStartDate] = useState<Date | null>(
    subDays(new Date(), 30)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [inventoryMetrics, setInventoryMetrics] = useState({
    totalValue: 0,
    totalItems: 0,
    lowStockCount: 0,
    turnoverRate: 0,
  });
  const [categoryData, setCategoryData] = useState<
    { name: string; value: number }[]
  >([]);
  const [salesPage, setSalesPage] = useState(0);
  const [salesRows, setSalesRows] = useState(25);

  // Calculate inventory metrics
  useEffect(() => {
    if (products?.length) {
      const totalValue = products.reduce(
        (sum: number, product: Product) => sum + product.unit_price * product.current_stock,
        0
      );

      const totalItems = products.reduce(
        (sum: number, product: Product) => sum + product.current_stock,
        0
      );

      const lowStockCount = products.filter(
        (product: Product) => product.current_stock <= product.minimum_stock
      ).length;

      // Mock turnover rate (would be calculated from actual sales data)
      const turnoverRate = 5.2;

      setInventoryMetrics({
        totalValue,
        totalItems,
        lowStockCount,
        turnoverRate,
      });

      // Prepare category data for pie chart
      const categoryMap = new Map<number, { name: string; value: number }>();

      products.forEach((product: Product) => {
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

      setCategoryData(Array.from(categoryMap.values()));
      setFilteredProducts(products);
    }
  }, [products]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Container>
        <Header title="Inventory Report" />
        <LoadingIndicator>
          <CircularProgress sx={{ color: "#FAC1D9" }} />
        </LoadingIndicator>
      </Container>
    );
  }

  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, percent = 0, name = '' } = props;
    const RADIAN = Math.PI / 180;
    const radius = (outerRadius as number) * 1.15;
    const x = (cx as number) + radius * Math.cos(-midAngle * RADIAN);
    const y = (cy as number) + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#FFFFFF"
        textAnchor={x > (cx as number) ? "start" : "end"}
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
        filter="drop-shadow(0px 0px 1px #000)"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  const pagedDeliveryHistory = mockDeliveryHistory.slice(
    salesPage * salesRows,
    salesPage * salesRows + salesRows
  );

  return (
    <Container>
      <Header title="Inventory Report" />
      <ContentWrapper>
        {/* Date filters */}
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(date) => setStartDate(date)}
              slotProps={{
                textField: {
                  variant: "outlined",
                  sx: { bgcolor: "#333", borderRadius: 1 },
                },
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(date) => setEndDate(date)}
              slotProps={{
                textField: {
                  variant: "outlined",
                  sx: { bgcolor: "#333", borderRadius: 1 },
                },
              }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            sx={{
              bgcolor: "#FAC1D9",
              color: "#000",
              "&:hover": { bgcolor: "#f8aac8" },
            }}
          >
            Apply Filter
          </Button>
        </Stack>

        {/* Summary Cards */}
        <SummaryContainer>
          <SummaryCard>
            <CardTitle>Total Inventory Value</CardTitle>
            <CardValue>{formatCurrency(inventoryMetrics.totalValue)}</CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Total Items</CardTitle>
            <CardValue>{inventoryMetrics.totalItems}</CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Low Stock Items</CardTitle>
            <CardValue>{inventoryMetrics.lowStockCount}</CardValue>
          </SummaryCard>
          <SummaryCard>
            <CardTitle>Stock Turnover Rate</CardTitle>
            <CardValue>{inventoryMetrics.turnoverRate.toFixed(1)}x</CardValue>
          </SummaryCard>
        </SummaryContainer>

        {/* Charts */}
        <ChartsRow>
          <ChartColumnLarge>
            <ChartContainer>
              <ChartTitle>Stock Level Trends</ChartTitle>
              <ResponsiveContainer width="100%" height="85%">
                <LineChart
                  data={mockStockTrend}
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
                      color: "#FFF",
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
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "#333",
                      border: "1px solid #444",
                      borderRadius: "4px",
                      color: "#FFF",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartColumnSmall>
        </ChartsRow>

        {/* Product Delivery History Table */}
        <TableTitle>Product Delivery History</TableTitle>
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>Product</StyledTableHeaderCell>
                <StyledTableHeaderCell>Supplier</StyledTableHeaderCell>
                <StyledTableHeaderCell align="right">
                  Quantity
                </StyledTableHeaderCell>
                <StyledTableHeaderCell align="right">
                  Cost
                </StyledTableHeaderCell>
                <StyledTableHeaderCell align="right">
                  Date
                </StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedDeliveryHistory.map((record) => (
                <TableRow key={record.id}>
                  <StyledTableCell>{record.product_name}</StyledTableCell>
                  <StyledTableCell>{record.supplier}</StyledTableCell>
                  <StyledTableCell align="right">
                    {record.quantity}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {formatCurrency(record.cost)}
                  </StyledTableCell>
                  <StyledTableCell align="right">{record.date}</StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={mockDeliveryHistory.length}
            page={salesPage}
            onPageChange={(_, p) => setSalesPage(p)}
            rowsPerPage={salesRows}
            onRowsPerPageChange={(e) => {
              setSalesRows(parseInt(e.target.value, 10));
              setSalesPage(0);
            }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </StyledTableContainer>

        {/* Products Table */}
        <TableTitle variant="h6">Inventory Items</TableTitle>
        <StyledTableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <StyledTableHeaderCell>Product Name</StyledTableHeaderCell>
                <StyledTableHeaderCell>SKU</StyledTableHeaderCell>
                <StyledTableHeaderCell>Category</StyledTableHeaderCell>
                <StyledTableHeaderCell>Unit Price</StyledTableHeaderCell>
                <StyledTableHeaderCell>Stock</StyledTableHeaderCell>
                <StyledTableHeaderCell>Value</StyledTableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <StyledTableCell>{product.name}</StyledTableCell>
                  <StyledTableCell>{product.sku}</StyledTableCell>
                  <StyledTableCell>
                    {product.category_name || `Category ${product.category_id}`}
                  </StyledTableCell>
                  <StyledTableCell>
                    {formatCurrency(product.unit_price)}
                  </StyledTableCell>
                  <StyledTableCell>{product.current_stock}</StyledTableCell>
                  <StyledTableCell>
                    {formatCurrency(
                      product.unit_price * product.current_stock
                    )}
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      </ContentWrapper>
    </Container>
  );
}
