import React from "react";
import { SUCCESS_STORIES } from "@/data/stories";
import styles from "./SuccessStories.module.css";

export function SuccessStories() {
  return (
    <section
      id="success-stories"
      className={styles.section}
      aria-labelledby="success-stories-title"
    >
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <span className={styles.goldTag}>TESTIMONIALS</span>
          <h2 id="success-stories-title" className={styles.title}>
            Stories That Began With a Match
          </h2>
          <p className={styles.subtitle}>
            Read inspiring stories of couples who found their life partner
            through shared values, mutual respect, and familial trust.
          </p>
        </div>

        {/* Stories Grid */}
        <div className={styles.storiesGrid}>
          {SUCCESS_STORIES.map((story) => (
            <article key={story.id} className={styles.storyCard}>
              <div className={styles.cardHeader} aria-hidden="true">
                <div className={styles.coupleInitials}>{story.initials}</div>
                <span className={styles.sampleTag}>Demo Story</span>
              </div>

              <div className={styles.cardBody}>
                <blockquote className={styles.quoteText}>
                  &ldquo;{story.quote}&rdquo;
                </blockquote>

                <div className={styles.coupleInfo}>
                  <span className={styles.coupleName}>{story.coupleNames}</span>
                  <span className={styles.coupleLocation}>{story.location}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
