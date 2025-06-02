// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import mdiHide from "./mdi-hide.svg";

export default function Login(): JSX.Element {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with real authentication via Tauri
    navigate("/dashboard");
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
          padding: "60px 60px",   // ↑ increased top/bottom & side padding
          width: "100%",
          maxWidth: 550,          // keep the card from growing too wide
          maxHeight: 700,
          boxSizing: "border-box",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "32px",            // ↑ increased gap between header and form
        }}
      >
        {/* CARD HEADER */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.875rem",                   // 30px
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
              fontWeight: 400,                        // Poppins-Regular
              fontSize: "0.875rem",                   // 14px
              color: "#E5E7EB",                       // lighter gray
              textAlign: "center",
            }}
          >
            Please enter your credentials below to continue
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",  // ↑ increased gap between field groups
          }}
        >
          {/* USERNAME FIELD */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label
              htmlFor="username"
              style={{
                fontFamily: "Poppins, Helvetica, sans-serif",
                fontWeight: 500,          // Poppins-Medium
                fontSize: "0.875rem",     // 14px
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
                height: 48,              // fixed height
                display: "flex",
                alignItems: "center",
                paddingLeft: 16,
                paddingRight: 48,        // room for an icon
              }}
            >
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#E5E7EB",
                  fontFamily: "Poppins, Helvetica, sans-serif",
                  fontWeight: 300,       // Poppins-Light
                  fontSize: "1rem",      // 16px
                  padding: 0,
                }}
              />
              <img
                src={mdiHide}
                alt=""
                style={{
                  position: "absolute",
                  right: 16,
                  width: 20,
                  height: 20,
                  opacity: 0,            // hide for now
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
                fontWeight: 500,         // Poppins-Medium
                fontSize: "0.875rem",    // 14px
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
                paddingRight: 48,       // room for the eye icon
              }}
            >
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#E5E7EB",
                  fontFamily: "Poppins, Helvetica, sans-serif",
                  fontWeight: 300,     // Poppins-Light
                  fontSize: "1rem",    // 16px
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
                // TODO: wire up onClick to toggle input.type
              />
            </div>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            style={{
              marginTop: "16px",      // ↑ leave extra space above button
              width: "100%",
              height: 48,
              backgroundColor: "#fac1d9",
              border: "none",
              borderRadius: 12,
              fontFamily: "Poppins, Helvetica, sans-serif",
              fontWeight: 500,
              fontSize: "1rem",
              color: "#333333",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}