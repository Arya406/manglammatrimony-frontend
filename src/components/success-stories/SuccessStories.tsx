"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { SUCCESS_STORIES } from "@/data/stories";
import styles from "./SuccessStories.module.css";

export function SuccessStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return false;
  });
  const sectionRef = useRef<HTMLElement>(null);
  const totalStories = SUCCESS_STORIES.length;
  const currentStory = SUCCESS_STORIES[activeIndex];

  // Subscribe to prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // IntersectionObserver for subtle entrance motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    const currentElem = sectionRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => observer.disconnect();
  }, []);

  // Story transition logic (Two-phase synchronization: fade-out then fade-in)
  const goToStory = useCallback(
    (targetIndex: number, moveDirection: "next" | "prev") => {
      if (isTransitioning || targetIndex === activeIndex) return;

      if (prefersReducedMotion) {
        setDirection(moveDirection);
        setActiveIndex(targetIndex);
        return;
      }

      setDirection(moveDirection);
      setIsTransitioning(true);

      // Phase 1: Current content & image fade slightly (240ms)
      const switchTimer = setTimeout(() => {
        setActiveIndex(targetIndex);

        // Phase 2: Next content & image fade/slide in smoothly
        const finishTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, 360);

        return () => clearTimeout(finishTimer);
      }, 240);

      return () => clearTimeout(switchTimer);
    },
    [activeIndex, isTransitioning, prefersReducedMotion]
  );

  const handlePrev = useCallback(() => {
    const prevIndex = (activeIndex - 1 + totalStories) % totalStories;
    goToStory(prevIndex, "prev");
  }, [activeIndex, totalStories, goToStory]);

  const handleNext = useCallback(() => {
    const nextIndex = (activeIndex + 1) % totalStories;
    goToStory(nextIndex, "next");
  }, [activeIndex, totalStories, goToStory]);

  // Automatic carousel cycling (~6.5 seconds)
  useEffect(() => {
    if (prefersReducedMotion || isPaused || isTransitioning) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      handleNext();
    }, 6500);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, isPaused, isTransitioning, handleNext]);

  return (
    <section
      id="success-stories"
      ref={sectionRef}
      className={`${styles.section} ${isVisible ? styles.sectionVisible : ""}`}
      aria-labelledby="success-stories-title"
    >
      {/* Corner Mandala Watermark Artwork */}
      <div className={styles.cornerWatermark} aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="160" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="40" cy="160" r="90" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="40" cy="160" r="60" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="40" cy="160" r="30" stroke="currentColor" strokeWidth="1" />
          <path d="M40 120 L50 150 L80 160 L50 170 L40 200 L30 170 L0 160 L30 150 Z" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className={styles.container}>
        {/* Section Header (Preserved exactly as required) */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>TESTIMONIALS</span>
          <h2 id="success-stories-title" className={styles.title}>
            Stories That Began With a Match
          </h2>
          <p className={styles.subtitle}>
            Read inspiring stories of couples who found their life partner
            through shared values, mutual respect, and familial trust.
          </p>
        </div>

        {/* Featured Story Presentation */}
        <div className={styles.cardWrapper}>
          <article
            className={styles.featuredCard}
            aria-roledescription="carousel"
            aria-label="Success Stories Editorial Presentation"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
          >
            {/* Left: Couple Image (approx 45% desktop / 40% tablet / top mobile) */}
            <div className={styles.imageColumn}>
              <div
                className={`${styles.imageInner} ${
                  isTransitioning ? styles.imageFadeOut : styles.imageFadeIn
                }`}
              >
                <Image
                  src={currentStory.imageUrl || "/images/stories/story-1.jpg"}
                  alt={currentStory.imageAlt || currentStory.coupleNames}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 40vw, 45vw"
                  className={styles.storyPhoto}
                  priority={activeIndex === 0}
                />
              </div>
            </div>

            {/* Right: Editorial Testimonial Content (approx 55% desktop / 60% tablet / bottom mobile) */}
            <div className={styles.contentColumn}>
              {/* Subtle decorative oversized quote mark */}
              <span className={styles.decorativeQuote} aria-hidden="true">
                “
              </span>

              <div
                className={`${styles.contentInner} ${
                  isTransitioning
                    ? direction === "next"
                      ? styles.contentFadeOutNext
                      : styles.contentFadeOutPrev
                    : styles.contentFadeIn
                }`}
                aria-live="polite"
              >
                <div className={styles.storyEyebrow}>
                  <span className={styles.storyEyebrowSparkle}>✦</span>
                  SUCCESS STORY
                </div>

                <blockquote className={styles.quoteText}>
                  &ldquo;{currentStory.quote}&rdquo;
                </blockquote>

                <div className={styles.goldDivider} aria-hidden="true" />

                <div className={styles.coupleMeta}>
                  <div className={styles.coupleName}>{currentStory.coupleNames}</div>
                  <div className={styles.coupleLocation}>{currentStory.location}</div>
                  <div className={styles.foundBadge}>
                    <span className={styles.foundBadgeDot} />
                    Found through Manglam
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Refined Story Navigation */}
        <nav
          className={styles.navigationRow}
          aria-label="Success stories pagination and controls"
        >
          {/* Desktop Previous Button */}
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonDesktop}`}
            onClick={handlePrev}
            aria-label="Previous success story"
            disabled={isTransitioning}
          >
            <span className={`${styles.navArrow} ${styles.navArrowLeft}`}>←</span>
            <span>Previous</span>
          </button>

          {/* Indicators Track: 01 ─── 02 ─── 03 */}
          <div
            className={styles.indicatorsTrack}
            role="tablist"
            aria-label="Select story"
          >
            {SUCCESS_STORIES.map((story, index) => {
              const isActive = index === activeIndex;
              const formattedNumber = String(index + 1).padStart(2, "0");

              return (
                <div key={story.id} className={styles.indicatorItem}>
                  <button
                    type="button"
                    role="tab"
                    id={`story-tab-${story.id}`}
                    aria-selected={isActive}
                    aria-label={`View story ${formattedNumber}: ${story.coupleNames}`}
                    className={`${styles.indicatorButton} ${
                      isActive ? styles.indicatorActive : ""
                    }`}
                    onClick={() => {
                      if (index !== activeIndex) {
                        goToStory(index, index > activeIndex ? "next" : "prev");
                      }
                    }}
                  >
                    <span className={styles.indicatorNumber}>{formattedNumber}</span>
                    <span className={styles.indicatorDot} />
                  </button>

                  {/* Connector Line between indicators */}
                  {index < totalStories - 1 && (
                    <div
                      className={`${styles.indicatorConnector} ${
                        isActive ? styles.indicatorConnectorActive : ""
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Next Button */}
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonDesktop}`}
            onClick={handleNext}
            aria-label="Next success story"
            disabled={isTransitioning}
          >
            <span>Next</span>
            <span className={`${styles.navArrow} ${styles.navArrowRight}`}>→</span>
          </button>

          {/* Mobile Buttons Group (side-by-side below indicators) */}
          <div className={styles.mobileNavButtons}>
            <button
              type="button"
              className={styles.navButton}
              onClick={handlePrev}
              aria-label="Previous success story"
              disabled={isTransitioning}
            >
              <span className={`${styles.navArrow} ${styles.navArrowLeft}`}>←</span>
              <span>Previous</span>
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={handleNext}
              aria-label="Next success story"
              disabled={isTransitioning}
            >
              <span>Next</span>
              <span className={`${styles.navArrow} ${styles.navArrowRight}`}>→</span>
            </button>
          </div>
        </nav>
      </div>
    </section>
  );
}
