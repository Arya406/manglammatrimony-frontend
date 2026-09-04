import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./AboutHero.module.css";

export function AboutHero() {
  return (
    <section className={styles.heroSection} aria-labelledby="about-hero-title">
      {/* Corner Mandala Watermark Artwork */}
      <div className={styles.cornerMandalaTopLeft} aria-hidden="true">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="40" cy="40" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="40" cy="40" r="90" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="40" cy="40" r="60" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="40" cy="40" r="30" stroke="currentColor" strokeWidth="1" />
          <path d="M40 0 L50 30 L80 40 L50 50 L40 80 L30 50 L0 40 L30 30 Z" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className={styles.heroContainer}>
        {/* Left Column: Eyebrow, H1, Copy, Divider, CTA */}
        <div className={styles.leftContent}>
          <span className={styles.goldEyebrow}>ABOUT MANGLAM</span>

          <h1 id="about-hero-title" className={styles.headline}>
            Where Meaningful
            <br />
            Connections Begin
            <span className={styles.heartIconWrapper} aria-hidden="true">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </span>
          </h1>

          <p className={styles.description}>
            Finding a life partner is more than finding a profile.
            It&apos;s about discovering someone who shares your values,
            understands your journey and is ready to build a
            future together.
          </p>

          {/* Decorative Divider */}
          <div className={styles.divider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerOrnament}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 22 12 12 22 2 12" />
              </svg>
            </span>
            <span className={styles.dividerLine} />
          </div>

          {/* Action Button */}
          <Link href="#philosophy" className={styles.ctaButton}>
            <span>Discover Our Journey</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Right Column: Arched Matrimonial Couple Visual */}
        <div className={styles.rightVisual}>
          <div className={styles.imageArchWrapper}>
            <Image
              src="/images/hero-couple.jpg"
              alt="Indian couple smiling warmly together in traditional festive wedding attire"
              fill
              priority
              sizes="(max-width: 960px) 100vw, 520px"
              className={styles.heroImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
