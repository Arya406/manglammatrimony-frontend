import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { Footer } from "@/components/footer/Footer";
import styles from "./safety.module.css";

export const metadata: Metadata = {
  title: "Safety Guidelines — Manglam Matrimony",
  description:
    "Essential safety tips, verification practices, and red-flag alerts to protect yourself and your family while searching for a life partner.",
};

const SAFETY_RULES = [
  {
    number: "01",
    title: "Keep Initial Conversations on the Platform",
    text: "Use Manglam Matrimony's secure 1-on-1 message requests for initial introductions. Avoid rushing to share personal phone numbers, home addresses, or private messaging apps until you and your family have established mutual comfort.",
  },
  {
    number: "02",
    title: "Never Send Money or Financial Assistance",
    text: "Legitimate matrimonial prospects will never request money, cryptocurrency, bank wire transfers, emergency medical funds, or travel assistance. If anyone asks for money under any pretext, cease communication immediately and report their profile.",
  },
  {
    number: "03",
    title: "Involve Family Members Early",
    text: "Matrimonial alliances flourish on family transparency. Discuss prospective matches openly with parents, guardians, or trusted elders, and arrange family-to-family calls before making personal commitments.",
  },
  {
    number: "04",
    title: "Conduct Video Calls Prior to In-Person Meetings",
    text: "Before meeting face-to-face, schedule a video conversation to verify that the person you are communicating with matches their uploaded photographs and declared identity.",
  },
  {
    number: "05",
    title: "Always Meet in Open, Public Places",
    text: "When scheduling an in-person meeting, always choose a well-lit, populated public venue (such as a busy cafe or family restaurant). Arrange your own reliable transportation and inform family or friends of your location.",
  },
  {
    number: "06",
    title: "Verify Educational & Professional Backgrounds",
    text: "Take time to independently verify education, occupation, and company affiliations through professional platforms or standard customary community references before solemnizing an alliance.",
  },
  {
    number: "07",
    title: "Protect Sensitive Personal Identification",
    text: "Never share sensitive financial or identity credentials such as bank account numbers, credit card details, OTPs, PAN cards, or Aadhaar details with any matrimonial prospect.",
  },
  {
    number: "08",
    title: "Beware of Excessive Urgency or Inconsistencies",
    text: "Be cautious if a prospect professes premature love within days, exerts pressure for an immediate marriage without family meetings, or displays inconsistent background stories.",
  },
  {
    number: "09",
    title: "Trust Your Intuition",
    text: "If something feels uncomfortable, insincere, or contradictory, pause the conversation. You are never obligated to continue communication with anyone who makes you feel uneasy.",
  },
  {
    number: "10",
    title: "Report Suspicious Accounts Promptly",
    text: "Help protect the entire Manglam community. If you encounter fake profiles, abusive behavior, or suspicious solicitations, immediately notify our moderation desk for swift investigation.",
  },
];

export default function SafetyPage() {
  return (
    <div className={styles.pageContainer}>
      <SiteHeader />

      <main className={styles.mainContent}>
        {/* Informational Guidance Notice */}
        <div className={styles.noticeBanner} role="note">
          <strong>Safety Advisory:</strong> These guidelines are provided as practical safety precautions for matrimonial seekers and their families. While Manglam Matrimony verifies member profiles, users must exercise independent caution and family diligence during their search.
        </div>

        <header className={styles.headerSection}>
          <span className={styles.eyebrow}>SAFE &amp; SECURE MATCHMAKING</span>
          <h1 className={styles.pageTitle}>Safety Guidelines</h1>
          <p className={styles.metaInfo}>
            Ten fundamental rules to ensure your matrimonial journey remains safe, dignified, and joyful.
          </p>
        </header>

        {/* 10 Safety Rules */}
        <section aria-label="Ten Matrimonial Safety Rules">
          {SAFETY_RULES.map((rule) => (
            <div key={rule.number} className={styles.ruleCard}>
              <div className={styles.ruleNumber}>{rule.number}</div>
              <div className={styles.ruleContent}>
                <h2 className={styles.ruleTitle}>{rule.title}</h2>
                <p className={styles.ruleText}>{rule.text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Red Flag & Reporting Box */}
        <section className={styles.emergencyCard}>
          <h2 className={styles.emergencyTitle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Notice Any Red Flags? Report Immediately</span>
          </h2>
          <p className={styles.emergencyText}>
            Our dedicated moderation desk actively investigates reported profiles. If you suspect fraud, impersonation, or harassment, reach out directly:
          </p>
          <p className={styles.emergencyText}>
            <strong>Email:</strong> <a href="mailto:support@manglammatrimony.com?subject=Safety%20Concern%20Report" className={styles.contactLink}>support@manglammatrimony.com</a>
          </p>
          <p className={styles.emergencyText}>
            You can also consult our <Link href="/help?category=privacy-safety" className={styles.contactLink}>Privacy &amp; Safety FAQs</Link> for additional assistance.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
