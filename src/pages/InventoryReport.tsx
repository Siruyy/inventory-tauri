import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { styled } from '@mui/material/styles';
import Header from '../components/Header';

const Container = styled('div')({
  minHeight: '100vh'
});

const ContentContainer = styled('div')({
  padding: '20px'
});

const FilterSection = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '30px',
  marginBottom: '40px',
  justifyContent: 'space-between'
});

const FilterButtons = styled('div')({
  display: 'flex',
  gap: '30px'
});

const RightSection = styled('div')({
  display: 'flex',
  gap: '30px',
  marginLeft: 'auto'
});

interface ReportTypeButtonProps {
  active?: boolean;
  onClick?: () => void;
}

const ReportTypeButton = styled('button')<ReportTypeButtonProps>(({ active = false, onClick }) => ({
  padding: '14px 22px',
  borderRadius: '7.5px',
  border: 'none',
  backgroundColor: active ? '#FAC1D9' : 'transparent',
  color: active ? '#000000' : '#FFFFFF',
  fontFamily: 'Poppins',
  fontSize: '16px',
  fontWeight: 400,
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: active ? '#FAC1D9' : 'rgba(250, 193, 217, 0.1)'
  }
}));

const DatePickerContainer = styled('div')({
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    backgroundImage: 'url("/icons/calendar.svg")',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    zIndex: 1
  },
  '& .react-datepicker': {
    backgroundColor: '#3D4142',
    border: 'none',
    borderRadius: '10px',
    fontFamily: 'Poppins',
    '& .react-datepicker__header': {
      backgroundColor: '#292C2D',
      borderBottom: '1px solid #5E5E5E',
      '& .react-datepicker__current-month': {
        color: '#FFFFFF'
      },
      '& .react-datepicker__day-name': {
        color: '#FAC1D9'
      }
    },
    '& .react-datepicker__day': {
      color: '#FFFFFF',
      '&:hover': {
        backgroundColor: '#FAC1D9',
        color: '#333333'
      }
    },
    '& .react-datepicker__day--selected': {
      backgroundColor: '#FAC1D9',
      color: '#333333'
    },
    '& .react-datepicker__day--keyboard-selected': {
      backgroundColor: '#FAC1D9',
      color: '#333333'
    },
    '& .react-datepicker__day--in-range': {
      backgroundColor: 'rgba(250, 193, 217, 0.2)',
      color: '#FFFFFF'
    },
    '& .react-datepicker__day--in-selecting-range': {
      backgroundColor: 'rgba(250, 193, 217, 0.2)',
      color: '#FFFFFF'
    },
    '& .react-datepicker__year-dropdown-container': {
      color: '#FFFFFF'
    },
    '& .react-datepicker__year-read-view': {
      color: '#FFFFFF',
      '&:hover': {
        cursor: 'pointer'
      }
    },
    '& .react-datepicker__year-dropdown': {
      backgroundColor: '#3D4142',
      border: '1px solid #5E5E5E',
      borderRadius: '4px',
      color: '#FFFFFF',
      '& .react-datepicker__year-option': {
        '&:hover': {
          backgroundColor: '#FAC1D9',
          color: '#333333'
        }
      }
    },
    '& .react-datepicker__month-read-view': {
      color: '#FFFFFF',
      '&:hover': {
        cursor: 'pointer'
      }
    },
    '& .react-datepicker__month-dropdown': {
      backgroundColor: '#3D4142',
      border: '1px solid #5E5E5E',
      borderRadius: '4px',
      color: '#FFFFFF',
      '& .react-datepicker__month-option': {
        '&:hover': {
          backgroundColor: '#FAC1D9',
          color: '#333333'
        }
      }
    }
  },
  '& .react-datepicker__input-container input': {
    backgroundColor: '#3D4142',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    width: '200px',
    height: '52px',
    padding: '0 10px 0 40px',
    fontFamily: 'Poppins',
    fontSize: '14px',
    '&:focus': {
      outline: 'none'
    }
  }
});

const ExportButton = styled('button')({
  padding: '14px 22px',
  borderRadius: '7.5px',
  border: 'none',
  backgroundColor: '#FAC1D9',
  color: '#333333',
  fontFamily: 'Poppins',
  fontSize: '16px',
  fontWeight: 500,
  cursor: 'pointer'
});

const TableContainer = styled('div')({
  backgroundColor: '#292C2D',
  borderRadius: '10px',
  padding: '25px 22px',
  marginBottom: '10px'
});

const Table = styled('table')({
  width: '100%',
  borderCollapse: 'collapse',
  '& th, & td': {
    padding: '12px 20px',
    textAlign: 'left',
    fontFamily: 'Poppins',
    borderBottom: '1px solid #5E5E5E'
  },
  '& th': {
    color: '#FAC1D9',
    fontWeight: 300,
    fontSize: '14px'
  },
  '& td': {
    color: '#FFFFFF',
    fontWeight: 300,
    fontSize: '16px'
  },
  '& tr:nth-of-type(even)': {
    backgroundColor: '#3D4142'
  }
});

export default function InventoryReport() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([new Date(), new Date()]);
  const [startDate, endDate] = dateRange;
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  const mockData = [
    {
      sNo: '01',
      itemName: 'Chicken Permeson',
      deliveryDate: '28. 03. 2024',
      expiry: '28. 03. 2024',
      supplier: 'ABC, Corp.',
      qoQr: '50 \\ 50',
      unitPrice: '$55.00',
      totalCost: '$8000.00'
    },
    // Add more mock data for better visualization
    {
      sNo: '02',
      itemName: 'Beef Steak',
      deliveryDate: '28. 03. 2024',
      expiry: '28. 03. 2024',
      supplier: 'ABC, Corp.',
      qoQr: '40 \\ 40',
      unitPrice: '$65.00',
      totalCost: '$7800.00'
    },
    {
      sNo: '03',
      itemName: 'Salmon Fillet',
      deliveryDate: '28. 03. 2024',
      expiry: '28. 03. 2024',
      supplier: 'ABC, Corp.',
      qoQr: '30 \\ 30',
      unitPrice: '$45.00',
      totalCost: '$4050.00'
    }
  ];

  return (
    <Container>
      <Header title="Reports" />
      <ContentContainer>
        <FilterSection>
          <FilterButtons>
            <ReportTypeButton 
              active={false}
              onClick={() => navigate('/reports')}
            >
              Sales & Revenue Report
            </ReportTypeButton>
            <ReportTypeButton active={true}>
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

        <TableContainer>
          <Table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Delivery Date</th>
                <th>Expiry</th>
                <th>Supplier</th>
                <th>QO \ QR</th>
                <th>Unit Price</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((item, index) => (
                <tr key={index}>
                  <td>{item.sNo}</td>
                  <td>{item.itemName}</td>
                  <td>{item.deliveryDate}</td>
                  <td>{item.expiry}</td>
                  <td>{item.supplier}</td>
                  <td>{item.qoQr}</td>
                  <td>{item.unitPrice}</td>
                  <td>{item.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </ContentContainer>
    </Container>
  );
} 