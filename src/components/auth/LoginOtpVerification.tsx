"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VerificationState } from "@/types/auth";
import {
  getVerificationState,
  verifyLoginOtp,
  resendLoginOtp,
  saveVerificationState,
  clearVerificationState,
  saveAuthSession,
} from "@/lib/api/auth";
import { getProfile } from "@/lib/api/profile";
import { getProfileRedirectRoute } from "@/lib/auth/getProfileRedirectRoute";
import { OtpInput } from "./OtpInput";
import styles from "./LoginOtpVerification.module.css";

export function LoginOtpVerification() {
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

  // If no active session found, redirect back to /login
  useEffect(() => {
    if (!session || !session.verificationId) {
      router.replace("/login");
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
        const response = await verifyLoginOtp(
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

        // 1. Save authentication session
        if (response.data.token) {
          saveAuthSession({
            token: response.data.token,
            user: response.data.user,
          });
        }

        // 2. Clear temporary verification session
        clearVerificationState();

        // 3. Retrieve actual profile state to determine exact destination
        let targetRoute = response.data.redirectTo || "/onboarding";
        try {
          const profileResponse = await getProfile();
          if (profileResponse.success && profileResponse.data) {
            targetRoute = getProfileRedirectRoute(profileResponse.data);
          }
        } catch (profileErr) {
          console.warn("Could not determine detailed profile route, using backend route", profileErr);
        }

        // 4. Navigate to target route after brief success display
        setTimeout(() => {
          router.push(targetRoute);
        }, 800);
      } catch (err) {
        console.error("Login verification error:", err);
        setErrorMessage("Something went wrong while verifying. Please try again.");
        setIsVerifying(false);
      }
    },
    [session, otp, router, isSuccess]
  );

  const handleResend = async () => {
    if (!session || cooldown > 0 || isResending || isSuccess) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const response = await resendLoginOtp(session.verificationId);

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
      setErrorMessage("Unable to resend verification code. Please try again.");
      setIsResending(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className={styles.verificationCard}>
      {/* Header Group */}
      <div className={styles.headerGroup}>
        <span className={styles.goldEyebrow}>SECURITY CHECK</span>
        <h1 className={styles.title}>Verify it&apos;s you</h1>
        <p className={styles.subtitle}>
          We&apos;ve sent a 6-digit verification code to{" "}
          <strong className={styles.maskedTarget}>
            {session.maskedIdentifier}
          </strong>
        </p>

        <div className={styles.changeIdentifierRow}>
          <Link href="/login" className={styles.changeLink}>
            <span>← Change email address</span>
          </Link>
        </div>
      </div>

      {/* Form with 6-Digit OTP */}
      <div className={styles.form}>
        <div className={styles.otpWrapper}>
          <OtpInput
            value={otp}
            onChange={(newOtp) => {
              setOtp(newOtp);
              if (errorMessage) setErrorMessage(null);
            }}
            onComplete={(fullOtp) => {
              handleVerifyOtp(fullOtp);
            }}
            disabled={isVerifying || isSuccess}
          />
        </div>

        {/* Success Feedback */}
        {isSuccess && (
          <div role="status" className={styles.successBanner}>
            <span className={styles.successIcon} aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span>Verification successful! Redirecting to your dashboard...</span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div role="alert" className={styles.errorBanner}>
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
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resend OTP Section */}
        <div className={styles.resendRow}>
          <span>Didn&apos;t receive the code?</span>
          {cooldown > 0 ? (
            <span className={styles.cooldownBadge}>
              Resend in <strong>{cooldown}s</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isVerifying || isSuccess}
              className={styles.resendButton}
            >
              {isResending ? "Sending code..." : "Resend OTP"}
            </button>
          )}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => handleVerifyOtp()}
          disabled={otp.length !== 6 || isVerifying || isSuccess}
          className={styles.submitButton}
        >
          {isSuccess ? (
            <span className={styles.buttonContent}>
              <span>Verified Successfully!</span>
            </span>
          ) : isVerifying ? (
            <span className={styles.buttonLoadingContent}>
              <span className={styles.spinner} aria-hidden="true" />
              <span>Verifying...</span>
            </span>
          ) : (
            <span className={styles.buttonContent}>
              <span>Verify &amp; Login</span>
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

        {/* Back to Login Link */}
        <div className={styles.cardFooter}>
          <Link href="/login" className={styles.footerBackLink}>
            ← Back to Login
          </Link>
        </div>

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
      </div>
    </div>
  );
}
