"use client";

import React, { useEffect, useRef } from "react";
import styles from "./ApplicationUnderReviewModal.module.css";

interface ApplicationUnderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationUnderReviewModal({
  isOpen,
  onClose,
}: ApplicationUnderReviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Focus trap & escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Focus primary action button when modal opens
    buttonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      onClick={onClose}
    >
      <div
        className={styles.modalCard}
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Verification Icon */}
        <div className={styles.iconWrapper} aria-hidden="true">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        <span className={styles.eyebrow}>SUBMISSION RECEIVED</span>
        <h2 id="review-modal-title" className={styles.title}>
          Application Under Review
        </h2>

        <p className={styles.bodyText}>
          Your profile has been submitted successfully and is now under review.
          Our team will review your information and notify you once the review is complete.
        </p>

        {/* Current State Indicator */}
        <div className={styles.statusNotice}>
          <span className={styles.statusBadge}>IN_REVIEW</span>
          <p className={styles.statusText}>
            You can view or update your profile information anytime while under review.
          </p>
        </div>

        {/* Action Button */}
        <div className={styles.actions}>
          <button
            ref={buttonRef}
            type="button"
            className={styles.primaryButton}
            onClick={onClose}
          >
            <span>View My Profile</span>
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
          </button>
        </div>

        {/* Trust Note */}
        <div className={styles.trustNote} aria-hidden="true">
          <svg
            width="12"
            height="12"
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
          <span>Your data is safe and encrypted</span>
        </div>
      </div>
    </div>
  );
}
