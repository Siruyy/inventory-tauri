// src/pages/Staff.tsx
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Header from "../components/Header";

// SVG imports
import EyeIcon from "/icons/eye.svg";
import PenIcon from "/icons/pen.svg";

// Define the staff member type
interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  age: number;
  timings: string;
  avatar: string;
  dob?: string;
  address?: string;
  additional?: string;
  isAvailable: boolean;
  username?: string;
  password?: string;
  rfid?: string;
  email?: string;
  permissions: {
    staff: boolean;
    inventory: boolean;
    reports: boolean;
    order: boolean;
    "role-access": boolean;
  };
}

// Fallback empty data if no localStorage data is found
const initialStaffData: StaffMember[] = [];

const roleOptions = ["Admin", "Sub-admin", "Inventory", "Cashier"];

export default function Staff(): JSX.Element {
  // Function to remove duplicate staff entries
  const removeDuplicateStaff = (staffArray: StaffMember[]): StaffMember[] => {
    const uniqueIds = new Set();
    const uniqueStaff: StaffMember[] = [];

    // Keep only the first occurrence of each ID
    for (const staff of staffArray) {
      if (!uniqueIds.has(staff.id)) {
        uniqueIds.add(staff.id);
        uniqueStaff.push(staff);
      } else {
        console.log(
          `Removed duplicate staff with ID: ${staff.id}, name: ${staff.name}`
        );
      }
    }

    return uniqueStaff;
  };

  // Generate a username based on staff name
  const generateUsername = (
    fullName: string,
    existingStaff: StaffMember[] = []
  ) => {
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName =
      nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

    let username = firstName[0].toLowerCase() + lastName.toLowerCase();

    // Check if username already exists in staff list
    const exists = existingStaff.some((staff) => staff.username === username);
    if (exists) {
      // If exists, append a number
      const similarUsernames = existingStaff
        .filter(
          (staff) => staff.username && staff.username.startsWith(username)
        )
        .map((staff) => staff.username as string);

      if (similarUsernames.length > 0) {
        username = username + (similarUsernames.length + 1);
      }
    }

    return username;
  };

  // Generate a random password
  const generatePassword = () => {
    // Generate a 4-digit numeric password
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  // Build staffList with data from localStorage if available
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      // Try to get staff data from localStorage
      const savedData = localStorage.getItem("staffList");
      if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Remove duplicate entries based on ID
        const uniqueStaff = removeDuplicateStaff(parsedData);

        // Ensure all staff have username and password
        const updatedData = uniqueStaff.map((staff: StaffMember) => {
          if (!staff.username || !staff.password) {
            // Generate username and password if missing
            const username =
              staff.username || generateUsername(staff.name, uniqueStaff);
            const password = staff.password || generatePassword();
            console.log(
              `Added missing credentials for ${staff.name}: username=${username}`
            );
            return { ...staff, username, password };
          }
          return staff;
        });

        // Save back to localStorage if any updates were made
        if (JSON.stringify(updatedData) !== savedData) {
          localStorage.setItem("staffList", JSON.stringify(updatedData));
          console.log("Updated staff list with missing credentials");
        }

        return Array.isArray(updatedData) ? updatedData : initialStaffData;
      }
    } catch (error) {
      console.error("Error loading staff data from localStorage:", error);
    }
    // Fall back to empty array if localStorage is empty or invalid
    return initialStaffData;
  });

  // Save to localStorage whenever staffList changes
  useEffect(() => {
    localStorage.setItem("staffList", JSON.stringify(staffList));
  }, [staffList]);

  // Emergency function to restore admin user if missing
  useEffect(() => {
    // Check if we have any admin users
    const hasAdmin = staffList.some(
      (staff) => staff.role === "Admin" || staff.role === "admin"
    );

    // If no admin users exist, create one
    if (!hasAdmin) {
      console.log("No admin users found. Creating emergency admin user...");

      const adminUser = {
        id: "#admin-default",
        name: "Administrator",
        role: "Admin",
        department: "Admin",
        phone: "000-000-0000",
        age: 0,
        timings: "00:00 to 00:00",
        avatar: "https://via.placeholder.com/60?text=Admin",
        dob: "",
        address: "",
        additional: "",
        isAvailable: true,
        username: "admin",
        password: "admin",
        rfid: "",
        email: "",
        permissions: {
          staff: true,
          inventory: true,
          reports: true,
          order: true,
          "role-access": true,
        },
      };

      setStaffList((prev) => [...prev, adminUser]);
      console.log("Emergency admin user created!");
    }
  }, [staffList]);

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
    rfid: "",
    department: "",
    phone: "",
    dob: "",
    shiftStart: "",
    shiftEnd: "",
    address: "",
    additional: "",
  });

  // Show credentials after adding a staff member
  const [showCredentials, setShowCredentials] = useState(false);
  const [newCredentials, setNewCredentials] = useState({
    username: "",
    password: "",
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
      prev.map((s, i) =>
        i === index ? { ...s, isAvailable: !s.isAvailable } : s
      )
    );
  };

  // Clicking the pen (edit) icon
  const handleEditClick = (index: number) => {
    const staffToEdit = staffList[index];
    setFormData({
      avatar: staffToEdit.avatar,
      fullName: staffToEdit.name,
      role: staffToEdit.role,
      rfid: staffToEdit.rfid || "",
      department: staffToEdit.department,
      phone: staffToEdit.phone,
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
      rfid: "",
      department: "",
      phone: "",
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

  // Handle profile image selection
  const handleProfileImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        avatar: result,
      }));
    };

    reader.readAsDataURL(file);
  };

  // Confirm (either add or edit)
  const handleConfirm = () => {
    if (editIndex === null) {
      // Add new staff
      // Find the highest existing ID number and add 1
      const highestId = staffList.reduce((max, staff) => {
        // Extract the numeric part of the ID
        const idNum = parseInt(staff.id.replace("#", ""));
        return isNaN(idNum) ? max : Math.max(max, idNum);
      }, 100); // Start at 100 if no valid IDs

      const newIdNumber = highestId + 1;

      // Generate username and password for new staff
      const username = generateUsername(formData.fullName, staffList);
      const password = generatePassword();

      // Set permissions based on role
      const isAdmin = formData.role === "Admin";

      const newStaffObj = {
        id: "#" + newIdNumber,
        name: formData.fullName,
        role: formData.role,
        rfid: formData.rfid,
        department: formData.department,
        phone: formData.phone,
        age: formData.dob
          ? Math.floor(
              new Date().getFullYear() - new Date(formData.dob).getFullYear()
            )
          : 0,
        timings: `${formData.shiftStart} to ${formData.shiftEnd}`,
        avatar: formData.avatar || "https://i.pravatar.cc/60?text=Admin",
        dob: formData.dob,
        address: formData.address,
        additional: formData.additional,
        isAvailable: true,
        username,
        password,
        permissions: {
          staff: isAdmin ? true : formData.role === "Sub-admin",
          inventory: isAdmin
            ? true
            : formData.role === "Inventory" || formData.role === "Sub-admin",
          reports: isAdmin ? true : formData.role === "Sub-admin",
          order: isAdmin
            ? true
            : formData.role === "Sub-admin" || formData.role === "Cashier",
          "role-access": isAdmin, // Only admin can manage roles
        },
      };

      setStaffList((prev) => [...prev, newStaffObj]);

      // Set credentials to show in popup
      setNewCredentials({ username, password });
      setShowCredentials(true);
    } else {
      // Update existing
      setStaffList((prev) =>
        prev.map((s, i) => {
          if (i === editIndex) {
            // Set permissions based on role
            const isAdmin = formData.role === "Admin";

            return {
              ...s,
              name: formData.fullName,
              role: formData.role,
              rfid: formData.rfid,
              department: formData.department,
              phone: formData.phone,
              age: formData.dob
                ? Math.floor(
                    new Date().getFullYear() -
                      new Date(formData.dob).getFullYear()
                  )
                : s.age,
              timings: `${formData.shiftStart} to ${formData.shiftEnd}`,
              avatar: formData.avatar || s.avatar,
              dob: formData.dob,
              address: formData.address,
              additional: formData.additional,
              permissions: {
                staff: isAdmin ? true : formData.role === "Sub-admin",
                inventory: isAdmin
                  ? true
                  : formData.role === "Inventory" ||
                    formData.role === "Sub-admin",
                reports: isAdmin ? true : formData.role === "Sub-admin",
                order: isAdmin
                  ? true
                  : formData.role === "Sub-admin" ||
                    formData.role === "Cashier",
                "role-access": isAdmin, // Only admin can manage roles
              },
            };
          }
          return s;
        })
      );

      // Close drawer
      setShowDrawer(false);
    }

    if (!showCredentials) {
      // Only clear form and close drawer if not showing credentials
      setEditIndex(null);

      // Clear form
      setFormData({
        avatar: "",
        fullName: "",
        role: "",
        rfid: "",
        department: "",
        phone: "",
        dob: "",
        shiftStart: "",
        shiftEnd: "",
        address: "",
        additional: "",
      });
    }
  };

  // Close the credentials popup and complete the staff addition
  const handleCredentialsDone = () => {
    setShowCredentials(false);
    setShowDrawer(false);
    setEditIndex(null);

    // Clear form
    setFormData({
      avatar: "",
      fullName: "",
      role: "",
      rfid: "",
      department: "",
      phone: "",
      dob: "",
      shiftStart: "",
      shiftEnd: "",
      address: "",
      additional: "",
    });
  };

  // Copy credentials to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Cancel: close drawer
  const handleCancel = () => {
    setShowDrawer(false);
    setEditIndex(null);
  };

  // Delete staff member
  const deleteStaff = (index: number) => {
    // Get the staff member to delete
    const staffToDelete = staffList[index];

    // Prevent deletion of any admin user with username "admin"
    if (staffToDelete.username === "admin") {
      alert("Cannot delete the default admin account!");
      return;
    }

    // Confirm deletion
    if (
      window.confirm(`Are you sure you want to delete ${staffToDelete.name}?`)
    ) {
      // Remove the staff member from the list
      setStaffList((prev) => prev.filter((_, idx) => idx !== index));
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Header title="Staff Management" />

      <div style={styles.contentWrapper}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <div style={styles.topLeft}>
            <h2 style={styles.staffCount}>
              Staff (
              {staffList.filter((staff) => staff.username !== "admin").length})
            </h2>
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

        {/* Staff Management Title */}
        <div style={styles.tabsContainer}>
          <div style={styles.tabButton}>Staff Management</div>
        </div>
        <div style={styles.tabDivider} />

        {/* Staff Management Table */}
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
              Department
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
          {staffList
            .filter((staff) => staff.username !== "admin") // Hide the default admin user
            .map((staff, idx) => (
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

                {/* Department */}
                <div
                  style={{
                    ...styles.rowCell,
                    flex: 2,
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={styles.staffText}>{staff.department}</span>
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
      </div>

      {/* ==================== OVERLAY & SLIDING DRAWER ==================== */}

      {(showDrawer || showCredentials) && (
        <div
          style={styles.overlay}
          onClick={showCredentials ? undefined : handleCancel}
          aria-hidden="true"
        />
      )}

      {/* Credentials Popup */}
      {showCredentials && (
        <div style={styles.credentialsContainer}>
          <div style={styles.credentialsHeader}>
            <h3 style={styles.drawerTitle}>Staff Credentials</h3>
          </div>
          <div style={styles.credentialsBody}>
            <p style={styles.credentialsText}>
              Please save these credentials for the new staff member:
            </p>
            <div style={styles.credentialItem}>
              <div style={styles.credentialLabel}>Username:</div>
              <div style={styles.credentialValue}>
                {newCredentials.username}
              </div>
              <button
                style={styles.copyButton}
                onClick={() => copyToClipboard(newCredentials.username)}
                aria-label="Copy username"
              >
                📋
              </button>
            </div>
            <div style={styles.credentialItem}>
              <div style={styles.credentialLabel}>Password:</div>
              <div style={styles.credentialValue}>
                {newCredentials.password}
              </div>
              <button
                style={styles.copyButton}
                onClick={() => copyToClipboard(newCredentials.password)}
                aria-label="Copy password"
              >
                📋
              </button>
            </div>
          </div>
          <div style={styles.drawerFooter}>
            <button
              style={styles.confirmButton}
              onClick={handleCredentialsDone}
            >
              Done
            </button>
          </div>
        </div>
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
            <label style={styles.changePicButton}>
              Add Profile
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfileImageChange}
              />
            </label>
          </div>

          <div style={styles.formGrid}>
            {/* Full Name */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={(e) => handleFieldChange("fullName", e.target.value)}
                style={styles.formInput}
              />
            </div>

            {/* Department */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Department</label>
              <input
                type="text"
                placeholder="Enter department"
                value={formData.department}
                onChange={(e) =>
                  handleFieldChange("department", e.target.value)
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

            {/* RFID */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>RFID</label>
              <input
                type="text"
                placeholder="Enter RFID"
                value={formData.rfid}
                onChange={(e) => handleFieldChange("rfid", e.target.value)}
                style={styles.formInput}
              />
            </div>

            {/* Phone number */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
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

            {/* Shift timings (start and end in one row) */}
            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.formLabel}>Shift Timings</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="time"
                    value={formData.shiftStart}
                    onChange={(e) =>
                      handleFieldChange("shiftStart", e.target.value)
                    }
                    style={{ ...styles.formInput, width: "100%" }}
                    placeholder="Start"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="time"
                    value={formData.shiftEnd}
                    onChange={(e) =>
                      handleFieldChange("shiftEnd", e.target.value)
                    }
                    style={{ ...styles.formInput, width: "100%" }}
                    placeholder="End"
                  />
                </div>
              </div>
            </div>

            {/* Address (full width) */}
            <div style={{ ...styles.formGroup, gridColumn: "span 2" }}>
              <label style={styles.formLabel}>Address</label>
              <input
                type="text"
                placeholder="Enter address"
                value={formData.address}
                onChange={(e) => handleFieldChange("address", e.target.value)}
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

  // Credential popup styles
  credentialsContainer: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1001,
    backgroundColor: "#2A2A2A",
    borderRadius: 8,
    width: 400,
    maxWidth: "90%",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
  },
  credentialsHeader: {
    padding: "16px 24px",
    borderBottom: "1px solid #444444",
  },
  credentialsBody: {
    padding: "24px",
  },
  credentialsText: {
    fontSize: "0.9rem",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  credentialItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
  },
  credentialLabel: {
    width: 100,
    fontSize: "0.9rem",
    color: "#CCCCCC",
  },
  credentialValue: {
    flex: 1,
    fontSize: "0.9rem",
    color: "#FFFFFF",
    fontWeight: 600,
    backgroundColor: "#1F1F1F",
    padding: "8px",
    borderRadius: 4,
  },
  copyButton: {
    backgroundColor: "#444444",
    border: "none",
    borderRadius: 4,
    width: 32,
    height: 32,
    marginLeft: 8,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};
