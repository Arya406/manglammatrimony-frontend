import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { Footer } from "@/components/footer/Footer";
import styles from "./terms.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — Manglam Matrimony",
  description:
    "Review the terms and conditions governing registration, membership eligibility, verified profile standards, and community conduct on Manglam Matrimony.",
};

export default function TermsPage() {
  return (
    <div className={styles.pageContainer}>
      <SiteHeader />

      <main className={styles.mainContent}>
        {/* Editorial / Legal Review Notice */}
        <div className={styles.legalNoticeBanner} role="note">
          <strong>Notice for Members:</strong> This document sets forth the terms of membership and platform community guidelines for Manglam Matrimony. It is published for member information and guidance. It does not constitute formal legal advice and remains subject to periodic legal and regulatory review.
        </div>

        <header className={styles.headerSection}>
          <span className={styles.eyebrow}>PLATFORM AGREEMENT</span>
          <h1 className={styles.pageTitle}>Terms of Service</h1>
          <p className={styles.metaInfo}>Effective Date: September 2026 | Last Updated: September 2026</p>
        </header>

        {/* 1. Acceptance & Matrimonial Intent */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>1. Acceptance &amp; Sole Purpose</h2>
          <p className={styles.paragraph}>
            Welcome to Manglam Matrimony. By creating an account, accessing, or using our services, you agree to be bound by these Terms of Service.
          </p>
          <p className={styles.paragraph}>
            Manglam Matrimony is exclusively designed for individuals seeking solemn, lawful matrimonial alliances and lifelong companionship. It is <strong>not</strong> a dating, hookup, casual networking, or commercial matchmaking service. Any use of this platform for purposes outside of lawful marriage is strictly prohibited.
          </p>
        </section>

        {/* 2. Eligibility & Legal Age */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>2. Membership Eligibility &amp; Minimum Age</h2>
          <p className={styles.paragraph}>
            To register as a member or create a profile on behalf of a family member, you must satisfy the following criteria:
          </p>
          <ul className={styles.bulletList}>
            <li><strong>Legal Age for Marriage in India:</strong> You must be at least 21 years of age if male, and at least 18 years of age if female, as prescribed under Indian law.</li>
            <li><strong>Marital Capacity:</strong> You must be legally competent to marry under your personal governing marriage laws (unmarried, legally divorced with final decree, or widowed).</li>
            <li><strong>Agency &amp; Representation:</strong> If creating a profile for your son, daughter, sibling, or relative, you affirm that you have received their explicit authorization to do so.</li>
          </ul>
        </section>

        {/* 3. Account Verification & Profile Moderation */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>3. Profile Truthfulness &amp; Review Process</h2>
          <p className={styles.paragraph}>
            Trust is the cornerstone of our community. All registered members agree that:
          </p>
          <ul className={styles.bulletList}>
            <li>All biodata, educational qualifications, employment details, and photographs provided must be true, accurate, and current.</li>
            <li>Every profile is submitted to our internal moderation team for verification prior to active status. Profiles under review are subject to restricted discovery access until approved.</li>
            <li>Submitting false credentials, impersonating another individual, or uploading misleading photographs constitutes grounds for immediate account suspension without prior notice.</li>
          </ul>
        </section>

        {/* 4. Code of Conduct & Prohibited Activities */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>4. Community Conduct &amp; Prohibitions</h2>
          <p className={styles.paragraph}>
            Members must conduct all interactions with dignity, courtesy, and cultural warmth. The following behaviors are strictly prohibited:
          </p>
          <ul className={styles.bulletList}>
            <li>Soliciting monetary loans, investments, gifts, or financial transfers from any member under any pretext.</li>
            <li>Sending abusive, vulgar, defamatory, offensive, or harassing messages.</li>
            <li>Harvesting, scraping, copying, or distributing profile photographs or contact details of other members.</li>
            <li>Using the messaging system for commercial advertising, promotional solicitations, or spam.</li>
          </ul>
        </section>

        {/* 5. Memberships & Plans */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>5. Membership Plans &amp; Complimentary Access</h2>
          <p className={styles.paragraph}>
            Core matching discovery, profile setup, and mutual interest requests are currently provided on a complimentary access basis for registered and verified members.
          </p>
          <p className={styles.paragraph}>
            Optional premium packages and concierge matchmaking advisor assistance may be offered. We will provide clear pricing, duration, and feature descriptions before any payment integration becomes live.
          </p>
        </section>

        {/* 6. Disclaimers & Independent Verification */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>6. Independent Verification &amp; Safe Matrimony</h2>
          <p className={styles.paragraph}>
            While Manglam Matrimony moderates profiles for adherence to community guidelines, we cannot independently investigate all personal backgrounds, criminal records, or family claims of every member.
          </p>
          <p className={styles.paragraph}>
            Members and their families are strongly encouraged to exercise customary due diligence and follow our <Link href="/safety" className={styles.contactLink}>Safety Guidelines</Link> before entering into marital commitments.
          </p>
        </section>

        {/* 7. Contact & Support */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>7. Support &amp; Dispute Redressal</h2>
          <p className={styles.paragraph}>
            If you have questions regarding these terms, or wish to report a violation by any profile, please contact our team:
          </p>
          <div className={styles.contactBox}>
            <p><strong>Member Support Desk:</strong> Manglam Matrimony</p>
            <p><strong>Email:</strong> <a href="mailto:support@manglammatrimony.com" className={styles.contactLink}>support@manglammatrimony.com</a></p>
            <p><strong>Support Portal:</strong> <Link href="/help" className={styles.contactLink}>Visit Help &amp; Support Centre</Link></p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
