import React from "react";
import { APPROACH_STEPS } from "@/data/about";
import styles from "./ApproachTimeline.module.css";

export function ApproachTimeline() {
  return (
    <section id="approach" className={styles.section} aria-labelledby="approach-title">
      {/* Corner Mandala Watermark Artwork */}
      <div className={styles.cornerMandalaBottomRight} aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="160" cy="160" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="160" cy="160" r="90" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="160" cy="160" r="60" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="160" cy="160" r="30" stroke="currentColor" strokeWidth="1" />
          <path d="M160 120 L170 150 L200 160 L170 170 L160 200 L150 170 L120 160 L150 150 Z" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.goldEyebrow}>OUR APPROACH</span>
          <h2 id="approach-title" className={styles.title}>
            From Introduction to a Lifetime
          </h2>
        </div>

        {/* Timeline Horizontal / Vertical */}
        <div className={styles.timelineWrapper}>
          <div className={styles.timelineConnector} aria-hidden="true" />
          <div className={styles.timelineGrid}>
            {APPROACH_STEPS.map((step) => (
              <div key={step.stepNumber} className={styles.stepItem}>
                <div className={styles.stepBadge}>{step.stepCode}</div>
                <div className={styles.iconCircle} aria-hidden="true">
                  <TimelineIcon iconName={step.icon} />
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineIcon({ iconName }: { iconName: string }) {
  switch (iconName) {
    case "user-plus":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      );
    case "search":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "message-square":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
      );
    case "heart":
    default:
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
  }
}
