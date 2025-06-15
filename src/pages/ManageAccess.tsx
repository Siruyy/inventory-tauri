import React, { useState, useEffect } from "react";

// Shared state type
interface User {
  id: number;
  name: string;
  role: string;
  permissions: {
    staff: boolean;
    inventory: boolean;
    reports: boolean;
    order: boolean;
    "role-access": boolean;
  };
}

export function UsersList(): JSX.Element {
  // Get staff data from localStorage
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const savedStaffData = localStorage.getItem("staffList");
      if (savedStaffData) {
        const parsedData = JSON.parse(savedStaffData);
        if (Array.isArray(parsedData)) {
          // Transform staff data to match User interface
          return parsedData.map((staff, index) => ({
            id: index + 1,
            name: staff.name,
            role: staff.role,
            permissions: {
              staff: staff.permissions?.staff ?? true,
              inventory: staff.permissions?.inventory ?? true,
              reports: staff.permissions?.reports ?? true,
              order: staff.permissions?.order ?? true,
              "role-access":
                staff.permissions?.["role-access"] ??
                (staff.role === "Admin" || staff.role === "Sub-admin"),
            },
          }));
        }
      }
      // Return default users if no staff data exists
      return [
        {
          id: 1,
          name: "Abubakar Sherazi",
          role: "Admin",
          permissions: {
            staff: true,
            inventory: true,
            reports: true,
            order: true,
            "role-access": true,
          },
        },
        {
          id: 2,
          name: "Anees Ansari",
          role: "Cashier",
          permissions: {
            staff: true,
            inventory: true,
            reports: true,
            order: true,
            "role-access": false,
          },
        },
      ];
    } catch (error) {
      console.error("Error loading staff data:", error);
      return [];
    }
  });

  // Save permissions to localStorage when they change
  useEffect(() => {
    try {
      const savedStaffData = localStorage.getItem("staffList");
      if (savedStaffData) {
        const staffList = JSON.parse(savedStaffData);

        // Update staff list with current permissions
        const updatedStaffList = staffList.map((staff: any, index: number) => {
          const currentUser = users.find((user) => user.name === staff.name);
          if (currentUser) {
            return {
              ...staff,
              permissions: currentUser.permissions,
            };
          }
          return staff;
        });

        localStorage.setItem("staffList", JSON.stringify(updatedStaffList));
      }
    } catch (error) {
      console.error("Error saving permissions:", error);
    }
  }, [users]);

  // Toggle permission handler
  const togglePermission = (userId: number, permission: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              permissions: {
                ...user.permissions,
                [permission]:
                  !user.permissions[
                    permission as keyof typeof user.permissions
                  ],
              },
            }
          : user
      )
    );
  };

  return (
    <div style={styles.card}>
      {users.map((user, index) => (
        <React.Fragment key={index}>
          <div style={styles.userSection}>
            <div style={styles.userHeader}>
              <div style={styles.userInfo}>
                <div style={styles.userDetails}>
                  <div>
                    <h3 style={styles.userName}>{user.name}</h3>
                  </div>
                  <div style={styles.roleTag}>
                    <span>{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={styles.permissionsContainer}>
              <div style={styles.permissionsTitle}>Access Permissions</div>
              <div style={styles.permissionsGrid}>
                {Object.entries(user.permissions).map(([key, value]) => (
                  <div key={key} style={styles.permissionItem}>
                    <span style={styles.permissionName}>{key}</span>
                    <div
                      style={styles.toggleContainer}
                      onClick={() => togglePermission(user.id, key)}
                    >
                      {value && <div style={styles.toggleBackground}></div>}
                      <div
                        style={{
                          ...styles.toggleCircle,
                          left: value ? "25.16px" : "3.68px",
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {index < users.length - 1 && <div style={styles.divider} />}
        </React.Fragment>
      ))}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  card: {
    backgroundColor: "#292C2D",
    borderRadius: "10px",
    padding: "30px",
    width: "100%",
    boxSizing: "border-box",
  },
  userSection: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    padding: "20px 0",
  },
  userHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  divider: {
    height: "1px",
    backgroundColor: "#5E5E5E",
    margin: "15px 0",
  },
  userInfo: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
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
  permissionsContainer: {
    backgroundColor: "#353839",
    borderRadius: "8px",
    padding: "20px",
  },
  permissionsTitle: {
    fontSize: "16px",
    fontWeight: 500,
    marginBottom: "20px",
    color: "#FFFFFF",
  },
  permissionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "30px",
  },
  permissionItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  toggleContainer: {
    width: "48px",
    height: "27px",
    backgroundColor: "#3D4142",
    borderRadius: "100px",
    position: "relative",
    cursor: "pointer",
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
    transition: "left 0.2s ease-in-out",
  },
  permissionName: {
    fontSize: "16px",
    fontWeight: 500,
    textTransform: "capitalize",
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
