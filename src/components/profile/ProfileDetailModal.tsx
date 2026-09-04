"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProfileCardData } from "@/types/profile-card";
import { RelationshipState } from "@/types/messaging";
import styles from "./ProfileDetailModal.module.css";

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
  const [prevProfileId, setPrevProfileId] = useState<string | null>(profile?.id || null);
  const [photoIndex, setPhotoIndex] = useState(0);

  // Reset photoIndex during render when profile changes
  if (profile && profile.id !== prevProfileId) {
    setPrevProfileId(profile.id);
    setPhotoIndex(0);
  }

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  const photoList = Array.isArray(profile.photos) && profile.photos.length > 0 ? profile.photos : [];
  const totalPhotos = photoList.length;
  const currentPhoto = photoList[photoIndex] || photoList[0];
  const photoUrl = typeof currentPhoto === "string" ? currentPhoto : currentPhoto?.url;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close profile details"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Photo Carousel Area */}
        <div className={styles.photoContainer}>
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={`Photo of ${profile.name}`}
              fill
              sizes="(max-width: 560px) 100vw, 560px"
              className={styles.photo}
              priority
            />
          ) : (
            <div className={styles.photoPlaceholder}>
              <div className={styles.placeholderAvatar}>
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <span>No photo provided</span>
            </div>
          )}

          {totalPhotos > 1 && (
            <>
              <button
                type="button"
                className={`${styles.navArrow} ${styles.navPrev}`}
                onClick={handlePrev}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.navArrow} ${styles.navNext}`}
                onClick={handleNext}
                aria-label="Next photo"
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
                    className={`${styles.dot} ${idx === photoIndex ? styles.dotActive : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoIndex(idx);
                    }}
                    aria-label={`View photo ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Profile Content Body */}
        <div className={styles.contentBody}>
          <div className={styles.headerRow}>
            <div className={styles.nameGroup}>
              <div className={styles.nameRow}>
                <h2 id="profile-modal-title" className={styles.name}>
                  {profile.name}, {profile.age}
                </h2>
                {profile.isVerified && (
                  <span className={styles.verifiedBadge} title="Verified Profile" aria-label="Verified Profile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                )}
              </div>
              <p className={styles.subInfo}>
                {profile.location || "Location not specified"}
              </p>
            </div>

            <button
              type="button"
              className={`${styles.favouriteButton} ${isFavourite ? styles.favourited : ""}`}
              onClick={onToggleFavourite}
              aria-label={isFavourite ? `Remove ${profile.name} from favourites` : `Shortlist ${profile.name} to favourites`}
              title={isFavourite ? "Shortlisted in favourites" : "Add to favourites"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavourite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>

          {/* Section 1: Basic & Marital Background */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionHeading}>✦ Personal Details</span>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Age / Gender</span>
                <span className={styles.detailValue}>{profile.age} yrs • {profile.gender}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Marital Status</span>
                <span className={styles.detailValue}>{profile.maritalStatus || "Not specified"}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{profile.location || "Not specified"}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Verification</span>
                <span className={styles.detailValue}>{profile.isVerified ? "Verified Member" : "Standard Profile"}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Cultural Background */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionHeading}>✦ Religion &amp; Community</span>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Religion</span>
                <span className={styles.detailValue}>{profile.religion || "Not specified"}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Community</span>
                <span className={styles.detailValue}>{profile.community || "Not specified"}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Education & Career */}
          <div className={styles.sectionBlock}>
            <span className={styles.sectionHeading}>✦ Education &amp; Career</span>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Education</span>
                <span className={styles.detailValue}>{profile.education || "Not specified"}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Occupation</span>
                <span className={styles.detailValue}>{profile.occupation || "Not specified"}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Annual Income</span>
                <span className={styles.detailValue}>{profile.incomeRange || "Not specified"}</span>
              </div>
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className={styles.actionsBar}>
            <button
              type="button"
              className={`${styles.messageButton} ${relationshipState === "PENDING_SENT" ? styles.pendingSent : ""}`}
              onClick={onMessageClick}
              disabled={relationshipState === "PENDING_SENT" || relationshipState === "DECLINED" || isActionLoading}
            >
              {relationshipState === "PENDING_SENT" ? (
                <span>Request Sent ✓</span>
              ) : relationshipState === "ACCEPTED" ? (
                <span>Chat</span>
              ) : relationshipState === "PENDING_RECEIVED" ? (
                <span>Respond</span>
              ) : relationshipState === "DECLINED" ? (
                <span>Declined</span>
              ) : (
                <span>{isActionLoading ? "Sending..." : "Message"}</span>
              )}
            </button>

            <button
              type="button"
              className={styles.closeBottomButton}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
