import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { styled } from "@mui/material/styles";
import Header from "../components/Header";

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
  gap: "30px",
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
  "& .react-datepicker__input-container input": {
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "10px",
    color: "#FFFFFF",
    width: "200px",
    height: "52px",
    padding: "0 10px 0 40px",
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

export default function Reports() {
  const [reportType, setReportType] = useState<"sales" | "inventory">("sales");
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    new Date(),
    new Date(),
  ]);
  const [startDate, endDate] = dateRange;
  const navigate = useNavigate();

  const handleReportTypeChange = (type: "sales" | "inventory") => {
    setReportType(type);
    if (type === "inventory") {
      navigate("/reports/inventory");
    }
  };

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
                onChange={(update: [Date | null, Date | null]) => {
                  setDateRange(update);
                }}
                placeholderText="Select date range"
                dateFormat="dd/MM/yyyy"
                showYearDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={10}
                showMonthDropdown
              />
            </DatePickerContainer>

            <ExportButton>Export Data</ExportButton>
          </RightSection>
        </FilterSection>

        <StatsContainer>
          <StatsCard>
            <StatsTitle>Total Sales: ₱ 12,493.00</StatsTitle>
            <StatItem>Total Transactions: 50</StatItem>
            <StatItem>Total Items Sold: 50</StatItem>
            <StatItem>Average Items Per Transaction: 50</StatItem>
          </StatsCard>

          <StatsCard>
            <StatsTitle>Total Revenue: ₱ 10,493.00</StatsTitle>
            <StatItem>Gross Revenue: ₱ 1,230</StatItem>
            <StatItem>Net Revenue: ₱ 1,230</StatItem>
            <StatItem>Total Profit: ₱ 1,230</StatItem>
          </StatsCard>
        </StatsContainer>

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Top Selling Food</th>
                <th>Revenue By Date</th>
                <th>Sell Price</th>
                <th>Profit</th>
                <th>Profit Margin</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                <tr key={item}>
                  <td>0{item}</td>
                  <td>Chicken Permeson</td>
                  <td>28. 03. 2024</td>
                  <td>$55.00</td>
                  <td>$7,985.00</td>
                  <td>15.00%</td>
                  <td>$8000.00</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </ContentContainer>
    </Container>
  );
}
