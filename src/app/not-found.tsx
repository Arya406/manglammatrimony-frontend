"use client";

import React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { Footer } from "@/components/footer/Footer";
import { useAuth } from "@/lib/auth/AuthContext";
import styles from "./not-found.module.css";

export default function NotFoundPage() {
  const { authStatus } = useAuth();

  const isAuth = authStatus === "AUTHENTICATED";

  const primaryHref = isAuth ? "/matches" : "/";
  const primaryLabel = isAuth ? "Return to Matches" : "Back to Home";

  return (
    <div className={styles.pageContainer}>
      <SiteHeader />

      <main className={styles.mainContent}>
        <div className={styles.notFoundCard}>
          <div className={styles.emblemWrapper} aria-hidden="true">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <span className={styles.codeBadge}>404 — PAGE NOT FOUND</span>
          <h1 className={styles.headline}>We Couldn&apos;t Find That Page</h1>
          <p className={styles.description}>
            The destination you requested may have been moved, renamed, or is temporarily unavailable. Let us guide you back to meaningful connections.
          </p>

          <div className={styles.ctaGroup}>
            <Link href={primaryHref} className={styles.primaryCta}>
              <span>{primaryLabel}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            <div className={styles.secondaryRow}>
              {isAuth && (
                <Link href="/onboarding/review" className={styles.secondaryLink}>
                  My Profile
                </Link>
              )}
              <Link href="/help" className={styles.secondaryLink}>
                Help Center
              </Link>
              <Link href="/membership" className={styles.secondaryLink}>
                Membership
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
