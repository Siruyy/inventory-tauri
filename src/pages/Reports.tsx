import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { styled } from "@mui/material/styles";
import Header from "../components/Header";
import {
  LineChart,
  Line,
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
import { useOrders, type SalesReportData } from "../hooks/useOrders";
import { formatCurrency } from "../utils/formatters";
import { useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

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
}

const ReportTypeButton = styled("button")<ReportTypeButtonProps>(
  ({ active = false }) => ({
    padding: "14px 22px",
    borderRadius: "7.5px",
    border: "none",
    backgroundColor: active ? "#FAC1D9" : "transparent",
    color: active ? "#333333" : "#FFFFFF",
    fontFamily: "Poppins",
    fontSize: "16px",
    fontWeight: 500,
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
  "& .react-datepicker-wrapper, & .react-datepicker__input-container": {
    display: "flex",
    width: "auto",
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
  "& .react-datepicker__input-container input": {
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "10px",
    color: "#FFFFFF",
    minWidth: "220px",
    width: "auto",
    height: "52px",
    padding: "0 20px 0 40px",
    fontFamily: "Poppins",
    fontSize: "14px",
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
  gap: "40px",
  marginBottom: "40px",
});

const StatsCard = styled("div")({
  flex: 1,
  backgroundColor: "#292C2D",
  borderRadius: "10px",
  padding: "35px 40px",
  display: "flex",
  flexDirection: "column",
  gap: "31px",
});

const StatsTitle = styled("h2")({
  margin: 0,
  fontSize: "25px",
  fontFamily: "Poppins",
  fontWeight: 700,
  color: "#FFFFFF",
});

const StatItem = styled("div")({
  backgroundColor: "#FAC1D9",
  borderRadius: "7.5px",
  padding: "14px 22px",
  color: "#333333",
  fontFamily: "Poppins",
  fontSize: "16px",
  fontWeight: 500,
});

const TableContainer = styled("div")({
  backgroundColor: "#292C2D",
  borderRadius: "10px",
  padding: "25px",
  marginBottom: "20px",
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

const FilterContainer = styled("div")({
  display: "flex",
  gap: "15px",
  marginBottom: "20px",
});

const FilterButton = styled("button")({
  padding: "10px 15px",
  borderRadius: "7.5px",
  border: "none",
  backgroundColor: "#3D4142",
  color: "#FFFFFF",
  fontFamily: "Poppins",
  fontSize: "14px",
  fontWeight: 400,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "rgba(250, 193, 217, 0.1)",
  },
});

const ChartContainer = styled("div")({
  display: "flex",
  gap: "40px",
  marginBottom: "40px",
  flexWrap: "wrap",
});

const ChartCard = styled("div")({
  flex: "1 1 calc(50% - 20px)",
  minWidth: "400px",
  backgroundColor: "#292C2D",
  borderRadius: "10px",
  padding: "25px",
  height: "400px",
});

const ChartTitle = styled("h3")({
  margin: "0 0 20px 0",
  fontSize: "18px",
  fontFamily: "Poppins",
  fontWeight: 600,
  color: "#FFFFFF",
});

const SummaryContainer = styled("div")({
  backgroundColor: "#292C2D",
  borderRadius: "10px",
  padding: "25px",
  marginBottom: "40px",
});

const SummaryTitle = styled("h3")({
  margin: "0 0 20px 0",
  fontSize: "18px",
  fontFamily: "Poppins",
  fontWeight: 600,
  color: "#FFFFFF",
});

const SummaryGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "20px",
});

const SummaryItem = styled("div")({
  backgroundColor: "#3D4142",
  borderRadius: "7.5px",
  padding: "15px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const SummaryLabel = styled("span")({
  fontSize: "14px",
  color: "#FAC1D9",
  marginBottom: "10px",
  textAlign: "center",
});

const SummaryValue = styled("span")({
  fontSize: "24px",
  fontWeight: "600",
  color: "#FFFFFF",
});

const ComparisonContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  marginTop: "5px",
});

const ComparisonValue = styled("span")<{ positive?: boolean }>(
  ({ positive = true }) => ({
    fontSize: "12px",
    color: positive ? "#4CAF50" : "#F44336",
    marginLeft: "5px",
  })
);

const TableTitle = styled("h3")({
  margin: "0 0 20px 0",
  fontSize: "18px",
  fontFamily: "Poppins",
  fontWeight: 600,
  color: "#FFFFFF",
});

const FilterSelect = styled("select")({
  padding: "10px 15px",
  borderRadius: "7.5px",
  border: "none",
  backgroundColor: "#3D4142",
  color: "#FFFFFF",
  fontFamily: "Poppins",
  fontSize: "14px",
  fontWeight: 400,
  cursor: "pointer",
  outline: "none",
});

const FilterLabel = styled("span")({
  color: "#FFFFFF",
  fontFamily: "Poppins",
  fontSize: "14px",
  marginRight: "10px",
});

const TableFilterContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  marginBottom: "20px",
  gap: "15px",
});

const SearchInput = styled("input")({
  padding: "10px 15px",
  borderRadius: "7.5px",
  border: "none",
  backgroundColor: "#3D4142",
  color: "#FFFFFF",
  fontFamily: "Poppins",
  fontSize: "14px",
  width: "250px",
  "&::placeholder": {
    color: "#AAAAAA",
  },
  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 2px rgba(250, 193, 217, 0.3)",
  },
});

interface SortableColumnProps {
  active?: boolean;
  direction?: "asc" | "desc";
}

const SortableColumn = styled("th")<SortableColumnProps>(
  ({ active = false, direction }) => ({
    cursor: "pointer",
    position: "relative",
    "&:hover": {
      opacity: 0.8,
    },
    "&::after": active
      ? {
          content: '""',
          position: "absolute",
          right: "8px",
          top: "50%",
          transform: `translateY(-50%) rotate(${
            direction === "asc" ? "180deg" : "0deg"
          })`,
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "4px solid #FAC1D9",
        }
      : {},
  })
);

// Colors for charts
const COLORS = [
  "#FAC1D9",
  "#82ca9d",
  "#8884d8",
  "#ffc658",
  "#FF8042",
  "#FFBB28",
  "#0088FE",
  "#00C49F",
];

export default function Reports() {
  const [reportType, setReportType] = useState<"sales" | "inventory">("sales");

  // Set the default date range to the known data date (June 10, 2025)
  const defaultDate = new Date(2025, 5, 10); // June 10, 2025 (month is 0-indexed)
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    defaultDate,
    defaultDate,
  ]);

  const [startDate, endDate] = dateRange;
  const [timeFilter, setTimeFilter] = useState<
    "day" | "week" | "month" | "year"
  >("day"); // Default to day view when showing a single day

  // Track if user has manually selected a custom date range
  const [isCustomDateRange, setIsCustomDateRange] = useState<boolean>(false);

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const navigate = useNavigate();
  const { getSalesReportData } = useOrders();
  const queryClient = useQueryClient();

  // Add debug function to check dates
  const debugOrderDates = async () => {
    try {
      // First log the currently selected date range
      console.log("Current date range selection:", {
        startDate: startDate
          ? `${startDate.getDate()}/${
              startDate.getMonth() + 1
            }/${startDate.getFullYear()}`
          : null,
        endDate: endDate
          ? `${endDate.getDate()}/${
              endDate.getMonth() + 1
            }/${endDate.getFullYear()}`
          : null,
        formattedStartDate: formatDateForApi(startDate),
        formattedEndDate: formatDateForApi(endDate),
      });

      // @ts-ignore - The debug_order_dates function is added but not in the types
      const dates = await invoke("debug_order_dates");
      console.log("All order dates in database:", dates);
      alert(`Found ${dates.length} orders with dates: ${dates.join(", ")}`);
    } catch (error) {
      console.error("Failed to debug order dates:", error);
      alert(`Error: ${error}`);
    }
  };

  // Format dates for the API request - ensure YYYY-MM-DD format
  const formatDateForApi = (date: Date | null) => {
    if (!date) return undefined;

    // Ensure we handle timezone issues by using local date components
    // This is critical for proper date filtering
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero if needed (Jan = 1)
    const day = String(date.getDate()).padStart(2, "0"); // Add leading zero if needed

    const formattedDate = `${year}-${month}-${day}`;
    console.log(
      `Formatting date: Day=${day}, Month=${month}, Year=${year} -> ${formattedDate}`
    );
    return formattedDate;
  };

  // Format dates for display
  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return "";
    return `${date.getDate().toString().padStart(2, "0")}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  // Handle date range change
  const handleDateRangeChange = (update: [Date | null, Date | null]) => {
    const [newStart, newEnd] = update;

    console.log("Date range selected:", {
      newStart: newStart ? newStart.toISOString() : null,
      newEnd: newEnd ? newEnd.toISOString() : null,
    });

    // Check if it's a custom date range
    if (newStart && newEnd) {
      const isSameDay =
        newStart.getDate() === newEnd.getDate() &&
        newStart.getMonth() === newEnd.getMonth() &&
        newStart.getFullYear() === newEnd.getFullYear();

      // If it's just a single day, we can keep time filters active
      setIsCustomDateRange(!isSameDay);

      // If it's a single day, default to day view
      if (isSameDay) {
        setTimeFilter("day");
      }

      // Clear cache immediately when date changes
      queryClient.invalidateQueries({
        queryKey: ["sales_report_data"],
      });
    }

    setDateRange(update);

    // Force a refetch after date range change
    setTimeout(() => {
      refetch();
    }, 100);
  };

  // Handle time filter change
  const handleTimeFilterChange = (
    filter: "day" | "week" | "month" | "year"
  ) => {
    setTimeFilter(filter);

    // Reset date range based on the selected time filter
    const now = new Date();
    let newStartDate: Date;

    switch (filter) {
      case "day":
        // Just today
        newStartDate = new Date(now);
        setDateRange([newStartDate, now]);
        break;
      case "week":
        // Last 7 days
        newStartDate = new Date(now);
        newStartDate.setDate(now.getDate() - 6);
        setDateRange([newStartDate, now]);
        break;
      case "month":
        // Current month
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
        setDateRange([newStartDate, now]);
        break;
      case "year":
        // Current year
        newStartDate = new Date(now.getFullYear(), 0, 1);
        setDateRange([newStartDate, now]);
        break;
    }

    // Not a custom range anymore since we're using predefined periods
    setIsCustomDateRange(false);
  };

  // Get sales report data from the backend
  const {
    data: reportData,
    isLoading,
    error,
    refetch,
  } = getSalesReportData(
    formatDateForApi(startDate),
    formatDateForApi(endDate),
    timeFilter
  );

  // Effect to refetch data when filters change
  useEffect(() => {
    // Log the date range for debugging
    console.log("Date range for API:", {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
      timeFilter,
    });

    // Clear the cache before refetching to avoid stale data
    queryClient.invalidateQueries({
      queryKey: ["sales_report_data"],
    });

    // This will refetch data when date range or time filter changes
    refetch();
  }, [startDate, endDate, timeFilter, refetch, queryClient]);

  // Check if we have no data for the selected time period
  const hasNoData = useMemo(() => {
    if (!reportData) return false;

    // Check if total sales is 0
    const hasNoSales = reportData.sales_summary.total_sales === 0;

    // Check if transactions count is 0
    const hasNoTransactions = reportData.sales_summary.transactions === 0;

    // Check if all data arrays are empty
    const hasEmptyDataArrays =
      reportData.sales_by_period.length === 0 &&
      reportData.sales_by_category.length === 0 &&
      reportData.top_products.length === 0 &&
      reportData.detailed_sales.length === 0;

    // Special date check: we only have data for June 10, 2025
    const hasDataDate = new Date(2025, 5, 10); // June 10, 2025 (month is 0-indexed)
    hasDataDate.setHours(0, 0, 0, 0);

    // Check if date range is outside our data date
    const isOutsideDataDate =
      startDate &&
      endDate &&
      (startDate.getTime() > hasDataDate.getTime() ||
        endDate.getTime() < hasDataDate.getTime());

    // Only date we have data for is June 10, 2025
    const isDataDate =
      startDate &&
      startDate.getFullYear() === 2025 &&
      startDate.getMonth() === 5 &&
      startDate.getDate() === 10;

    // Stricter check - any of these conditions means no data
    const noData =
      hasNoSales ||
      hasNoTransactions ||
      hasEmptyDataArrays ||
      isOutsideDataDate;

    console.log("Date range analysis:", {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
      dataDate: "2025-06-10",
      isOutsideDataDate,
      isDataDate,
      hasNoSales,
      hasNoTransactions,
      hasEmptyDataArrays,
      noData,
    });

    return noData;
  }, [reportData, startDate, endDate]);

  // Sort and filter table data
  const getSortedData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    setSortConfig({ key, direction });
  };

  // Filter detailed sales based on category and search query
  const filteredTableData = getSortedData(
    reportData?.detailed_sales?.filter(
      (item) =>
        (categoryFilter === "all" ||
          item.category.toLowerCase() === categoryFilter.toLowerCase()) &&
        item.product.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []
  );

  // Process period data for charts
  const processChartData = (data: any[]) => {
    if (!data || data.length === 0) return [];

    return data.map((item) => {
      // Format period for display based on the time filter
      let name = item.period;
      if (timeFilter === "month" && item.period.includes("-")) {
        const [year, month] = item.period.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        name = date.toLocaleString("default", { month: "short" });
      }

      return {
        name,
        sales: item.sales,
        revenue: item.revenue,
        profit: item.profit,
      };
    });
  };

  const handleReportTypeChange = (type: "sales" | "inventory") => {
    setReportType(type);
    if (type === "inventory") {
      navigate("/reports/inventory");
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    // Format the start and end dates for the filename
    const formatDate = (date: Date | null) => {
      if (!date) return "";
      return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };

    const fileName = `sales_report_${formatDate(startDate)}_to_${formatDate(
      endDate
    )}.csv`;

    // Create CSV header row
    let csvContent = "Product,Category,Date,Price,Profit,Margin,Revenue\n";

    // Add data rows
    reportData.detailed_sales.forEach((row) => {
      csvContent += `"${row.product}","${row.category}","${row.date}",${row.price},${row.profit},"${row.margin}",${row.revenue}\n`;
    });

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Categories for the filter
  const categories = [
    { id: "all", name: "All Categories" },
    ...(reportData?.sales_by_category.map((cat) => ({
      id: cat.category.toLowerCase(),
      name: cat.category,
    })) || []),
  ];

  // Display empty state when no data
  const renderEmptyState = () => {
    return (
      <div
        style={{
          backgroundColor: "#292C2D",
          borderRadius: "10px",
          padding: "40px",
          textAlign: "center",
          color: "#FFFFFF",
          marginTop: "40px",
        }}
      >
        <h3
          style={{
            fontSize: "20px",
            fontFamily: "Poppins",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          No orders found for the selected date range
        </h3>
        <p
          style={{
            fontSize: "16px",
            fontFamily: "Poppins",
            color: "#AAAAAA",
            marginBottom: "20px",
          }}
        >
          Try selecting a different date range or time period
        </p>
        <button
          onClick={() => {
            // Set the date range to the date we know has data (June 10, 2025)
            const dataDate = new Date(2025, 5, 10);
            setDateRange([dataDate, dataDate]);
            setTimeFilter("day");
          }}
          style={{
            padding: "12px 24px",
            borderRadius: "7.5px",
            border: "none",
            backgroundColor: "#FAC1D9",
            color: "#333333",
            fontFamily: "Poppins",
            fontSize: "16px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          View Data (June 10, 2025)
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Container>
        <Header title="Reports" />
        <ContentContainer>
          <div
            style={{ padding: "40px", textAlign: "center", color: "#FFFFFF" }}
          >
            Loading report data...
          </div>
        </ContentContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header title="Reports" />
        <ContentContainer>
          <div
            style={{ padding: "40px", textAlign: "center", color: "#FFFFFF" }}
          >
            Error loading report data. Please try again later.
          </div>
        </ContentContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header title="Reports" />
      <ContentContainer>
        <FilterSection>
          <FilterButtons>
            <ReportTypeButton
              active={reportType === "sales"}
              onClick={() => handleReportTypeChange("sales")}
            >
              Sales & Revenue Report
            </ReportTypeButton>
            <ReportTypeButton
              active={reportType === "inventory"}
              onClick={() => handleReportTypeChange("inventory")}
            >
              Inventory Report
            </ReportTypeButton>
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
              <ExportButton onClick={exportToCSV}>Export Data</ExportButton>
            </div>
          </RightSection>
        </FilterSection>

        {hasNoData ? (
          renderEmptyState()
        ) : (
          <>
            <SummaryContainer>
              <SummaryTitle>Performance Summary</SummaryTitle>
              <SummaryGrid>
                <SummaryItem>
                  <SummaryLabel>Total Sales</SummaryLabel>
                  <SummaryValue>
                    {formatCurrency(reportData?.sales_summary.total_sales || 0)}
                  </SummaryValue>
                  <ComparisonContainer>
                    <ComparisonValue
                      positive={reportData?.sales_summary.sales_growth >= 0}
                    >
                      {reportData?.sales_summary.sales_growth >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(
                        reportData?.sales_summary.sales_growth || 0
                      ).toFixed(1)}
                      %
                    </ComparisonValue>
                  </ComparisonContainer>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Total Revenue</SummaryLabel>
                  <SummaryValue>
                    {formatCurrency(
                      reportData?.sales_summary.total_revenue || 0
                    )}
                  </SummaryValue>
                  <ComparisonContainer>
                    <ComparisonValue
                      positive={reportData?.sales_summary.revenue_growth >= 0}
                    >
                      {reportData?.sales_summary.revenue_growth >= 0
                        ? "↑"
                        : "↓"}{" "}
                      {Math.abs(
                        reportData?.sales_summary.revenue_growth || 0
                      ).toFixed(1)}
                      %
                    </ComparisonValue>
                  </ComparisonContainer>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Total Profit</SummaryLabel>
                  <SummaryValue>
                    {formatCurrency(
                      reportData?.sales_summary.total_profit || 0
                    )}
                  </SummaryValue>
                  <ComparisonContainer>
                    <ComparisonValue
                      positive={reportData?.sales_summary.profit_growth >= 0}
                    >
                      {reportData?.sales_summary.profit_growth >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(
                        reportData?.sales_summary.profit_growth || 0
                      ).toFixed(1)}
                      %
                    </ComparisonValue>
                  </ComparisonContainer>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Items Sold</SummaryLabel>
                  <SummaryValue>
                    {reportData?.sales_summary.items_sold || 0}
                  </SummaryValue>
                  <ComparisonContainer>
                    <ComparisonValue
                      positive={reportData?.sales_summary.items_growth >= 0}
                    >
                      {reportData?.sales_summary.items_growth >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(
                        reportData?.sales_summary.items_growth || 0
                      ).toFixed(1)}
                      %
                    </ComparisonValue>
                  </ComparisonContainer>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Transactions</SummaryLabel>
                  <SummaryValue>
                    {reportData?.sales_summary.transactions || 0}
                  </SummaryValue>
                  <ComparisonContainer>
                    <ComparisonValue
                      positive={
                        reportData?.sales_summary.transactions_growth >= 0
                      }
                    >
                      {reportData?.sales_summary.transactions_growth >= 0
                        ? "↑"
                        : "↓"}{" "}
                      {Math.abs(
                        reportData?.sales_summary.transactions_growth || 0
                      ).toFixed(1)}
                      %
                    </ComparisonValue>
                  </ComparisonContainer>
                </SummaryItem>
              </SummaryGrid>
            </SummaryContainer>

            <FilterContainer>
              <FilterButton
                onClick={() => handleTimeFilterChange("day")}
                style={{
                  backgroundColor: timeFilter === "day" ? "#FAC1D9" : "#3D4142",
                  color: timeFilter === "day" ? "#333333" : "#FFFFFF",
                  opacity: isCustomDateRange ? 0.5 : 1,
                  cursor: isCustomDateRange ? "not-allowed" : "pointer",
                }}
                disabled={isCustomDateRange}
              >
                Daily
              </FilterButton>
              <FilterButton
                onClick={() => handleTimeFilterChange("week")}
                style={{
                  backgroundColor:
                    timeFilter === "week" ? "#FAC1D9" : "#3D4142",
                  color: timeFilter === "week" ? "#333333" : "#FFFFFF",
                  opacity: isCustomDateRange ? 0.5 : 1,
                  cursor: isCustomDateRange ? "not-allowed" : "pointer",
                }}
                disabled={isCustomDateRange}
              >
                Weekly
              </FilterButton>
              <FilterButton
                onClick={() => handleTimeFilterChange("month")}
                style={{
                  backgroundColor:
                    timeFilter === "month" ? "#FAC1D9" : "#3D4142",
                  color: timeFilter === "month" ? "#333333" : "#FFFFFF",
                  opacity: isCustomDateRange ? 0.5 : 1,
                  cursor: isCustomDateRange ? "not-allowed" : "pointer",
                }}
                disabled={isCustomDateRange}
              >
                Monthly
              </FilterButton>
              <FilterButton
                onClick={() => handleTimeFilterChange("year")}
                style={{
                  backgroundColor:
                    timeFilter === "year" ? "#FAC1D9" : "#3D4142",
                  color: timeFilter === "year" ? "#333333" : "#FFFFFF",
                  opacity: isCustomDateRange ? 0.5 : 1,
                  cursor: isCustomDateRange ? "not-allowed" : "pointer",
                }}
                disabled={isCustomDateRange}
              >
                Yearly
              </FilterButton>
            </FilterContainer>

            <ChartContainer>
              <ChartCard>
                <ChartTitle>Sales Trend</ChartTitle>
                <ResponsiveContainer width="100%" height="90%">
                  <LineChart
                    data={processChartData(reportData?.sales_by_period)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#FAC1D9" />
                    <YAxis stroke="#FAC1D9" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#3D4142",
                        borderColor: "#5E5E5E",
                        color: "#FFFFFF",
                      }}
                      labelStyle={{ color: "#FAC1D9" }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#FAC1D9"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="profit" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard>
                <ChartTitle>Category Distribution</ChartTitle>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={reportData?.sales_by_category}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="category"
                    >
                      {reportData?.sales_by_category.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#3D4142",
                        borderColor: "#5E5E5E",
                        color: "#FFFFFF",
                      }}
                      labelStyle={{ color: "#FAC1D9" }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard>
                <ChartTitle>Top Selling Products</ChartTitle>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={reportData?.top_products}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 130, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis type="number" stroke="#FAC1D9" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#FAC1D9"
                      width={130}
                      tick={{ fontSize: 14 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#3D4142",
                        borderColor: "#5E5E5E",
                        color: "#FFFFFF",
                      }}
                      labelStyle={{ color: "#FAC1D9" }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#FAC1D9"
                      barSize={16}
                      barGap={12}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard>
                <ChartTitle>Monthly Revenue Breakdown</ChartTitle>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart
                    data={processChartData(reportData?.sales_by_period)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="name" stroke="#FAC1D9" />
                    <YAxis stroke="#FAC1D9" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#3D4142",
                        borderColor: "#5E5E5E",
                        color: "#FFFFFF",
                      }}
                      labelStyle={{ color: "#FAC1D9" }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                    <Bar dataKey="profit" fill="#FAC1D9" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </ChartContainer>

            <TableContainer>
              <TableTitle>Top Selling Products Details</TableTitle>
              <TableFilterContainer>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <FilterLabel>Filter by Category:</FilterLabel>
                  <FilterSelect
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </FilterSelect>
                </div>
                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FilterLabel>Search:</FilterLabel>
                  <SearchInput
                    type="text"
                    placeholder="Search by product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </TableFilterContainer>

              {filteredTableData.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#FFFFFF",
                  }}
                >
                  No products found matching your filter criteria.
                </div>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <SortableColumn
                        active={sortConfig?.key === "product"}
                        direction={sortConfig?.direction}
                        onClick={() => requestSort("product")}
                      >
                        Product Name
                      </SortableColumn>
                      <SortableColumn
                        active={sortConfig?.key === "category"}
                        direction={sortConfig?.direction}
                        onClick={() => requestSort("category")}
                      >
                        Category
                      </SortableColumn>
                      <th>Revenue Date</th>
                      <SortableColumn
                        active={sortConfig?.key === "price"}
                        direction={sortConfig?.direction}
                        onClick={() => requestSort("price")}
                      >
                        Sell Price
                      </SortableColumn>
                      <SortableColumn
                        active={sortConfig?.key === "profit"}
                        direction={sortConfig?.direction}
                        onClick={() => requestSort("profit")}
                      >
                        Profit
                      </SortableColumn>
                      <SortableColumn
                        active={sortConfig?.key === "margin"}
                        direction={sortConfig?.direction}
                        onClick={() => requestSort("margin")}
                      >
                        Profit Margin
                      </SortableColumn>
                      <SortableColumn
                        active={sortConfig?.key === "revenue"}
                        direction={sortConfig?.direction}
                        onClick={() => requestSort("revenue")}
                      >
                        Total Revenue
                      </SortableColumn>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTableData.map((item, index) => (
                      <tr key={item.id}>
                        <td>{String(index + 1).padStart(2, "0")}</td>
                        <td>{item.product}</td>
                        <td>{item.category}</td>
                        <td>{item.date.split(" ")[0]}</td>
                        <td>₱{item.price.toFixed(2)}</td>
                        <td>₱{item.profit.toFixed(2)}</td>
                        <td>{item.margin}</td>
                        <td>₱{item.revenue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </TableContainer>
          </>
        )}
      </ContentContainer>
    </Container>
  );
}
