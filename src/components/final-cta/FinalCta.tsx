import React from "react";
import Link from "next/link";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section className={styles.section} aria-labelledby="final-cta-heading">
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          <div className={styles.contentWrapper}>
            <span className={styles.goldTag}>BEGIN YOUR JOURNEY</span>

            <h2 id="final-cta-heading" className={styles.headline}>
              Your Story Could Be Next.
            </h2>

            <p className={styles.description}>
              Begin your journey toward a meaningful connection with Manglam
              Matrimony. Complete your profile and discover matches curated to
              your preferences.
            </p>

            <Link href="/register" className={styles.primaryButton}>
              Create Your Profile
            </Link>

            <div className={styles.reassuranceList}>
              <span>Free Registration</span>
              <span className={styles.separator} aria-hidden="true">•</span>
              <span>Privacy Focused</span>
              <span className={styles.separator} aria-hidden="true">•</span>
              <span>Easy to Get Started</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
