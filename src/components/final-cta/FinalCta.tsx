"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    const elem = sectionRef.current;
    if (elem) {
      observer.observe(elem);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${styles.section} ${isVisible ? styles.sectionVisible : ""}`}
      aria-labelledby="final-cta-heading"
    >
      {/* Subtle Ornamental Edge Geometry (Left & Right) */}
      <div className={`${styles.edgeOrnament} ${styles.edgeOrnamentLeft}`} aria-hidden="true">
        <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="160" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="20" cy="160" r="110" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="20" cy="160" r="80" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="20" cy="160" r="50" stroke="currentColor" strokeWidth="1" />
          <path d="M20 110 L30 145 L65 160 L30 175 L20 210 L10 175 L-25 160 L10 145 Z" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>

      <div className={`${styles.edgeOrnament} ${styles.edgeOrnamentRight}`} aria-hidden="true">
        <svg viewBox="0 0 200 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="180" cy="160" r="140" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="180" cy="160" r="110" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="180" cy="160" r="80" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="180" cy="160" r="50" stroke="currentColor" strokeWidth="1" />
          <path d="M180 110 L190 145 L225 160 L190 175 L180 210 L170 175 L135 160 L170 145 Z" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <span className={styles.goldEyebrow}>BEGIN YOUR JOURNEY</span>

          <h2 id="final-cta-heading" className={styles.headline}>
            Your Story Could Be Next.
          </h2>

          <div className={styles.goldDivider} aria-hidden="true" />

          <p className={styles.description}>
            Begin your journey toward a meaningful connection with Manglam Matrimony.
          </p>

          <div className={styles.ctaWrapper}>
            <Link href="/register" className={styles.primaryButton}>
              <span>Create Your Profile</span>
              <span className={styles.buttonArrow} aria-hidden="true">
                →
              </span>
            </Link>
          </div>

          <div className={styles.trustLine}>
            <span>Free Registration</span>
            <span className={styles.trustSeparator} aria-hidden="true">
              •
            </span>
            <span>Privacy Focused</span>
            <span className={styles.trustSeparator} aria-hidden="true">
              •
            </span>
            <span>Easy to Get Started</span>
          </div>
        </div>
      </div>
    </section>
  );
}
