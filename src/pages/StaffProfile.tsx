// src/pages/StaffProfile.tsx
import React from "react";
import { useParams, NavLink } from "react-router-dom";

//
// Re‐import the very same initialStaffData that you used in Staff.tsx
// so that we can look up a staff member by ID. In a real‐world scenario,
// you'd probably fetch this from your backend or share via context/Redux.
// But for now, we just copy‐paste the same array here.
//
const initialStaffData = [
  {
    id: "#101",
    name: "Watson Joyce",
    role: "Manager",
    email: "watsonjoyce11@gmail.com",
    phone: "+1 (123) 123 4654",
    age: 45,
    salary: "$2200.00",
    timings: "9am to 6pm",
    avatar: "https://i.pravatar.cc/300?img=47",
    dob: "1983-01-01",
    address: "House #114 Street 123 USA, Chicago",
    additional: "",
  },
  {
    id: "#102",
    name: "Arielle Santos",
    role: "Cashier",
    email: "arielle.santos@example.com",
    phone: "+1 (123) 987 6543",
    age: 28,
    salary: "$1200.00",
    timings: "10am to 7pm",
    avatar: "https://i.pravatar.cc/300?img=5",
    dob: "1996-05-15",
    address: "123 Baker Street, New York",
    additional: "",
  },
  {
    id: "#103",
    name: "Miguel Reyes",
    role: "Cook",
    email: "miguel.reyes@example.com",
    phone: "+1 (123) 555 3322",
    age: 32,
    salary: "$1500.00",
    timings: "8am to 5pm",
    avatar: "https://i.pravatar.cc/300?img=12",
    dob: "1991-11-20",
    address: "456 Elm Street, Los Angeles",
    additional: "",
  },
  {
    id: "#104",
    name: "Lea Bautista",
    role: "Barista",
    email: "lea.bautista@example.com",
    phone: "+1 (123) 444 7788",
    age: 25,
    salary: "$1100.00",
    timings: "11am to 8pm",
    avatar: "https://i.pravatar.cc/300?img=20",
    dob: "1998-08-30",
    address: "789 Pine Street, Seattle",
    additional: "",
  },
];

export default function StaffProfile(): JSX.Element {
  // Grab the ":id" param from the URL (we expect something like "/staff/101")
  const params = useParams<{ id: string }>();
  const rawId = params.id; // e.g. "101"

  // We stored staff.id as "#101", so re‐prepend the "#"
  const lookupId = rawId ? `#${rawId}` : "";

  // Find the matching staff object (or undefined if not found)
  const staff = initialStaffData.find((s) => s.id === lookupId);

  // If no such staff, render a simple “Not Found” message
  if (!staff) {
    return (
      <div style={styles.pageContainer}>
        <NavLink to="/staff" style={styles.backLink}>
          ← Back to Staff Management
        </NavLink>
        <div style={styles.notFoundText}>Staff not found.</div>
      </div>
    );
  }

  // Otherwise, render the profile layout
  return (
    <div style={styles.pageContainer}>
      {/* Header with Back Arrow */}
      <div style={styles.header}>
        <NavLink to="/staff" style={styles.backLink}>
          ←
        </NavLink>
        <h1 style={styles.title}>{staff.name}</h1>
      </div>

      <div style={styles.content}>
        {/* Left Column: Profile Image */}
        <div style={styles.leftColumn}>
          <div style={styles.profileImageWrapper}>
            <img
              src={staff.avatar}
              alt={staff.name}
              style={styles.profileImage}
            />
          </div>
        </div>

        {/* Right Column: Two Boxes (Personal & Job Details) */}
        <div style={styles.rightColumn}>
          {/* Employee Personal Details */}
          <div style={styles.box}>
            <h2 style={styles.boxTitle}>Employee Personal Details</h2>
            <div style={styles.detailsGrid}>
              {/* Full Name */}
              <div style={styles.detailLabel}>Full Name</div>
              <div style={styles.detailValue}>{staff.name}</div>

              {/* Email */}
              <div style={styles.detailLabel}>Email</div>
              <div style={styles.detailValue}>{staff.email}</div>

              {/* Phone number */}
              <div style={styles.detailLabel}>Phone number</div>
              <div style={styles.detailValue}>{staff.phone}</div>

              {/* Date of birth */}
              <div style={styles.detailLabel}>Date of birth</div>
              <div style={styles.detailValue}>{staff.dob}</div>

              {/* Address (spans two columns) */}
              <div style={{ ...styles.detailLabel, gridColumn: "span 2" }}>
                Address
              </div>
              <div style={{ ...styles.detailValue, gridColumn: "span 2" }}>
                {staff.address}
              </div>
            </div>
          </div>

          {/* Employee Job Details */}
          <div style={styles.box}>
            <h2 style={styles.boxTitle}>Employee Job Details</h2>
            <div style={styles.detailsGrid}>
              {/* Role */}
              <div style={styles.detailLabel}>Role</div>
              <div style={styles.detailValue}>{staff.role}</div>

              {/* Salary */}
              <div style={styles.detailLabel}>Salary</div>
              <div style={styles.detailValue}>{staff.salary}</div>

              {/* Shift start timing */}
              <div style={styles.detailLabel}>Shift start timing</div>
              <div style={styles.detailValue}>
                {staff.timings.split(" to ")[0]}
              </div>

              {/* Shift end timing */}
              <div style={styles.detailLabel}>Shift end timing</div>
              <div style={styles.detailValue}>
                {staff.timings.split(" to ")[1]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    flexGrow: 1,
    backgroundColor: "#1F1F1F",
    padding: "16px 24px",
    boxSizing: "border-box",
    fontFamily: "Poppins, Helvetica, sans-serif",
    color: "#FFFFFF",
  },

  /* Header with back arrow + staff name */
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: 24,
  },
  backLink: {
    color: "#CCCCCC",
    fontSize: "1.25rem",
    textDecoration: "none",
    marginRight: 12,
    cursor: "pointer",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    margin: 0,
  },

  /* If staff not found */
  notFoundText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: "1rem",
    color: "#DD4444",
  },

  /* Main content area: two‐column flex */
  content: {
    display: "flex",
    gap: 24,
  },

  /* Left column: profile image */
  leftColumn: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
  },
  profileImageWrapper: {
    width: 300,
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#2A2A2A",
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  /* Right column: two stacked boxes */
  rightColumn: {
    flex: 2,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  /* Each “box” has a subtle background, rounded corners */
  box: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: "16px",
  },
  boxTitle: {
    fontSize: "1.125rem",
    fontWeight: 500,
    marginBottom: 12,
    color: "#FFFFFF",
  },

  /* Grid for the detail rows (two columns) */
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    rowGap: 12,
    columnGap: 16,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#CCCCCC",
  },
  detailValue: {
    fontSize: "0.875rem",
    fontWeight: 300,
    color: "#FFFFFF",
  },
};
