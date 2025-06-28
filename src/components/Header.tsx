// src/components/Header.tsx
import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Make sure these three SVG files live in the same folder as Header.tsx,
// or adjust the import paths accordingly.
import BackArrow from "./back-arrow.svg";
import ProfileIcon from "./profile-icon.svg";
import NotificationBell from "./NotificationBell";

interface HeaderProps {
  title: string;
}

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
  username?: string;
  password?: string;
  rfid?: string;
  email?: string;
}

export default function Header({ title }: HeaderProps): JSX.Element {
  const location = useLocation();
  const { user } = useAuth();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Find the user's avatar from staffList
  useEffect(() => {
    if (user) {
      try {
        const staffListJson = localStorage.getItem("staffList");
        if (staffListJson) {
          const staffList: StaffMember[] = JSON.parse(staffListJson);
          const currentStaff = staffList.find(
            (staff) =>
              staff.username === user.username ||
              staff.email === user.email ||
              staff.name === user.full_name
          );

          if (currentStaff && currentStaff.avatar) {
            setUserAvatar(currentStaff.avatar);
          }
        }
      } catch (error) {
        console.error("Error finding user avatar:", error);
      }
    }
  }, [user]);

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        {title !== "Dashboard" && (
          <NavLink
            to="/dashboard"
            style={styles.backLink}
            title="Back to Dashboard"
          >
            <img src={BackArrow} alt="Back" style={styles.backIcon} />
          </NavLink>
        )}
        <h1 style={styles.title}>{title}</h1>
      </div>
      <div style={styles.right}>
        <NotificationBell />
        <NavLink
          to="/profile"
          style={
            location.pathname === "/profile"
              ? { ...styles.iconLink, ...styles.iconActive }
              : styles.iconLink
          }
          title="Profile"
        >
          {userAvatar ? (
            <img src={userAvatar} alt="Profile" style={styles.avatarImage} />
          ) : (
            <img src={ProfileIcon} alt="Profile" style={styles.iconImage} />
          )}
        </NavLink>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 20px",
    backgroundColor: "#1F1F1F",
    boxSizing: "border-box",
    height: "80px",
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  backLink: {
    display: "inline-block",
    marginRight: 12,
    width: 24,
    height: 24,
  },
  backIcon: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    cursor: "pointer",
    opacity: 0.75,
    transition: "opacity 0.2s",
  },
  title: {
    fontFamily: "Poppins, Helvetica, sans-serif",
    fontWeight: 600,
    fontSize: "1.5rem",
    color: "#FFFFFF",
    margin: 0,
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  iconLink: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconActive: {
    opacity: 1,
  },
  iconImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    cursor: "pointer",
    opacity: 0.75,
    transition: "opacity 0.2s",
  },
  avatarImage: {
    width: "32px",
    height: "32px",
    objectFit: "cover",
    cursor: "pointer",
    opacity: 1,
    transition: "opacity 0.2s",
    borderRadius: "50%",
  },
};
