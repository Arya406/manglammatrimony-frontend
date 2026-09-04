"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  requestRegistrationOtp,
  saveVerificationState,
  getVerificationState,
} from "@/lib/api/auth";
import styles from "./RegisterForm.module.css";

export function RegisterForm() {
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = getVerificationState();
      return stored?.rawIdentifier || "";
    }
    return "";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailAddress(e.target.value);
    if (errorMessage) {
      setErrorMessage(null);
      setErrorCode(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorCode(null);

    const trimmedEmail = emailAddress.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const normalizedEmail = trimmedEmail.toLowerCase();
    setIsLoading(true);

    try {
      const response = await requestRegistrationOtp("email", normalizedEmail);

      if (!response.success) {
        setErrorMessage(response.message);
        setErrorCode(response.code || "REQUEST_FAILED");
        setIsLoading(false);
        return;
      }

      // Persist verification session reference for /register/verify
      saveVerificationState({
        verificationId: response.data.verificationId,
        method: "email",
        maskedIdentifier: response.data.maskedIdentifier,
        rawIdentifier: normalizedEmail,
        resendCooldownSeconds: response.data.resendCooldownSeconds,
        expiresInSeconds: response.data.expiresInSeconds,
        requestedAt: Date.now(),
      });

      // Navigate to verification screen
      router.push("/register/verify");
    } catch (err) {
      console.error("Registration error:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.headerGroup}>
        <span className={styles.goldEyebrow}>WELCOME TO MANGLAM</span>
        <h1 className={styles.title}>Create Your Account</h1>
        <p className={styles.subtitle}>
          Your journey toward finding a meaningful connection starts here.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Email Input Panel */}
        <div className={styles.inputGroup} id="email-registration-panel">
          <label htmlFor="email-input" className={styles.label}>
            Email Address
          </label>
          <input
            id="email-input"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            className={styles.emailInput}
            value={emailAddress}
            onChange={handleEmailChange}
            disabled={isLoading}
            autoFocus
          />
        </div>

        {/* Error Feedback Banner */}
        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <span className={styles.errorIcon} aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <div className={styles.errorText}>
              <p>{errorMessage}</p>
              {errorCode === "USER_ALREADY_EXISTS" && (
                <Link href="/login" className={styles.loginLink}>
                  Continue to Login →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Submit Action */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              <span>Sending Code...</span>
            </>
          ) : (
            <>
              <span>Continue with Email</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Legal Consent Notice */}
        <p className={styles.consentText}>
          By continuing, you agree to our{" "}
          <Link href="/terms" className={styles.legalLink}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={styles.legalLink}>
            Privacy Policy
          </Link>
          .
        </p>

        {/* Trust Indicators */}
        <div className={styles.trustRow}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span>Secure Verification</span>
          </div>

          <div className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
            <span>Privacy Protected</span>
          </div>
        </div>
      </form>
    </div>
  );
}
