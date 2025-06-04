import React, { useState } from "react";
import PenIcon from "/icons/pen.svg";
import TrashIcon from "/icons/trash.svg";

// Shared state type
interface User {
  name: string;
  email: string;
  role: string;
  permissions: {
    dashboard: boolean;
    reports: boolean;
    inventory: boolean;
    orders: boolean;
    customers: boolean;
    settings: boolean;
  };
}

export function UsersList(): JSX.Element {
  const [users] = useState<User[]>([
    {
      name: "Abubakar Sherazi",
      email: "abubakarsherazi@gmail.com",
      role: "Admin",
      permissions: {
        dashboard: true,
        reports: true,
        inventory: true,
        orders: true,
        customers: true,
        settings: true,
      }
    },
    {
      name: "Anees Ansari",
      email: "aneesansari@gmail.com",
      role: "Cashier",
      permissions: {
        dashboard: true,
        reports: true,
        inventory: true,
        orders: true,
        customers: true,
        settings: true,
      }
    }
  ]);

  return (
    <div style={styles.card}>
      {users.map((user, index) => (
        <React.Fragment key={index}>
          <div style={styles.userSection}>
            <div style={styles.userInfo}>
              <div style={styles.userDetails}>
                <div>
                  <h3 style={styles.userName}>{user.name}</h3>
                  <span style={styles.userEmail}>{user.email}</span>
                </div>
                <div style={styles.roleTag}>
                  <span>{user.role}</span>
                </div>
              </div>
              <div style={styles.userActions}>
                <button style={styles.iconButton}>
                  <img src={PenIcon} alt="Edit" style={styles.actionIcon} />
                </button>
                <button style={styles.iconButton}>
                  <img src={TrashIcon} alt="Delete" style={styles.actionIcon} />
                </button>
              </div>
            </div>
            <div style={styles.permissionsGrid}>
              {Object.entries(user.permissions).map(([key, value]) => (
                <div key={key} style={styles.permissionItem}>
                  <div style={styles.toggleContainer}>
                    <div style={styles.toggleBackground}>
                      <div style={styles.toggleCircle} />
                    </div>
                  </div>
                  <span style={styles.permissionName}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {index < users.length - 1 && <div style={styles.divider} />}
        </React.Fragment>
      ))}
    </div>
  );
}

export function AddNewUserForm(): JSX.Element {
  const [newUserData, setNewUserData] = useState({
    firstName: "",
    email: "",
    role: "",
    password: "",
  });

  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddUser = () => {
    // TODO: Implement add user functionality
    console.log("Adding new user:", newUserData);
    // Reset form
    setNewUserData({
      firstName: "",
      email: "",
      role: "",
      password: "",
    });
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.sectionTitle}>Add New User</h2>
      <div style={styles.addUserForm}>
        <div style={styles.formField}>
          <label style={styles.label}>First Name</label>
          <input
            type="text"
            name="firstName"
            value={newUserData.firstName}
            onChange={handleNewUserInputChange}
            style={styles.input}
            placeholder="First Name"
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={newUserData.email}
            onChange={handleNewUserInputChange}
            style={styles.input}
            placeholder="Email"
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Role</label>
          <input
            type="text"
            name="role"
            value={newUserData.role}
            onChange={handleNewUserInputChange}
            style={styles.input}
            placeholder="Role"
          />
        </div>
        <div style={styles.formField}>
          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={newUserData.password}
            onChange={handleNewUserInputChange}
            style={styles.input}
            placeholder="Password"
          />
        </div>
        <button
          onClick={handleAddUser}
          style={styles.addButton}
        >
          Add
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: "#292C2D",
    borderRadius: "10px",
    padding: "40px 39px",
    width: "100%",
    boxSizing: "border-box",
  },
  userSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "30px 0",
  },
  divider: {
    height: "1px",
    backgroundColor: "#5E5E5E",
    margin: "10px 0",
  },
  userInfo: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "10px",
  },
  userDetails: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  userName: {
    fontSize: "25px",
    fontWeight: 500,
    margin: 0,
  },
  userEmail: {
    color: "#FAC1D9",
    fontSize: "16px",
    fontWeight: 300,
  },
  roleTag: {
    backgroundColor: "#FAC1D9",
    borderRadius: "5px",
    padding: "7px 15px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#333333",
    height: "fit-content",
  },
  permissionsGrid: {
    display: "flex",
    gap: "61px",
  },
  permissionItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  toggleContainer: {
    width: "48px",
    height: "27px",
    backgroundColor: "#3D4142",
    borderRadius: "100px",
    position: "relative",
  },
  toggleBackground: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FAC1D9",
    borderRadius: "100px",
    position: "absolute",
    top: 0,
    left: 0,
  },
  toggleCircle: {
    width: "19.16px",
    height: "19.16px",
    backgroundColor: "#333333",
    borderRadius: "50%",
    position: "absolute",
    top: "3.68px",
    left: "25.16px",
  },
  permissionName: {
    fontSize: "16px",
    fontWeight: 500,
  },
  userActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIcon: {
    width: "20px",
    height: "20px",
  },
  sectionTitle: {
    fontSize: "25px",
    fontWeight: 500,
    marginTop: 0,
    marginBottom: "32px",
  },
  addUserForm: {
    display: "flex",
    flexDirection: "column",
    gap: "21px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 300,
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#3D4142",
    border: "none",
    borderRadius: "10px",
    padding: "14px 15px",
    color: "#FFFFFF",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
    height: "50px",
  },
  addButton: {
    backgroundColor: "#FAC1D9",
    border: "none",
    borderRadius: "10px",
    padding: "20px 50px",
    color: "#333333",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
  },
}; 