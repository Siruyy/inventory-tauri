import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { UsersList } from "./ManageAccess";
import { useAuth } from "../context/AuthContext";

import ProfileIcon from "/icons/profile.svg";
import ManageAccessIcon from "/icons/access.svg";
import LogoutIcon from "/icons/logout.svg";

// Interface for staff member
interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  username?: string;
  password?: string;
  dob?: string;
  timings?: string;
  rfid?: string;
  isAvailable?: boolean;
  permissions?: {
    staff: boolean;
    inventory: boolean;
    reports: boolean;
    order: boolean;
    "role-access": boolean;
  };
}

export default function Profile(): JSX.Element {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState<"profile" | "manage" | "logout">(
    "profile"
  );
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
    rfid: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  // Ensure admin user is added to staff list and load current staff data
  useEffect(() => {
    if (user) {
      try {
        // Get existing staff or initialize empty array
        const savedStaffData = localStorage.getItem("staffList");
        let staffList: StaffMember[] = savedStaffData
          ? JSON.parse(savedStaffData)
          : [];

        // Find the current logged in user in staff list
        let currentUserInStaff = staffList.find(
          (staff: StaffMember) =>
            staff.email === user.email ||
            (staff.username && staff.username === user.username)
        );

        // If user isn't in staff list and is admin, add them
        if (!currentUserInStaff && user.role === "admin") {
          const adminStaff: StaffMember = {
            id: `#${100 + staffList.length}`,
            name: user.full_name || "Administrator",
            email: user.email || "admin@example.com",
            role: "Admin",
            department: "Management",
            phone: "000-000-0000",
            avatar: "https://via.placeholder.com/141?text=Admin",
            address: "Main Office",
            username: user.username,
            password: "admin123", // This would typically be hashed
            dob: "1990-01-01",
            timings: "9:00 AM to 5:00 PM",
            rfid: "", // No default RFID - user will set their own
            isAvailable: true,
            permissions: {
              staff: true,
              inventory: true,
              reports: true,
              order: true,
              "role-access": true,
            },
          };

          staffList.push(adminStaff);
          localStorage.setItem("staffList", JSON.stringify(staffList));
          currentUserInStaff = adminStaff;
        }

        // Set current staff data
        if (currentUserInStaff) {
          setCurrentStaff(currentUserInStaff);
          setFormData({
            username: currentUserInStaff.username || "",
            newPassword: "",
            confirmPassword: "",
            rfid: currentUserInStaff.rfid || "",
          });
        }
      } catch (error) {
        console.error("Error handling staff data:", error);
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    if (!currentStaff) return;

    try {
      // Validate password if changing it
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage("Passwords don't match");
          return;
        }
        if (formData.newPassword.length < 4) {
          setMessage("Password must be at least 4 characters");
          return;
        }
      }

      // Get existing staff list
      const savedStaffData = localStorage.getItem("staffList");
      let staffList: StaffMember[] = savedStaffData
        ? JSON.parse(savedStaffData)
        : [];

      // Update the current staff member
      const updatedStaffList = staffList.map((staff) => {
        if (staff.id === currentStaff.id) {
          return {
            ...staff,
            username: formData.username,
            password: formData.newPassword || staff.password,
            rfid: formData.rfid,
          };
        }
        return staff;
      });

      localStorage.setItem("staffList", JSON.stringify(updatedStaffList));

      // Update current staff
      setCurrentStaff((prev) =>
        prev
          ? {
              ...prev,
              username: formData.username,
              password: formData.newPassword || prev.password,
              rfid: formData.rfid,
            }
          : null
      );

      // Reset password fields
      setFormData({
        ...formData,
        newPassword: "",
        confirmPassword: "",
        rfid: formData.rfid,
      });

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      setMessage("Failed to update profile");
    }
  };

  const handleDiscardChanges = () => {
    if (currentStaff) {
      setFormData({
        username: currentStaff.username || "",
        newPassword: "",
        confirmPassword: "",
        rfid: currentStaff.rfid || "",
      });
    }
  };

  const handleNavClick = (nav: "profile" | "manage" | "logout") => {
    setActiveNav(nav);

    if (nav === "logout") {
      logout();
      navigate("/login");
    }
  };

  // Extract shift times if available
  const getShiftTimes = () => {
    if (!currentStaff?.timings) return { start: "", end: "" };

    const parts = currentStaff.timings.split(" to ");
    return {
      start: parts[0] || "",
      end: parts[1] || "",
    };
  };

  const shiftTimes = getShiftTimes();

  return (
    <div style={styles.pageContainer}>
      <div style={styles.mainContent}>
        <Header title="Profile" />

        <div style={styles.contentWrapper}>
          <div style={styles.leftColumn}>
            {/* Profile Navigation */}
            <div style={styles.profileNav}>
              <div
                style={{
                  ...styles.profileNavItem,
                  ...(activeNav === "profile"
                    ? styles.profileNavItemActive
                    : {}),
                }}
                onClick={() => handleNavClick("profile")}
              >
                <div
                  style={
                    activeNav === "profile"
                      ? styles.profileNavIconActive
                      : styles.profileNavIconInactive
                  }
                >
                  <img src={ProfileIcon} alt="Profile" style={styles.navIcon} />
                </div>
                <span
                  style={
                    activeNav === "profile"
                      ? styles.profileNavTextActive
                      : styles.profileNavTextInactive
                  }
                >
                  My Profile
                </span>
              </div>
              {currentStaff?.permissions?.["role-access"] !== false && (
                <div
                  style={{
                    ...styles.profileNavItem,
                    ...(activeNav === "manage"
                      ? styles.profileNavItemActive
                      : {}),
                  }}
                  onClick={() => handleNavClick("manage")}
                >
                  <div
                    style={
                      activeNav === "manage"
                        ? styles.profileNavIconActive
                        : styles.profileNavIconInactive
                    }
                  >
                    <img
                      src={ManageAccessIcon}
                      alt="Manage Access"
                      style={styles.navIcon}
                    />
                  </div>
                  <span
                    style={
                      activeNav === "manage"
                        ? styles.profileNavTextActive
                        : styles.profileNavTextInactive
                    }
                  >
                    Manage Access
                  </span>
                </div>
              )}
              <div
                style={styles.profileNavItem}
                onClick={() => handleNavClick("logout")}
              >
                <div style={styles.profileNavIconInactive}>
                  <img src={LogoutIcon} alt="Logout" style={styles.navIcon} />
                </div>
                <span style={styles.profileNavTextInactive}>Logout</span>
              </div>
            </div>

            {/* Account Credentials Section */}
            {activeNav === "profile" && (
              <div style={styles.credentialsCard}>
                <h2 style={styles.cardTitle}>Account Credentials</h2>
                <div style={styles.cardContent}>
                  <div style={styles.credentialRow}>
                    <span style={styles.detailLabel}>Username</span>
                    <div style={styles.inputContainer}>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        style={styles.input}
                      />
                    </div>
                  </div>
                  <div style={styles.credentialRow}>
                    <span style={styles.detailLabel}>New Password</span>
                    <div style={styles.passwordInputContainer}>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Enter new password"
                      />
                      <button
                        style={styles.showPasswordButton}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        type="button"
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <div style={styles.credentialRow}>
                    <span style={styles.detailLabel}>Confirm Password</span>
                    <div style={styles.passwordInputContainer}>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Confirm new password"
                      />
                      <button
                        style={styles.showPasswordButton}
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        type="button"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* RFID Field */}
                  <div style={styles.credentialRow}>
                    <span style={styles.detailLabel}>RFID Card</span>
                    <div style={styles.inputContainer}>
                      <input
                        type="text"
                        name="rfid"
                        value={formData.rfid}
                        onChange={handleInputChange}
                        style={styles.input}
                        placeholder="Enter RFID card number"
                      />
                    </div>
                  </div>

                  {/* Message Display */}
                  {message && (
                    <div
                      style={{
                        padding: "10px",
                        marginTop: "10px",
                        backgroundColor: message.includes("successful")
                          ? "#4caf5033"
                          : "#f4433633",
                        borderRadius: "4px",
                        color: message.includes("successful")
                          ? "#4caf50"
                          : "#f44336",
                        textAlign: "center",
                      }}
                    >
                      {message}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={styles.actionButtons}>
                    <button
                      onClick={handleDiscardChanges}
                      style={styles.discardButton}
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      style={styles.saveButton}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div style={styles.rightColumn}>
            {activeNav === "profile" ? (
              <div style={styles.mainContentLayout}>
                {/* Profile Image */}
                <div style={styles.profileImageContainer}>
                  <img
                    src={
                      currentStaff?.avatar ||
                      "https://via.placeholder.com/200?text=Profile"
                    }
                    alt="Profile"
                    style={styles.profileImage}
                  />
                </div>

                {/* Employee Personal Details */}
                <div style={styles.detailsSection}>
                  <h2 style={styles.sectionTitle}>Employee Personal Details</h2>
                  <div style={styles.detailsContent}>
                    <div style={styles.detailRow}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Full Name</span>
                        <span style={styles.detailValue}>
                          {currentStaff?.name || "User"}
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Department</span>
                        <span style={styles.detailValue}>
                          {currentStaff?.department || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Phone number</span>
                        <span style={styles.detailValue}>
                          {currentStaff?.phone || "N/A"}
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Date of birth</span>
                        <span style={styles.detailValue}>
                          {currentStaff?.dob || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Address</span>
                        <span style={styles.detailValue}>
                          {currentStaff?.address || "N/A"}
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>RFID</span>
                        <span style={styles.detailValue}>
                          {currentStaff?.rfid || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employee Job Details */}
                <div style={styles.detailsSection}>
                  <h2 style={styles.sectionTitle}>Employee Job Details</h2>
                  <div style={styles.detailsContent}>
                    <div style={styles.detailRow}>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Role</span>
                        <span style={styles.detailValue}>
                          {currentStaff?.role || "User"}
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>
                          Shift start timing
                        </span>
                        <span style={styles.detailValue}>
                          {shiftTimes.start || "N/A"}
                        </span>
                      </div>
                      <div style={styles.detailItem}>
                        <span style={styles.detailLabel}>Shift end timing</span>
                        <span style={styles.detailValue}>
                          {shiftTimes.end || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <UsersList />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#1F1F1F",
    color: "#FFFFFF",
    fontFamily: "Poppins, Helvetica, sans-serif",
  },
  mainContent: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  contentWrapper: {
    display: "flex",
    gap: "20px",
    padding: "20px",
    alignItems: "flex-start",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "319px",
  },
  rightColumn: {
    flexGrow: 1,
  },
  mainContentLayout: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  profileNav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "30px 20px",
    backgroundColor: "#292C2D",
    borderRadius: "10px",
    flexShrink: 0,
    height: "236px",
    justifyContent: "center",
  },
  credentialsCard: {
    backgroundColor: "#292C2D",
    borderRadius: "10px",
    padding: "30px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 500,
    margin: 0,
    marginBottom: "20px",
    color: "#FFFFFF",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  profileNavItem: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding: "14px 41px",
    borderRadius: "8px",
    cursor: "pointer",
    width: "279px",
    height: "52px",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    margin: "0 auto",
  },
  profileNavItemActive: {
    backgroundColor: "#FAC1D9",
  },
  profileNavIconActive: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    filter: "brightness(0)",
  },
  profileNavIconInactive: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  navIcon: {
    width: "100%",
    height: "100%",
  },
  profileNavTextActive: {
    color: "#333333",
    fontSize: "16px",
    fontWeight: 500,
    marginLeft: "7px",
  },
  profileNavTextInactive: {
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: 500,
    marginLeft: "7px",
  },
  profileImageContainer: {
    backgroundColor: "#292C2D",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
    width: "auto",
  },
  profileImage: {
    width: "200px",
    height: "200px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  detailsSection: {
    backgroundColor: "#292C2D",
    borderRadius: "10px",
    padding: "25px",
    height: "auto",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: 500,
    marginTop: 0,
    marginBottom: "20px",
    color: "#FFFFFF",
  },
  detailsContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  detailRow: {
    display: "flex",
    gap: "30px",
    width: "100%",
  },
  detailItem: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  credentialRow: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "5px",
  },
  detailLabel: {
    fontSize: "14px",
    color: "#888888",
  },
  detailValue: {
    fontSize: "16px",
    color: "#FFFFFF",
    backgroundColor: "#3D4142",
    padding: "12px 15px",
    borderRadius: "10px",
    minHeight: "45px",
    display: "flex",
    alignItems: "center",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "10px",
    padding: "12px 15px",
    color: "#FFFFFF",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    height: "45px",
  },
  passwordInputContainer: {
    position: "relative",
    width: "100%",
  },
  showPasswordButton: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    color: "#FFFFFF",
    cursor: "pointer",
    padding: 0,
    fontSize: "14px",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "20px",
    marginTop: "20px",
  },
  discardButton: {
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    padding: "12px 20px",
  },
  saveButton: {
    backgroundColor: "#FAC1D9",
    border: "none",
    borderRadius: "10px",
    padding: "12px 30px",
    color: "#333333",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
  },
};
