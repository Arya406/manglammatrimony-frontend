"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";
import { loginAdmin } from "@/lib/api/admin";
import { Logo } from "@/components/common/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginAdmin(trimmedEmail, password);

      if (res.success && res.data) {
        login(res.data);
        router.replace("/admin");
      } else {
        setErrorMessage(res.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      setErrorMessage("Unable to connect to the administration server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-ivory)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "var(--font-bricolage)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* Top minimal header */}
      <header
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Logo size="sm" href="/" />
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backgroundColor: "rgba(123, 17, 35, 0.08)",
              color: "var(--color-maroon)",
              padding: "4px 8px",
              borderRadius: "4px",
            }}
          >
            Admin V1
          </span>
        </div>

        <Link
          href="/"
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-maroon)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
        >
          <span>&larr;</span> Back to Manglam Matrimony
        </Link>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "960px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid var(--color-border)",
            boxShadow: "0 12px 36px rgba(123, 17, 35, 0.06)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          {/* Left Hero / Brand Statement Side */}
          <div
            style={{
              padding: "48px 40px",
              backgroundColor: "var(--color-maroon-dark)",
              color: "#FFFFFF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  backgroundColor: "rgba(197, 155, 39, 0.18)",
                  border: "1px solid rgba(197, 155, 39, 0.35)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  color: "#F3E8C8",
                  textTransform: "uppercase",
                  marginBottom: "28px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#C59B27",
                  }}
                />
                Platform Governance
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
                  fontWeight: 700,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                  marginBottom: "16px",
                }}
              >
                Manglam Matrimony Administration
              </h1>

              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.6,
                  color: "rgba(255, 255, 255, 0.82)",
                  marginBottom: "32px",
                }}
              >
                Restricted portal for verified operations, matrimonial discovery monitoring,
                and real-time platform metrics.
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                paddingTop: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.8125rem",
                color: "rgba(255, 255, 255, 0.65)",
              }}
            >
              <span>Security Tier: <strong>Enterprise L1</strong></span>
              <span>PostgreSQL &bull; Active</span>
            </div>
          </div>

          {/* Right Login Form Side */}
          <div
            style={{
              padding: "48px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ marginBottom: "28px" }}>
              <h2
                style={{
                  fontSize: "1.375rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.01em",
                  marginBottom: "6px",
                }}
              >
                Administrative Sign In
              </h2>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
                Enter your authorized administrative credentials to proceed.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                style={{
                  backgroundColor: "#FDF2F2",
                  border: "1px solid #F8B4B4",
                  color: "#9B1C1C",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "1rem", lineHeight: 1 }}>&times;</span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Email Address */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="admin-email"
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Email Address
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    height: "46px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FAFAFA",
                    fontSize: "0.9375rem",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-maroon)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(123, 17, 35, 0.12)";
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--color-border)";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.backgroundColor = "#FAFAFA";
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: "28px" }}>
                <label
                  htmlFor="admin-password"
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      height: "46px",
                      padding: "0 46px 0 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "#FAFAFA",
                      fontSize: "0.9375rem",
                      color: "var(--color-text-primary)",
                      outline: "none",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-maroon)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(123, 17, 35, 0.12)";
                      e.currentTarget.style.backgroundColor = "#FFFFFF";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.backgroundColor = "#FAFAFA";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                      padding: "4px 6px",
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-maroon)",
                  color: "#FFFFFF",
                  border: "none",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background-color 0.2s, transform 0.1s",
                  opacity: isLoading ? 0.75 : 1,
                  boxShadow: "0 4px 12px rgba(123, 17, 35, 0.24)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = "var(--color-maroon-dark)";
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.currentTarget.style.backgroundColor = "var(--color-maroon)";
                }}
              >
                {isLoading ? (
                  <>
                    <span
                      style={{
                        width: "18px",
                        height: "18px",
                        border: "2px solid rgba(255, 255, 255, 0.4)",
                        borderTopColor: "#FFFFFF",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                    Verifying Credentials...
                  </>
                ) : (
                  "Sign In to Administration"
                )}
              </button>
            </form>

            <div
              style={{
                marginTop: "24px",
                textAlign: "center",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              Restricted system. Unauthorized access attempts are monitored and logged.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: "16px 24px",
          textAlign: "center",
          fontSize: "0.8125rem",
          color: "var(--color-text-muted)",
          borderTop: "1px solid var(--color-border)",
          backgroundColor: "#FFFFFF",
        }}
      >
        &copy; {new Date().getFullYear()} Manglam Matrimony. All rights reserved.
      </footer>
    </div>
  );
}
