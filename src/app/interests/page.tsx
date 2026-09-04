"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/navigation/AppHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileCardData } from "@/types/profile-card";
import { getFavourites, getReceivedLikes, addFavourite, removeFavourite } from "@/lib/api/favourites";
import { useAuth } from "@/lib/auth/AuthContext";
import styles from "./interests.module.css";

type InterestsTab = "received" | "sent";

export default function InterestsPage() {
  const router = useRouter();
  const { authStatus, profileStatus, error, retryValidation } = useAuth();
  const [activeTab, setActiveTab] = useState<InterestsTab>("received");
  const [receivedLikes, setReceivedLikes] = useState<(ProfileCardData & { likedAt?: string })[]>([]);
  const [sentFavourites, setSentFavourites] = useState<ProfileCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Authenticated route guard & profile status verification
  useEffect(() => {
    if (authStatus === "AUTH_LOADING" || authStatus === "AUTH_ERROR") {
      return;
    }

    if (authStatus === "UNAUTHENTICATED") {
      router.replace("/login");
      return;
    }

    if (authStatus === "AUTHENTICATED") {
      if (profileStatus === "IN_REVIEW") {
        router.replace("/onboarding/review");
        return;
      }
      if (profileStatus === "INCOMPLETE") {
        router.replace("/onboarding");
        return;
      }
      if (profileStatus === "REJECTED") {
        router.replace("/onboarding/review");
        return;
      }
      if (profileStatus === "SUSPENDED") {
        router.replace("/onboarding/review");
        return;
      }
    }
  }, [router, authStatus, profileStatus]);

  // Load data based on active tab
  useEffect(() => {
    if (authStatus !== "AUTHENTICATED" || profileStatus !== "ACTIVE") {
      return;
    }

    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        if (activeTab === "received") {
          const res = await getReceivedLikes(1, 50);
          if (!isMounted) return;
          if (res.success && res.data) {
            setReceivedLikes(res.data.profiles);
          } else if (!res.success && res.code === "PROFILE_UNDER_REVIEW") {
            router.replace("/onboarding/review");
          }
        } else {
          const res = await getFavourites(1, 50);
          if (!isMounted) return;
          if (res.success && res.data) {
            setSentFavourites(res.data.profiles);
          } else if (!res.success && res.code === "PROFILE_UNDER_REVIEW") {
            router.replace("/onboarding/review");
          }
        }
      } catch (err) {
        console.error("Error loading interests data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeTab, router, authStatus, profileStatus]);

  // Also prefetch the other tab's count in the background for accurate tab badge counts
  useEffect(() => {
    let isMounted = true;

    if (authStatus === "AUTHENTICATED" && profileStatus === "ACTIVE") {
      if (activeTab === "received") {
        getFavourites(1, 50).then((res) => {
          if (isMounted && res.success && res.data) {
            setSentFavourites(res.data.profiles);
          }
        });
      } else {
        getReceivedLikes(1, 50).then((res) => {
          if (isMounted && res.success && res.data) {
            setReceivedLikes(res.data.profiles);
          }
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, authStatus, profileStatus]);

  const handleToggleFavourite = async (profile: ProfileCardData, isFav: boolean) => {
    // If we're on the sent favourites tab and user unfavourites, optimistically remove it from the list
    if (activeTab === "sent" && !isFav) {
      setSentFavourites((prev) => prev.filter((p) => p.id !== profile.id));
    } else {
      // Update in-place
      setReceivedLikes((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, isFavourited: isFav } : p))
      );
      setSentFavourites((prev) =>
        prev.map((p) => (p.id === profile.id ? { ...p, isFavourited: isFav } : p))
      );
    }

    setActionFeedback(
      isFav
        ? `Added ${profile.name} to your shortlisted favourites.`
        : `Removed ${profile.name} from your favourites.`
    );
    setTimeout(() => setActionFeedback(null), 3500);

    try {
      const res = isFav ? await addFavourite(profile.id) : await removeFavourite(profile.id);
      if (!res.success) {
        // Rollback on error
        setActionFeedback("Could not update favourite. Please try again.");
      }
    } catch {
      setActionFeedback("Could not update favourite. Please try again.");
    }
  };

  const handleSendInterest = (profile: ProfileCardData) => {
    setActionFeedback(`Interest sent to ${profile.name}!`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const currentProfiles = activeTab === "received" ? receivedLikes : sentFavourites;

  if (authStatus === "AUTH_LOADING") {
    return (
      <div className={styles.pageContainer}>
        <AppHeader />
        <main className={styles.mainContent}>
          <div style={{ textAlign: "center", padding: "100px 24px", color: "#8E7479" }}>
            Loading interests & favourites...
          </div>
        </main>
      </div>
    );
  }

  if (authStatus === "AUTH_ERROR") {
    return (
      <div className={styles.pageContainer}>
        <AppHeader />
        <main className={styles.mainContent}>
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <p style={{ color: "#7B1123", marginBottom: 16, fontSize: 16 }}>
              {error || "Unable to reach server. Please check your connection."}
            </p>
            <button
              type="button"
              onClick={() => retryValidation()}
              style={{
                padding: "8px 24px",
                backgroundColor: "#7B1123",
                color: "#FFF",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Retry Connection
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Authenticated Application Header */}
      <AppHeader />

      {/* 2. Main Container */}
      <main className={styles.mainContent}>
        {/* Toast Feedback */}
        {actionFeedback && (
          <div className={styles.feedbackToast} role="status" aria-live="polite">
            <span className={styles.toastDot} />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Banner Section */}
        <section className={styles.bannerSection} aria-label="Interests Banner">
          <div className={styles.bannerInner}>
            <div className={styles.badge}>
              <span className={styles.goldSparkle}>✦</span>
              <span>SACRED CONNECTIONS</span>
            </div>
            <h1 className={styles.bannerTitle}>Interests & Favourites</h1>
            <p className={styles.bannerSubtitle}>
              Keep track of members who have shown interest in your profile and manage the candidates you have shortlisted.
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className={styles.tabNavSection} aria-label="Interests Categories">
          <div className={styles.tabsWrapper} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "received"}
              aria-controls="interests-panel-received"
              className={`${styles.tabBtn} ${activeTab === "received" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("received")}
            >
              <span>Received Likes</span>
              <span className={styles.tabCountBadge}>{receivedLikes.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "sent"}
              aria-controls="interests-panel-sent"
              className={`${styles.tabBtn} ${activeTab === "sent" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("sent")}
            >
              <span>Sent Favourites</span>
              <span className={styles.tabCountBadge}>{sentFavourites.length}</span>
            </button>
          </div>
        </section>

        {/* Content Section */}
        <section
          id={`interests-panel-${activeTab}`}
          className={styles.contentSection}
          role="tabpanel"
          aria-label={activeTab === "received" ? "Received Likes" : "Sent Favourites"}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>
                {activeTab === "received" ? "People Who Liked You" : "Profiles You Liked"}
              </h2>
              <p className={styles.sectionSubtitle}>
                {activeTab === "received"
                  ? "Members who have expressed interest in your profile."
                  : "Profiles you have shortlisted and added to your favourites."}
              </p>
            </div>
            <div className={styles.resultsBadge}>
              <span>{currentProfiles.length} {currentProfiles.length === 1 ? "Profile" : "Profiles"}</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading profiles...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && currentProfiles.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>
                <svg
                  width="32"
                  height="32"
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
              </div>
              <h3 className={styles.emptyTitle}>
                {activeTab === "received" ? "No incoming likes yet" : "No favourites saved yet"}
              </h3>
              <p className={styles.emptySubtitle}>
                {activeTab === "received"
                  ? "When other members like or shortlist your profile, they will appear here."
                  : "Explore compatible matches and click the heart icon on any card to save them to your shortlist."}
              </p>
              <Link href="/matches" className={styles.exploreButton}>
                Explore Matches
              </Link>
            </div>
          )}

          {/* 250px Card Grid */}
          {!isLoading && currentProfiles.length > 0 && (
            <div className={styles.profileGrid} role="list">
              {currentProfiles.map((profile) => (
                <div key={profile.id} className={styles.gridItem} role="listitem">
                  <ProfileCard
                    profile={profile}
                    onToggleFavourite={handleToggleFavourite}
                    onSendInterest={handleSendInterest}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.appFooter}>
        <div className={styles.footerInner}>
          <p>© {new Date().getFullYear()} Manglam Matrimony — Sacred Connections, Verified Trust.</p>
        </div>
      </footer>
    </div>
  );
}
