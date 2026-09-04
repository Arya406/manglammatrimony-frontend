"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VerificationState } from "@/types/auth";
import {
  getVerificationState,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  saveVerificationState,
  clearVerificationState,
  saveAuthSession,
} from "@/lib/api/auth";
import { OtpInput } from "./OtpInput";
import styles from "./OtpVerification.module.css";

export function OtpVerification() {
  const router = useRouter();
  const [session, setSession] = useState<VerificationState | null>(() => {
    return getVerificationState();
  });

  const [cooldown, setCooldown] = useState<number>(() => {
    const stored = getVerificationState();
    if (!stored) return 60;
    const elapsedSeconds = Math.floor((Date.now() - stored.requestedAt) / 1000);
    return Math.max(0, (stored.resendCooldownSeconds || 60) - elapsedSeconds);
  });

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If no session found, redirect back to /register
  useEffect(() => {
    if (!session || !session.verificationId) {
      router.replace("/register");
    }
  }, [session, router]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerifyOtp = useCallback(
    async (codeToVerify?: string) => {
      const targetOtp = codeToVerify || otp;
      if (!session || targetOtp.length !== 6 || isSuccess) return;

      setIsVerifying(true);
      setErrorMessage(null);

      try {
        const response = await verifyRegistrationOtp(
          session.verificationId,
          targetOtp
        );

        if (!response.success) {
          let msg = response.message || "Failed to verify code. Please try again.";
          if (response.code === "OTP_EXPIRED") {
            msg = "This verification code has expired. Please request a new code.";
          } else if (
            response.code === "OTP_MAX_ATTEMPTS" ||
            response.code === "TOO_MANY_ATTEMPTS"
          ) {
            msg = "Maximum verification attempts exceeded. Please request a new code.";
          } else if (response.code === "INVALID_OTP") {
            msg = "The verification code is invalid. Please double check the 6 digits and try again.";
          }
          setErrorMessage(msg);
          setIsVerifying(false);
          return;
        }

        setIsSuccess(true);
        setIsVerifying(false);

        // Save authentication session for subsequent onboarding steps
        if (response.data.token) {
          saveAuthSession({
            token: response.data.token,
            user: response.data.user,
          });
        }

        // Clean up temporary verification session
        clearVerificationState();

        // Redirect to onboarding as specified in the contract
        setTimeout(() => {
          router.push(response.data.redirectTo || "/onboarding");
        }, 800);
      } catch (err) {
        console.error("Verification error:", err);
        setErrorMessage("Something went wrong while verifying. Please try again.");
        setIsVerifying(false);
      }
    },
    [session, otp, router, isSuccess]
  );

  const handleResend = async () => {
    if (!session || cooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const response = await resendRegistrationOtp(session.verificationId);

      if (!response.success) {
        setErrorMessage(response.message);
        setIsResending(false);
        return;
      }

      // Update stored session with new cooldown & timestamp
      const updatedSession: VerificationState = {
        ...session,
        verificationId: response.data.verificationId,
        resendCooldownSeconds: response.data.resendCooldownSeconds,
        expiresInSeconds: response.data.expiresInSeconds,
        requestedAt: Date.now(),
      };
      saveVerificationState(updatedSession);
      setSession(updatedSession);
      setCooldown(response.data.resendCooldownSeconds || 60);
      setOtp("");
      setIsResending(false);
    } catch (err) {
      console.error("Resend error:", err);
      setErrorMessage("Failed to resend code. Please try again.");
      setIsResending(false);
    }
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (!session) {
    return (
      <div className={styles.verificationCard}>
        <p className={styles.subtitle}>Loading verification session...</p>
      </div>
    );
  }

  return (
    <div className={styles.verificationCard}>
      <div className={styles.headerGroup}>
        <span className={styles.goldEyebrow}>VERIFY YOUR ACCOUNT</span>
        <h1 className={styles.title}>Enter Verification Code</h1>
        <p className={styles.subtitle}>
          We&apos;ve sent a 6-digit verification code to
          <br />
          <span className={styles.maskedTarget}>
            {session.maskedIdentifier}
          </span>
        </p>
        <div className={styles.changeIdentifierRow}>
          <Link href="/register" className={styles.changeLink}>
            ← Change email address
          </Link>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          handleVerifyOtp();
        }}
      >
        {/* 6-box OTP Input */}
        <OtpInput
          value={otp}
          onChange={(newVal) => {
            setOtp(newVal);
            if (errorMessage) setErrorMessage(null);
          }}
          onComplete={(completedOtp) => {
            handleVerifyOtp(completedOtp);
          }}
          disabled={isVerifying || isSuccess}
        />

        {/* Success Feedback */}
        {isSuccess && (
          <div className={styles.successBanner} role="status">
            <span className={styles.successIcon} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <p>Verification successful! Redirecting to setup...</p>
          </div>
        )}

        {/* Error Feedback */}
        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <span className={styles.errorIcon} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Resend Cooldown Section */}
        <div className={styles.resendRow}>
          <span>Didn&apos;t receive the code?</span>
          {cooldown > 0 ? (
            <span className={styles.cooldownBadge}>
              Resend in {formatTimer(cooldown)}
            </span>
          ) : (
            <button
              type="button"
              className={styles.resendButton}
              onClick={handleResend}
              disabled={isResending || isSuccess}
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          )}
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          className={styles.verifyButton}
          disabled={otp.length !== 6 || isVerifying || isSuccess}
        >
          {isSuccess ? (
            <span>Verified Successfully!</span>
          ) : isVerifying ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify &amp; Continue</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className={styles.trustRow}>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span>Secure Verification</span>
          </div>

          <div className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
