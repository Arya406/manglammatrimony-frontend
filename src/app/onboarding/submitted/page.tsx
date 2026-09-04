"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import styles from "./submitted.module.css";

export default function SubmittedPage() {
  const router = useRouter();
  const { authStatus, profile } = useAuth();

  useEffect(() => {
    if (authStatus === "UNAUTHENTICATED") {
      router.replace("/login");
    }
  }, [router, authStatus]);

  const profileName = profile?.personalDetails?.firstName
    ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName || ""}`.trim()
    : "";

  return (
    <OnboardingLayout>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          {/* Gold / Green Verification Badge */}
          <div className={styles.iconCircle}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7B1123"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>

          <span className={styles.eyebrow}>SUBMISSION SUCCESSFUL</span>
          <h1 className={styles.title}>Your profile is under review</h1>
          <p className={styles.subtitle}>
            {profileName ? `Thank you, ${profileName}! ` : ""}
            Your profile has been submitted successfully. Our team will review
            your details and photos before your profile becomes active.
          </p>

          {/* Status Box */}
          <div className={styles.statusBox}>
            <span className={styles.statusLabel}>PROFILE STATUS</span>
            <div className={styles.statusValueRow}>
              <span className={styles.statusValue}>Under Review</span>
              <span className={styles.statusPill}>IN_REVIEW</span>
            </div>
            <p className={styles.statusExplanation}>
              Verification typically takes 24–48 hours. We ensure all profiles meet
              our authenticity and quality guidelines.
            </p>
          </div>

          {/* Timeline / Next Steps List */}
          <div className={styles.infoBox}>
            <h2 className={styles.infoTitle}>What to expect next:</h2>
            <ul className={styles.infoList}>
              <li>
                <span className={styles.bulletCheck}>✓</span>
                <span>Our moderation team will review your photos and bio details.</span>
              </li>
              <li>
                <span className={styles.bulletCheck}>✓</span>
                <span>You will receive an SMS and email notification once verified.</span>
              </li>
              <li>
                <span className={styles.bulletCheck}>✓</span>
                <span>Once approved, compatible matches will be able to discover you.</span>
              </li>
            </ul>
          </div>

          {/* Action CTAs */}
          <div className={styles.actionsGroup}>
            <Link href="/onboarding/review" className={styles.primaryButton}>
              <span>View My Profile</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>

            <Link href="/onboarding/personal-details" className={styles.secondaryButton}>
              Edit Profile
            </Link>
          </div>

          {/* Trust Note */}
          <div className={styles.trustMessage}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C59B27"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Your information is safely stored and protected.</span>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
}
