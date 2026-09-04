"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { SAMPLE_PROFILE_PRIYA } from "@/data/mockProfiles";
import { ProfileCardData } from "@/types/profile-card";
import styles from "./preview.module.css";

export default function ProfileCardPreviewPage() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleViewProfile = (profile: ProfileCardData) => {
    setLastAction(`Clicked "View Profile" for ${profile.name} (ID: ${profile.id})`);
  };

  const handleSendInterest = (profile: ProfileCardData) => {
    setLastAction(`Toggled "Send Interest" for ${profile.name}`);
  };

  const handleToggleFavourite = (profile: ProfileCardData, isFav: boolean) => {
    setLastAction(
      isFav
        ? `Added ${profile.name} to favourites (♥)`
        : `Removed ${profile.name} from favourites (♡)`
    );
  };

  return (
    <div className={styles.previewPage}>
      {/* Top Header Bar */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Logo size="md" />
          <div className={styles.headerTitleBadge}>
            <span>Component Preview: Standalone ProfileCard</span>
          </div>
          <Link href="/" className={styles.backHomeLink}>
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Section */}
      <main className={styles.mainContainer}>
        <div className={styles.introGroup}>
          <span className={styles.goldEyebrow}>Manglam Matrimony Design System</span>
          <h1 className={styles.pageTitle}>Profile Card UI Component</h1>
          <p className={styles.pageSubtitle}>
            Standalone, responsive profile card built with Bricolage Grotesque typography,
            4:5 portrait photo carousel, verified &amp; online status overlays, and interactive action states.
          </p>
        </div>

        {/* Action Feedback Banner */}
        {lastAction && (
          <div className={styles.feedbackBanner} role="status">
            <span className={styles.feedbackDot} />
            <span>{lastAction}</span>
          </div>
        )}

        {/* Showcase Grid */}
        <div className={styles.showcaseWrapper}>
          <div className={styles.cardFrame}>
            <div className={styles.frameLabel}>Default State (Priya, 28)</div>
            <ProfileCard
              profile={SAMPLE_PROFILE_PRIYA}
              onViewProfile={handleViewProfile}
              onSendInterest={handleSendInterest}
              onToggleFavourite={handleToggleFavourite}
            />
          </div>
        </div>

        {/* Component Features Breakdown */}
        <div className={styles.featuresCard}>
          <h2 className={styles.featuresTitle}>Component Specifications &amp; Features</h2>
          <div className={styles.specsGrid}>
            <div className={styles.specItem}>
              <strong className={styles.specKey}>Card Dimensions:</strong>
              <span>250px Width × ~450px Height (Compact Matrimonial Card)</span>
            </div>
            <div className={styles.specItem}>
              <strong className={styles.specKey}>Photo Area:</strong>
              <span>250px × 312px (4:5 Aspect Ratio)</span>
            </div>
            <div className={styles.specItem}>
              <strong className={styles.specKey}>Typography:</strong>
              <span>Bricolage Grotesque (Google Fonts)</span>
            </div>
            <div className={styles.specItem}>
              <strong className={styles.specKey}>Corner Radius:</strong>
              <span>22px Container, 10px Buttons</span>
            </div>
            <div className={styles.specItem}>
              <strong className={styles.specKey}>Palette:</strong>
              <span>Deep Maroon (#7B1123), Gold (#C59B27), Ivory (#FCFAF7)</span>
            </div>
            <div className={styles.specItem}>
              <strong className={styles.specKey}>Carousel:</strong>
              <span>5 Sample Photos with Wrap-Around navigation &amp; dot indicators</span>
            </div>
            <div className={styles.specItem}>
              <strong className={styles.specKey}>Badges &amp; Overlays:</strong>
              <span>Online Indicator (●), Favourite (♡/♥), Verified Badge (✓)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Manglam Matrimony — Component Design System</p>
      </footer>
    </div>
  );
}
