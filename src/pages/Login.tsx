// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mdiHide from "/icons/mdi-hide.svg";

export default function Login(): JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#111315",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflowY: "auto",
        overflowX: "hidden",
        boxSizing: "border-box",
        margin: 0,
      }}
    >
      <div
        style={{
          backgroundColor: "#292c2d",
          borderRadius: 24,
          padding: "60px 60px",
          width: "100%",
          maxWidth: 550,
          maxHeight: 700,
          boxSizing: "border-box",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        {/* CARD HEADER */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.875rem",
              fontFamily: "Poppins, Helvetica, sans-serif",
              fontWeight: 500,
              color: "#FFFFFF",
              textAlign: "center",
            }}
          >
            Login!
          </h1>

          <p
            style={{
              margin: 0,
              fontFamily: "Poppins, Helvetica, sans-serif",
              fontWeight: 400,
              fontSize: "0.875rem",
              color: "#E5E7EB",
              textAlign: "center",
            }}
          >
            Please enter your credentials below to continue
          </p>

          {error && (
            <p
              style={{
                margin: 0,
                fontFamily: "Poppins, Helvetica, sans-serif",
                fontWeight: 400,
                fontSize: "0.875rem",
                color: "#ef4444",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* USERNAME FIELD */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              htmlFor="username"
              style={{
                fontFamily: "Poppins, Helvetica, sans-serif",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "#FFFFFF",
              }}
            >
              Username
            </label>
            <div
              style={{
                position: "relative",
                backgroundColor: "#3c4041",
                borderRadius: 12,
                height: 48,
                display: "flex",
                alignItems: "center",
                paddingLeft: 16,
                paddingRight: 48,
              }}
            >
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#E5E7EB",
                  fontFamily: "Poppins, Helvetica, sans-serif",
                  fontWeight: 300,
                  fontSize: "1rem",
                  padding: 0,
                }}
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              htmlFor="password"
              style={{
                fontFamily: "Poppins, Helvetica, sans-serif",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "#FFFFFF",
              }}
            >
              Password
            </label>
            <div
              style={{
                position: "relative",
                backgroundColor: "#3c4041",
                borderRadius: 12,
                height: 48,
                display: "flex",
                alignItems: "center",
                paddingLeft: 16,
                paddingRight: 48,
              }}
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#E5E7EB",
                  fontFamily: "Poppins, Helvetica, sans-serif",
                  fontWeight: 300,
                  fontSize: "1rem",
                  padding: 0,
                }}
              />
              <img
                src={mdiHide}
                alt="Toggle visibility"
                style={{
                  position: "absolute",
                  right: 16,
                  width: 20,
                  height: 20,
                  cursor: "pointer",
                  opacity: 0.6,
                }}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "16px",
              width: "100%",
              height: 48,
              backgroundColor: isLoading ? "#d1a1b6" : "#fac1d9",
              border: "none",
              borderRadius: 12,
              fontFamily: "Poppins, Helvetica, sans-serif",
              fontWeight: 500,
              fontSize: "1rem",
              color: "#333333",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
