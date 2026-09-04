"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import styles from "./SearchDiscoveryModal.module.css";

interface SearchDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDiscoveryModal({
  isOpen,
  onClose,
}: SearchDiscoveryModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close dialog"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.headerIcon} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <h3 id="search-modal-title" className={styles.title}>
          Member-Protected Discovery
        </h3>

        <p className={styles.description}>
          To protect candidate privacy and family details, full profile discovery and search filters are exclusively available to verified Manglam Matrimony members.
        </p>

        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>100% manually moderated and verified profiles</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>Privacy-safe photos with metadata protection</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>Curated recommendations matching your cultural heritage</span>
          </div>
        </div>

        <div className={styles.ctaGroup}>
          <Link
            href="/register"
            className={styles.registerCta}
            onClick={onClose}
          >
            <span>Create Free Profile to Search</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/login"
            className={styles.loginCta}
            onClick={onClose}
          >
            Already a member? Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
