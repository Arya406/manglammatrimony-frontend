"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileCreatedFor, ProfileCreatedForOption } from "@/types/profile";
import { createProfile, getProfile } from "@/lib/api/profile";
import { ProfileCreatedForCapsule } from "./ProfileCreatedForCapsule";
import { OnboardingProgress } from "./OnboardingProgress";
import styles from "./ProfileCreatedForSelector.module.css";

const PROFILE_OPTIONS: ProfileCreatedForOption[] = [
  { value: "MYSELF", title: "Myself" },
  { value: "MY_SON", title: "My Son" },
  { value: "MY_DAUGHTER", title: "My Daughter" },
  { value: "MY_BROTHER", title: "My Brother" },
  { value: "MY_SISTER", title: "My Sister" },
  { value: "MY_RELATIVE", title: "My Relative" },
  { value: "OTHER", title: "Other" },
];

export function ProfileCreatedForSelector() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<ProfileCreatedFor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-populate if profile already exists in PostgreSQL
  useEffect(() => {
    let isMounted = true;
    async function loadExisting() {
      try {
        const res = await getProfile();
        if (isMounted && res.success && res.data) {
          const profileFor = res.data.profile?.profileCreatedFor || res.data.profileCreatedFor;
          if (profileFor) {
            setSelectedOption(profileFor);
          }
        }
      } catch (err) {
        console.warn("Could not prefetch profile:", err);
      }
    }
    loadExisting();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelect = (value: ProfileCreatedFor) => {
    if (isSubmitting) return;
    setSelectedOption(value);
    setErrorMessage(null);
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await createProfile(selectedOption);

      if (!response.success) {
        if (response.code === "UNAUTHORIZED") {
          setErrorMessage("Your session has expired. Please log in again.");
          setTimeout(() => {
            router.push("/register");
          }, 1500);
          setIsSubmitting(false);
          return;
        }

        setErrorMessage(
          response.message || "We couldn't save your selection. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      // Navigate to the next onboarding step
      router.push("/onboarding/personal-details");
    } catch (err) {
      console.error("Profile creation error:", err);
      setErrorMessage("An unexpected network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.panelWrapper}>
      {/* Centered White Onboarding Surface Panel */}
      <div className={styles.panel}>
        {/* Step Progress Minimal Header */}
        <div className={styles.progressHeader}>
          <OnboardingProgress currentStep={1} totalSteps={6} />
        </div>

        {/* Main Heading & Supporting Text */}
        <div className={styles.headerGroup}>
          <h1 className={styles.title}>Who is this profile for?</h1>
          <p className={styles.subtitle}>
            Tell us who you&apos;re helping find a match.
          </p>
        </div>

        {/* Accessible Error Alert Region */}
        {errorMessage && (
          <div className={styles.errorAlert} role="alert" aria-live="assertive">
            <svg
              className={styles.errorIcon}
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Selection Form with Semantic Fieldset & Capsules */}
        <form onSubmit={handleContinue} className={styles.form}>
          <fieldset className={styles.fieldset} disabled={isSubmitting}>
            <legend className={styles.srOnly}>
              Select who this matrimonial profile is for
            </legend>
            <div className={styles.capsulesContainer}>
              {PROFILE_OPTIONS.map((option) => (
                <ProfileCreatedForCapsule
                  key={option.value}
                  option={option}
                  isSelected={selectedOption === option.value}
                  onSelect={handleSelect}
                  disabled={isSubmitting}
                />
              ))}
            </div>
          </fieldset>

          {/* Subtle Panel Divider */}
          <div className={styles.divider} aria-hidden="true" />

          {/* Full-Width Continue CTA Button */}
          <button
            type="submit"
            disabled={!selectedOption || isSubmitting}
            className={[
              styles.continueButton,
              selectedOption ? styles.continueActive : styles.continueDisabled,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span>{isSubmitting ? "Saving profile..." : "Continue"}</span>
            {!isSubmitting && (
              <svg
                className={styles.arrowIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            )}
          </button>

          {/* Security & Privacy Reassurance */}
          <div className={styles.trustMessage}>
            <svg
              className={styles.lockIcon}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Your information is safe and protected.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
