"use client";

import React, { useEffect } from "react";
import styles from "./ContactSupportModal.module.css";

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
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
      aria-labelledby="support-modal-title"
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
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.iconWrapper} aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </div>

        <h3 id="support-modal-title" className={styles.title}>
          Contact Member Support
        </h3>

        <p className={styles.intro}>
          Our team is available to assist you with account verification, profile adjustments, and membership inquiries.
        </p>

        <div className={styles.channelBox}>
          <span className={styles.channelLabel}>Official Support Email</span>
          <a
            href="mailto:support@manglammatrimony.com?subject=Manglam%20Matrimony%20Support%20Inquiry"
            className={styles.emailLink}
          >
            support@manglammatrimony.com
          </a>
        </div>

        <p className={styles.hoursInfo}>
          Desk Operating Hours: Monday to Saturday, 9:30 AM – 6:30 PM IST. Please include your registered email address for faster account assistance.
        </p>

        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={styles.closeAction}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
