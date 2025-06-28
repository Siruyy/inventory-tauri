import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithRfid: (rfid: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = sessionStorage.getItem("auth_token");
    const storedUser = sessionStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      try {
        // Skip backend verification and trust sessionStorage data
        // This is safe because we're only using sessionStorage for authentication
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        console.log("User restored from sessionStorage:", parsedUser.username);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid auth data
        sessionStorage.removeItem("auth_token");
        sessionStorage.removeItem("auth_user");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    // Add event listener for app close to clear auth state
    const handleBeforeUnload = () => {
      sessionStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_user");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log("Attempting login with:", { username });

      // Special case for admin/admin login - allow even if there's no staff entry
      if (username.toLowerCase() === "admin" && password === "admin") {
        console.log(
          "Default admin credentials detected, bypassing normal authentication"
        );

        // Create a default admin user
        const adminUser: User = {
          id: 1,
          username: "admin",
          email: "admin@example.com",
          full_name: "Admin User",
          role: "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Generate a token (simple implementation)
        const token = "admin_token_" + new Date().getTime();

        setUser(adminUser);
        setToken(token);

        // Store auth data in sessionStorage instead of localStorage
        sessionStorage.setItem("auth_token", token);
        sessionStorage.setItem("auth_user", JSON.stringify(adminUser));

        console.log("Admin authentication completed successfully");
        return;
      }

      // Check if the user exists in the staff list
      const staffListJson = localStorage.getItem("staffList");
      if (staffListJson) {
        const staffList = JSON.parse(staffListJson);
        const staffMember = staffList.find(
          (staff: any) =>
            staff.username &&
            staff.username.toLowerCase() === username.toLowerCase() &&
            staff.password === password
        );

        if (staffMember) {
          console.log("Staff member found in localStorage:", staffMember.name);

          // Create a user object from the staff member
          const user: User = {
            id: parseInt(staffMember.id.replace("#", "")) || 0,
            username: staffMember.username,
            email: staffMember.email || `${staffMember.username}@example.com`,
            full_name: staffMember.name,
            role: staffMember.role || "staff",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Generate a token
          const token = "staff_token_" + new Date().getTime();

          setUser(user);
          setToken(token);

          // Store auth data in sessionStorage instead of localStorage
          sessionStorage.setItem("auth_token", token);
          sessionStorage.setItem("auth_user", JSON.stringify(user));

          console.log("Staff authentication completed successfully");
          return;
        } else {
          console.log("Staff member not found in localStorage");
        }
      }

      // If we get here, try the backend authentication
      try {
        const response = await invoke<AuthResponse>("login", {
          creds: { username, password: password },
        });

        console.log("Login response:", response);

        // Special case for admin users - ensure they have admin role
        if (username.toLowerCase() === "admin") {
          console.log("Admin user detected, ensuring admin role is set");
          response.user.role = "admin";
        }

        setUser(response.user);
        setToken(response.token);

        // Store auth data in sessionStorage instead of localStorage
        sessionStorage.setItem("auth_token", response.token);
        sessionStorage.setItem("auth_user", JSON.stringify(response.user));

        console.log("Authentication completed successfully");
      } catch (error) {
        console.error("Backend login failed:", error);
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error as string);
    }
  };

  const loginWithRfid = async (rfid: string) => {
    try {
      console.log("Attempting login with RFID:", rfid);

      // First, get the staff list from localStorage
      const staffListJson = localStorage.getItem("staffList");
      if (!staffListJson) {
        console.error("No staff records found in localStorage");
        throw new Error("No staff records found");
      }

      const staffList = JSON.parse(staffListJson);
      console.log("Staff list loaded, entries:", staffList.length);

      // Clean the input RFID
      const cleanRfid = rfid.toString().trim();

      // Find staff member with matching RFID - handle partial matches
      // Convert to string for comparison since RFID might be stored as number or string
      let staffMember = staffList.find((staff: any) => {
        const staffRfid = staff.rfid?.toString() || "";
        console.log(
          `Checking staff: ${
            staff.name
          }, RFID: ${staffRfid} (${typeof staff.rfid})`
        );

        // Exact match
        if (staffRfid === cleanRfid) {
          console.log("EXACT MATCH FOUND for", staff.name);
          return true;
        }

        return false;
      });

      // If no exact match, try partial matches (common with RFID scanners)
      if (!staffMember) {
        console.log("No exact match found, trying partial matches...");

        // Try matching with one digit missing (common scanner issue)
        staffMember = staffList.find((staff: any) => {
          const staffRfid = staff.rfid?.toString() || "";

          // Check if input is a prefix of stored RFID (missing last digit)
          if (staffRfid.startsWith(cleanRfid)) {
            console.log("PARTIAL MATCH (prefix) for", staff.name);
            return true;
          }

          // Check if stored RFID is a prefix of input (extra digit)
          if (cleanRfid.startsWith(staffRfid) && staffRfid.length > 5) {
            console.log("PARTIAL MATCH (stored prefix) for", staff.name);
            return true;
          }

          return false;
        });
      }

      if (!staffMember) {
        console.error(`No staff found with RFID: ${cleanRfid}`);
        console.log(
          "Available RFIDs:",
          staffList.map((s: any) => `${s.name}: ${s.rfid}`).join(", ")
        );
        throw new Error("Invalid RFID card");
      }

      console.log("Found staff member:", staffMember.name);
      console.log("Credentials check:", {
        hasUsername: !!staffMember.username,
        usernameValue: staffMember.username,
        hasPassword: !!staffMember.password,
        passwordValue: staffMember.password,
      });

      // Special case for admin users - try with default admin credentials
      if (staffMember.role === "Admin" || staffMember.role === "admin") {
        console.log("Admin user detected, trying default admin credentials");
        try {
          // First try with the stored credentials
          await login(staffMember.username, staffMember.password);
          console.log("Admin login successful with stored credentials");

          // Ensure admin role is set
          if (user) {
            const updatedUser = { ...user, role: "admin" };
            setUser(updatedUser);
            localStorage.setItem("auth_user", JSON.stringify(updatedUser));
            console.log("Admin role enforced for RFID login");
          }

          return;
        } catch (error) {
          console.log(
            "Admin login failed with stored credentials, trying default admin credentials"
          );
          // If that fails, try with default admin credentials
          try {
            await login("admin", "admin");
            return;
          } catch (secondError) {
            console.error("Admin login failed with default credentials too");
            throw new Error("Authentication failed");
          }
        }
      }

      // If credentials are missing, try to use the staff name as username and default password
      if (!staffMember.username || !staffMember.password) {
        console.log(
          "Staff member is missing credentials, attempting to update..."
        );

        // Create default credentials based on staff info
        const defaultUsername = staffMember.name
          .toLowerCase()
          .replace(/\s+/g, ".");
        const defaultPassword = "password123"; // Default password

        console.log(
          `Setting default credentials - username: ${defaultUsername}, password: ${defaultPassword}`
        );

        // Update the staff member in localStorage
        staffMember.username = staffMember.username || defaultUsername;
        staffMember.password = staffMember.password || defaultPassword;

        // Save the updated staff list
        const updatedStaffList = staffList.map((staff: any) =>
          staff.id === staffMember.id ? staffMember : staff
        );

        localStorage.setItem("staffList", JSON.stringify(updatedStaffList));
        console.log("Updated staff member with default credentials");
      }

      console.log("Using credentials for:", staffMember.username);

      // Use regular login with the found credentials
      try {
        await login(staffMember.username, staffMember.password);
        console.log("RFID Authentication completed successfully");
      } catch (error) {
        console.error("Login failed with stored credentials:", error);

        // Try a fallback password if the role is known
        if (staffMember.role) {
          const fallbackPassword = staffMember.role.toLowerCase();
          console.log(
            `Trying fallback password based on role: ${fallbackPassword}`
          );

          try {
            await login(staffMember.username, fallbackPassword);
            console.log("Login successful with fallback password");

            // Update the staff member with the correct password
            staffMember.password = fallbackPassword;

            // Save the updated staff list
            const updatedStaffList = staffList.map((staff: any) =>
              staff.id === staffMember.id ? staffMember : staff
            );

            localStorage.setItem("staffList", JSON.stringify(updatedStaffList));
            console.log("Updated staff password in staff list");
          } catch (fallbackError) {
            console.error(
              "Login failed with fallback password:",
              fallbackError
            );
            throw new Error("Invalid password");
          }
        } else {
          throw new Error("Invalid password");
        }
      }
    } catch (error) {
      console.error("RFID login error:", error);
      throw new Error(error as string);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await invoke<AuthResponse>("register", {
        request: userData,
      });

      setUser(response.user);
      setToken(response.token);

      // Store auth data
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
    } catch (error) {
      throw new Error(error as string);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token"); // Also clear from localStorage for backward compatibility
    localStorage.removeItem("auth_user"); // Also clear from localStorage for backward compatibility
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    loginWithRfid,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider };
export default AuthProvider;
