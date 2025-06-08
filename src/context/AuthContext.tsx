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

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      // Verify token with backend
      invoke<boolean>("verify_auth", { token: storedToken })
        .then((isValid) => {
          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Clear invalid auth data
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
          }
        })
        .catch(() => {
          // Clear invalid auth data
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log("Attempting login with:", { username });

      const response = await invoke<AuthResponse>("login", {
        creds: { username, password: password },
      });

      console.log("Login response:", response);

      setUser(response.user);
      setToken(response.token);

      // Store auth data
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(response.user));

      console.log("Authentication completed successfully");
    } catch (error) {
      console.error("Login error:", error);
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
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
