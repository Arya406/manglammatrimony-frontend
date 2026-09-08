"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import styles from "./CinematicNavbar.module.css";

export function CinematicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    },
    [isMobileMenuOpen]
  );

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen, handleKeyDown]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className={styles.header} role="banner">
      <div className={styles.navContainer}>
        {/* Brand Logo - Inverse variant for crisp contrast against dark video/vignette */}
        <Logo variant="inverse" size="md" />

        {/* Desktop Actions */}
        <nav className={styles.desktopActions} aria-label="Main Navigation">
          <Link href="/login" className={styles.loginLink} id="nav-login-btn">
            Login
          </Link>
          <Link href="/register" className={styles.ctaButton} id="nav-register-btn">
            Find Your Match
          </Link>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="cinematic-mobile-drawer"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          id="nav-mobile-toggle"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`${styles.drawerOverlay} ${isMobileMenuOpen ? styles.drawerOverlayOpen : ""}`}
        onClick={closeMobileMenu}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Mobile Drawer */}
      <div
        id="cinematic-mobile-drawer"
        className={`${styles.drawer} ${isMobileMenuOpen ? styles.drawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        <div className={styles.drawerHeader}>
          <Logo variant="inverse" size="sm" />
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.drawerBody}>
          <Link
            href="/login"
            className={styles.drawerLoginLink}
            onClick={closeMobileMenu}
            id="mobile-drawer-login"
          >
            Login
          </Link>
          <Link
            href="/register"
            className={styles.drawerCtaButton}
            onClick={closeMobileMenu}
            id="mobile-drawer-register"
          >
            Find Your Match
          </Link>
        </div>

        <div className={styles.drawerFooter}>
          <span className={styles.drawerTagline}>Where Two Lives Become One Story</span>
        </div>
      </div>
    </header>
  );
}
