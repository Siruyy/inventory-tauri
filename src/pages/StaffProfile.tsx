// src/pages/StaffProfile.tsx
import React, { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";

//
// Instead of hard-coding the staff data, we'll get it from localStorage
// where it's being stored by the Staff.tsx component
//

export default function StaffProfile(): JSX.Element {
  // State to hold staff data
  const [staffData, setStaffData] = useState<any[]>([]);

  // Load staff data from localStorage on component mount
  useEffect(() => {
    const savedStaff = localStorage.getItem("staffList");
    if (savedStaff) {
      try {
        const parsedData = JSON.parse(savedStaff);
        setStaffData(parsedData);
      } catch (error) {
        console.error("Failed to parse staff data from localStorage:", error);
      }
    }
  }, []);

  // Grab the ":id" param from the URL (we expect something like "/staff/101")
  const params = useParams<{ id: string }>();
  const rawId = params.id; // e.g. "101"

  // We stored staff.id as "#101", so re‐prepend the "#"
  const lookupId = rawId ? `#${rawId}` : "";

  // Find the matching staff object (or undefined if not found)
  const staff = staffData.find((s) => s.id === lookupId);

  // If no such staff, render a simple "Not Found" message
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

              {/* Department */}
              <div style={styles.detailLabel}>Department</div>
              <div style={styles.detailValue}>{staff.department}</div>

              {/* Phone number */}
              <div style={styles.detailLabel}>Phone number</div>
              <div style={styles.detailValue}>{staff.phone}</div>

              {/* Date of birth */}
              <div style={styles.detailLabel}>Date of birth</div>
              <div style={styles.detailValue}>{staff.dob}</div>

              {/* Address */}
              <div style={styles.detailLabel}>Address</div>
              <div style={styles.detailValue}>{staff.address}</div>

              {/* Username */}
              <div style={styles.detailLabel}>Username</div>
              <div style={styles.detailValue}>{staff.username}</div>

              {/* Password */}
              <div style={styles.detailLabel}>Password</div>
              <div style={styles.detailValue}>{staff.password}</div>
            </div>
          </div>

          {/* Employee Job Details */}
          <div style={styles.box}>
            <h2 style={styles.boxTitle}>Employee Job Details</h2>
            <div style={styles.detailsGrid}>
              {/* Role */}
              <div style={styles.detailLabel}>Role</div>
              <div style={styles.detailValue}>{staff.role}</div>

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

              {/* Additional information */}
              {staff.additional && (
                <>
                  <div style={{ ...styles.detailLabel, gridColumn: "span 2" }}>
                    Additional Information
                  </div>
                  <div style={{ ...styles.detailValue, gridColumn: "span 2" }}>
                    {staff.additional}
                  </div>
                </>
              )}
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

  /* Each "box" has a subtle background, rounded corners */
  box: {
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
  },
  boxTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginTop: 0,
    marginBottom: 16,
    color: "#FFFFFF",
  },

  /* Grid for details (label/value pairs) */
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: "8px",
    alignItems: "center",
  },
  detailLabel: {
    color: "#AAAAAA",
    fontSize: "0.875rem",
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: "0.875rem",
    fontWeight: 500,
  },
};
