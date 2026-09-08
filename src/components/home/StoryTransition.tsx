import React from "react";
import styles from "./StoryTransition.module.css";

export function StoryTransition() {
  return (
    <section id="story-transition" className={styles.section} aria-label="About Manglam Matrimony">
      <div className={styles.container}>
        <span className={styles.eyebrow}>The Manglam Philosophy</span>
        <h2 className={styles.title}>Rooted in Tradition, Designed for Today</h2>
        <p className={styles.subtitle}>
          A discreet, respectful matrimony platform designed for families and modern individuals who value authenticity, cultural heritage, and shared aspirations.
        </p>

        <div className={styles.pillarGrid}>
          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className={styles.pillarTitle}>100% Verified Profiles</h3>
            <p className={styles.pillarText}>
              Every profile is rigorously screened to ensure authentic details, genuine family backgrounds, and sincere matchmaking intentions.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h3 className={styles.pillarTitle}>Values & Family Trust</h3>
            <p className={styles.pillarText}>
              Honoring cultural traditions and shared family values while providing modern compatibility preferences for lasting partnerships.
            </p>
          </div>

          <div className={styles.pillarCard}>
            <div className={styles.pillarIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className={styles.pillarTitle}>Privacy & Discretion</h3>
            <p className={styles.pillarText}>
              You have complete control over your photo visibility, contact access, and communications in a secure, dignity-first environment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
