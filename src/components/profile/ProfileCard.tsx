"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProfileCardProps } from "@/types/profile-card";
import { RelationshipState } from "@/types/messaging";
import { sendMessageRequest, getRelationshipStatus } from "@/lib/api/messages";
import { addFavourite, removeFavourite } from "@/lib/api/favourites";
import { ProfileDetailModal } from "./ProfileDetailModal";
import styles from "./ProfileCard.module.css";

export function ProfileCard({
  profile,
  className,
  onViewProfile,
  onSendInterest,
  onToggleFavourite,
}: ProfileCardProps) {
  const router = useRouter();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [favouriteOverride, setFavouriteOverride] = useState<boolean | null>(null);
  const [prevProfileIsFav, setPrevProfileIsFav] = useState<boolean | undefined>(profile?.isFavourited);

  if (profile?.isFavourited !== prevProfileIsFav) {
    setPrevProfileIsFav(profile?.isFavourited);
    setFavouriteOverride(null);
  }

  const isFavourite = favouriteOverride !== null ? favouriteOverride : (profile?.isFavourited ?? false);
  const [isTogglingFavourite, setIsTogglingFavourite] = useState(false);
  const [relationshipState, setRelationshipState] = useState<RelationshipState>("NO_RELATIONSHIP");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Check relationship status from PostgreSQL backend on mount
  useEffect(() => {
    let isMounted = true;
    if (profile?.id) {
      getRelationshipStatus(profile.id).then((res) => {
        if (isMounted && res.success && res.data) {
          setRelationshipState(res.data.relationshipState);
          if (res.data.conversationId) {
            setConversationId(res.data.conversationId);
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  // Normalize photo array without fabricated fallbacks
  const hasPhotos = Array.isArray(profile?.photos) && (profile?.photos.length || 0) > 0;
  const photoList = hasPhotos && profile
    ? profile.photos.map((item, idx) => {
        if (typeof item === "string") {
          return { url: item, alt: `${profile.name} photo ${idx + 1}` };
        }
        return {
          url: item.url,
          alt: item.alt || `${profile.name} photo ${idx + 1}`,
        };
      })
    : [];

  const totalPhotos = photoList.length;

  const handlePrevPhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === 0 ? totalPhotos - 1 : prev - 1));
  }, [totalPhotos]);

  const handleNextPhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === totalPhotos - 1 ? 0 : prev + 1));
  }, [totalPhotos]);

  const handleDotClick = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex(index);
  }, []);

  const handleFavouriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile || isTogglingFavourite) return;

    const previousState = isFavourite;
    const nextState = !previousState;

    // Optimistic UI update
    setFavouriteOverride(nextState);
    setIsTogglingFavourite(true);

    try {
      if (onToggleFavourite) {
        await onToggleFavourite(profile, nextState);
      } else {
        const res = nextState ? await addFavourite(profile.id) : await removeFavourite(profile.id);
        if (!res.success) {
          // Rollback on failure
          setFavouriteOverride(previousState);
        }
      }
    } catch (err) {
      console.error("[TOGGLE FAVOURITE ERROR]:", err);
      // Rollback on error
      setFavouriteOverride(previousState);
    } finally {
      setIsTogglingFavourite(false);
    }
  };

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile) return;

    // If request already accepted, open conversation
    if (relationshipState === "ACCEPTED") {
      if (conversationId) {
        router.push(`/messages?conversationId=${conversationId}`);
      } else {
        router.push("/messages");
      }
      return;
    }

    // If incoming request pending, go to inbox
    if (relationshipState === "PENDING_RECEIVED") {
      router.push("/messages");
      return;
    }

    // If already sent or declined, do nothing
    if (relationshipState === "PENDING_SENT" || relationshipState === "DECLINED") {
      return;
    }

    // Initiate message request
    if (relationshipState === "NO_RELATIONSHIP" && !isActionLoading) {
      setIsActionLoading(true);
      try {
        const res = await sendMessageRequest({ receiverProfileId: profile.id });
        if (res.success && res.data) {
          setRelationshipState(res.data.relationshipState);
          if (res.data.relationshipState === "ACCEPTED" && res.data.conversationId) {
            setConversationId(res.data.conversationId);
          }
          if (onSendInterest) {
            onSendInterest(profile);
          }
        }
      } catch (err) {
        console.error("Message request error:", err);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleViewProfileClick = () => {
    setIsDetailModalOpen(true);
    if (onViewProfile && profile) {
      onViewProfile(profile);
    }
  };

  if (!profile) return null;

  const currentPhoto = photoList[currentPhotoIndex] || photoList[0];

  return (
    <article
      className={`${styles.cardContainer} ${className || ""}`}
      aria-label={`Matrimonial profile of ${profile.name}, ${profile.age}`}
    >
      {/* ========================================================
          1. PHOTO SECTION & OVERLAYS
          ======================================================== */}
      <div className={styles.photoContainer}>
        {/* Main Photo or Neutral Branded Placeholder */}
        <div className={styles.imageWrapper}>
          {hasPhotos && currentPhoto ? (
            <>
              <Image
                src={currentPhoto.url}
                alt={currentPhoto.alt || `${profile.name}'s photo`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                priority={currentPhotoIndex === 0}
                className={styles.profileImage}
              />
              <div className={styles.imageGradientOverlay} aria-hidden="true" />
            </>
          ) : (
            <div
              className={styles.placeholderContainer}
              aria-label={`${profile.name} - Photo not provided`}
            >
              <div className={styles.placeholderAvatar}>
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={styles.placeholderSilhouette}
                  aria-hidden="true"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className={styles.placeholderLabel}>Photo Protected</span>
            </div>
          )}
        </div>

        {/* Top Left: Online Status Indicator */}
        {profile.isOnline && (
          <div className={styles.onlineBadge} aria-label="User is online now">
            <span className={styles.onlineDot} aria-hidden="true" />
            <span className={styles.onlineText}>Online</span>
          </div>
        )}

        {/* Top Right: Favourite / Shortlist Button */}
        <button
          type="button"
          data-testid="favourite-button"
          onClick={handleFavouriteClick}
          disabled={isTogglingFavourite}
          className={`${styles.favouriteButton} ${isFavourite ? styles.favouriteActive : ""}`}
          aria-label={isFavourite ? `Remove ${profile.name} from favourites` : `Add ${profile.name} to favourites`}
          aria-pressed={isFavourite}
        >
          {isFavourite ? (
            <svg
              className={styles.heartIconFilled}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              className={styles.heartIconOutline}
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
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          )}
        </button>

        {/* Carousel Navigation Arrows */}
        {hasPhotos && totalPhotos > 1 && (
          <div className={styles.carouselNavGroup}>
            <button
              type="button"
              onClick={handlePrevPhoto}
              className={`${styles.carouselArrow} ${styles.prevArrow}`}
              aria-label={`Previous photo (${currentPhotoIndex === 0 ? totalPhotos : currentPhotoIndex} of ${totalPhotos})`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={handleNextPhoto}
              className={`${styles.carouselArrow} ${styles.nextArrow}`}
              aria-label={`Next photo (${currentPhotoIndex + 2 > totalPhotos ? 1 : currentPhotoIndex + 2} of ${totalPhotos})`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Bottom Left: Verified Badge */}
        {profile.isVerified && (
          <div className={styles.verifiedBadge} aria-label="Verified Profile">
            <span className={styles.verifiedIconWrapper} aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span className={styles.verifiedText}>Verified</span>
          </div>
        )}

        {/* Bottom Right: Photo Counter Badge */}
        {hasPhotos && totalPhotos > 1 && (
          <div className={styles.photoCountBadge} aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.cameraIcon}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            <span>{currentPhotoIndex + 1} / {totalPhotos}</span>
          </div>
        )}

        {/* Bottom Center: Carousel Indicators */}
        {hasPhotos && totalPhotos > 1 && (
          <div className={styles.indicatorContainer} role="tablist" aria-label="Photo carousel indicators">
            {photoList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={idx === currentPhotoIndex}
                aria-label={`Go to photo ${idx + 1}`}
                onClick={(e) => handleDotClick(idx, e)}
                className={`${styles.indicatorDot} ${idx === currentPhotoIndex ? styles.indicatorActive : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          2. PROFILE IDENTITY & HIGHLIGHTS
          ======================================================== */}
      <div className={styles.contentSection}>
        {/* Primary Identity Header */}
        <div className={styles.identityHeader}>
          <h2 className={styles.primaryName}>
            {profile.name}, {profile.age}
          </h2>
          <p className={styles.secondaryMeta}>
            <span>{profile.gender}</span>
            <span className={styles.metaDivider}>•</span>
            <span>{profile.maritalStatus}</span>
          </p>
        </div>

        {/* Key Highlights (4 compact rows with subtle icons) */}
        <ul className={styles.highlightList} aria-label="Key Profile Attributes">
          {/* Row 1: Religion & Community */}
          <li className={styles.highlightItem}>
            <span className={styles.highlightIconWrapper} aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a9 9 0 0 0-9 9c0 4.97 4.03 9 9 9s9-4.03 9-9a9 9 0 0 0-9-9z" />
                <path d="M12 6v12" />
                <path d="M6 12h12" />
              </svg>
            </span>
            <span className={styles.highlightText}>
              {profile.religion}
              {profile.community ? ` • ${profile.community}` : ""}
            </span>
          </li>

          {/* Row 2: Location */}
          <li className={styles.highlightItem}>
            <span className={styles.highlightIconWrapper} aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span className={styles.highlightText}>{profile.location}</span>
          </li>

          {/* Row 3: Education & Career */}
          <li className={styles.highlightItem}>
            <span className={styles.highlightIconWrapper} aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
            <span className={styles.highlightText}>
              {profile.education}
              {profile.occupation ? ` • ${profile.occupation}` : ""}
            </span>
          </li>

          {/* Row 4: Annual Income */}
          <li className={styles.highlightItem}>
            <span className={styles.highlightIconWrapper} aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="4" x2="18" y2="4" />
                <line x1="6" y1="9" x2="18" y2="9" />
                <path d="M6 4h7a4 4 0 0 1 0 8H6" />
                <line x1="10" y1="12" x2="18" y2="20" />
              </svg>
            </span>
            <span className={styles.highlightText}>{profile.incomeRange}</span>
          </li>
        </ul>

        {/* ========================================================
            3. ACTION BUTTONS
            ======================================================== */}
        <div className={styles.actionRow}>
          <button
            type="button"
            onClick={handleViewProfileClick}
            className={styles.viewProfileButton}
            aria-label={`View full profile of ${profile.name}`}
          >
            View Profile
          </button>

          <button
            type="button"
            onClick={handleMessageClick}
            disabled={relationshipState === "PENDING_SENT" || relationshipState === "DECLINED" || isActionLoading}
            className={[
              styles.messageButton,
              relationshipState === "PENDING_SENT" ? styles.pendingSentActive : "",
              relationshipState === "ACCEPTED" ? styles.acceptedActive : "",
              relationshipState === "DECLINED" ? styles.declinedActive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={
              relationshipState === "PENDING_SENT"
                ? `Message request already sent to ${profile.name}`
                : relationshipState === "ACCEPTED"
                ? `Chat with ${profile.name}`
                : `Send message request to ${profile.name}`
            }
          >
            {relationshipState === "PENDING_SENT" ? (
              <span className={styles.buttonLabelWithIcon}>
                <svg className={styles.chatIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Request Sent</span>
              </span>
            ) : relationshipState === "ACCEPTED" ? (
              <span className={styles.buttonLabelWithIcon}>
                <svg className={styles.chatIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Chat</span>
              </span>
            ) : relationshipState === "PENDING_RECEIVED" ? (
              <span className={styles.buttonLabelWithIcon}>
                <svg className={styles.chatIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Respond</span>
              </span>
            ) : relationshipState === "DECLINED" ? (
              <span className={styles.buttonLabelWithIcon}>
                <span>Declined</span>
              </span>
            ) : (
              <span className={styles.buttonLabelWithIcon}>
                <svg className={styles.chatIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{isActionLoading ? "Sending..." : "Message"}</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Detail Modal */}
      <ProfileDetailModal
        profile={profile}
        isOpen={isDetailModalOpen}
        relationshipState={relationshipState}
        isFavourite={isFavourite}
        isActionLoading={isActionLoading}
        onClose={() => setIsDetailModalOpen(false)}
        onToggleFavourite={() =>
          handleFavouriteClick({ stopPropagation: () => {} } as React.MouseEvent)
        }
        onMessageClick={handleMessageClick}
      />
    </article>
  );
}
