import React from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  id?: string;
  children: React.ReactNode;
  variant?:
    | "rose"
    | "maroon"
    | "gold"
    | "ivory"
    | "outline"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
  id,
  children,
  variant = "rose",
  size = "md",
  icon,
  className = "",
}: BadgeProps) {
  const badgeClasses = [styles.badge, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <span id={id} className={badgeClasses}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
