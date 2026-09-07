"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ProfileCardData } from "@/types/profile-card";
import { RelationshipState } from "@/types/messaging";
import { getPublicProfile } from "@/lib/api/profile";
import styles from "./ProfileDetailModal.module.css";

interface ExtendedProfileData extends ProfileCardData {
  customReligion?: string | null;
  customCommunity?: string | null;
  customSubCommunity?: string | null;
  customCaste?: string | null;
  customSubCaste?: string | null;
}

interface ProfileDetailModalProps {
  profile: ProfileCardData | null;
  isOpen: boolean;
  relationshipState: RelationshipState;
  isFavourite: boolean;
  isActionLoading: boolean;
  onClose: () => void;
  onToggleFavourite: () => void;
  onMessageClick: (e: React.MouseEvent) => void;
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Normalizes field values, filtering out placeholders like "Not specified",
 * and resolving custom inputs when standard value is "Other".
 */
function getEffectiveValue(
  standardValue?: string | null,
  customValue?: string | null
): string | null {
  if (customValue && customValue.trim()) {
    return customValue.trim();
  }
  if (!standardValue) return null;
  const trimmed = standardValue.trim();
  if (trimmed.toLowerCase() === "other") {
    return null;
  }
  if (
    trimmed.toLowerCase() === "not specified" ||
    trimmed.toLowerCase() === "not provided" ||
    trimmed.toLowerCase() === "location not specified" ||
    trimmed.toLowerCase() === "location not provided"
  ) {
    return null;
  }
  return trimmed;
}

export function ProfileDetailModal({
  profile,
  isOpen,
  relationshipState,
  isFavourite,
  isActionLoading,
  onClose,
  onToggleFavourite,
  onMessageClick,
}: ProfileDetailModalProps) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [prevProfileId, setPrevProfileId] = useState<string | null>(profile?.id || null);
  const [fetchedDetails, setFetchedDetails] = useState<ProfileCardData | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Sync state during render when candidate profile changes
  if (profile && profile.id !== prevProfileId) {
    setPrevProfileId(profile.id);
    setPhotoIndex(0);
    setFetchedDetails(null);
  }

  // Fetch full public candidate profile from GET /api/profile/:profileId
  useEffect(() => {
    if (!isOpen || !profile?.id) return;

    let isActive = true;

    getPublicProfile(profile.id)
      .then((res) => {
        if (!isActive) return;
        if (res.success && res.data) {
          setFetchedDetails(res.data);
        }
      })
      .catch((err) => {
        if (!isActive) return;
        console.error("[PROFILE DETAIL FETCH ERROR]:", err);
      });

    return () => {
      isActive = false;
    };
  }, [isOpen, profile?.id]);

  // Focus trap & background scroll lock
  useEffect(() => {
    if (!isOpen) return;

    // Save previous active element to restore focus on close
    triggerRef.current = document.activeElement as HTMLElement | null;

    // Lock body scrolling and prevent layout shift
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    // Move focus into the modal
    modalRef.current?.focus();

    // Escape key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;

      // Restore focus to trigger
      if (triggerRef.current && typeof triggerRef.current.focus === "function") {
        triggerRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isMounted) return null;

  const currentData = fetchedDetails ? { ...profile, ...fetchedDetails } : profile;

  if (!currentData) {
    const errorModal = (
      <div
        className={styles.overlay}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Profile not found"
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.errorContainer}>
            <p>Candidate profile is currently unavailable.</p>
            <button
              type="button"
              className={styles.closeSecondaryButton}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
    return createPortal(errorModal, document.body);
  }

  // Process photos
  const rawPhotos = currentData.photos || [];
  const photoList = rawPhotos.map((item, idx) => {
    if (typeof item === "string") {
      return { url: item, alt: `${currentData.name} photo ${idx + 1}` };
    }
    return {
      url: item.url,
      alt: item.alt || `${currentData.name} photo ${idx + 1}`,
    };
  });

  const totalPhotos = photoList.length;
  const currentPhoto = photoList[photoIndex] || photoList[0];
  const photoUrl = currentPhoto?.url;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
  };

  const extendedData = currentData as ExtendedProfileData;

  // Extract and sanitize candidate fields
  const effectiveReligion = getEffectiveValue(
    currentData.religion,
    extendedData.customReligion
  );
  const effectiveCommunity = getEffectiveValue(
    currentData.community,
    extendedData.customCommunity
  );
  const effectiveSubCommunity = getEffectiveValue(
    currentData.subCommunity,
    extendedData.customSubCommunity
  );
  const effectiveCaste = getEffectiveValue(
    currentData.caste,
    extendedData.customCaste
  );
  const effectiveSubCaste = getEffectiveValue(
    currentData.subCaste,
    extendedData.customSubCaste
  );
  const effectiveGotra = getEffectiveValue(currentData.gotra);
  const effectiveManglik = getEffectiveValue(currentData.manglik);

  const effectiveEducation = getEffectiveValue(currentData.education);
  const effectiveSpecialization = getEffectiveValue(currentData.specialization);
  const effectiveInstitution = getEffectiveValue(currentData.institution);
  const effectiveEmployment = getEffectiveValue(currentData.employmentStatus);
  const effectiveEmploymentType = getEffectiveValue(currentData.employmentType);
  const effectiveOccupation = getEffectiveValue(currentData.occupation);
  const effectiveIncome = getEffectiveValue(currentData.incomeRange);

  const effectiveGender = getEffectiveValue(currentData.gender);
  const effectiveMarital = getEffectiveValue(currentData.maritalStatus);
  const effectiveMotherTongue = getEffectiveValue(currentData.motherTongue);
  const effectiveHeight =
    currentData.heightFormatted ||
    (currentData.heightCm ? `${currentData.heightCm} cm` : null);
  const effectiveCreatedFor = getEffectiveValue(currentData.profileCreatedFor);
  const effectiveLocation = getEffectiveValue(
    currentData.location ||
      [currentData.city, currentData.state].filter(Boolean).join(", ")
  );

  // Partner Preferences check
  const pref = currentData.partnerPreference;
  const hasPreferences =
    pref &&
    Boolean(
      pref.minAge ||
        pref.maxAge ||
        pref.minHeightCm ||
        pref.maxHeightCm ||
        (pref.religions && pref.religions.length > 0) ||
        (pref.communities && pref.communities.length > 0) ||
        (pref.castes && pref.castes.length > 0) ||
        (pref.gotras && pref.gotras.length > 0) ||
        (pref.educations && pref.educations.length > 0) ||
        (pref.occupations && pref.occupations.length > 0) ||
        (pref.maritalStatuses && pref.maritalStatuses.length > 0) ||
        (pref.manglik && pref.manglik.length > 0)
    );

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-dialog-name"
      aria-describedby="profile-dialog-desc"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================
            LEFT COLUMN: PRIMARY PHOTO & HERO CAROUSEL AREA (42%)
            ======================================================== */}
        <div className={styles.leftColumn}>
          <div className={styles.photoContainer}>
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={currentPhoto?.alt || `Photo of ${currentData.name}`}
                fill
                sizes="(max-width: 860px) 100vw, 420px"
                className={styles.photo}
                priority
              />
            ) : (
              <div className={styles.photoPlaceholder}>
                <div className={styles.placeholderAvatar}>
                  {currentData.name.charAt(0).toUpperCase()}
                </div>
                <span className={styles.placeholderText}>
                  Photo Protected / Not Provided
                </span>
              </div>
            )}

            {/* Subtle aesthetic gradient for carousel readability */}
            <div className={styles.photoGradientOverlay} aria-hidden="true" />

            {/* Multi-photo carousel controls */}
            {totalPhotos > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navPrev}`}
                  onClick={handlePrev}
                  aria-label="View previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navNext}`}
                  onClick={handleNext}
                  aria-label="View next photo"
                >
                  ›
                </button>
                <div className={styles.photoCounter}>
                  {photoIndex + 1} / {totalPhotos}
                </div>
                <div className={styles.dotsContainer}>
                  {photoList.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`${styles.dot} ${
                        idx === photoIndex ? styles.dotActive : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotoIndex(idx);
                      }}
                      aria-label={`Go to photo ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: HEADER, SCROLLABLE PROFILE DATA & ACTIONS (58%)
            ======================================================== */}
        <div className={styles.rightColumn}>
          {/* 1. STICKY / FIXED HEADER */}
          <div className={styles.headerContainer}>
            <div className={styles.headerInfo}>
              <div className={styles.nameRow}>
                <h2 id="profile-dialog-name" className={styles.candidateName}>
                  {currentData.name}
                  {currentData.age ? (
                    <span className={styles.candidateAge}>, {currentData.age}</span>
                  ) : null}
                </h2>
                {currentData.isVerified && (
                  <span
                    className={styles.verifiedBadge}
                    title="Verified Matrimonial Profile"
                    aria-label="Verified Matrimonial Profile"
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                    </svg>
                    <span>Verified</span>
                  </span>
                )}
              </div>

              {effectiveLocation && (
                <div className={styles.locationRow} id="profile-dialog-desc">
                  <svg
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
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{effectiveLocation}</span>
                </div>
              )}
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={`${styles.favouriteButton} ${
                  isFavourite ? styles.favourited : ""
                }`}
                onClick={onToggleFavourite}
                aria-label={
                  isFavourite
                    ? `Remove ${currentData.name} from favourites`
                    : `Shortlist ${currentData.name} to favourites`
                }
                title={isFavourite ? "Shortlisted in favourites" : "Add to favourites"}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isFavourite ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </button>

              <button
                type="button"
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Close profile details"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* 2. SCROLLABLE PROFILE INFORMATION AREA */}
          <div className={styles.scrollableBody}>
            {/* Section 1: Personal Details */}
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionHeading}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </span>
                Personal Details
              </h3>
              <div className={styles.detailsGrid}>
                {effectiveGender && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Gender</span>
                    <span className={styles.detailValue}>{effectiveGender}</span>
                  </div>
                )}
                {effectiveMarital && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Marital Status</span>
                    <span className={styles.detailValue}>{effectiveMarital}</span>
                  </div>
                )}
                {effectiveMotherTongue && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Mother Tongue</span>
                    <span className={styles.detailValue}>{effectiveMotherTongue}</span>
                  </div>
                )}
                {effectiveHeight && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Height</span>
                    <span className={styles.detailValue}>{effectiveHeight}</span>
                  </div>
                )}
                {effectiveCreatedFor && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Profile Created For</span>
                    <span className={styles.detailValue}>{effectiveCreatedFor}</span>
                  </div>
                )}
                {effectiveLocation && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Location</span>
                    <span className={styles.detailValue}>{effectiveLocation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Religion & Community */}
            {(effectiveReligion ||
              effectiveCommunity ||
              effectiveSubCommunity ||
              effectiveCaste ||
              effectiveSubCaste ||
              effectiveGotra ||
              effectiveManglik) && (
              <div className={styles.sectionBlock}>
                <h3 className={styles.sectionHeading}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L1 21h22L12 2zm0 4.24l7.53 13.01H4.47L12 6.24zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
                    </svg>
                  </span>
                  Religion &amp; Community
                </h3>
                <div className={styles.detailsGrid}>
                  {effectiveReligion && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Religion</span>
                      <span className={styles.detailValue}>{effectiveReligion}</span>
                    </div>
                  )}
                  {effectiveCommunity && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Community</span>
                      <span className={styles.detailValue}>{effectiveCommunity}</span>
                    </div>
                  )}
                  {effectiveSubCommunity && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Sub-Community</span>
                      <span className={styles.detailValue}>{effectiveSubCommunity}</span>
                    </div>
                  )}
                  {effectiveCaste && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Caste</span>
                      <span className={styles.detailValue}>{effectiveCaste}</span>
                    </div>
                  )}
                  {effectiveSubCaste && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Sub-Caste</span>
                      <span className={styles.detailValue}>{effectiveSubCaste}</span>
                    </div>
                  )}
                  {effectiveGotra && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Gotra</span>
                      <span className={styles.detailValue}>{effectiveGotra}</span>
                    </div>
                  )}
                  {effectiveManglik && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Manglik Status</span>
                      <span className={styles.detailValue}>{effectiveManglik}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 3: Education & Career */}
            {(effectiveEducation ||
              effectiveSpecialization ||
              effectiveInstitution ||
              effectiveOccupation ||
              effectiveEmployment ||
              effectiveEmploymentType ||
              effectiveIncome) && (
              <div className={styles.sectionBlock}>
                <h3 className={styles.sectionHeading}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                    </svg>
                  </span>
                  Education &amp; Career
                </h3>
                <div className={styles.detailsGrid}>
                  {effectiveEducation && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Highest Education</span>
                      <span className={styles.detailValue}>{effectiveEducation}</span>
                    </div>
                  )}
                  {effectiveSpecialization && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Specialization</span>
                      <span className={styles.detailValue}>{effectiveSpecialization}</span>
                    </div>
                  )}
                  {effectiveInstitution && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Institution / University</span>
                      <span className={styles.detailValue}>{effectiveInstitution}</span>
                    </div>
                  )}
                  {effectiveOccupation && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Occupation</span>
                      <span className={styles.detailValue}>{effectiveOccupation}</span>
                    </div>
                  )}
                  {effectiveEmployment && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Employment Status</span>
                      <span className={styles.detailValue}>{effectiveEmployment}</span>
                    </div>
                  )}
                  {effectiveEmploymentType && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Employment Type</span>
                      <span className={styles.detailValue}>{effectiveEmploymentType}</span>
                    </div>
                  )}
                  {effectiveIncome && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Annual Income</span>
                      <span className={styles.detailValue}>{effectiveIncome}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section 4: Partner Preferences */}
            {hasPreferences && pref && (
              <div className={styles.sectionBlock}>
                <h3 className={styles.sectionHeading}>
                  <span className={styles.sectionIcon} aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </span>
                  Partner Preferences
                </h3>
                <div className={styles.prefStack}>
                  {(pref.minAge || pref.maxAge) && (
                    <div className={styles.prefRow}>
                      <span className={styles.prefLabel}>Preferred Age</span>
                      <span className={styles.prefValue}>
                        {pref.minAge || "Any"} – {pref.maxAge || "Any"} yrs
                      </span>
                    </div>
                  )}
                  {(pref.minHeightCm || pref.maxHeightCm) && (
                    <div className={styles.prefRow}>
                      <span className={styles.prefLabel}>Preferred Height</span>
                      <span className={styles.prefValue}>
                        {pref.minHeightCm ? `${pref.minHeightCm} cm` : "Any"} –{" "}
                        {pref.maxHeightCm ? `${pref.maxHeightCm} cm` : "Any"}
                      </span>
                    </div>
                  )}
                  {pref.religions && pref.religions.length > 0 && (
                    <div className={styles.prefGroup}>
                      <span className={styles.prefLabel}>Preferred Religions</span>
                      <div className={styles.chipContainer}>
                        {pref.religions.map((r, i) => (
                          <span key={i} className={styles.chip}>
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pref.communities && pref.communities.length > 0 && (
                    <div className={styles.prefGroup}>
                      <span className={styles.prefLabel}>Preferred Communities</span>
                      <div className={styles.chipContainer}>
                        {pref.communities.map((c, i) => (
                          <span key={i} className={styles.chip}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pref.castes && pref.castes.length > 0 && (
                    <div className={styles.prefGroup}>
                      <span className={styles.prefLabel}>Preferred Castes</span>
                      <div className={styles.chipContainer}>
                        {pref.castes.map((ca, i) => (
                          <span key={i} className={styles.chip}>
                            {ca}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pref.gotras && pref.gotras.length > 0 && (
                    <div className={styles.prefGroup}>
                      <span className={styles.prefLabel}>Preferred Gotras</span>
                      <div className={styles.chipContainer}>
                        {pref.gotras.map((g, i) => (
                          <span key={i} className={styles.chip}>
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pref.educations && pref.educations.length > 0 && (
                    <div className={styles.prefGroup}>
                      <span className={styles.prefLabel}>Preferred Education</span>
                      <div className={styles.chipContainer}>
                        {pref.educations.map((ed, i) => (
                          <span key={i} className={styles.chip}>
                            {ed}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pref.occupations && pref.occupations.length > 0 && (
                    <div className={styles.prefGroup}>
                      <span className={styles.prefLabel}>Preferred Occupations</span>
                      <div className={styles.chipContainer}>
                        {pref.occupations.map((oc, i) => (
                          <span key={i} className={styles.chip}>
                            {oc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pref.maritalStatuses && pref.maritalStatuses.length > 0 && (
                    <div className={styles.prefGroup}>
                      <span className={styles.prefLabel}>Preferred Marital Status</span>
                      <div className={styles.chipContainer}>
                        {pref.maritalStatuses.map((ms, i) => (
                          <span key={i} className={styles.chip}>
                            {ms}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {pref.manglik && pref.manglik.length > 0 && (
                    <div className={styles.prefGroup}>
                      <span className={styles.prefLabel}>Preferred Manglik</span>
                      <div className={styles.chipContainer}>
                        {pref.manglik.map((m, i) => (
                          <span key={i} className={styles.chip}>
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. STICKY BOTTOM ACTION BAR */}
          <div className={styles.actionBar}>
            <button
              type="button"
              className={`${styles.actionButton} ${
                relationshipState === "PENDING_SENT" ? styles.pendingSent : ""
              } ${relationshipState === "ACCEPTED" ? styles.acceptedActive : ""}`}
              onClick={onMessageClick}
              disabled={
                relationshipState === "PENDING_SENT" ||
                relationshipState === "DECLINED" ||
                isActionLoading
              }
            >
              {relationshipState === "PENDING_SENT" ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Request Sent</span>
                </>
              ) : relationshipState === "ACCEPTED" ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Chat</span>
                </>
              ) : relationshipState === "PENDING_RECEIVED" ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Respond</span>
                </>
              ) : relationshipState === "DECLINED" ? (
                <span>Declined</span>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{isActionLoading ? "Sending..." : "Message"}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className={styles.closeSecondaryButton}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
