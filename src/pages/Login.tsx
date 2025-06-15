// src/pages/Login.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mdiHide from "/icons/mdi-hide.svg";

export default function Login(): JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rfid, setRfid] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  // Hidden RFID input that's active when no other input is focused
  const hiddenRfidInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithRfid } = useAuth();

  // Focus the hidden RFID input when component mounts
  useEffect(() => {
    console.log("Login component rendered");
    if (hiddenRfidInputRef.current && !isInputFocused) {
      hiddenRfidInputRef.current.focus();
    }

    // Set up a click event listener on the document to refocus the RFID input
    // when clicking outside of input fields
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !isInputFocused &&
        target.tagName !== "INPUT" &&
        hiddenRfidInputRef.current
      ) {
        hiddenRfidInputRef.current.focus();
      }
    };

    document.addEventListener("click", handleClick);

    // Clean up event listener on unmount
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isInputFocused]);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleCredentialSubmit = async (e: React.FormEvent) => {
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

  const handleRfidChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setRfid(value);

    // Auto-submit when RFID has enough digits (typically 10 digits)
    if (value.length >= 8) {
      console.log("Auto-submitting RFID:", value);

      setError("");
      setIsLoading(true);

      try {
        await loginWithRfid(value);
        navigate(from, { replace: true });
      } catch (err) {
        console.error("RFID login failed:", err);
        setError((err as Error).message);
        setRfid("");
        // Refocus the RFID input after error
        if (hiddenRfidInputRef.current) {
          hiddenRfidInputRef.current.value = "";
          hiddenRfidInputRef.current.focus();
        }
      } finally {
        setIsLoading(false);
      }
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
      {/* Hidden RFID input that's only active when no other input is focused */}
      <input
        ref={hiddenRfidInputRef}
        type="password"
        value={rfid}
        onChange={handleRfidChange}
        style={{
          position: "absolute",
          opacity: 0,
          pointerEvents: "none", // Doesn't block clicks on elements beneath it
        }}
        autoFocus={!isInputFocused}
        tabIndex={isInputFocused ? -1 : 0} // Remove from tab order when other inputs are focused
      />

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
            Please enter your credentials below to continue or scan your RFID
            card
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
          onSubmit={handleCredentialSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "8px",
                fontFamily: "Poppins, Helvetica, sans-serif",
                fontWeight: 500,
                fontSize: "0.875rem",
                color: "#FFFFFF",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: "#1F1F1F",
                border: "1px solid #333333",
                borderRadius: "8px",
                fontFamily: "Poppins, Helvetica, sans-serif",
                fontSize: "0.875rem",
                color: "#FFFFFF",
                outline: "none",
              }}
              required
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
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
              }}
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#1F1F1F",
                  border: "1px solid #333333",
                  borderRadius: "8px",
                  fontFamily: "Poppins, Helvetica, sans-serif",
                  fontSize: "0.875rem",
                  color: "#FFFFFF",
                  outline: "none",
                }}
                required
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
              >
                <img
                  src={mdiHide}
                  alt={showPassword ? "Hide password" : "Show password"}
                  style={{
                    width: "20px",
                    height: "20px",
                    opacity: 0.7,
                  }}
                />
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#fac1d9",
              border: "none",
              borderRadius: "8px",
              fontFamily: "Poppins, Helvetica, sans-serif",
              fontWeight: 500,
              fontSize: "0.875rem",
              color: "#111315",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              transition: "opacity 0.2s",
              marginTop: "8px",
            }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
