import React from "react";
import styles from "./Badge.module.css";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "rose" | "maroon" | "gold" | "ivory" | "outline";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  className?: string;
}

export function Badge({
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
    <span className={badgeClasses}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
