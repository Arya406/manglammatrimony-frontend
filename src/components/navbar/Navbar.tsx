"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { NAV_LINKS } from "@/data/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import styles from "./Navbar.module.css";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated: isLoggedIn, logout: authLogout } = useAuth();
  const pathname = usePathname();

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

  const handleLogout = () => {
    closeMobileMenu();
    authLogout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        {/* Brand Logo */}
        <Logo size="md" />

        {/* Desktop Navigation Links */}
        <nav className={styles.desktopNav} aria-label="Main Navigation">
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : link.href.startsWith("/#")
                  ? false
                  : pathname.startsWith(link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${
                      isActive ? styles.activeLink : ""
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Desktop Action Buttons */}
        <div className={styles.navActions}>
          {isLoggedIn ? (
            <>
              <Link href="/matches" className={styles.loginButton}>
                My Profile
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.logoutButton}
                aria-label="Logout of account"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.loginButton}>
                Login
              </Link>
              <Link href="/register" className={styles.registerButton}>
                Register Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          className={styles.mobileMenuBtn}
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation-drawer"
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
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

      {/* Mobile Drawer Overlay */}
      <div
        className={`${styles.mobileOverlay} ${isMobileMenuOpen ? styles.mobileOverlayOpen : ""}`}
        onClick={closeMobileMenu}
        aria-hidden={!isMobileMenuOpen}
      />

      {/* Mobile Navigation Drawer */}
      <div
        id="mobile-navigation-drawer"
        className={`${styles.mobileDrawer} ${isMobileMenuOpen ? styles.mobileDrawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        <div className={styles.mobileDrawerHeader}>
          <Logo size="sm" />
          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeMobileMenu}
            aria-label="Close navigation menu"
          >
            <svg
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile Navigation List">
          <ul className={styles.mobileNavList}>
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : link.href.startsWith("/#")
                  ? false
                  : pathname.startsWith(link.href);
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`${styles.mobileNavLink} ${
                      isActive ? styles.mobileActiveLink : ""
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.mobileActions}>
          {isLoggedIn ? (
            <>
              <Link
                href="/matches"
                className={styles.loginButton}
                onClick={closeMobileMenu}
                style={{ width: "100%", textAlign: "center" }}
              >
                My Profile
              </Link>
              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
                style={{ width: "100%", textAlign: "center" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={styles.loginButton}
                onClick={closeMobileMenu}
                style={{ width: "100%", textAlign: "center" }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={styles.registerButton}
                onClick={closeMobileMenu}
                style={{ width: "100%", textAlign: "center" }}
              >
                Register Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
