import React from "react";
import Image from "next/image";
import { ABOUT_PRINCIPLES } from "@/data/about";
import styles from "./PhilosophySection.module.css";

export function PhilosophySection() {
  return (
    <section id="philosophy" className={styles.section} aria-labelledby="philosophy-title">
      <div className={styles.container}>
        {/* Left Column: Authentic Family Visual */}
        <div className={styles.imageColumn}>
          <Image
            src="/images/about-family.jpg"
            alt="Warm authentic Indian family sitting together and sharing a joyful moment"
            fill
            sizes="(max-width: 960px) 100vw, 540px"
            className={styles.familyImage}
          />
        </div>

        {/* Right Column: Editorial Narrative and 3 Principles */}
        <div className={styles.contentColumn}>
          <span className={styles.goldEyebrow}>OUR PHILOSOPHY</span>

          <h2 id="philosophy-title" className={styles.title}>
            Marriage Begins With Understanding
          </h2>

          <p className={styles.descriptionParagraph}>
            We believe a meaningful marriage begins long before the wedding day.
            It begins with understanding — who you are, what you value and the
            kind of life you hope to build together.
          </p>

          <p className={styles.descriptionParagraph}>
            Manglam brings technology and a personal approach together to make
            the journey toward finding a life partner more thoughtful,
            comfortable and meaningful.
          </p>

          {/* Three Compact Principles */}
          <div className={styles.principlesRow}>
            {ABOUT_PRINCIPLES.map((principle) => (
              <div key={principle.id} className={styles.principleItem}>
                <div className={styles.iconCircle} aria-hidden="true">
                  <PrincipleIcon iconName={principle.icon} />
                </div>
                <div className={styles.textGroup}>
                  <span className={styles.principleTitle}>{principle.title}</span>
                  <span className={styles.principleDescription}>
                    {principle.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PrincipleIcon({ iconName }: { iconName: string }) {
  switch (iconName) {
    case "shield-check":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "user-check":
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case "heart":
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      );
  }
}
