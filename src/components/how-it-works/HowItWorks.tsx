import React from "react";
import Link from "next/link";
import { HOW_IT_WORKS_STEPS } from "@/data/steps";
import styles from "./HowItWorks.module.css";

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={styles.section}
      aria-labelledby="how-it-works-title"
    >
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
          <span className={styles.goldTag}>FIND YOUR PERFECT MATCH</span>
          <h2 id="how-it-works-title" className={styles.title}>
            Start Your Journey Today
          </h2>
          <p className={styles.subtitle}>
            Simple steps to find your life partner
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className={styles.stepsGrid}>
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div key={step.stepNumber} className={styles.card}>
              <div className={styles.iconCircle} aria-hidden="true">
                <StepIcon iconName={step.icon} />
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>

        {/* Centered Action Button */}
        <div className={styles.ctaWrapper}>
          <Link href="/about#approach" className={styles.moreButton}>
            Explore Our Matchmaking Approach
          </Link>
        </div>
      </div>
    </section>
  );
}

function StepIcon({ iconName }: { iconName: string }) {
  switch (iconName) {
    case "user-plus":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" />
          <line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      );
    case "search":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    case "message-square":
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="9" y1="10" x2="15" y2="10" />
        </svg>
      );
    case "heart":
    default:
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
  }
}
