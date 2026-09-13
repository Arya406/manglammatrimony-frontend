"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { requestActivationOtp, verifyActivationOtp } from "@/lib/api/auth";
import { saveAuthSession } from "@/lib/auth/authSession";

function ActivateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(urlEmail);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const [prevUrlEmail, setPrevUrlEmail] = useState(urlEmail);
  if (urlEmail !== prevUrlEmail) {
    setPrevUrlEmail(urlEmail);
    if (!email) {
      setEmail(urlEmail);
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    if (!trimmedEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyActivationOtp({
        email: trimmedEmail,
        otp: trimmedOtp,
      });

      if (!res.success) {
        if (res.code === "ACCOUNT_ALREADY_ACTIVATED") {
          setErrorMessage(
            "This account has already completed ownership verification. Please proceed to login."
          );
        } else if (res.code === "OTP_EXPIRED") {
          setErrorMessage("This verification code has expired. Please request a new code.");
        } else if (res.code === "OTP_MAX_ATTEMPTS") {
          setErrorMessage("Maximum verification attempts exceeded. Please request a new code.");
        } else if (res.code === "ACCOUNT_SUSPENDED") {
          setErrorMessage("This account is currently suspended. Please contact support.");
        } else if (res.code === "ACCOUNT_BLOCKED") {
          setErrorMessage("This account has been blocked. Please contact support.");
        } else if (res.code === "ACCOUNT_DELETED") {
          setErrorMessage("This account has been deleted.");
        } else {
          setErrorMessage(res.message || "Invalid verification code. Please check and try again.");
        }
        return;
      }

      saveAuthSession({ token: res.data.token, user: res.data.user });
      setSuccessMessage("Account verified and activated! Redirecting to setup your profile...");
      setTimeout(() => {
        router.push(res.data.redirectTo || "/onboarding");
      }, 1200);
    } catch (err) {
      console.error("[ACTIVATION VERIFY ERROR]:", err);
      setErrorMessage("A network or server error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address to request a new code.");
      return;
    }

    if (isResending || cooldown > 0) return;

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await requestActivationOtp(trimmedEmail);
      if (!res.success) {
        if (res.code === "OTP_COOLDOWN") {
          setErrorMessage(res.message);
        } else if (res.code === "ACCOUNT_ALREADY_ACTIVATED") {
          setErrorMessage("This account is already activated. Please log in directly.");
        } else {
          setErrorMessage(res.message || "Failed to resend activation code. Please try again.");
        }
        return;
      }

      setSuccessMessage("A fresh 6-digit activation code has been sent to your email.");
      setCooldown(res.data?.resendCooldownSeconds || 60);
    } catch (err) {
      console.error("[ACTIVATION RESEND ERROR]:", err);
      setErrorMessage("Unable to connect to the server. Please check your connection.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-ivory, #FAF8F5)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-bricolage, sans-serif)",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border, #E5E7EB)",
          backgroundColor: "#FFFFFF",
        }}
      >
        <Logo size="md" />
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary, #4B5563)" }}>
            Already claimed?
          </span>
          <Link
            href="/login"
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-maroon, #8B1538)",
              textDecoration: "none",
            }}
          >
            Sign In &rarr;
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
            border: "1px solid var(--color-border, #E5E7EB)",
            padding: "36px 32px",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                backgroundColor: "#FFFBEB",
                border: "2px solid #FDE68A",
                color: "#B45309",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-maroon, #8B1538)",
                margin: "0 0 8px",
                letterSpacing: "-0.01em",
              }}
            >
              Claim &amp; Activate Account
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary, #4B5563)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Enter your email and the 6-digit verification code sent to claim ownership of your profile.
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#991B1B",
                fontSize: "0.8125rem",
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0, marginTop: "2px" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                backgroundColor: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderRadius: "8px",
                padding: "12px 14px",
                color: "#065F46",
                fontSize: "0.8125rem",
                marginBottom: "20px",
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ flexShrink: 0, marginTop: "2px" }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div>{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Email Input */}
            <div>
              <label
                htmlFor="activation-email"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary, #111827)",
                  marginBottom: "6px",
                }}
              >
                Registered Email Address
              </label>
              <input
                id="activation-email"
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isVerifying}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border, #E5E7EB)",
                  fontSize: "0.9375rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* OTP Input */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <label
                  htmlFor="activation-otp"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary, #111827)",
                  }}
                >
                  6-Digit Activation Code
                </label>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: cooldown > 0 ? "var(--color-text-muted, #9CA3AF)" : "var(--color-maroon, #8B1538)",
                    cursor: cooldown > 0 || isResending ? "not-allowed" : "pointer",
                    padding: 0,
                  }}
                >
                  {isResending
                    ? "Sending..."
                    : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend Code"}
                </button>
              </div>
              <input
                id="activation-otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                }}
                disabled={isVerifying}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "8px",
                  border: "2px solid var(--color-border, #E5E7EB)",
                  fontSize: "1.5rem",
                  letterSpacing: "0.35em",
                  textAlign: "center",
                  fontWeight: 700,
                  color: "var(--color-maroon, #8B1538)",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "monospace",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor:
                  isVerifying || otp.length !== 6
                    ? "#9CA3AF"
                    : "var(--color-maroon, #8B1538)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.9375rem",
                cursor: isVerifying || otp.length !== 6 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 2px 4px rgba(139, 21, 56, 0.2)",
                transition: "background-color 0.15s ease",
              }}
            >
              {isVerifying && (
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#FFFFFF",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
              )}
              {isVerifying ? "Verifying..." : "Verify & Claim Account"}
            </button>
          </form>

          {/* Footer Assistance */}
          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid var(--color-border, #E5E7EB)",
              textAlign: "center",
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary, #4B5563)",
            }}
          >
            Need help claiming your account?{" "}
            <Link
              href="/contact"
              style={{
                color: "var(--color-maroon, #8B1538)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-ivory, #FAF8F5)",
            color: "var(--color-maroon, #8B1538)",
            fontWeight: 600,
          }}
        >
          Loading Activation...
        </div>
      }
    >
      <ActivateContent />
    </Suspense>
  );
}
