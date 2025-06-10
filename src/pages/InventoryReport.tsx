import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { styled } from "@mui/material/styles";
import Header from "../components/Header";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useProducts, type Product } from "../hooks/useProducts";
import { formatCurrency } from "../utils/formatters";

const Container = styled("div")({
  minHeight: "100vh",
});

const ContentContainer = styled("div")({
  padding: "20px",
});

const FilterSection = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "30px",
  marginBottom: "40px",
  justifyContent: "space-between",
});

const FilterButtons = styled("div")({
  display: "flex",
  gap: "30px",
});

const RightSection = styled("div")({
  display: "flex",
  gap: "15px",
  marginLeft: "auto",
});

interface ReportTypeButtonProps {
  active?: boolean;
  onClick?: () => void;
}

const ReportTypeButton = styled("button")<ReportTypeButtonProps>(
  ({ active = false, onClick }) => ({
    padding: "14px 22px",
    borderRadius: "7.5px",
    border: "none",
    backgroundColor: active ? "#FAC1D9" : "transparent",
    color: active ? "#333333" : "#FFFFFF",
    fontFamily: "Poppins",
    fontSize: "16px",
    fontWeight: 400,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: active ? "#FAC1D9" : "rgba(250, 193, 217, 0.1)",
    },
  })
);

const DatePickerContainer = styled("div")({
  position: "relative",
  display: "flex",
  "&::before": {
    content: '""',
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "20px",
    height: "20px",
    backgroundImage: 'url("/icons/calendar.svg")',
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    zIndex: 1,
  },
  "& .react-datepicker": {
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "10px",
    fontFamily: "Poppins",
    "& .react-datepicker__header": {
      backgroundColor: "#292C2D",
      borderBottom: "1px solid #5E5E5E",
      "& .react-datepicker__current-month": {
        color: "#FFFFFF",
      },
      "& .react-datepicker__day-name": {
        color: "#FAC1D9",
      },
    },
    "& .react-datepicker__day": {
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#FAC1D9",
        color: "#333333",
      },
    },
    "& .react-datepicker__day--selected": {
      backgroundColor: "#FAC1D9",
      color: "#333333",
    },
    "& .react-datepicker__day--keyboard-selected": {
      backgroundColor: "#FAC1D9",
      color: "#333333",
    },
    "& .react-datepicker__day--in-range": {
      backgroundColor: "rgba(250, 193, 217, 0.2)",
      color: "#FFFFFF",
    },
    "& .react-datepicker__day--in-selecting-range": {
      backgroundColor: "rgba(250, 193, 217, 0.2)",
      color: "#FFFFFF",
    },
    "& .react-datepicker__year-dropdown-container": {
      color: "#FFFFFF",
    },
    "& .react-datepicker__year-read-view": {
      color: "#FFFFFF",
      "&:hover": {
        cursor: "pointer",
      },
    },
    "& .react-datepicker__year-dropdown": {
      backgroundColor: "#3D4142",
      border: "1px solid #5E5E5E",
      borderRadius: "4px",
      color: "#FFFFFF",
      "& .react-datepicker__year-option": {
        "&:hover": {
          backgroundColor: "#FAC1D9",
          color: "#333333",
        },
      },
    },
    "& .react-datepicker__month-read-view": {
      color: "#FFFFFF",
      "&:hover": {
        cursor: "pointer",
      },
    },
    "& .react-datepicker__month-dropdown": {
      backgroundColor: "#3D4142",
      border: "1px solid #5E5E5E",
      borderRadius: "4px",
      color: "#FFFFFF",
      "& .react-datepicker__month-option": {
        "&:hover": {
          backgroundColor: "#FAC1D9",
          color: "#333333",
        },
      },
    },
  },
  "& .react-datepicker-wrapper, & .react-datepicker__input-container": {
    display: "flex",
    width: "auto",
  },
  "& .react-datepicker__close-icon": {
    right: "8px",
    padding: 0,
    "&::after": {
      background: "none",
      color: "#FFFFFF",
      fontSize: "16px",
      padding: 0,
      width: "16px",
      height: "16px",
    },
  },
  "& .react-datepicker__input-container input": {
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "10px",
    color: "#FFFFFF",
    minWidth: "250px",
    width: "auto",
    height: "52px",
    padding: "0 25px 0 45px",
    fontFamily: "Poppins",
    fontSize: "14px",
    textAlign: "center",
    "&:focus": {
      outline: "none",
    },
  },
});

const ExportButton = styled("button")({
  padding: "14px 22px",
  borderRadius: "7.5px",
  border: "none",
  backgroundColor: "#FAC1D9",
  color: "#333333",
  fontFamily: "Poppins",
  fontSize: "16px",
  fontWeight: 500,
  cursor: "pointer",
});

const StatsContainer = styled("div")({
  display: "flex",
  gap: "20px",
  marginBottom: "30px",
});

const StatsCard = styled("div")({
  flex: 1,
  backgroundColor: "#292C2D",
  borderRadius: "10px",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
});

const StatsHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "5px",
});

const StatsTitle = styled("h3")({
  margin: 0,
  fontSize: "18px",
  fontFamily: "Poppins",
  fontWeight: 500,
  color: "#FAC1D9",
});

const StatValue = styled("div")({
  fontSize: "24px",
  fontFamily: "Poppins",
  fontWeight: 700,
  color: "#FFFFFF",
});

const StatChange = styled("div")<{ positive?: boolean }>((props) => ({
  fontSize: "14px",
  fontFamily: "Poppins",
  fontWeight: 400,
  color: props.positive ? "#4CAF50" : "#F44336",
  display: "flex",
  alignItems: "center",
  gap: "5px",
}));

const ChartContainer = styled("div")({
  display: "flex",
  gap: "20px",
  marginBottom: "30px",
});

const ChartCard = styled("div")({
  flex: 1,
  backgroundColor: "#292C2D",
  borderRadius: "10px",
  padding: "20px",
  height: "300px",
});

const ChartTitle = styled("h3")({
  margin: "0 0 15px 0",
  fontSize: "18px",
  fontFamily: "Poppins",
  fontWeight: 500,
  color: "#FAC1D9",
});

const FilterRow = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
  gap: "15px",
});

const SearchInput = styled("div")({
  position: "relative",
  flex: 1,
  maxWidth: "300px",
  "&::before": {
    content: '""',
    position: "absolute",
    left: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "16px",
    height: "16px",
    backgroundImage: 'url("/icons/search.svg")',
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    opacity: 0.7,
  },
  "& input": {
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "10px",
    color: "#FFFFFF",
    width: "100%",
    height: "42px",
    padding: "0 15px 0 40px",
    fontFamily: "Poppins",
    fontSize: "14px",
    "&:focus": {
      outline: "none",
      boxShadow: "0 0 0 2px rgba(250, 193, 217, 0.3)",
    },
    "&::placeholder": {
      color: "rgba(255, 255, 255, 0.5)",
    },
  },
});

const FilterSelect = styled("select")({
  backgroundColor: "#3D4142",
  border: "none",
  borderRadius: "10px",
  color: "#FFFFFF",
  height: "42px",
  padding: "0 15px",
  fontFamily: "Poppins",
  fontSize: "14px",
  appearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  backgroundSize: "16px",
  paddingRight: "30px",
  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 2px rgba(250, 193, 217, 0.3)",
  },
  "& option": {
    backgroundColor: "#3D4142",
  },
});

const StatusBadge = styled("span")<{ status: string }>((props) => {
  let backgroundColor = "#757575"; // Default gray

  if (props.status === "InStock") backgroundColor = "#4CAF50"; // Green
  else if (props.status === "LowStock") backgroundColor = "#FF9800"; // Orange
  else if (props.status === "OutOfStock") backgroundColor = "#F44336"; // Red
  else if (props.status === "Expired") backgroundColor = "#9C27B0"; // Purple
  else if (props.status === "AboutToExpire") backgroundColor = "#FFD600"; // Yellow

  return {
    backgroundColor,
    color: "#FFFFFF",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
    display: "inline-block",
  };
});

const TableContainer = styled("div")({
  backgroundColor: "#292C2D",
  borderRadius: "10px",
  padding: "25px 22px",
  marginBottom: "10px",
});

const Table = styled("table")({
  width: "100%",
  borderCollapse: "collapse",
  "& th, & td": {
    padding: "12px 20px",
    textAlign: "left",
    fontFamily: "Poppins",
    borderBottom: "1px solid #5E5E5E",
  },
  "& th": {
    color: "#FAC1D9",
    fontWeight: 300,
    fontSize: "14px",
  },
  "& td": {
    color: "#FFFFFF",
    fontWeight: 300,
    fontSize: "16px",
  },
  "& tr:nth-of-type(even)": {
    backgroundColor: "#3D4142",
  },
});

const PaginationContainer = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: "20px",
});

const PageInfo = styled("div")({
  color: "#FFFFFF",
  fontFamily: "Poppins",
  fontSize: "14px",
});

const PageButtons = styled("div")({
  display: "flex",
  gap: "10px",
});

const PageSizeSelect = styled("select")({
  backgroundColor: "#3D4142",
  border: "none",
  borderRadius: "10px",
  color: "#FFFFFF",
  height: "32px",
  padding: "0 25px 0 10px",
  fontFamily: "Poppins",
  fontSize: "14px",
  appearance: "none",
  backgroundImage:
    "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 8px center",
  backgroundSize: "12px",
  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 2px rgba(250, 193, 217, 0.3)",
  },
  "& option": {
    backgroundColor: "#3D4142",
  },
});

const PageSizeLabel = styled("div")({
  display: "flex",
  alignItems: "center",
  color: "#FFFFFF",
  fontFamily: "Poppins",
  fontSize: "14px",
  gap: "8px",
});

const PageButton = styled("button")<{ active?: boolean }>((props) => ({
  backgroundColor: props.active ? "#FAC1D9" : "#3D4142",
  color: props.active ? "#333333" : "#FFFFFF",
  border: "none",
  borderRadius: "5px",
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontFamily: "Poppins",
  fontSize: "14px",
  "&:hover": {
    backgroundColor: props.active ? "#FAC1D9" : "rgba(250, 193, 217, 0.2)",
  },
  "&:disabled": {
    opacity: 0.5,
    cursor: "not-allowed",
    backgroundColor: "#3D4142",
  },
}));

export default function InventoryReport() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [startDate, endDate] = dateRange;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const navigate = useNavigate();

  // Get real products data from the backend
  const { products: realProducts } = useProducts();

  // Convert real products to report format
  const reportData = useMemo(() => {
    if (!realProducts || realProducts.length === 0) return [];

    return realProducts.map((product, index) => {
      // Generate a semi-random future date for delivery/expiry
      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(
        today.getDate() + Math.floor(Math.random() * 10) + 1
      );

      const expiryDate = new Date(deliveryDate);
      // Set longer expiry for non-food items
      const isFoodItem =
        product.category_name?.toLowerCase().includes("food") ||
        product.name.toLowerCase().includes("milk") ||
        product.name.toLowerCase().includes("egg");
      expiryDate.setDate(
        deliveryDate.getDate() +
          (isFoodItem ? Math.floor(Math.random() * 14) + 2 : 365)
      );

      // Determine status based on stock
      let status = "InStock";
      if (product.current_stock <= 0) {
        status = "OutOfStock";
      } else if (product.current_stock <= product.minimum_stock) {
        status = "LowStock";
      }

      // For perishable items, some might be about to expire
      if (isFoodItem && Math.random() < 0.3) {
        status = "AboutToExpire";
        expiryDate.setDate(today.getDate() + Math.floor(Math.random() * 3) + 1);
      }

      // Calculate remaining days
      const remainingDays = isFoodItem
        ? Math.floor(
            (expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24)
          )
        : null;

      // Format dates
      const formatDate = (date: Date) => {
        return `${String(date.getDate()).padStart(2, "0")}. ${String(
          date.getMonth() + 1
        ).padStart(2, "0")}. ${date.getFullYear()}`;
      };

      return {
        id: product.id,
        sNo: String(index + 1).padStart(2, "0"),
        itemName: product.name,
        sku: product.sku,
        category: product.category_name || "Uncategorized",
        deliveryDate: formatDate(deliveryDate),
        expiry: isFoodItem ? formatDate(expiryDate) : "N/A",
        supplier:
          product.supplier || product.category_name || "Unknown Supplier",
        qoQr: `${product.current_stock} \\ ${product.current_stock}`, // Ordered vs Received
        unitPrice: product.unit_price,
        totalCost: product.unit_price * product.current_stock,
        status: status,
        remainingDays: remainingDays,
      };
    });
  }, [realProducts]);

  // Parse date strings in the format "DD. MM. YYYY" to Date objects
  const parseDate = (dateString: string): Date | null => {
    if (dateString === "N/A") return null;

    try {
      const parts = dateString.split(". ");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript Date
        const year = parseInt(parts[2], 10);
        const result = new Date(year, month, day);
        // Set to midnight to ignore time component
        result.setHours(0, 0, 0, 0);
        return result;
      }
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
    }
    return null;
  };

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...reportData];

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter((item) => {
        const itemDeliveryDate = parseDate(item.deliveryDate);
        if (!itemDeliveryDate) return false;

        // Start date is inclusive (>=), end date is inclusive (<=)
        return itemDeliveryDate >= startDate && itemDeliveryDate <= endDate;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Filter by supplier
    if (supplierFilter !== "All") {
      filtered = filtered.filter((item) => item.supplier === supplierFilter);
    }

    // Apply sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
          case "name":
            aValue = a.itemName;
            bValue = b.itemName;
            break;
          case "price":
            aValue = a.unitPrice;
            bValue = b.unitPrice;
            break;
          case "totalCost":
            aValue = a.totalCost;
            bValue = b.totalCost;
            break;
          case "deliveryDate":
            aValue = parseDate(a.deliveryDate)?.getTime() || 0;
            bValue = parseDate(b.deliveryDate)?.getTime() || 0;
            break;
          case "expiry":
            aValue = parseDate(a.expiry)?.getTime() || Number.MAX_SAFE_INTEGER;
            bValue = parseDate(b.expiry)?.getTime() || Number.MAX_SAFE_INTEGER;
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            aValue = a.itemName;
            bValue = b.itemName;
        }

        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [
    reportData,
    startDate,
    endDate,
    searchTerm,
    statusFilter,
    supplierFilter,
    sortBy,
    sortDirection,
  ]);

  // Calculate statistics based on filtered data, not the full mock data
  const totalItems = filteredData.length;
  const totalValue = filteredData.reduce(
    (sum, item) => sum + item.totalCost,
    0
  );
  const itemsNearExpiry = filteredData.filter(
    (item) => item.remainingDays !== null && item.remainingDays <= 7
  ).length;
  const outOfStockItems = filteredData.filter(
    (item) => item.status === "OutOfStock"
  ).length;

  // Generate chart data based on filtered data
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};

    // Sum up values by category
    filteredData.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category] += item.totalCost;
    });

    // Convert to chart data format
    return Object.keys(categories).map((name) => ({
      name,
      value: categories[name],
    }));
  }, [filteredData]);

  const supplierData = useMemo(() => {
    const suppliers: Record<string, number> = {};

    // Sum up values by supplier
    filteredData.forEach((item) => {
      if (!suppliers[item.supplier]) {
        suppliers[item.supplier] = 0;
      }
      suppliers[item.supplier] += item.totalCost;
    });

    // Convert to chart data format
    return Object.keys(suppliers).map((name) => ({
      name,
      value: suppliers[name],
    }));
  }, [filteredData]);

  const COLORS = [
    "#FF8042",
    "#FFBB28",
    "#00C49F",
    "#0088FE",
    "#FF6B8B",
    "#8884d8",
  ];

  // Format date for display in a consistent format
  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return "";
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/");
  };

  // Handle date range change
  const handleDateRangeChange = (update: [Date | null, Date | null]) => {
    console.log(
      "Date range changed:",
      update[0]?.toISOString(),
      update[1]?.toISOString()
    );
    setDateRange(update);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
  const currentItems = filteredData.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // If already sorting by this column, toggle direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Otherwise, sort by this column in descending order initially
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  // Get suppliers from the real products data
  const suppliers = useMemo(() => {
    return [...new Set(reportData.map((item) => item.supplier))];
  }, [reportData]);

  return (
    <Container>
      <Header title="Reports" />
      <ContentContainer>
        <FilterSection>
          <FilterButtons>
            <ReportTypeButton
              active={false}
              onClick={() => navigate("/reports")}
            >
              Sales & Revenue Report
            </ReportTypeButton>
            <ReportTypeButton active={true}>Inventory Report</ReportTypeButton>
          </FilterButtons>
          <RightSection>
            <DatePickerContainer>
              <DatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateRangeChange}
                dateFormat="dd/MM/yyyy"
                placeholderText="Select date range"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                isClearable={false}
              />
            </DatePickerContainer>
            <div style={{ display: "flex", gap: "10px" }}>
              <ExportButton>Export Data</ExportButton>
            </div>
          </RightSection>
        </FilterSection>

        {/* Stats Summary Cards */}
        <StatsContainer>
          {filteredData.length > 0 ? (
            <>
              <StatsCard>
                <StatsHeader>
                  <StatsTitle>Total Inventory Items</StatsTitle>
                </StatsHeader>
                <StatValue>{totalItems}</StatValue>
                <StatChange positive={true}>+3 since last week</StatChange>
              </StatsCard>

              <StatsCard>
                <StatsHeader>
                  <StatsTitle>Total Inventory Value</StatsTitle>
                </StatsHeader>
                <StatValue>{formatCurrency(totalValue)}</StatValue>
                <StatChange positive={true}>+12.5% since last month</StatChange>
              </StatsCard>

              <StatsCard>
                <StatsHeader>
                  <StatsTitle>Items Near Expiry</StatsTitle>
                </StatsHeader>
                <StatValue>{itemsNearExpiry}</StatValue>
                <StatChange positive={false}>+2 since last week</StatChange>
              </StatsCard>

              <StatsCard>
                <StatsHeader>
                  <StatsTitle>Out of Stock Items</StatsTitle>
                </StatsHeader>
                <StatValue>{outOfStockItems}</StatValue>
                <StatChange positive={true}>-1 since last week</StatChange>
              </StatsCard>
            </>
          ) : (
            <>
              <StatsCard>
                <StatsHeader>
                  <StatsTitle>Total Inventory Items</StatsTitle>
                </StatsHeader>
                <StatValue>0</StatValue>
                <StatChange positive={true}>
                  No data for selected period
                </StatChange>
              </StatsCard>

              <StatsCard>
                <StatsHeader>
                  <StatsTitle>Total Inventory Value</StatsTitle>
                </StatsHeader>
                <StatValue>{formatCurrency(0)}</StatValue>
                <StatChange positive={true}>
                  No data for selected period
                </StatChange>
              </StatsCard>

              <StatsCard>
                <StatsHeader>
                  <StatsTitle>Items Near Expiry</StatsTitle>
                </StatsHeader>
                <StatValue>0</StatValue>
                <StatChange positive={true}>
                  No data for selected period
                </StatChange>
              </StatsCard>

              <StatsCard>
                <StatsHeader>
                  <StatsTitle>Out of Stock Items</StatsTitle>
                </StatsHeader>
                <StatValue>0</StatValue>
                <StatChange positive={true}>
                  No data for selected period
                </StatChange>
              </StatsCard>
            </>
          )}
        </StatsContainer>

        {/* Charts */}
        {filteredData.length > 0 ? (
          <ChartContainer>
            <ChartCard>
              <ChartTitle>Inventory Value by Category</ChartTitle>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
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
                    formatter={(value) => formatCurrency(value as number)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Inventory Value by Supplier</ChartTitle>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={supplierData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" tick={{ fill: "#FFFFFF" }} />
                  <YAxis tick={{ fill: "#FFFFFF" }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar dataKey="value" fill="#FAC1D9" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </ChartContainer>
        ) : (
          <ChartContainer>
            <ChartCard>
              <ChartTitle>Inventory Value by Category</ChartTitle>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "90%",
                  color: "#FFFFFF",
                  opacity: 0.7,
                }}
              >
                No data available for the selected filters
              </div>
            </ChartCard>

            <ChartCard>
              <ChartTitle>Inventory Value by Supplier</ChartTitle>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "90%",
                  color: "#FFFFFF",
                  opacity: 0.7,
                }}
              >
                No data available for the selected filters
              </div>
            </ChartCard>
          </ChartContainer>
        )}

        {/* Filters */}
        <FilterRow>
          <SearchInput>
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <div style={{ display: "flex", gap: "15px" }}>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="InStock">In Stock</option>
              <option value="LowStock">Low Stock</option>
              <option value="OutOfStock">Out of Stock</option>
              <option value="AboutToExpire">About to Expire</option>
              <option value="Expired">Expired</option>
            </FilterSelect>

            <FilterSelect
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="All">All Suppliers</option>
              {suppliers.map((supplier, index) => (
                <option key={index} value={supplier}>
                  {supplier}
                </option>
              ))}
            </FilterSelect>
          </div>
        </FilterRow>

        {/* Table */}
        <TableContainer>
          {filteredData.length > 0 ? (
            <Table>
              <thead>
                <tr>
                  <th>S.No</th>
                  <th
                    onClick={() => handleSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Item Name{" "}
                    {sortBy === "name" && (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th>SKU</th>
                  <th
                    onClick={() => handleSort("deliveryDate")}
                    style={{ cursor: "pointer" }}
                  >
                    Delivery Date{" "}
                    {sortBy === "deliveryDate" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("expiry")}
                    style={{ cursor: "pointer" }}
                  >
                    Expiry{" "}
                    {sortBy === "expiry" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th>Supplier</th>
                  <th>QO \ QR</th>
                  <th
                    onClick={() => handleSort("price")}
                    style={{ cursor: "pointer" }}
                  >
                    Unit Price{" "}
                    {sortBy === "price" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("totalCost")}
                    style={{ cursor: "pointer" }}
                  >
                    Total Cost{" "}
                    {sortBy === "totalCost" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    style={{ cursor: "pointer" }}
                  >
                    Status{" "}
                    {sortBy === "status" &&
                      (sortDirection === "asc" ? "▲" : "▼")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{item.sNo}</td>
                    <td>{item.itemName}</td>
                    <td>{item.sku}</td>
                    <td>{item.deliveryDate}</td>
                    <td>{item.expiry}</td>
                    <td>{item.supplier}</td>
                    <td>{item.qoQr}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{formatCurrency(item.totalCost)}</td>
                    <td>
                      <StatusBadge status={item.status}>
                        {item.status === "InStock" && "In Stock"}
                        {item.status === "LowStock" && "Low Stock"}
                        {item.status === "OutOfStock" && "Out of Stock"}
                        {item.status === "AboutToExpire" && "About to Expire"}
                        {item.status === "Expired" && "Expired"}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "50px 20px",
                color: "#FFFFFF",
                fontFamily: "Poppins",
              }}
            >
              <h3 style={{ marginBottom: "10px", fontWeight: 500 }}>
                No inventory items found
              </h3>
              <p>
                No items match your current filters. Try adjusting your search
                criteria or date range.
              </p>
            </div>
          )}
        </TableContainer>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <PaginationContainer>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <PageInfo>
                Showing {startIndex + 1}-{endIndex} of {filteredData.length}{" "}
                items
              </PageInfo>
              <PageSizeLabel>
                Show
                <PageSizeSelect
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </PageSizeSelect>
                per page
              </PageSizeLabel>
            </div>
            <PageButtons>
              <PageButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ←
              </PageButton>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1;

                // If we have more than 5 pages and are not at the beginning
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 3 + i;

                  // Don't go beyond the last page
                  if (pageNum > totalPages) {
                    pageNum = totalPages - (4 - i);
                  }
                }

                // Don't show page numbers beyond the total
                if (pageNum <= totalPages) {
                  return (
                    <PageButton
                      key={i}
                      active={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  );
                }
                return null;
              })}

              <PageButton
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                →
              </PageButton>
            </PageButtons>
          </PaginationContainer>
        )}
      </ContentContainer>
    </Container>
  );
}
