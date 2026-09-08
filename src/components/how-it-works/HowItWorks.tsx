"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./HowItWorks.module.css";

interface JourneyStep {
  number: string;
  titleLines: [string, string];
  description: string;
  imageSrc: string;
  imageAlt: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    number: "01",
    titleLines: ["CREATE", "YOUR PROFILE"],
    description: "Tell us about yourself, your values and what you're looking for.",
    imageSrc: "/images/journey/journey-step-1.jpg",
    imageAlt: "Indian couple preparing for traditional wedding moment",
  },
  {
    number: "02",
    titleLines: ["DISCOVER", "YOUR MATCH"],
    description: "Explore compatible profiles based on what matters to you.",
    imageSrc: "/images/journey/journey-step-2.jpg",
    imageAlt: "Indian couple discovering and smiling together",
  },
  {
    number: "03",
    titleLines: ["CONNECT", "WITH TRUST"],
    description: "Express interest and start meaningful conversations.",
    imageSrc: "/images/journey/journey-step-3.jpg",
    imageAlt: "Couple sharing a warm meaningful conversation",
  },
  {
    number: "04",
    titleLines: ["BEGIN", "YOUR STORY"],
    description: "Take the next step toward something lasting.",
    imageSrc: "/images/journey/journey-step-4.jpg",
    imageAlt: "Joyful couple celebrating the beginning of their journey",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className={styles.section}
      aria-labelledby="how-it-works-title"
    >
      {/* Corner Mandala Watermark Artwork */}
      <div className={styles.cornerMandalaBottomRight} aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="160" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="160" cy="160" r="90" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="160" cy="160" r="60" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="160" cy="160" r="30" stroke="currentColor" strokeWidth="1" />
          <path d="M160 120 L170 150 L200 160 L170 170 L160 200 L150 170 L120 160 L150 150 Z" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className={styles.container}>
        {/* Section Header (preserved exactly as requested) */}
        <div className={styles.header}>
          <span className={styles.goldTag}>FIND YOUR PERFECT MATCH</span>
          <h2 id="how-it-works-title" className={styles.title}>
            Start Your Journey Today
          </h2>
          <p className={styles.subtitle}>
            Simple steps to find your life partner
          </p>
        </div>

        {/* Desktop Layout (>1024px) */}
        <div className={styles.desktopJourney}>
          {JOURNEY_STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              <JourneyCardContent step={step} index={index} />

              {/* Sequential Connector between cards 1-2, 2-3, 3-4 */}
              {index < JOURNEY_STEPS.length - 1 && (
                <div
                  className={`${styles.connectorDesktop} ${styles[`connectorDesktop${index + 1}`]}`}
                  aria-hidden="true"
                >
                  <div className={styles.connectorTrack} />
                  <div
                    className={`${styles.connectorPulse} ${styles[`pulseDesktop${index + 1}`]}`}
                  >
                    <span className={styles.sparkleIcon}>✦</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Tablet 2x2 Layout (768px - 1023px) */}
        <div className={styles.tabletJourney}>
          {/* Card 01 */}
          <div className={styles.tabletCardWrapper} style={{ gridArea: "c1" }}>
            <JourneyCardContent step={JOURNEY_STEPS[0]} index={0} />
          </div>

          {/* Tablet Connector 1: 01 -> 02 (horizontal right) */}
          <div className={`${styles.connectorTabletH} ${styles.connectorTablet1}`} style={{ gridArea: "t1" }} aria-hidden="true">
            <div className={styles.connectorTrack} />
            <div className={`${styles.connectorPulse} ${styles.pulseDesktop1}`}>
              <span className={styles.sparkleIcon}>✦</span>
            </div>
          </div>

          {/* Card 02 */}
          <div className={styles.tabletCardWrapper} style={{ gridArea: "c2" }}>
            <JourneyCardContent step={JOURNEY_STEPS[1]} index={1} />
          </div>

          {/* Tablet Connector 2: 02 -> 03 (vertical downwards) */}
          <div className={`${styles.connectorTabletV} ${styles.connectorTablet2}`} style={{ gridArea: "t2" }} aria-hidden="true">
            <div className={styles.connectorTrackV} />
            <div className={`${styles.connectorPulseV} ${styles.pulseTabletV}`}>
              <span className={styles.sparkleIconV}>✦</span>
            </div>
          </div>

          {/* Card 03 (bottom right) */}
          <div className={styles.tabletCardWrapper} style={{ gridArea: "c3" }}>
            <JourneyCardContent step={JOURNEY_STEPS[2]} index={2} />
          </div>

          {/* Tablet Connector 3: 03 -> 04 (horizontal leftwards) */}
          <div className={`${styles.connectorTabletH} ${styles.connectorTablet3}`} style={{ gridArea: "t3" }} aria-hidden="true">
            <div className={styles.connectorTrack} />
            <div className={`${styles.connectorPulse} ${styles.pulseTabletLeft}`}>
              <span className={styles.sparkleIcon}>✦</span>
            </div>
          </div>

          {/* Card 04 (bottom left) */}
          <div className={styles.tabletCardWrapper} style={{ gridArea: "c4" }}>
            <JourneyCardContent step={JOURNEY_STEPS[3]} index={3} />
          </div>
        </div>

        {/* Mobile Layout (<=767px) */}
        <div className={styles.mobileJourney}>
          {JOURNEY_STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
              <JourneyCardContent step={step} index={index} />
              {index < JOURNEY_STEPS.length - 1 && (
                <div
                  className={`${styles.connectorMobile} ${styles[`connectorMobile${index + 1}`]}`}
                  aria-hidden="true"
                >
                  <div className={styles.connectorTrackV} />
                  <div
                    className={`${styles.connectorPulseV} ${styles[`pulseMobile${index + 1}`]}`}
                  >
                    <span className={styles.sparkleIconV}>✦</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Centered Action Button (preserved exactly as requested) */}
        <div className={styles.ctaWrapper}>
          <Link href="/about#approach" className={styles.moreButton}>
            Explore Our Matchmaking Approach
          </Link>
        </div>
      </div>
    </section>
  );
}

function JourneyCardContent({ step, index }: { step: JourneyStep; index: number }) {
  return (
    <article
      className={`${styles.card} ${styles[`card${index + 1}`]}`}
      aria-label={`Step ${step.number}: ${step.titleLines.join(" ")}`}
    >
      {/* Top ~30% Image Area */}
      <div className={styles.imageWrapper}>
        <Image
          src={step.imageSrc}
          alt={step.imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px"
          className={styles.cardImage}
          priority={false}
        />
        <div className={styles.imageOverlay} />
      </div>

      {/* Bottom ~70% Editorial Content */}
      <div className={styles.cardContent}>
        <div className={styles.contentTop}>
          <div className={styles.numberRow}>
            <span className={styles.stepNumber}>{step.number}</span>
            <span className={`${styles.activeBeacon} ${styles[`beacon${index + 1}`]}`} aria-hidden="true" />
          </div>
          <h3 className={styles.stepTitle}>
            <span>{step.titleLines[0]}</span>
            <span>{step.titleLines[1]}</span>
          </h3>
          <p className={styles.stepDescription}>{step.description}</p>
        </div>
        <div className={styles.arrowWrapper} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </article>
  );
}
