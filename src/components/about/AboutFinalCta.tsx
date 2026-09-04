"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SearchDiscoveryModal } from "@/components/common/SearchDiscoveryModal";
import styles from "./AboutFinalCta.module.css";

export function AboutFinalCta() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <section className={styles.section} aria-labelledby="about-cta-title">
      {/* Corner Mandala Watermark Backgrounds */}
      <div className={styles.mandalaPatternLeft} aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="40" cy="40" r="80" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
      <div className={styles.mandalaPatternRight} aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="160" cy="160" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="160" cy="160" r="80" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <h2 id="about-cta-title" className={styles.title}>
            Your Journey Begins With One Step.
          </h2>

          <div className={styles.divider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerOrnament}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 22 12 12 22 2 12" />
              </svg>
            </span>
            <span className={styles.dividerLine} />
          </div>

          <p className={styles.description}>
            Take the first step toward finding someone with whom you can build
            something meaningful.
          </p>

          <div className={styles.buttonsRow}>
            <Link href="/register" className={styles.primaryButton}>
              <UserIcon />
              <span>Create Your Profile</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className={styles.secondaryButton}
              aria-label="Explore profiles (Member Only)"
            >
              <SearchIcon />
              <span>Explore Profiles</span>
            </button>
          </div>
        </div>
      </div>

      <SearchDiscoveryModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </section>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
