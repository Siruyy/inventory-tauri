import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

// Import SVG icons
import ProfileIcon from "./profile.svg";
import ManageAccessIcon from "./access.svg";
import LogoutIcon from "../pages/logout.svg";
import EditIcon from "./edit-icon.svg";

export default function Profile(): JSX.Element {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<'profile' | 'manage' | 'logout'>('profile');
  const [formData, setFormData] = useState({
    firstName: "John Doe",
    email: "johndoe123@gmail.com",
    address: "123 Street USA, Chicago",
    newPassword: "",
    confirmPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = () => {
    // TODO: Implement save changes functionality
    console.log("Saving changes:", formData);
  };

  const handleDiscardChanges = () => {
    // Reset form to initial values
    setFormData({
      firstName: "John Doe",
      email: "johndoe123@gmail.com",
      address: "123 Street USA, Chicago",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleNavClick = (nav: 'profile' | 'manage' | 'logout') => {
    setActiveNav(nav);
    if (nav === 'logout') {
      // Add any cleanup logic here (clear tokens, session, etc.)
      setTimeout(() => {
        navigate('/login');
      }, 200); // Small delay to show the button active state
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.mainContent}>
        <Header title="Profile" />
        
        <div style={styles.contentWrapper}>
          {/* Profile Navigation */}
          <div style={styles.profileNav}>
            <div 
              style={{
                ...styles.profileNavItem, 
                ...(activeNav === 'profile' ? styles.profileNavItemActive : {})
              }}
              onClick={() => handleNavClick('profile')}
            >
              <div style={activeNav === 'profile' ? styles.profileNavIconActive : styles.profileNavIconInactive}>
                <img src={ProfileIcon} alt="Profile" style={styles.navIcon} />
              </div>
              <span style={activeNav === 'profile' ? styles.profileNavTextActive : styles.profileNavTextInactive}>
                My Profile
              </span>
            </div>
            <div 
              style={{
                ...styles.profileNavItem, 
                ...(activeNav === 'manage' ? styles.profileNavItemActive : {})
              }}
              onClick={() => handleNavClick('manage')}
            >
              <div style={activeNav === 'manage' ? styles.profileNavIconActive : styles.profileNavIconInactive}>
                <img src={ManageAccessIcon} alt="Manage Access" style={styles.navIcon} />
              </div>
              <span style={activeNav === 'manage' ? styles.profileNavTextActive : styles.profileNavTextInactive}>
                Manage Access
              </span>
            </div>
            <div 
              style={styles.profileNavItem}
              onClick={() => handleNavClick('logout')}
            >
              <div style={styles.profileNavIconInactive}>
                <img src={LogoutIcon} alt="Logout" style={styles.navIcon} />
              </div>
              <span style={styles.profileNavTextInactive}>
                Logout
              </span>
            </div>
          </div>

          {/* Main Profile Content */}
          <div style={styles.profileContent}>
            <h2 style={styles.sectionTitle}>Personal Information</h2>

            {/* Profile Header */}
            <div style={styles.profileHeader}>
              <div style={styles.profileImageContainer}>
                <img
                  src="https://via.placeholder.com/141"
                  alt="Profile"
                  style={styles.profileImage}
                />
                <div style={styles.editImageButton}>
                  <img src={EditIcon} alt="Edit" style={styles.editIcon} />
                </div>
              </div>
              <div style={styles.profileInfo}>
                <h3 style={styles.profileName}>John Doe</h3>
                <span style={styles.profileRole}>Manager</span>
              </div>
            </div>

            {/* Form Fields */}
            <div style={styles.formContainer}>
              <div style={styles.formField}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>New Password</label>
                <div style={styles.passwordInputContainer}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                  <button
                    style={styles.showPasswordButton}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                  </button>
                </div>
              </div>

              <div style={styles.formField}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.passwordInputContainer}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                  <button
                    style={styles.showPasswordButton}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                  </button>
                </div>
              </div>
            </div>

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
  profileNav: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "30px 20px",
    backgroundColor: "#292C2D",
    width: "319px",
    borderRadius: "10px",
    flexShrink: 0,
    height: "236px",
    justifyContent: "center",
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
  profileNavIcon: {
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  profileContent: {
    backgroundColor: "#292C2D",
    borderRadius: "10px",
    padding: "40px 39px",
    width: "824px",
    height: "904px",
  },
  sectionTitle: {
    fontSize: "25px",
    fontWeight: 500,
    marginTop: 0,
    marginBottom: "32px",
  },
  profileHeader: {
    display: "flex",
    gap: "25px",
    marginBottom: "32px",
  },
  profileImageContainer: {
    position: "relative",
    width: "141px",
    height: "141px",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
  },
  editImageButton: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    width: "29px",
    height: "29px",
    backgroundColor: "#FAC1D9",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  editIcon: {
    width: "16px",
    height: "16px",
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  profileName: {
    fontSize: "25px",
    fontWeight: 500,
    margin: 0,
  },
  profileRole: {
    color: "#FAC1D9",
    fontSize: "16px",
    fontWeight: 300,
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "21px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "744px",
  },
  label: {
    fontSize: "16px",
    fontWeight: 500,
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "10px",
    padding: "20px 25px",
    color: "#FFFFFF",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    height: "65px",
  },
  passwordInputContainer: {
    position: "relative",
    width: "362px",
  },
  showPasswordButton: {
    position: "absolute",
    right: "15px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  showPasswordIcon: {
    width: "20px",
    height: "20px",
    color: "#777979",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "30px",
    marginTop: "32px",
  },
  discardButton: {
    background: "none",
    border: "none",
    color: "#FFFFFF",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
  },
  saveButton: {
    backgroundColor: "#FAC1D9",
    border: "none",
    borderRadius: "10px",
    padding: "20px 50px",
    color: "#333333",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
  },
}; 