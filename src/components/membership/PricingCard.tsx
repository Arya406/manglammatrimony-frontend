"use client";

import React from "react";
import { MembershipPlan } from "@/data/membershipPlans";
import styles from "./PricingCard.module.css";

interface PricingCardProps {
  plan: MembershipPlan;
  onSelectPlan: (plan: MembershipPlan) => void;
}

export function PricingCard({ plan, onSelectPlan }: PricingCardProps) {
  return (
    <div
      className={`${styles.card} ${plan.isHighlighted ? styles.highlightedCard : ""}`}
      id={`plan-card-${plan.id}`}
      data-testid="plan-card"
    >
      {plan.tag && (
        <div className={styles.tagContainer}>
          <span className={styles.planTag}>{plan.tag}</span>
        </div>
      )}

      <div>
        <div className={styles.cardHeader}>
          <h3 className={styles.durationName}>{plan.duration}</h3>
          <div className={styles.priceRow}>
            <span className={styles.price} data-testid="plan-price">{plan.formattedPrice}</span>
            <span className={styles.period}>{plan.periodText}</span>
          </div>
          <p className={styles.description}>{plan.description}</p>
        </div>

        <div className={styles.divider} />

        <div className={styles.featuresSection}>
          <h4 className={styles.featuresTitle}>Includes:</h4>
          <ul className={styles.featuresList}>
            {plan.features.map((feature, idx) => (
              <li key={idx} className={styles.featureItem}>
                <span className={styles.checkIcon} aria-hidden="true">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {/* 6-Month Specific Disclosures presented clearly */}
          {plan.advisorDetails && (
            <div className={styles.advisorDisclosures}>
              <div className={styles.disclosureBox}>
                <strong>Policy Guarantee:</strong> {plan.advisorDetails.guaranteeText}
              </div>
              <div className={styles.disclosureBox}>
                <strong>Transparent Fee:</strong> {plan.advisorDetails.verificationFeeText}
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        className={`${styles.ctaButton} ${plan.isHighlighted ? styles.ctaHighlighted : ""}`}
        onClick={() => onSelectPlan(plan)}
        aria-label={`Select ${plan.duration} plan for ${plan.formattedPrice}`}
      >
        Select {plan.duration}
      </button>
    </div>
  );
}
