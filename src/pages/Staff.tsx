// src/pages/Staff.tsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Header from "../components/Header";

// SVG imports
import EyeIcon from "/icons/eye.svg";
import PenIcon from "/icons/pen.svg";

//
// Re‐use the same initialStaffData array that StaffProfile also needs.
// In a real app you'd fetch this from your backend or share via context.
// For now, we hard‐code it here so that both Staff.tsx and StaffProfile.tsx
// refer to the exact same data.
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
    avatar: "https://i.pravatar.cc/60?img=47",
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
    avatar: "https://i.pravatar.cc/60?img=5",
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
    avatar: "https://i.pravatar.cc/60?img=12",
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
    avatar: "https://i.pravatar.cc/60?img=20",
    dob: "1998-08-30",
    address: "789 Pine Street, Seattle",
    additional: "",
  },
];

const attendanceData = [
  {
    id: "#101",
    name: "Watson Joyce",
    role: "Manager",
    date: "16-Apr-2024",
    timings: "9am to 6pm",
    status: "Present",
    avatar: "https://i.pravatar.cc/60?img=47",
  },
  {
    id: "#102",
    name: "Arielle Santos",
    role: "Cashier",
    date: "16-Apr-2024",
    timings: "10am to 7pm",
    status: "Absent",
    avatar: "https://i.pravatar.cc/60?img=5",
  },
  {
    id: "#103",
    name: "Miguel Reyes",
    role: "Cook",
    date: "16-Apr-2024",
    timings: "8am to 5pm",
    status: "Half Shift",
    avatar: "https://i.pravatar.cc/60?img=12",
  },
  {
    id: "#104",
    name: "Lea Bautista",
    role: "Barista",
    date: "16-Apr-2024",
    timings: "11am to 8pm",
    status: "Leave",
    avatar: "https://i.pravatar.cc/60?img=20",
  },
];

const roleOptions = ["Manager", "Cashier", "Cook", "Barista", "Driver"];

export default function Staff(): JSX.Element {
  // Which tab is active: "manage" or "attendance"
  const [activeTab, setActiveTab] = useState<"manage" | "attendance">("manage");

  // Build staffList with an additional isAvailable boolean
  const [staffList, setStaffList] = useState(
    initialStaffData.map((staff) => ({ ...staff, isAvailable: true }))
  );

  // Sorting field
  const [sortField, setSortField] = useState<"name" | "role" | "age">("name");

  // Show/hide the sliding drawer
  const [showDrawer, setShowDrawer] = useState(false);

  // If editIndex === null => adding new staff; otherwise editing staffList[editIndex]
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    avatar: "",
    fullName: "",
    role: "",
    email: "",
    phone: "",
    salary: "",
    dob: "",
    shiftStart: "",
    shiftEnd: "",
    address: "",
    additional: "",
  });

  // Whenever sortField changes, re-sort staffList in place
  useEffect(() => {
    setStaffList((prev) =>
      [...prev].sort((a, b) => {
        if (sortField === "age") {
          return a.age - b.age;
        }
        return a[sortField].toLowerCase() < b[sortField].toLowerCase() ? -1 : 1;
      })
    );
  }, [sortField]);

  // Toggle availability (greys out row)
  const toggleAvailability = (index: number) => {
    setStaffList((prev) =>
      prev.map((s, i) => (i === index ? { ...s, isAvailable: !s.isAvailable } : s))
    );
  };

  // Clicking the pen (edit) icon
  const handleEditClick = (index: number) => {
    const staffToEdit = staffList[index];
    setFormData({
      avatar: staffToEdit.avatar,
      fullName: staffToEdit.name,
      role: staffToEdit.role,
      email: staffToEdit.email,
      phone: staffToEdit.phone,
      salary: staffToEdit.salary,
      dob: staffToEdit.dob || "",
      shiftStart: staffToEdit.timings.split(" to ")[0] || "",
      shiftEnd: staffToEdit.timings.split(" to ")[1] || "",
      address: staffToEdit.address || "",
      additional: staffToEdit.additional || "",
    });
    setEditIndex(index);
    setShowDrawer(true);
  };

  // Clicking "Add Staff"
  const handleAddClick = () => {
    setFormData({
      avatar: "",
      fullName: "",
      role: "",
      email: "",
      phone: "",
      salary: "",
      dob: "",
      shiftStart: "",
      shiftEnd: "",
      address: "",
      additional: "",
    });
    setEditIndex(null);
    setShowDrawer(true);
  };

  // Form field change
  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Confirm (either add or edit)
  const handleConfirm = () => {
    if (editIndex === null) {
      // Add new staff
      const newIdNumber = staffList.length + 101; // Example logic
      const newStaffObj = {
        id: "#" + newIdNumber,
        name: formData.fullName,
        role: formData.role,
        email: formData.email,
        phone: formData.phone,
        age: formData.dob
          ? Math.floor(
              new Date().getFullYear() - new Date(formData.dob).getFullYear()
            )
          : 0,
        salary: formData.salary,
        timings: `${formData.shiftStart} to ${formData.shiftEnd}`,
        avatar: formData.avatar || "https://i.pravatar.cc/60?img=1",
        dob: formData.dob,
        address: formData.address,
        additional: formData.additional,
        isAvailable: true,
      };
      setStaffList((prev) => [...prev, newStaffObj]);
    } else {
      // Update existing
      setStaffList((prev) =>
        prev.map((s, i) => {
          if (i === editIndex) {
            return {
              ...s,
              name: formData.fullName,
              role: formData.role,
              email: formData.email,
              phone: formData.phone,
              age: formData.dob
                ? Math.floor(
                    new Date().getFullYear() - new Date(formData.dob).getFullYear()
                  )
                : s.age,
              salary: formData.salary,
              timings: `${formData.shiftStart} to ${formData.shiftEnd}`,
              avatar: formData.avatar || s.avatar,
              dob: formData.dob,
              address: formData.address,
              additional: formData.additional,
            };
          }
          return s;
        })
      );
    }

    // Close drawer
    setShowDrawer(false);
    setEditIndex(null);

    // Clear form
    setFormData({
      avatar: "",
      fullName: "",
      role: "",
      email: "",
      phone: "",
      salary: "",
      dob: "",
      shiftStart: "",
      shiftEnd: "",
      address: "",
      additional: "",
    });
  };

  // Cancel: close drawer
  const handleCancel = () => {
    setShowDrawer(false);
    setEditIndex(null);
  };

  return (
    <div style={styles.pageContainer}>
      <Header title="Staff Management" />

      <div style={styles.contentWrapper}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div style={styles.topLeft}>
            <h2 style={styles.staffCount}>Staff ({staffList.length})</h2>
          </div>
          <div style={styles.topRight}>
            <button style={styles.addStaffButton} onClick={handleAddClick}>
              Add Staff
            </button>
            <div style={styles.sortByWrapper}>
              <span style={styles.sortByLabel}>Sort by</span>
              <select
                style={styles.sortBySelect}
                value={sortField}
                onChange={(e) =>
                  setSortField(e.target.value as "name" | "role" | "age")
                }
              >
                <option value="name">Name</option>
                <option value="role">Role</option>
                <option value="age">Age</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabsContainer}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "manage" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("manage")}
          >
            Staff Management
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === "attendance" ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>
        </div>
        <div style={styles.tabDivider} />

        {/* Staff Management Table */}
        {activeTab === "manage" && (
          <div style={styles.tableContainer}>
            {/* Header Row */}
            <div style={styles.tableHeader}>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 0.5,
                  justifyContent: "center",
                }}
              >
                <input type="checkbox" />
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 1,
                  justifyContent: "flex-start",
                }}
              >
                ID
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 2,
                  justifyContent: "flex-start",
                }}
              >
                Name
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 2,
                  justifyContent: "flex-start",
                }}
              >
                Email
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 1.5,
                  justifyContent: "flex-start",
                }}
              >
                Phone
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                Age
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 1.5,
                  justifyContent: "flex-start",
                }}
              >
                Salary
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 2,
                  justifyContent: "flex-start",
                }}
              >
                Timings
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 2,
                  justifyContent: "center",
                }}
              >
                Available / Edit
              </div>
            </div>

            {/* Rows */}
            {staffList.map((staff, idx) => (
              <div
                key={staff.id + idx}
                style={{
                  ...styles.tableRow,
                  backgroundColor: idx % 2 === 0 ? "#2A2A2A" : "#343434",
                  opacity: staff.isAvailable ? 1 : 0.5,
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 0.5,
                    justifyContent: "center",
                  }}
                >
                  <input type="checkbox" />
                </div>

                {/* ID */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 1,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffId}>{staff.id}</span>
                </div>

                {/* Name + Avatar (wrapped in NavLink) */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 2,
                    justifyContent: "flex-start",
                    gap: 12,
                  }}
                >
                  <NavLink
                    to={`/staff/${staff.id.replace("#", "")}`}
                    style={{ textDecoration: "none" }}
                  >
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      style={styles.avatarImage}
                    />
                  </NavLink>

                  <NavLink
                    to={`/staff/${staff.id.replace("#", "")}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div>
                      <div style={styles.staffName}>{staff.name}</div>
                      <div style={styles.staffRole}>{staff.role}</div>
                    </div>
                  </NavLink>
                </div>

                {/* Email */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 2,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffText}>{staff.email}</span>
                </div>

                {/* Phone */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 1.5,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffText}>{staff.phone}</span>
                </div>

                {/* Age */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <span style={styles.staffText}>{staff.age} yr</span>
                </div>

                {/* Salary */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 1.5,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffText}>{staff.salary}</span>
                </div>

                {/* Timings */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 2,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffText}>{staff.timings}</span>
                </div>

                {/* Available / Edit Icons */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 2,
                    justifyContent: "center",
                    gap: 12,
                  }}
                >
                  {/* Eye icon toggles availability */}
                  <button
                    style={styles.iconButton}
                    onClick={() => toggleAvailability(idx)}
                    title={
                      staff.isAvailable
                        ? "Set as unavailable"
                        : "Set as available"
                    }
                  >
                    <img
                      src={EyeIcon}
                      alt="Toggle Availability"
                      style={styles.eyeIcon}
                    />
                  </button>

                  {/* Pen icon to edit */}
                  <button
                    style={styles.iconButton}
                    onClick={() => handleEditClick(idx)}
                    title="Edit Staff"
                  >
                    <img
                      src={PenIcon}
                      alt="Edit Staff"
                      style={styles.penIcon}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Attendance Table */}
        {activeTab === "attendance" && (
          <div style={styles.tableContainer}>
            {/* Header Row */}
            <div style={styles.tableHeader}>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 0.5,
                  justifyContent: "center",
                }}
              >
                <input type="checkbox" />
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 1,
                  justifyContent: "flex-start",
                }}
              >
                ID
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 2,
                  justifyContent: "flex-start",
                }}
              >
                Name
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 1.5,
                  justifyContent: "flex-start",
                }}
              >
                Date
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 1.5,
                  justifyContent: "flex-start",
                }}
              >
                Timings
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 3,
                  justifyContent: "flex-start",
                }}
              >
                Status
              </div>
              <div
                style={{
                  ...styles.headerCell,
                  flex: 1,
                  justifyContent: "center",
                }}
              >
                Action
              </div>
            </div>

            {/* Rows */}
            {attendanceData.map((att, idx) => (
              <div
                key={att.id + idx}
                style={{
                  ...styles.tableRow,
                  backgroundColor: idx % 2 === 0 ? "#2A2A2A" : "#343434",
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 0.5,
                    justifyContent: "center",
                  }}
                >
                  <input type="checkbox" />
                </div>

                {/* ID */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 1,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffId}>{att.id}</span>
                </div>

                {/* Name + Avatar */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 2,
                    justifyContent: "flex-start",
                    gap: 12,
                  }}
                >
                  <img
                    src={att.avatar}
                    alt={att.name}
                    style={styles.avatarImage}
                  />
                  <div>
                    <div style={styles.staffName}>{att.name}</div>
                    <div style={styles.staffRole}>{att.role}</div>
                  </div>
                </div>

                {/* Date */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 1.5,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffText}>{att.date}</span>
                </div>

                {/* Timings */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 1.5,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffText}>{att.timings}</span>
                </div>

                {/* Status Buttons */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 3,
                    justifyContent: "flex-start",
                    gap: 8,
                  }}
                >
                  <button
                    style={{ ...styles.statusButton, ...styles.statusPresent }}
                  >
                    Present
                  </button>
                  <button
                    style={{ ...styles.statusButton, ...styles.statusAbsent }}
                  >
                    Absent
                  </button>
                  <button
                    style={{ ...styles.statusButton, ...styles.statusHalf }}
                  >
                    Half Shift
                  </button>
                  <button
                    style={{ ...styles.statusButton, ...styles.statusLeave }}
                  >
                    Leave
                  </button>
                </div>

                {/* Action: current status text */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <span style={styles.editStatusText}>{att.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================== OVERLAY & SLIDING DRAWER ==================== */}

      {showDrawer && (
        <div
          style={styles.overlay}
          onClick={handleCancel}
          aria-hidden="true"
        />
      )}

      <div
        style={{
          ...styles.drawerContainer,
          transform: showDrawer ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Drawer Header */}
        <div style={styles.drawerHeader}>
          <h3 style={styles.drawerTitle}>
            {editIndex === null ? "Add Staff" : "Edit Staff"}
          </h3>
          <button
            onClick={handleCancel}
            style={styles.drawerCloseButton}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Drawer Body */}
        <div style={styles.drawerBody}>
          <div style={styles.profilePicWrapper}>
            <div style={styles.profilePicPlaceholder}>
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <span style={styles.profilePicIcon}>🖼️</span>
              )}
            </div>
            <button style={styles.changePicButton}>
              Change Profile Picture
            </button>
          </div>

          <div style={styles.formGrid}>
            {/* Full Name */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) =>
                  handleFieldChange("fullName", e.target.value)
                }
                style={styles.formInput}
              />
            </div>

            {/* Email */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email</label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) =>
                  handleFieldChange("email", e.target.value)
                }
                style={styles.formInput}
              />
            </div>

            {/* Role */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
                style={styles.formSelect}
              >
                <option value="">Select role</option>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone number */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  handleFieldChange("phone", e.target.value)
                }
                style={styles.formInput}
              />
            </div>

            {/* Salary */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Salary</label>
              <input
                type="text"
                placeholder="Enter salary"
                value={formData.salary}
                onChange={(e) =>
                  handleFieldChange("salary", e.target.value)
                }
                style={styles.formInput}
              />
            </div>

            {/* Date of birth */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Date of birth</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => handleFieldChange("dob", e.target.value)}
                style={styles.formInput}
              />
            </div>

            {/* Shift start timing */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Shift start timing</label>
              <input
                type="time"
                value={formData.shiftStart}
                onChange={(e) =>
                  handleFieldChange("shiftStart", e.target.value)
                }
                style={styles.formInput}
              />
            </div>

            {/* Shift end timing */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Shift end timing</label>
              <input
                type="time"
                value={formData.shiftEnd}
                onChange={(e) =>
                  handleFieldChange("shiftEnd", e.target.value)
                }
                style={styles.formInput}
              />
            </div>

            {/* Address (full width) */}
            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.formLabel}>Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) =>
                  handleFieldChange("address", e.target.value)
                }
                style={styles.formInput}
              />
            </div>

            {/* Additional details (full width) */}
            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.formLabel}>Additional details</label>
              <textarea
                placeholder="Enter additional details"
                value={formData.additional}
                onChange={(e) =>
                  handleFieldChange("additional", e.target.value)
                }
                style={styles.formTextarea}
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={styles.drawerFooter}>
          <button style={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
          <button style={styles.confirmButton} onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    flexGrow: 1,
    backgroundColor: "#1F1F1F",
    boxSizing: "border-box",
    overflowY: "auto",
    fontFamily: "Poppins, Helvetica, sans-serif",
  },
  contentWrapper: {
    padding: "16px 24px",
  },

  /* Top Bar */
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  topLeft: {},
  staffCount: {
    fontWeight: 600,
    fontSize: "1.25rem",
    color: "#FFFFFF",
    margin: 0,
  },
  topRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  addStaffButton: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#292c2d",
    backgroundColor: "#fac1d9",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  sortByWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sortByLabel: {
    fontWeight: 400,
    fontSize: "0.875rem",
    color: "#DDDDDD",
  },
  sortBySelect: {
    fontSize: "0.875rem",
    color: "#FFFFFF",
    backgroundColor: "#2A2A2A",
    border: "1px solid #444444",
    borderRadius: 4,
    padding: "4px 8px",
    cursor: "pointer",
    appearance: "none",
  },

  /* Tabs */
  tabsContainer: {
    display: "flex",
    gap: 16,
    marginBottom: 8,
  },
  tabButton: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#FFFFFF",
    backgroundColor: "#2A2A2A",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  tabActive: {
    backgroundColor: "#fac1d9",
    color: "#292c2d",
  },
  tabDivider: {
    height: 1,
    backgroundColor: "#444444",
    marginBottom: 16,
  },

  /* Table Container */
  tableContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  /* Table Header */
  tableHeader: {
    display: "flex",
    backgroundColor: "#2A2A2A",
    padding: "12px 16px",
    borderRadius: 6,
  },
  headerCell: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#CCCCCC",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },

  /* Table Row */
  tableRow: {
    display: "flex",
    padding: "12px 16px",
    alignItems: "center",
    borderRadius: 6,
  },
  rowCell: {
    display: "flex",
    alignItems: "center",
    color: "#FFFFFF",
    fontSize: "0.875rem",
  },
  staffId: {
    fontWeight: 500,
    color: "#EEEEEE",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
  },
  staffName: {
    fontWeight: 500,
    fontSize: "1rem",
    color: "#FFFFFF",
    lineHeight: 1,
  },
  staffRole: {
    fontWeight: 300,
    fontSize: "0.75rem",
    color: "#CCCCCC",
    lineHeight: 1,
  },
  staffText: {
    fontWeight: 300,
    fontSize: "0.875rem",
    color: "#DDDDDD",
  },

  /* Eye & Pen Icon Button */
  iconButton: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  eyeIcon: {
    width: 20,
    height: 20,
    objectFit: "contain",
    opacity: 0.85,
    transition: "opacity 0.2s",
  },
  penIcon: {
    width: 18,
    height: 18,
    objectFit: "contain",
    opacity: 0.85,
    transition: "opacity 0.2s",
  },

  /* Attendance Status Buttons */
  statusButton: {
    fontWeight: 500,
    fontSize: "0.75rem",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 4,
    padding: "4px 8px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  statusPresent: {
    backgroundColor: "#fac1d9",
  },
  statusAbsent: {
    backgroundColor: "#F0C419",
  },
  statusHalf: {
    backgroundColor: "#19C4F0",
  },
  statusLeave: {
    backgroundColor: "#F44336",
  },
  editStatusText: {
    fontWeight: 300,
    fontSize: "0.875rem",
    color: "#DDDDDD",
  },

  /* ==================== OVERLAY & DRAWER ==================== */
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
  },
  drawerContainer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "450px",
    maxWidth: "100vw",
    height: "100vh",
    backgroundColor: "#2A2A2A",
    boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s ease-out",
    transform: "translateX(100%)",
    zIndex: 1001,
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: "1px solid #444444",
  },
  drawerTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#FFFFFF",
  },
  drawerCloseButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#DDDDDD",
    fontSize: "1.25rem",
    cursor: "pointer",
  },
  drawerBody: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "16px",
  },
  profilePicWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 24,
  },
  profilePicPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  profilePicIcon: {
    fontSize: "2rem",
    color: "#888888",
  },
  changePicButton: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#FFFFFF",
    backgroundColor: "transparent",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  formLabel: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#FFFFFF",
  },
  formInput: {
    padding: "8px",
    backgroundColor: "#3A3A3A",
    border: "1px solid #444444",
    borderRadius: 4,
    color: "#FFFFFF",
    fontSize: "0.875rem",
    outline: "none",
  },
  formSelect: {
    padding: "8px",
    backgroundColor: "#3A3A3A",
    border: "1px solid #444444",
    borderRadius: 4,
    color: "#FFFFFF",
    fontSize: "0.875rem",
    outline: "none",
    appearance: "none",
    cursor: "pointer",
  },
  formTextarea: {
    padding: "8px",
    backgroundColor: "#3A3A3A",
    border: "1px solid #444444",
    borderRadius: 4,
    color: "#FFFFFF",
    fontSize: "0.875rem",
    outline: "none",
    resize: "vertical",
    minHeight: 80,
  },
  drawerFooter: {
    padding: "16px",
    borderTop: "1px solid #444444",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#FFFFFF",
    backgroundColor: "transparent",
    border: "1px solid #CCCCCC",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  confirmButton: {
    fontWeight: 500,
    fontSize: "0.875rem",
    color: "#292c2d",
    backgroundColor: "#fac1d9",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
