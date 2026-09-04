import React from "react";
import { ProfileCreatedFor, ProfileCreatedForOption } from "@/types/profile";
import styles from "./ProfileCreatedForCapsule.module.css";

interface ProfileCreatedForCapsuleProps {
  option: ProfileCreatedForOption;
  isSelected: boolean;
  onSelect: (value: ProfileCreatedFor) => void;
  disabled?: boolean;
}

function getCapsuleIcon(value: ProfileCreatedFor, isSelected: boolean) {
  const strokeColor = isSelected ? "#FFFFFF" : "#7B1123";
  const accentColor = isSelected ? "#F3E8C8" : "#C59B27";

  switch (value) {
    case "MYSELF":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="7" r="4" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="7" r="1.5" fill={accentColor} />
        </svg>
      );
    case "MY_SON":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="6.5" r="3.5" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M9.5 4.5C11 3.5 13 3.5 14.5 4.5" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "MY_DAUGHTER":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="6.5" r="3.5" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M5 20C5 16.5 8 14 12 14C16 14 19 16.5 19 20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="6.5" r="1.2" fill={accentColor} />
        </svg>
      );
    case "MY_BROTHER":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="9" cy="7" r="3" stroke={strokeColor} strokeWidth="2" />
          <circle cx="16" cy="8" r="2.5" stroke={accentColor} strokeWidth="1.5" />
          <path d="M3 20C3 17 5.5 15 9 15C12.5 15 15 17 15 20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M15 19C15.5 17.5 17 16.5 19.5 16.5C21 16.5 22 17.5 22 19" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "MY_SISTER":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="9" cy="7" r="3" stroke={strokeColor} strokeWidth="2" />
          <circle cx="9" cy="7" r="1.2" fill={accentColor} />
          <circle cx="16" cy="8" r="2.5" stroke={accentColor} strokeWidth="1.5" />
          <path d="M3 20C3 17 5.5 15 9 15C12.5 15 15 17 15 20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M15 19C15.5 17.5 17 16.5 19.5 16.5C21 16.5 22 17.5 22 19" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "MY_RELATIVE":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="6" r="2.5" stroke={strokeColor} strokeWidth="2" />
          <circle cx="6" cy="8.5" r="2" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="18" cy="8.5" r="2" stroke={accentColor} strokeWidth="1.5" />
          <path d="M8 19C8 16 9.8 14.5 12 14.5C14.2 14.5 16 16 16 19" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <path d="M2 19C2 17 3.5 16 5.5 16" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M22 19C22 17 20.5 16 18.5 16" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "OTHER":
    default:
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="11" r="2" fill={accentColor} />
        </svg>
      );
  }
}

export function ProfileCreatedForCapsule({
  option,
  isSelected,
  onSelect,
  disabled = false,
}: ProfileCreatedForCapsuleProps) {
  const inputId = `capsule-${option.value.toLowerCase()}`;

  return (
    <label
      htmlFor={inputId}
      className={[
        styles.capsule,
        isSelected ? styles.selected : "",
        disabled ? styles.disabled : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Accessible Hidden Radio Input */}
      <input
        type="radio"
        id={inputId}
        name="profileCreatedFor"
        value={option.value}
        checked={isSelected}
        onChange={() => onSelect(option.value)}
        disabled={disabled}
        className={styles.hiddenRadio}
      />

      {/* Left Circular Icon */}
      <div className={styles.iconCircle}>
        {getCapsuleIcon(option.value, isSelected)}
      </div>

      {/* Capsule Label Text */}
      <span className={styles.label}>{option.title}</span>

      {/* Right Checkmark when selected */}
      {isSelected && (
        <span className={styles.checkIcon} aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </label>
  );
}
