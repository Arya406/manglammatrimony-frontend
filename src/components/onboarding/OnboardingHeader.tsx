"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/lib/auth/AuthContext";
import styles from "./OnboardingHeader.module.css";

interface OnboardingHeaderProps {
  onSaveAndExit?: () => void;
  showLogout?: boolean;
}

export function OnboardingHeader({
  onSaveAndExit,
  showLogout = true,
}: OnboardingHeaderProps) {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoWrapper}>
          <Logo size="md" href="/matches" />
        </div>

        <div className={styles.actionWrapper}>
          {onSaveAndExit ? (
            <button
              type="button"
              onClick={onSaveAndExit}
              className={styles.saveExitButton}
              aria-label="Save progress and return to matches"
            >
              Save & Exit
            </button>
          ) : (
            <Link
              href="/matches"
              className={styles.saveExitButton}
              aria-label="Save progress and return to matches"
            >
              Save & Exit
            </Link>
          )}

          {showLogout && (
            <button
              type="button"
              onClick={handleLogout}
              className={styles.logoutButton}
              aria-label="Log out of your account"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
