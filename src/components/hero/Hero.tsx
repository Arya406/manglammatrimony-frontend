"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchDiscoveryModal } from "@/components/common/SearchDiscoveryModal";
import styles from "./Hero.module.css";

export function Hero() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  return (
    <section className={styles.heroSection} aria-labelledby="hero-title">
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
        {/* Left Column: Headline, Copy, Divider, CTAs, Trust Indicators */}
        <div className={styles.leftContent}>
          <h1 id="hero-title" className={styles.headline}>
            Where Manglik
            <br />
            Hearts Meet
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
            Trusted by thousands of Manglik families.
            <br />
            Find your perfect match with confidence.
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

          {/* Action Buttons */}
          <div className={styles.ctaGroup}>
            <Link href="/register" className={styles.primaryCta}>
              <UserIcon />
              <span>Create Your Profile</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className={styles.secondaryCta}
              aria-label="Search profiles (Member Only)"
            >
              <SearchIcon />
              <span>Search Profiles</span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <div className={styles.trustIconWrapper} aria-hidden="true">
                <ShieldCheckIcon />
              </div>
              <div className={styles.trustTextGroup}>
                <span className={styles.trustTitle}>Verified Profiles</span>
                <span className={styles.trustSubtitle}>100% Secure</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrapper} aria-hidden="true">
                <UserCheckIcon />
              </div>
              <div className={styles.trustTextGroup}>
                <span className={styles.trustTitle}>Manglik Focused</span>
                <span className={styles.trustSubtitle}>Better Matches</span>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconWrapper} aria-hidden="true">
                <LockIcon />
              </div>
              <div className={styles.trustTextGroup}>
                <span className={styles.trustTitle}>Privacy First</span>
                <span className={styles.trustSubtitle}>Your Data, Safe</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Arched Matrimonial Couple Visual */}
        <div className={styles.rightVisual}>
          <div className={styles.imageArchWrapper}>
            <Image
              src="/images/hero-couple.jpg"
              alt="Indian bride and groom smiling warmly together in traditional wedding attire"
              fill
              priority
              sizes="(max-width: 960px) 100vw, 540px"
              className={styles.heroImage}
            />
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
