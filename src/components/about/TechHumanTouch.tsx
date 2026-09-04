import React from "react";
import Image from "next/image";
import styles from "./TechHumanTouch.module.css";

export function TechHumanTouch() {
  return (
    <section id="tech-human-touch" className={styles.section} aria-labelledby="tech-human-title">
      <div className={styles.container}>
        {/* Left Column: Warm Human Connection Visual */}
        <div className={styles.imageColumn}>
          <Image
            src="/images/about-conversation.jpg"
            alt="Warm festive Indian wedding gathering with couple and family members interacting joyfully"
            fill
            sizes="(max-width: 960px) 100vw, 540px"
            className={styles.conversationImage}
          />
        </div>

        {/* Right Column: Narrative */}
        <div className={styles.contentColumn}>
          <span className={styles.goldEyebrow}>TECHNOLOGY &amp; HUMAN TOUCH</span>

          <h2 id="tech-human-title" className={styles.title}>
            Technology Can Introduce Two People.
            <br />
            People Make the Journey Meaningful.
            <span className={styles.heartIconWrapper} aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </span>
          </h2>

          <p className={styles.descriptionParagraph}>
            While our platform provides the right tools and technology, we
            believe the human touch, care and guidance make all the difference.
          </p>

          <p className={styles.descriptionParagraph}>
            At Manglam, we are committed to supporting you with empathy and
            understanding at every step of your journey.
          </p>
        </div>
      </div>
    </section>
  );
}
