"use client";

import React, { useEffect } from "react";
import { MembershipPlan } from "@/data/membershipPlans";
import styles from "./MembershipModal.module.css";

interface MembershipModalProps {
  plan: MembershipPlan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MembershipModal({ plan, isOpen, onClose }: MembershipModalProps) {
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

  if (!isOpen || !plan) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="membership-modal-title"
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

        <div className={styles.headerIcon} aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        </div>

        <h3 id="membership-modal-title" className={styles.title}>
          Membership Enrollment
        </h3>

        <div className={styles.planSnippet}>
          <span>Selected Plan:</span>
          <strong>{plan.duration} ({plan.formattedPrice})</strong>
        </div>

        <p className={styles.noticeText}>
          Online payment checkout and automated subscription management will be available soon.
        </p>

        <div className={styles.callout}>
          <strong>Complimentary Access Notice:</strong> No payment has been charged. All core profile discovery, matching filters, and direct 1-on-1 message requests are currently complimentary for verified Manglam Matrimony members.
        </div>

        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={styles.secondaryAction}
            onClick={onClose}
          >
            Back to Plans
          </button>
          <button
            type="button"
            className={styles.primaryAction}
            onClick={onClose}
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
