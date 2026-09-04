import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { Footer } from "@/components/footer/Footer";
import styles from "./privacy.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — Manglam Matrimony",
  description:
    "Review Manglam Matrimony's privacy policy, personal data protection practices, photo security, cookie policies, and grievance redressal mechanisms.",
};

export default function PrivacyPage() {
  return (
    <div className={styles.pageContainer}>
      <SiteHeader />

      <main className={styles.mainContent}>
        {/* Editorial / Legal Review Notice */}
        <div className={styles.legalNoticeBanner} role="note">
          <strong>Notice for Members:</strong> This document outlines Manglam Matrimony&apos;s data handling practices and privacy principles. It is published for platform transparency and user guidance. It does not constitute legal advice and remains subject to periodic legal and operational review.
        </div>

        <header className={styles.headerSection}>
          <span className={styles.eyebrow}>TRANSPARENCY &amp; TRUST</span>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <p className={styles.metaInfo}>Effective Date: September 2026 | Last Updated: September 2026</p>
        </header>

        {/* 1. Introduction & Scope */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>1. Introduction &amp; Commitment</h2>
          <p className={styles.paragraph}>
            Manglam Matrimony (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) operates a matrimonial matchmaking platform tailored for Indian families. We are deeply committed to respecting the privacy, dignity, and confidential personal data of our users.
          </p>
          <p className={styles.paragraph}>
            This Privacy Policy explains how information is collected, stored, processed, and safeguarded when you create an account, upload photos, or interact with other members on Manglam Matrimony.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>2. Information Collected</h2>
          <p className={styles.paragraph}>
            To facilitate meaningful and culturally harmonious matchmaking, we collect information submitted voluntarily by members or their authorized family guardians:
          </p>
          <ul className={styles.bulletList}>
            <li><strong>Account Verification:</strong> Email address and mobile phone number for secure one-time password (OTP) verification.</li>
            <li><strong>Biodata &amp; Profile Details:</strong> Full name, date of birth, gender, marital status, height, physical attributes, city, state, and country of residence.</li>
            <li><strong>Cultural &amp; Astrological Background:</strong> Religion, community, caste, sub-caste, gotra, and manglik status (provided voluntarily, with options for custom entries or non-disclosure).</li>
            <li><strong>Education &amp; Career:</strong> Highest degree, institution name, occupation, employer sector, and annual income range.</li>
            <li><strong>Photographs:</strong> Portrait photographs uploaded for profile verification and member presentation.</li>
            <li><strong>Partner Preferences:</strong> Criteria regarding preferred age range, height, religion, education, and location for matching curation.</li>
          </ul>
        </section>

        {/* 3. Photo Privacy & EXIF Stripping */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>3. Photo Privacy &amp; Metadata Protection</h2>
          <p className={styles.paragraph}>
            We employ privacy-first image processing to protect members from digital tracking. When you upload photos to Manglam Matrimony:
          </p>
          <ul className={styles.bulletList}>
            <li>All EXIF metadata (including geolocation coordinates, camera device models, timestamps, and camera serial numbers) is automatically stripped upon upload.</li>
            <li>Photos are normalized, resized, and converted into privacy-safe WebP/JPEG formats stored on secure, authenticated media endpoints.</li>
            <li>Direct high-resolution originals are not exposed to unauthenticated web crawlers or public search engines.</li>
          </ul>
        </section>

        {/* 4. Consent-Based Contact Sharing */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>4. Disclosure &amp; Contact Sharing</h2>
          <p className={styles.paragraph}>
            Your contact information (such as personal phone number and private email address) is never publicly posted on discovery cards or search listings.
          </p>
          <p className={styles.paragraph}>
            Contact details and direct messaging capabilities are shared strictly on a <strong>mutual consent</strong> basis: only when both parties have exchanged and accepted a message request can direct communication proceed.
          </p>
        </section>

        {/* 5. Cookie Policy Section with explicit id="cookies" */}
        <section id="cookies" className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>5. Cookie Policy &amp; Session Management</h2>
          <p className={styles.paragraph}>
            Manglam Matrimony uses essential cookies and secure local storage mechanisms strictly for:
          </p>
          <ul className={styles.bulletList}>
            <li><strong>Authentication &amp; Session Continuity:</strong> Maintaining your logged-in session securely across page visits.</li>
            <li><strong>Security Validation:</strong> Preventing cross-site request forgery (CSRF) and detecting suspicious login attempts.</li>
            <li><strong>User Interface Preferences:</strong> Remembering temporary filter states and navigation drawer preferences.</li>
          </ul>
          <p className={styles.paragraph}>
            We do not sell personal browsing behavior to third-party ad networks. You can manage or disable cookies via browser settings, though authentication may require essential session tokens.
          </p>
        </section>

        {/* 6. Security Standards with explicit id="security" */}
        <section id="security" className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>6. Data Security &amp; Storage Architecture</h2>
          <p className={styles.paragraph}>
            We maintain technical, administrative, and physical safeguards designed to prevent unauthorized access, disclosure, or alteration of your personal data:
          </p>
          <ul className={styles.bulletList}>
            <li>All network communications are encrypted in transit using industry-standard Transport Layer Security (TLS 1.3 / HTTPS).</li>
            <li>Sensitive authentication tokens are signed with cryptographic algorithms and subject to bounded session expiry.</li>
            <li>All profiles undergo human moderation and review prior to public discovery eligibility.</li>
          </ul>
        </section>

        {/* 7. Member Rights & Account Deletion */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>7. Your Rights &amp; Profile Deletion</h2>
          <p className={styles.paragraph}>
            You have the right to access, review, edit, or update your personal details and photographs at any time through your Profile Summary and Edit Profile controls.
          </p>
          <p className={styles.paragraph}>
            Should you decide to remove your account (such as upon finding your life partner), you may request complete profile deletion or deactivation by contacting member support.
          </p>
        </section>

        {/* 8. Grievance Redressal */}
        <section className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>8. Grievance Redressal &amp; Support Contact</h2>
          <p className={styles.paragraph}>
            In accordance with applicable digital communications and matrimonial governance standards, members may direct inquiries or privacy concerns to our dedicated desk:
          </p>
          <div className={styles.contactBox}>
            <p><strong>Support &amp; Grievance Desk:</strong> Manglam Matrimony Operations</p>
            <p><strong>Email:</strong> <a href="mailto:support@manglammatrimony.com" className={styles.contactLink}>support@manglammatrimony.com</a></p>
            <p><strong>Help Centre:</strong> <Link href="/help" className={styles.contactLink}>Visit Help Center &amp; FAQs</Link></p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
