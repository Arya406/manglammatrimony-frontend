"use client";

import React, { useState } from "react";
import { FaqItem } from "@/data/helpFaqData";
import styles from "./FaqAccordion.module.css";

interface FaqAccordionProps {
  items: FaqItem[];
  defaultOpenFirst?: boolean;
}

export function FaqAccordion({ items, defaultOpenFirst = false }: FaqAccordionProps) {
  // Store a set of open item IDs to allow multiple items open simultaneously
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (defaultOpenFirst && items.length > 0) {
      initial.add(items[0].id);
    }
    return initial;
  });

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={styles.accordionContainer} role="region" aria-label="Frequently Asked Questions">
      {items.map((item) => {
        const isOpen = openIds.has(item.id);
        const headerId = `faq-header-${item.id}`;
        const panelId = `faq-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`}
            data-testid="faq-item"
          >
            <h3>
              <button
                type="button"
                id={headerId}
                className={styles.headerButton}
                onClick={() => toggleItem(item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                data-testid="faq-header-button"
              >
                <span className={styles.question}>{item.question}</span>
                <span
                  className={`${styles.chevronIcon} ${isOpen ? styles.chevronRotated : ""}`}
                  aria-hidden="true"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={styles.contentWrapper}
              style={{
                maxHeight: isOpen ? "400px" : "0px",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className={styles.answerBody}>
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
