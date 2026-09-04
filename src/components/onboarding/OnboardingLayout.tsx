"use client";

import React from "react";
import { OnboardingHeader } from "./OnboardingHeader";
import styles from "./OnboardingLayout.module.css";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  onSaveAndExit?: () => void;
}

export function OnboardingLayout({
  children,
  onSaveAndExit,
}: OnboardingLayoutProps) {
  return (
    <div className={styles.layoutWrapper}>
      <OnboardingHeader onSaveAndExit={onSaveAndExit} />

      <main className={styles.mainContent}>
        {/* Subtle background decorative ornament */}
        <div className={styles.bgOrnament} aria-hidden="true" />

        <div className={styles.contentContainer}>{children}</div>
      </main>

      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} Manglam Matrimony. Built with privacy and
          trust.
        </p>
      </footer>
    </div>
  );
}
