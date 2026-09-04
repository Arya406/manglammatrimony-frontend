"use client";

import React from "react";
import { AuthMethod } from "@/types/auth";
import styles from "./AuthMethodSelector.module.css";

interface AuthMethodSelectorProps {
  selectedMethod: AuthMethod;
  onSelectMethod: (method: AuthMethod) => void;
  disabled?: boolean;
}

export function AuthMethodSelector({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}: AuthMethodSelectorProps) {
  return (
    <div className={styles.selectorWrapper} role="tablist" aria-label="Registration method selection">
      <button
        type="button"
        role="tab"
        aria-selected={selectedMethod === "phone"}
        aria-controls="phone-registration-panel"
        disabled={disabled}
        className={`${styles.methodButton} ${
          selectedMethod === "phone" ? styles.selected : ""
        }`}
        onClick={() => onSelectMethod("phone")}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
            <path d="M12 18h.01" />
          </svg>
        </span>
        <span>Mobile Number</span>
      </button>

      <button
        type="button"
        role="tab"
        aria-selected={selectedMethod === "email"}
        aria-controls="email-registration-panel"
        disabled={disabled}
        className={`${styles.methodButton} ${
          selectedMethod === "email" ? styles.selected : ""
        }`}
        onClick={() => onSelectMethod("email")}
      >
        <span className={styles.icon} aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </span>
        <span>Email Address</span>
      </button>
    </div>
  );
}
