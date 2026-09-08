"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { CinematicNavbar } from "@/components/navbar/CinematicNavbar";
import styles from "./CinematicHero.module.css";

export function CinematicHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly set DOM IDL properties to satisfy browser autoplay policies
    video.defaultMuted = true;
    video.muted = true;

    const attemptPlay = () => {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy or pause handled silently
        });
      }
    };

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener("loadeddata", attemptPlay, { once: true });
      video.addEventListener("canplay", attemptPlay, { once: true });
    }

    return () => {
      video.removeEventListener("loadeddata", attemptPlay);
      video.removeEventListener("canplay", attemptPlay);
    };
  }, []);

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById("story-transition");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className={styles.heroSection} aria-label="Hero Section">
      {/* 1. Transparent Overlay Navigation Header */}
      <CinematicNavbar />

      {/* 2. Background Media Container */}
      <div className={styles.mediaContainer} aria-hidden="true">
        {/* Full-Viewport Background Video (Video-First, No Static Image Fallback) */}
        <video
          ref={videoRef}
          className={styles.videoBackground}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          {/* Mobile Source (screens <= 768px) */}
          <source src="/videos/manglam-hero-mobile.mp4" media="(max-width: 768px)" type="video/mp4" />
          {/* Desktop / Default Source */}
          <source src="/videos/manglam-hero-desktop.mp4" type="video/mp4" />
        </video>

        {/* Balanced Dark/Warm Cinematic Gradient Overlay */}
        <div className={styles.gradientOverlay} />
      </div>

      {/* 3. Hero Editorial Content */}
      <div className={styles.contentContainer}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          <span>Manglam Matrimony</span>
          <span className={styles.eyebrowDot} aria-hidden="true" />
        </div>

        <h1 className={styles.headline}>
          Where Two Lives
          <br />
          Become One Story
        </h1>

        <p className={styles.supportingText}>
          Meaningful connections, rooted in values, family and trust.
        </p>

        <div className={styles.ctaGroup}>
          <Link href="/register" className={styles.primaryCta} id="hero-find-match-btn">
            <span>Find Your Match</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>

          <Link href="/login" className={styles.secondaryCta} id="hero-login-btn">
            Login
          </Link>
        </div>
      </div>

      {/* 4. Subtle Scroll Cue */}
      <a
        href="#story-transition"
        onClick={handleScrollClick}
        className={styles.scrollCue}
        aria-label="Scroll to learn more"
      >
        <span className={styles.scrollLine} aria-hidden="true" />
        <span>Explore</span>
      </a>
    </section>
  );
}
