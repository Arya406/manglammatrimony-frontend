"use client";

import React from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppHeader } from "./AppHeader";
import { Navbar } from "@/components/navbar/Navbar";
import { Logo } from "@/components/common/Logo";
import styles from "./SiteHeader.module.css";

/**
 * Unified, dynamic header component for dual-access pages (e.g. /membership, /help).
 *
 * Behavior:
 * - AUTH_LOADING: Stable brand placeholder to prevent hydration flicker or premature redirects.
 * - AUTH_ERROR: Non-destructive error bar with retry action (tokens preserved).
 * - AUTHENTICATED: Full authenticated AppHeader (adapts for ACTIVE vs IN_REVIEW).
 * - UNAUTHENTICATED: Public marketing Navbar with Login & Register Free.
 */
export function SiteHeader() {
  const { authStatus, error, retryValidation } = useAuth();

  if (authStatus === "AUTH_LOADING") {
    return (
      <header className={styles.placeholderHeader} aria-label="Loading Navigation">
        <div className={styles.headerContainer}>
          <div className={styles.brandGroup}>
            <Logo size="md" />
          </div>
          <div className={styles.skeletonGroup}>
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
            <div className={styles.skeletonPill} />
          </div>
        </div>
      </header>
    );
  }

  if (authStatus === "AUTH_ERROR") {
    return (
      <header className={styles.placeholderHeader}>
        <div className={styles.errorBanner} role="alert">
          <span>{error || "Unable to reach verification server."}</span>
          <button
            type="button"
            className={styles.retryButton}
            onClick={() => retryValidation()}
          >
            Retry Connection
          </button>
        </div>
        <div className={styles.headerContainer}>
          <div className={styles.brandGroup}>
            <Logo size="md" />
          </div>
        </div>
      </header>
    );
  }

  if (authStatus === "AUTHENTICATED") {
    return <AppHeader />;
  }

  // Confirmed UNAUTHENTICATED
  return <Navbar />;
}
