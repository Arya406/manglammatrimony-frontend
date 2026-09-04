"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { FOOTER_LINK_GROUPS } from "@/data/navigation";
import { SearchDiscoveryModal } from "@/components/common/SearchDiscoveryModal";
import styles from "./Footer.module.css";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [socialFeedback, setSocialFeedback] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleSocialClick = (platform: string) => {
    setSocialFeedback(`Manglam Matrimony official ${platform} channel is launching soon.`);
    setTimeout(() => {
      setSocialFeedback(null);
    }, 3500);
  };

  return (
    <footer className={styles.footer} aria-label="Site Footer">
      <div className={styles.container}>
        {/* Top Multi-column Section */}
        <div className={styles.topSection}>
          {/* Brand Column */}
          <div className={styles.brandColumn}>
            <Logo variant="inverse" size="md" />
            <p className={styles.brandDescription}>
              A trusted, elegant Indian matrimonial platform dedicated to
              uniting compatible life partners through shared heritage, dignity,
              and mutual respect.
            </p>

            {/* Social Links Controls */}
            <ul className={styles.socialList} aria-label="Social Media Channels">
              <li>
                <button
                  type="button"
                  onClick={() => handleSocialClick("Instagram")}
                  className={styles.socialButton}
                  aria-label="Manglam Matrimony on Instagram (Coming Soon)"
                  title="Instagram (Coming Soon)"
                >
                  <InstagramIcon />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSocialClick("Facebook")}
                  className={styles.socialButton}
                  aria-label="Manglam Matrimony on Facebook (Coming Soon)"
                  title="Facebook (Coming Soon)"
                >
                  <FacebookIcon />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSocialClick("LinkedIn")}
                  className={styles.socialButton}
                  aria-label="Manglam Matrimony on LinkedIn (Coming Soon)"
                  title="LinkedIn (Coming Soon)"
                >
                  <LinkedinIcon />
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSocialClick("YouTube")}
                  className={styles.socialButton}
                  aria-label="Manglam Matrimony on YouTube (Coming Soon)"
                  title="YouTube (Coming Soon)"
                >
                  <YoutubeIcon />
                </button>
              </li>
            </ul>

            {/* Accessible in-place notification */}
            {socialFeedback && (
              <div className={styles.socialToast} role="status" aria-live="polite">
                {socialFeedback}
              </div>
            )}
          </div>

          {/* Structured Link Columns */}
          {FOOTER_LINK_GROUPS.map((group) => (
            <div key={group.title} className={styles.linkColumn}>
              <h3 className={styles.columnTitle}>{group.title}</h3>
              <ul className={styles.linkList}>
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.isSearchModal ? (
                      <button
                        type="button"
                        onClick={() => setIsSearchModalOpen(true)}
                        className={styles.footerLinkBtn}
                      >
                        {link.label}
                      </button>
                    ) : link.isComingSoon ? (
                      <span
                        className={styles.footerLinkDisabled}
                        title={`${link.label} is coming soon`}
                      >
                        {link.label}
                        <span className={styles.comingSoonBadge}>Soon</span>
                      </span>
                    ) : link.href ? (
                      <Link href={link.href} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    ) : (
                      <span className={styles.footerLinkDisabled}>{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            &copy; {currentYear} Manglam Matrimony. All rights reserved.
          </div>
          <div className={styles.trustTag}>
            ✦ Designed with Dignity &amp; Cultural Warmth for Indian Families
          </div>
        </div>
      </div>

      {/* Search Info Modal */}
      <SearchDiscoveryModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </footer>
  );
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  );
}
