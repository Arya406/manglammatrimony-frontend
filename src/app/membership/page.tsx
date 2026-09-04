"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { PricingCard } from "@/components/membership/PricingCard";
import { MembershipModal } from "@/components/membership/MembershipModal";
import { MEMBERSHIP_PLANS, MembershipPlan } from "@/data/membershipPlans";
import styles from "./membership.module.css";

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className={styles.pageWrapper}>
      <SiteHeader />

      <main className={styles.mainContent}>
        {/* Hero Section */}
        <section className={styles.heroSection} aria-labelledby="membership-hero-heading">
          <div className={styles.heroTag}>
            <span>✦ Transparent Memberships</span>
          </div>
          <h1 id="membership-hero-heading" className={styles.heroHeading}>
            Find the right membership for your journey
          </h1>
          <p className={styles.heroSubheading}>
            Connect with verified profiles, initiate meaningful family conversations, or choose complete advisor-assisted matchmaking tailored to your expectations.
          </p>
        </section>

        {/* Pricing Cards Grid */}
        <section
          className={styles.pricingGrid}
          aria-label="Available Membership Plans"
        >
          {MEMBERSHIP_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </section>

        {/* Value / Trust Section */}
        <section className={styles.trustSection} aria-label="Membership Value Pillars">
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <div className={styles.trustIconBox} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <h3 className={styles.trustTitle}>100% Verified Profiles</h3>
                <p className={styles.trustText}>
                  Every profile undergoes manual contact and credential verification to protect family authenticity.
                </p>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconBox} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className={styles.trustTitle}>Direct Family Conversations</h3>
                <p className={styles.trustText}>
                  Reach out with mutual consent through secure message requests, direct phone contacts, and video calls.
                </p>
              </div>
            </div>

            <div className={styles.trustItem}>
              <div className={styles.trustIconBox} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <h3 className={styles.trustTitle}>Complete Privacy Control</h3>
                <p className={styles.trustText}>
                  Your photos are securely normalized with metadata stripped. Personal contacts are only shared when you accept.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Teaser Callout */}
        <div className={styles.faqCallout}>
          <p className={styles.faqCalloutText}>
            Have questions about membership features, contacts, or advisor assistance?
          </p>
          <Link href="/help" className={styles.faqLink}>
            <span>Visit our Help Center FAQ</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Safe Selection Modal */}
      <MembershipModal
        plan={selectedPlan}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
