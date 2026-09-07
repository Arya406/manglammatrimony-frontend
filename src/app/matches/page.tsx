"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { ProfileCardData } from "@/types/profile-card";
import { getMatches } from "@/lib/api/matches";
import { addFavourite, removeFavourite } from "@/lib/api/favourites";
import { useAuth } from "@/lib/auth/AuthContext";
import styles from "./matches.module.css";

type DiscoveryCategory = "made-for-each-other" | "recommended" | "preferences";

interface CategoryMeta {
  id: DiscoveryCategory;
  label: string;
  title: string;
  description: string;
  profiles: ProfileCardData[];
}

export default function MatchesPage() {
  const router = useRouter();
  const { authStatus, profile, user, error, retryValidation } = useAuth();
  const [activeCategory, setActiveCategory] = useState<DiscoveryCategory>("made-for-each-other");
  const [categoryProfiles, setCategoryProfiles] = useState<Record<DiscoveryCategory, ProfileCardData[]>>({
    "made-for-each-other": [],
    recommended: [],
    preferences: [],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const userDisplayName =
    profile?.personalDetails?.firstName ||
    user?.phone ||
    user?.email ||
    null;

  // Authenticated route guard:
  // Requires a valid authenticated session.
  // Under the temporary review rule, all authenticated users (ACTIVE, IN_REVIEW, INCOMPLETE, SUSPENDED)
  // are allowed to access /matches and browse candidate profiles.
  useEffect(() => {
    if (authStatus === "AUTH_LOADING" || authStatus === "AUTH_ERROR") {
      return;
    }

    if (authStatus === "UNAUTHENTICATED") {
      router.replace("/login");
      return;
    }
  }, [router, authStatus]);

  // Fetch real discovery profiles for the active category for any authenticated user
  useEffect(() => {
    if (authStatus !== "AUTHENTICATED") {
      return;
    }

    let isMounted = true;

    async function fetchMatches() {
      setIsLoading(true);
      try {
        const response = await getMatches(activeCategory);
        if (!isMounted) return;

        if (response.success && response.data) {
          setCategoryProfiles((prev) => ({
            ...prev,
            [activeCategory]: response.data.profiles,
          }));
        }
      } catch (err) {
        console.error("Error fetching discovery matches:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, [activeCategory, authStatus]);

  // Derive time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const greetingHeading = userDisplayName
    ? `${getGreeting()}, ${userDisplayName}`
    : "Welcome back";

  const categories: CategoryMeta[] = [
    {
      id: "made-for-each-other",
      label: "Made for Each Other",
      title: "Made for Each Other",
      description: "Profiles that seem especially compatible with you.",
      profiles: categoryProfiles["made-for-each-other"],
    },
    {
      id: "recommended",
      label: "Recommended for You",
      title: "Recommended for You",
      description: "Profiles selected based on your preferences.",
      profiles: categoryProfiles["recommended"],
    },
    {
      id: "preferences",
      label: "Your Preferences",
      title: "Your Preferences",
      description: "Profiles that closely match the preferences you've selected.",
      profiles: categoryProfiles["preferences"],
    },
  ];

  const currentCategory = categories.find((c) => c.id === activeCategory) || categories[0];

  const handleToggleFavourite = async (profile: ProfileCardData, isFav: boolean) => {
    // Optimistically update categoryProfiles
    setCategoryProfiles((prev) => {
      const updated = { ...prev };
      for (const cat of Object.keys(updated) as DiscoveryCategory[]) {
        updated[cat] = updated[cat].map((p) =>
          p.id === profile.id ? { ...p, isFavourited: isFav } : p
        );
      }
      return updated;
    });

    setActionFeedback(
      isFav
        ? `Added ${profile.name} to your shortlisted favourites.`
        : `Removed ${profile.name} from your favourites.`
    );
    setTimeout(() => setActionFeedback(null), 3500);

    try {
      const res = isFav ? await addFavourite(profile.id) : await removeFavourite(profile.id);
      if (!res.success) {
        // Rollback on server error
        setCategoryProfiles((prev) => {
          const updated = { ...prev };
          for (const cat of Object.keys(updated) as DiscoveryCategory[]) {
            updated[cat] = updated[cat].map((p) =>
              p.id === profile.id ? { ...p, isFavourited: !isFav } : p
            );
          }
          return updated;
        });
        setActionFeedback("Failed to update favourites. Please try again.");
      }
    } catch {
      // Rollback on network error
      setCategoryProfiles((prev) => {
        const updated = { ...prev };
        for (const cat of Object.keys(updated) as DiscoveryCategory[]) {
          updated[cat] = updated[cat].map((p) =>
            p.id === profile.id ? { ...p, isFavourited: !isFav } : p
          );
        }
        return updated;
      });
      setActionFeedback("Failed to update favourites. Please try again.");
    }
  };

  const handleSendInterest = (profile: ProfileCardData) => {
    setActionFeedback(`Interest sent to ${profile.name}!`);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleViewProfile = () => {
    // ProfileDetailModal is managed internally by ProfileCard
  };

  if (authStatus === "AUTH_LOADING") {
    return (
      <div className={styles.pageContainer}>
        <AppHeader />
        <main className={styles.mainContent}>
          <div style={{ textAlign: "center", padding: "100px 24px", color: "#8E7479" }}>
            Loading your personalized matches...
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
              {error || "Unable to reach matchmaking server. Please check your connection."}
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

      {/* 2. Main Discovery Container */}
      <main className={styles.mainContent}>
        {/* Toast Feedback */}
        {actionFeedback && (
          <div className={styles.feedbackToast} role="status" aria-live="polite">
            <span className={styles.toastDot} />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Personalized Discovery Greeting Area */}
        <section className={styles.greetingSection} aria-label="Personalized Greeting">
          <div className={styles.greetingHeader}>
            <div className={styles.greetingEyebrow}>
              <span className={styles.goldSparkle}>✦</span>
              <span>PERSONALIZED DISCOVERY</span>
            </div>
            <h1 className={styles.greetingTitle}>
              {greetingHeading}
            </h1>
            <p className={styles.greetingSubtitle}>
              Discover profiles selected around your preferences and what you&apos;re looking for.
            </p>
          </div>
        </section>

        {/* Category Navigation Tabs */}
        <section className={styles.categoryNavSection} aria-label="Discovery Categories">
          <div className={styles.categoryTabsWrapper} role="tablist">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`category-panel-${category.id}`}
                  className={`${styles.categoryTab} ${isActive ? styles.categoryTabActive : ""}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <span className={styles.tabLabel}>{category.label}</span>
                  <span className={styles.tabCountBadge}>({category.profiles.length})</span>
                  {isActive && <span className={styles.tabActiveUnderline} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Active Discovery Section */}
        <section
          id={`category-panel-${currentCategory.id}`}
          className={styles.discoverySection}
          role="tabpanel"
          aria-label={currentCategory.title}
        >
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleGroup}>
              <h2 className={styles.sectionTitle}>{currentCategory.title}</h2>
              <p className={styles.sectionSubtitle}>{currentCategory.description}</p>
            </div>
            <div className={styles.resultsBadge}>
              <span>{currentCategory.profiles.length} Profiles Available</span>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Finding compatible matches...</p>
            </div>
          )}

          {/* Empty Discovery State */}
          {!isLoading && currentCategory.profiles.length === 0 && (
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
              <h3 className={styles.emptyTitle}>Your matches are on their way</h3>
              <p className={styles.emptySubtitle}>
                We&apos;ll show compatible profiles here as they complete their verification and become available.
              </p>
            </div>
          )}

          {/* Centered 250px Card Grid */}
          {!isLoading && currentCategory.profiles.length > 0 && (
            <div className={styles.profileGrid} role="list">
              {currentCategory.profiles.map((profile) => (
                <div key={profile.id} className={styles.gridItem} role="listitem">
                  <ProfileCard
                    profile={profile}
                    onViewProfile={handleViewProfile}
                    onSendInterest={handleSendInterest}
                    onToggleFavourite={handleToggleFavourite}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Application Footer */}
      <footer className={styles.appFooter}>
        <div className={styles.footerInner}>
          <p>© {new Date().getFullYear()} Manglam Matrimony — Sacred Connections, Verified Trust.</p>
        </div>
      </footer>
    </div>
  );
}
