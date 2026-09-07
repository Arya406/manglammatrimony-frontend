"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompleteProfileData } from "@/types/profile";
import { getProfile, submitProfile, resolvePhotoUrl } from "@/lib/api/profile";
import { useAuth } from "@/lib/auth/AuthContext";
import { ApplicationUnderReviewModal } from "./ApplicationUnderReviewModal";
import styles from "./ProfileReview.module.css";

function calculateAge(dateOfBirthString?: string): number | null {
  if (!dateOfBirthString) return null;
  const dob = new Date(dateOfBirthString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

function formatDate(dateString?: string): string {
  if (!dateString) return "Not specified";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHeight(heightCm?: number | null): string {
  if (!heightCm) return "Not specified";
  const totalInches = Math.round(heightCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${heightCm} cm (${feet}' ${inches}")`;
}

function formatMaritalStatus(status?: string | null): string {
  if (!status) return "Not specified";
  const map: Record<string, string> = {
    NEVER_MARRIED: "Never Married",
    DIVORCED: "Divorced",
    WIDOWED: "Widowed",
    AWAITING_DIVORCE: "Awaiting Divorce",
    ANNULLED: "Annulled",
  };
  return map[status] || status;
}

function formatGender(gender?: string | null): string {
  if (!gender) return "Not specified";
  const map: Record<string, string> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  };
  return map[gender] || gender;
}

function formatManglik(status?: string | null): string {
  if (!status) return "Not specified";
  const map: Record<string, string> = {
    YES: "Manglik",
    NO: "Non-Manglik",
    DONT_KNOW: "Don't Know",
    NOT_APPLICABLE: "Not Applicable",
  };
  return map[status] || status;
}

function formatEmploymentType(type?: string | null): string {
  if (!type) return "Not specified";
  const map: Record<string, string> = {
    FULL_TIME: "Full Time",
    PART_TIME: "Part Time",
    CONTRACT: "Contract",
    FREELANCE: "Freelance",
    INTERNSHIP: "Internship",
    OTHER: "Other",
  };
  return map[type] || type;
}

function formatIncome(range?: string | null): string {
  if (!range) return "Not specified";
  const map: Record<string, string> = {
    BELOW_2_LAKH: "Below ₹2 Lakh",
    TWO_TO_FIVE_LAKH: "₹2–5 Lakh",
    FIVE_TO_TEN_LAKH: "₹5–10 Lakh",
    TEN_TO_FIFTEEN_LAKH: "₹10–15 Lakh",
    FIFTEEN_TO_TWENTY_LAKH: "₹15–20 Lakh",
    TWENTY_TO_THIRTY_LAKH: "₹20–30 Lakh",
    THIRTY_TO_FIFTY_LAKH: "₹30–50 Lakh",
    FIFTY_LAKH_TO_ONE_CRORE: "₹50 Lakh–1 Crore",
    ABOVE_ONE_CRORE: "Above ₹1 Crore",
    PREFER_NOT_TO_SAY: "Prefer not to say",
  };
  return map[range] || range;
}

export function ProfileReview() {
  const router = useRouter();
  const { refreshAuth } = useAuth();

  const [profileData, setProfileData] = useState<CompleteProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [missingSections, setMissingSections] = useState<string[]>([]);

  // 1. Initial Load: Fetch full profile data
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      try {
        const response = await getProfile();
        if (!isMounted) return;

        if (response.success && response.data) {
          setProfileData(response.data);
        } else if (!response.success && response.code === "UNAUTHORIZED") {
          router.replace("/login");
        }
      } catch (err) {
        console.error("Error loading profile review:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Handle Submit for Verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmError(null);
    setServerError(null);
    setMissingSections([]);

    if (!isConfirmed) {
      setConfirmError(
        "Please confirm that your information and photos are genuine before submitting."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitProfile();

      if (!response.success) {
        if (response.code === "UNAUTHORIZED") {
          setServerError("Your session has expired. Please log in again.");
          setTimeout(() => router.push("/login"), 1500);
          return;
        }

        if (
          response.code === "PROFILE_ALREADY_SUBMITTED" ||
          response.code === "PROFILE_ALREADY_ACTIVE"
        ) {
          await refreshAuth();
          router.push("/matches");
          return;
        }

        if (response.code === "PROFILE_INCOMPLETE") {
          setServerError("Your profile isn't ready yet. Please complete the missing sections.");
          if (Array.isArray(response.details?.missingSections)) {
            setMissingSections(response.details.missingSections);
          }
          return;
        }

        if (response.code === "NO_APPROVED_PHOTO") {
          setServerError("Your profile needs at least one photo before submission.");
          return;
        }

        setServerError(
          response.message || "We couldn't submit your profile. Please try again."
        );
        return;
      }

      // Successful submission: Refresh authenticated profile state and navigate directly to /matches
      await refreshAuth();
      router.push("/matches");
    } catch (err) {
      console.error("Profile submission error:", err);
      setServerError("We couldn't submit your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.panelWrapper}>
        <div className={styles.panel}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading your profile details...</p>
          </div>
        </div>
      </div>
    );
  }

  const profile = profileData?.profile || profileData;
  const personal = profileData?.personalDetails;
  const religion = profileData?.religion;
  const education = profileData?.education;
  const career = profileData?.career;
  const photos = profileData?.photos || [];
  const partner = profileData?.partnerPreferences || profileData?.partnerPreference;
  const languages = profileData?.languages || [];

  const primaryPhoto =
    photos.find((p) => p.photoType === "PRIMARY") || photos[0] || null;

  const age = calculateAge(personal?.dateOfBirth);
  const completion = profile?.completionPercentage ?? 100;

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        {/* SECTION 1: REVIEW HEADER */}
        <div className={styles.headerGroup}>
          <span className={styles.eyebrow}>PROFILE REVIEW</span>
          <h1 className={styles.title}>Review your profile</h1>
          <p className={styles.subtitle}>
            Everything looks good? Review your details before submitting your profile
            for verification.
          </p>

          {/* Under Review Status Notice Banner if profile is IN_REVIEW */}
          {profile?.profileStatus === "IN_REVIEW" && (
            <div className={styles.underReviewBanner} role="status">
              <div className={styles.underReviewIcon} aria-hidden="true">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7B1123"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <div className={styles.underReviewText}>
                <div className={styles.underReviewHeaderRow}>
                  <h2 className={styles.underReviewTitle}>Application Under Review</h2>
                  <span className={styles.underReviewBadge}>IN_REVIEW</span>
                </div>
                <p className={styles.underReviewDesc}>
                  Your profile has been submitted successfully and is currently under review by our moderation team. You can review your details below or make edits at any time. Once approved, your profile will become discoverable to compatible matches.
                </p>
              </div>
            </div>
          )}

          {/* Progress Completion Bar */}
          <div className={styles.completionBarWrapper}>
            <div className={styles.completionHeader}>
              <span className={styles.completionLabel}>Profile completion</span>
              <span className={styles.completionPercent}>{completion}%</span>
            </div>
            <div className={styles.progressTrack} aria-hidden="true">
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PROFILE IDENTITY HEADER */}
        <div className={styles.identityCard}>
          <div className={styles.avatarWrapper}>
            {primaryPhoto?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={primaryPhoto.url}
                alt={`${personal?.firstName || "Profile"} photo`}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7B1123"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>

          <div className={styles.identityInfo}>
            <h2 className={styles.identityName}>
              {personal?.firstName
                ? `${personal.firstName} ${personal.lastName || ""}`.trim()
                : "Your Profile"}
            </h2>
            <p className={styles.identityDetails}>
              {[
                age ? `${age} years` : null,
                formatGender(personal?.gender),
                formatMaritalStatus(personal?.maritalStatus),
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>
            <div className={styles.badgeRow}>
              {profile?.profileStatus === "ACTIVE" ? (
                <span
                  className={styles.completeBadge}
                  style={{ background: "#F0FDF4", color: "#166534", borderColor: "#86EFAC" }}
                >
                  ✓ Profile Live
                </span>
              ) : (
                <span className={styles.completeBadge}>✓ Profile Complete</span>
              )}
            </div>
          </div>
        </div>

        {/* Server & Validation Error Alerts */}
        {(serverError || confirmError) && (
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
            <div className={styles.errorContent}>
              <span>{serverError || confirmError}</span>
              {missingSections.length > 0 && (
                <ul className={styles.missingList}>
                  {missingSections.map((sec) => (
                    <li key={sec}>{sec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className={styles.reviewSectionsContainer}>
          {/* SECTION 3: ABOUT YOU */}
          <section className={styles.sectionBlock} aria-labelledby="about-heading">
            <div className={styles.sectionHeader}>
              <h3 id="about-heading" className={styles.sectionTitle}>
                ABOUT YOU
              </h3>
              <Link
                href="/onboarding/personal-details?mode=edit"
                className={styles.editLink}
                aria-label="Edit personal details"
              >
                Edit →
              </Link>
            </div>
            <dl className={styles.dataGrid}>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>First Name</dt>
                <dd className={styles.dataValue}>{personal?.firstName || "Not specified"}</dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Last Name</dt>
                <dd className={styles.dataValue}>{personal?.lastName || "Not specified"}</dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Gender</dt>
                <dd className={styles.dataValue}>{formatGender(personal?.gender)}</dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Date of Birth</dt>
                <dd className={styles.dataValue}>{formatDate(personal?.dateOfBirth)}</dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Marital Status</dt>
                <dd className={styles.dataValue}>
                  {formatMaritalStatus(personal?.maritalStatus)}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Height</dt>
                <dd className={styles.dataValue}>{formatHeight(personal?.heightCm)}</dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Mother Tongue</dt>
                <dd className={styles.dataValue}>
                  {personal?.motherTongue?.name || "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Location</dt>
                <dd className={styles.dataValue}>
                  {personal?.city && personal?.state
                    ? `${personal.city}, ${personal.state}`
                    : personal?.city || personal?.state || "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Spoken Languages</dt>
                <dd className={styles.dataValue}>
                  {languages.length > 0
                    ? languages.map((l) => l.name).join(" • ")
                    : "Not specified"}
                </dd>
              </div>
            </dl>
          </section>

          {/* SECTION 4: RELIGION & COMMUNITY */}
          <section className={styles.sectionBlock} aria-labelledby="religion-heading">
            <div className={styles.sectionHeader}>
              <h3 id="religion-heading" className={styles.sectionTitle}>
                RELIGION & COMMUNITY
              </h3>
              <Link
                href="/onboarding/religion?mode=edit"
                className={styles.editLink}
                aria-label="Edit religion and community"
              >
                Edit →
              </Link>
            </div>
            <dl className={styles.dataGrid}>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Religion</dt>
                <dd className={styles.dataValue}>
                  {religion?.effectiveReligion ||
                    (religion?.religion?.slug !== "other" ? religion?.religion?.name : null) ||
                    religion?.customReligion ||
                    "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Community</dt>
                <dd className={styles.dataValue}>
                  {religion?.effectiveCommunity ||
                    (religion?.community?.slug !== "other" ? religion?.community?.name : null) ||
                    religion?.customCommunity ||
                    "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Sub-community</dt>
                <dd className={styles.dataValue}>
                  {religion?.subCommunity?.name || "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Caste</dt>
                <dd className={styles.dataValue}>
                  {religion?.effectiveCaste ||
                    (religion?.caste?.slug !== "other" ? religion?.caste?.name : null) ||
                    religion?.customCaste ||
                    "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Sub-caste</dt>
                <dd className={styles.dataValue}>
                  {religion?.effectiveSubCaste ||
                    (religion?.subCaste?.slug !== "other" ? religion?.subCaste?.name : null) ||
                    religion?.customSubCaste ||
                    "Not specified"}
                </dd>
              </div>
              {religion?.religion?.slug === "hindu" && (
                <div className={styles.dataRow}>
                  <dt className={styles.dataLabel}>Gotra</dt>
                  <dd className={styles.dataValue}>
                    {religion?.gotra?.name || "Not specified"}
                  </dd>
                </div>
              )}
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Manglik</dt>
                <dd className={styles.dataValue}>{formatManglik(religion?.manglik)}</dd>
              </div>
            </dl>
          </section>

          {/* SECTION 5: EDUCATION & CAREER */}
          <section className={styles.sectionBlock} aria-labelledby="education-heading">
            <div className={styles.sectionHeader}>
              <h3 id="education-heading" className={styles.sectionTitle}>
                EDUCATION & CAREER
              </h3>
              <Link
                href="/onboarding/education-career?mode=edit"
                className={styles.editLink}
                aria-label="Edit education and career"
              >
                Edit →
              </Link>
            </div>
            <dl className={styles.dataGrid}>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Education</dt>
                <dd className={styles.dataValue}>
                  {education?.education?.name || "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Specialization</dt>
                <dd className={styles.dataValue}>
                  {education?.specialization?.name || "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Institution</dt>
                <dd className={styles.dataValue}>
                  {education?.institution?.name ||
                    education?.institutionName ||
                    "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Employment Status</dt>
                <dd className={styles.dataValue}>
                  {career?.employmentStatus?.name || "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Occupation</dt>
                <dd className={styles.dataValue}>
                  {career?.occupation?.name || "Not specified"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Employment Type</dt>
                <dd className={styles.dataValue}>
                  {formatEmploymentType(career?.employmentType)}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Company</dt>
                <dd className={styles.dataValue}>{career?.companyName || "Not specified"}</dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Annual Income</dt>
                <dd className={styles.dataValue}>
                  {formatIncome(career?.annualIncomeRange)}
                </dd>
              </div>
            </dl>
          </section>

          {/* SECTION 6: PHOTOS */}
          <section className={styles.sectionBlock} aria-labelledby="photos-heading">
            <div className={styles.sectionHeader}>
              <h3 id="photos-heading" className={styles.sectionTitle}>
                PHOTOS ({photos.length})
              </h3>
              <Link
                href="/onboarding/photos?mode=edit"
                className={styles.editLink}
                aria-label="Edit photos"
              >
                Edit →
              </Link>
            </div>
            {photos.length === 0 ? (
              <p className={styles.emptyNote}>No photos uploaded yet.</p>
            ) : (
              <div className={styles.photoThumbnailsRow}>
                {photos.map((photo, index) => (
                  <div key={photo.id} className={styles.thumbnailCard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvePhotoUrl(photo.url)}
                      alt={`Photo ${index + 1}`}
                      className={styles.thumbnailImg}
                    />
                    {photo.photoType === "PRIMARY" && (
                      <span className={styles.thumbPrimaryBadge}>★ Main</span>
                    )}
                    <span
                      className={[
                        styles.thumbStatusPill,
                        photo.moderationStatus === "APPROVED"
                          ? styles.thumbStatusApproved
                          : photo.moderationStatus === "PENDING"
                          ? styles.thumbStatusPending
                          : styles.thumbStatusRejected,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {photo.moderationStatus === "APPROVED"
                        ? "Approved"
                        : photo.moderationStatus === "PENDING"
                        ? "Under review"
                        : "Needs attention"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 7: PARTNER PREFERENCES */}
          <section className={styles.sectionBlock} aria-labelledby="partner-heading">
            <div className={styles.sectionHeader}>
              <h3 id="partner-heading" className={styles.sectionTitle}>
                PARTNER PREFERENCES
              </h3>
              <Link
                href="/onboarding/partner-preferences?mode=edit"
                className={styles.editLink}
                aria-label="Edit partner preferences"
              >
                Edit →
              </Link>
            </div>
            <dl className={styles.dataGrid}>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Age Range</dt>
                <dd className={styles.dataValue}>
                  {partner?.minAge && partner?.maxAge
                    ? `${partner.minAge} – ${partner.maxAge} years`
                    : partner?.minAge
                    ? `Min ${partner.minAge} years`
                    : partner?.maxAge
                    ? `Max ${partner.maxAge} years`
                    : "No preference"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Height Range</dt>
                <dd className={styles.dataValue}>
                  {partner?.minHeightCm && partner?.maxHeightCm
                    ? `${partner.minHeightCm} – ${partner.maxHeightCm} cm`
                    : partner?.minHeightCm
                    ? `Min ${partner.minHeightCm} cm`
                    : partner?.maxHeightCm
                    ? `Max ${partner.maxHeightCm} cm`
                    : "No preference"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Religions</dt>
                <dd className={styles.dataValue}>
                  {partner?.religions && partner.religions.length > 0
                    ? partner.religions.map((r) => r.name).join(", ")
                    : "No preference"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Communities</dt>
                <dd className={styles.dataValue}>
                  {partner?.communities && partner.communities.length > 0
                    ? partner.communities.map((c) => c.name).join(", ")
                    : "No preference"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Educations</dt>
                <dd className={styles.dataValue}>
                  {partner?.educations && partner.educations.length > 0
                    ? partner.educations.map((e) => e.name).join(", ")
                    : "No preference"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Occupations</dt>
                <dd className={styles.dataValue}>
                  {partner?.occupations && partner.occupations.length > 0
                    ? partner.occupations.map((o) => o.name).join(", ")
                    : "No preference"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Manglik Preference</dt>
                <dd className={styles.dataValue}>
                  {partner?.manglikStatuses && partner.manglikStatuses.length > 0
                    ? partner.manglikStatuses.map(formatManglik).join(", ")
                    : "No preference"}
                </dd>
              </div>
              <div className={styles.dataRow}>
                <dt className={styles.dataLabel}>Marital Status</dt>
                <dd className={styles.dataValue}>
                  {partner?.maritalStatuses && partner.maritalStatuses.length > 0
                    ? partner.maritalStatuses.map(formatMaritalStatus).join(", ")
                    : "No preference"}
                </dd>
              </div>
            </dl>
          </section>

          {/* SECTION 8: WHAT HAPPENS NEXT */}
          <div className={styles.nextStepsCard}>
            <h4 className={styles.nextStepsTitle}>WHAT HAPPENS NEXT?</h4>
            <ul className={styles.nextStepsList}>
              <li>
                <span className={styles.checkIcon}>✓</span>
                <span>Your profile will be submitted for verification.</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                <span>Our team will review your profile and photos.</span>
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                <span>
                  Once approved, your profile can become visible to relevant members.
                </span>
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                <span>You can continue updating your profile anytime later.</span>
              </li>
            </ul>
          </div>

          {/* SECTION 9 & 10: ACTION AREA */}
          {(() => {
            const currentStatus = profile?.profileStatus || profileData?.profileStatus;

            if (currentStatus === "IN_REVIEW") {
              return (
                <div className={styles.actionForm}>
                  <div className={styles.divider} aria-hidden="true" />
                  <div className={styles.actionRow}>
                    <Link
                      href="/onboarding/personal-details"
                      className={styles.submitButton}
                    >
                      <span>Edit Profile</span>
                      <svg
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
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </Link>
                  </div>

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
                    <span>Your profile is securely under review. Edits will be updated automatically.</span>
                  </div>
                </div>
              );
            }

            if (currentStatus === "ACTIVE") {
              return (
                <div className={styles.actionForm}>
                  <div className={styles.divider} aria-hidden="true" />
                  <div className={styles.actionRow}>
                    <Link href="/matches" className={styles.submitButton}>
                      <span>Explore Matches</span>
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
                    </Link>
                  </div>
                </div>
              );
            }

            return (
              <>
                <div className={styles.confirmationWrapper}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isConfirmed}
                      onChange={(e) => {
                        setIsConfirmed(e.target.checked);
                        if (e.target.checked) setConfirmError(null);
                      }}
                      disabled={isSubmitting}
                      className={styles.checkbox}
                      required
                    />
                    <span className={styles.checkboxText}>
                      I confirm that the information and photos provided are genuine and
                      belong to the person represented in this profile.
                    </span>
                  </label>
                </div>

                <div className={styles.divider} aria-hidden="true" />

                <form onSubmit={handleSubmit} className={styles.actionForm}>
                  <div className={styles.actionRow}>
                    <Link
                      href="/onboarding/partner-preferences"
                      className={styles.backButton}
                      aria-label="Go back to Partner Preferences"
                    >
                      ← Back
                    </Link>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={styles.submitButton}
                    >
                      <span>
                        {isSubmitting
                          ? "Submitting profile..."
                          : "Submit Profile for Review"}
                      </span>
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
                  </div>

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
                    <span>Your information is securely protected.</span>
                  </div>
                </form>
              </>
            );
          })()}
        </div>
      </div>

      {/* Application Under Review Confirmation Modal */}
      <ApplicationUnderReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
      />
    </div>
  );
}
