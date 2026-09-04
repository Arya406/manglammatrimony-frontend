"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  requestLoginOtp,
  saveVerificationState,
  getVerificationState,
} from "@/lib/api/auth";
import styles from "./LoginForm.module.css";

export function LoginForm() {
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
      const response = await requestLoginOtp("email", normalizedEmail);

      if (!response.success) {
        setErrorMessage(response.message);
        setErrorCode(response.code || "REQUEST_FAILED");
        setIsLoading(false);
        return;
      }

      // Persist verification session reference for /login/verify
      saveVerificationState({
        verificationId: response.data.verificationId,
        method: "email",
        maskedIdentifier: response.data.maskedIdentifier,
        rawIdentifier: normalizedEmail,
        resendCooldownSeconds: response.data.resendCooldownSeconds,
        expiresInSeconds: response.data.expiresInSeconds,
        requestedAt: Date.now(),
      });

      // Navigate to login verification screen
      router.push("/login/verify");
    } catch (err) {
      console.error("Login OTP request error:", err);
      setErrorMessage("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* Header Group */}
      <div className={styles.headerGroup}>
        <span className={styles.goldEyebrow}>SECURE ACCESS</span>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Log in securely with your email to access your Manglam Matrimony account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <div className={styles.inputGroup} id="email-login-panel">
          <label htmlFor="login-email-input" className={styles.label}>
            Email Address
          </label>
          <input
            id="login-email-input"
            type="email"
            placeholder="Enter your registered email address"
            value={emailAddress}
            onChange={handleEmailChange}
            disabled={isLoading}
            autoFocus
            autoComplete="email"
            className={styles.emailInput}
            aria-describedby={errorMessage ? "login-error-banner" : undefined}
          />
        </div>

        {/* Error Banner with Account Creation Helper */}
        {errorMessage && (
          <div
            id="login-error-banner"
            role="alert"
            className={styles.errorBanner}
          >
            <svg
              className={styles.errorIcon}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className={styles.errorTextContainer}>
              <span>
                {errorCode === "USER_NOT_FOUND"
                  ? "We couldn't find an account with this email address."
                  : errorMessage}
              </span>
              {errorCode === "USER_NOT_FOUND" && (
                <div className={styles.registerLinkWrap}>
                  <Link href="/register" className={styles.createAccountLink}>
                    Create an account →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={styles.submitButton}
        >
          {isLoading ? (
            <span className={styles.buttonLoadingContent}>
              <span className={styles.spinner} aria-hidden="true" />
              <span>Sending Code...</span>
            </span>
          ) : (
            <span className={styles.buttonContent}>
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
            </span>
          )}
        </button>

        {/* Footer Registration Link inside Form Area */}
        <div className={styles.cardFooter}>
          <span>Don&apos;t have an account?</span>
          <Link href="/register" className={styles.footerRegisterLink}>
            Register Free
          </Link>
        </div>

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
