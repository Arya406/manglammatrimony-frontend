import React from "react";
import Link from "next/link";
import styles from "./Logo.module.css";

interface LogoProps {
  variant?: "default" | "inverse";
  size?: "sm" | "md" | "lg";
  className?: string;
  href?: string;
}

export function Logo({ variant = "default", size = "md", className = "", href }: LogoProps) {
  const containerClass = [
    styles.logoLink,
    variant === "inverse" ? styles.inverse : "",
    styles[size] || "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const maroonColor = variant === "inverse" ? "#FFFFFF" : "#7B1123";
  const goldColor = variant === "inverse" ? "#F3E8C8" : "#C59B27";
  const roseColor = variant === "inverse" ? "#F7D6DE" : "#C44265";

  return (
    <Link href={href || "/"} className={containerClass} aria-label="Manglam Matrimony Home">
      <div className={styles.emblemWrapper} aria-hidden="true">
        <svg
          width={size === "sm" ? 30 : size === "lg" ? 44 : 36}
          height={size === "sm" ? 30 : size === "lg" ? 44 : 36}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Couple / Sacred Union Emblem forming a heart & bond */}
          {/* Left Figure (Bride) */}
          <circle cx="14" cy="11" r="3.5" fill={maroonColor} />
          <path
            d="M7 26C7 19.5 11 16 16 16C19.5 16 22 18.5 22 22C22 26.5 16 32 12 34C9.5 31.5 7 28.5 7 26Z"
            fill={maroonColor}
          />
          {/* Sacred Bindi / Accent */}
          <circle cx="14" cy="11" r="1.2" fill={goldColor} />

          {/* Right Figure (Groom) */}
          <circle cx="26" cy="11" r="3.5" fill={goldColor} />
          <path
            d="M33 26C33 19.5 29 16 24 16C20.5 16 18 18.5 18 22C18 26.5 24 32 28 34C30.5 31.5 33 28.5 33 26Z"
            fill={goldColor}
            fillOpacity="0.9"
          />

          {/* Center Sacred Interlock Spark */}
          <path
            d="M20 18C21.5 20.5 21.5 23.5 20 26C18.5 23.5 18.5 20.5 20 18Z"
            fill={roseColor}
          />
        </svg>
      </div>

      <div className={styles.textGroup}>
        <span className={styles.brandName}>Manglam</span>
        <span className={styles.tagline}>Matrimony</span>
      </div>
    </Link>
  );
}
