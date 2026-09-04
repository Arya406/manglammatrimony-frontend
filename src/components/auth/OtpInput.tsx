"use client";

import React, { useRef, useEffect } from "react";
import styles from "./OtpInput.module.css";

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  disabled?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  useEffect(() => {
    // Focus first input on initial mount if not disabled
    if (!disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [disabled]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const cleanDigit = rawVal.replace(/\D/g, "").slice(-1);

    const newDigits = [...digits];
    newDigits[index] = cleanDigit;
    const newOtp = newDigits.join("");
    onChange(newOtp);

    // Auto-advance to next box if digit was entered
    if (cleanDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger onComplete if all 6 digits entered
    if (newOtp.length === 6 && onComplete) {
      onComplete(newOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move back to previous box and clear it
        inputRefs.current[index - 1]?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    onChange(pasted);
    const targetFocusIndex = Math.min(pasted.length, 5);
    inputRefs.current[targetFocusIndex]?.focus();

    if (pasted.length === 6 && onComplete) {
      onComplete(pasted);
    }
  };

  return (
    <div className={styles.otpContainer} onPaste={handlePaste} aria-label="6-digit verification code input">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={`${styles.digitBox} ${digit ? styles.digitBoxFilled : ""}`}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </div>
  );
}
