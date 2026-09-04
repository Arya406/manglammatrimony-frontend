"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { HelpCategoryCard } from "@/components/help/HelpCategoryCard";
import { FaqAccordion } from "@/components/help/FaqAccordion";
import { ContactSupportModal } from "@/components/help/ContactSupportModal";
import { HELP_CATEGORIES, FAQ_ITEMS } from "@/data/helpFaqData";
import styles from "./help.module.css";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Deterministically open ContactSupportModal if arrived at or hash changed to #contact
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#contact") {
        setIsSupportModalOpen(true);
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // Client-side dynamic filtering
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      // 1. Category match
      if (selectedCategoryId && item.categoryId !== selectedCategoryId) {
        return false;
      }

      // 2. Search query match (matches question, answer, or keywords)
      if (query) {
        const matchesQuestion = item.question.toLowerCase().includes(query);
        const matchesAnswer = item.answer.toLowerCase().includes(query);
        const matchesKeyword = item.keywords.some((kw) => kw.toLowerCase().includes(query));
        return matchesQuestion || matchesAnswer || matchesKeyword;
      }

      return true;
    });
  }, [searchQuery, selectedCategoryId]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId));
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategoryId(null);
  };

  const activeCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return HELP_CATEGORIES.find((c) => c.id === selectedCategoryId);
  }, [selectedCategoryId]);

  return (
    <div className={styles.pageWrapper}>
      <SiteHeader />

      <main className={styles.mainContent}>
        {/* Hero Section with Live Search */}
        <section className={styles.heroSection} aria-labelledby="help-hero-heading">
          <div className={styles.heroTag}>
            <span>✦ Help & Support Centre</span>
          </div>
          <h1 id="help-hero-heading" className={styles.heroHeading}>
            How can we help?
          </h1>
          <p className={styles.heroSubheading}>
            Find answers to common questions or get help with your Manglam Matrimony account.
          </p>

          {/* Search Input */}
          <div className={styles.searchContainer}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search help articles"
              id="help-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchButton}
                onClick={handleClearSearch}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>
        </section>

        {/* Categories Grid */}
        <section className={styles.categoriesSection} aria-labelledby="categories-heading">
          <div className={styles.sectionHeaderRow}>
            <h2 id="categories-heading" className={styles.sectionTitle}>
              Browse by Category
            </h2>
            {selectedCategoryId && (
              <button
                type="button"
                className={styles.viewAllButton}
                onClick={() => setSelectedCategoryId(null)}
              >
                View All Categories
              </button>
            )}
          </div>

          <div className={styles.categoriesGrid}>
            {HELP_CATEGORIES.map((cat) => (
              <HelpCategoryCard
                key={cat.id}
                category={cat}
                isActive={selectedCategoryId === cat.id}
                onSelect={handleCategorySelect}
              />
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section className={styles.faqSection} aria-labelledby="faq-section-heading">
          <div className={styles.resultsMeta}>
            <h2 id="faq-section-heading" className={styles.sectionTitle}>
              {activeCategory ? activeCategory.title : "Frequently Asked Questions"}
            </h2>
            <div>
              {searchQuery && (
                <span>
                  Found {filteredFaqs.length} {filteredFaqs.length === 1 ? "article" : "articles"}
                </span>
              )}
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <FaqAccordion items={filteredFaqs} defaultOpenFirst={false} />
          ) : (
            <div className={styles.noResultsCard}>
              <div className={styles.noResultsIcon} aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </div>
              <h3 className={styles.noResultsTitle}>No matching articles found</h3>
              <p className={styles.noResultsText}>
                We couldn&apos;t find any answers matching &ldquo;{searchQuery}&rdquo;. Try using different keywords or browse by category above.
              </p>
              <button
                type="button"
                className={styles.resetButton}
                onClick={handleResetFilters}
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </section>

        {/* Still Need Help Support Section with id="contact" */}
        <section id="contact" className={styles.supportSection} aria-labelledby="support-section-heading">
          <div className={styles.supportContent}>
            <h2 id="support-section-heading" className={styles.supportHeading}>
              Still need help?
            </h2>
            <p className={styles.supportSubtext}>
              Our support team is here to help with account and platform questions. Reach out for dedicated guidance regarding verification, profile moderation, and matchmaking inquiries.
            </p>
          </div>
          <button
            type="button"
            className={styles.contactButton}
            onClick={() => setIsSupportModalOpen(true)}
            id="contact-support-cta"
          >
            Contact Support
          </button>
        </section>
      </main>

      {/* Contact Support Dialog */}
      <ContactSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
}
