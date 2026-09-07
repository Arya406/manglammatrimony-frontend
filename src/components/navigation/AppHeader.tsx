"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/lib/auth/AuthContext";
import { getUnreadCounters } from "@/lib/api/messages";
import { getReceivedLikesCount } from "@/lib/api/favourites";
import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  /**
   * Optional override for number of other users/profiles who have liked the current user's profile.
   * If omitted, fetched directly from PostgreSQL backend.
   */
  likesReceived?: number;
}

export function AppHeader({ likesReceived: propLikesReceived }: AppHeaderProps) {
  const { user: authUser, profile, profileStatus, logout: authLogout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [unreadCounters, setUnreadCounters] = useState({
    unreadRequests: 0,
    unreadMessages: 0,
    totalUnread: 0,
  });
  const [likesCount, setLikesCount] = useState(0);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const userDisplayName =
    profile?.personalDetails?.firstName
      ? `${profile.personalDetails.firstName}${profile.personalDetails.lastName ? ` ${profile.personalDetails.lastName}` : ""}`
      : authUser?.phone || authUser?.email || "Arya";
  const isUnderReview = profileStatus === "IN_REVIEW";

  const effectiveLikes = propLikesReceived !== undefined ? propLikesReceived : likesCount;
  const formattedLikesCount = effectiveLikes > 99 ? "99+" : effectiveLikes.toString();
  const hasLikes = effectiveLikes > 0;

  // Fetch unread counters and incoming likes from PostgreSQL backend only for ACTIVE users
  useEffect(() => {
    if (isUnderReview) return;

    let isMounted = true;
    const fetchCounts = () => {
      getUnreadCounters().then((res) => {
        if (isMounted && res.success && res.data) {
          setUnreadCounters(res.data);
        }
      });
      getReceivedLikesCount().then((res) => {
        if (isMounted && res.success && res.data) {
          setLikesCount(res.data.count);
        }
      });
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isUnderReview]);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    setIsMobileNavOpen(false);
    authLogout();
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileMenuOpen(false);
        setIsMobileNavOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const navLinks = isUnderReview
    ? [
        { label: "Matches", href: "/matches" },
        { label: "My Profile", href: "/onboarding/review" },
      ]
    : [
        { label: "Matches", href: "/matches" },
        { label: "Interests", href: "/interests", badge: effectiveLikes > 0 ? effectiveLikes : undefined },
        { label: "Messages", href: "/messages", badge: unreadCounters.totalUnread },
        { label: "Premium", href: "/membership" },
      ];

  return (
    <header className={styles.appHeader}>
      <div className={styles.headerContainer}>
        {/* Left: Brand Logo */}
        <div className={styles.brandGroup}>
          <Logo size="md" href="/matches" />
        </div>

        {/* Center: Authenticated Navigation Links */}
        <nav className={styles.desktopNav} aria-label="Application Navigation">
          <ul className={styles.navList}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/matches" && pathname === "/matches");
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                    {link.badge !== undefined && link.badge > 0 ? (
                      <span className={styles.navBadge} aria-label={`${link.badge} unread`}>
                        {link.badge > 99 ? "99+" : link.badge}
                      </span>
                    ) : null}
                    {isActive && <span className={styles.activeIndicator} aria-hidden="true" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right: Actions (Messages Icon, Likes Heart, User Menu) */}
        <div className={styles.userActionsGroup}>
          {isUnderReview ? (
            <span className={styles.statusPillReview}>Under Review</span>
          ) : (
            <>
              {/* Direct Messages / Chat Icon Button */}
              <Link
                href="/messages"
                className={styles.messageIconButton}
                aria-label={
                  unreadCounters.totalUnread > 0
                    ? `${unreadCounters.totalUnread} unread messages`
                    : "Messages"
                }
                title="Messages"
              >
                <svg
                  className={styles.chatIcon}
                  width="20"
                  height="20"
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
                {unreadCounters.totalUnread > 0 && (
                  <span className={styles.iconBadge} aria-hidden="true">
                    {unreadCounters.totalUnread > 99 ? "99+" : unreadCounters.totalUnread}
                  </span>
                )}
              </Link>

              {/* Profile Likes Received Button (Shows how many others liked MY profile) */}
              <Link
                href="/interests"
                className={styles.likesReceivedButton}
                aria-label={
                  hasLikes
                    ? `${effectiveLikes} ${effectiveLikes === 1 ? "person" : "people"} liked your profile`
                    : "No one has liked your profile yet"
                }
                title={
                  hasLikes
                    ? `${effectiveLikes} ${effectiveLikes === 1 ? "person" : "people"} liked your profile`
                    : "Profile Likes Received"
                }
              >
                <svg
                  className={styles.heartIcon}
                  width="20"
                  height="20"
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
                {hasLikes && (
                  <span className={styles.likesBadge} aria-hidden="true">
                    {formattedLikesCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* User Profile Menu Dropdown */}
          <div className={styles.profileMenuWrapper} ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className={styles.profilePillButton}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              aria-label="User profile and account menu"
            >
              <span className={styles.userAvatar}>
                {userDisplayName.charAt(0).toUpperCase()}
              </span>
              <span className={styles.profileLabel}>My Profile</span>
              <svg
                className={`${styles.chevronIcon} ${isProfileMenuOpen ? styles.chevronOpen : ""}`}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {isProfileMenuOpen && (
              <div className={styles.dropdownMenu} role="menu">
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownUserName}>{userDisplayName}</p>
                  <p className={styles.dropdownUserStatus}>● Profile Active</p>
                </div>
                <div className={styles.dropdownDivider} />
                <Link
                  href="/onboarding/personal-details?mode=edit"
                  role="menuitem"
                  className={styles.dropdownItem}
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Edit Profile</span>
                </Link>
                <Link
                  href="/onboarding/partner-preferences?mode=edit"
                  role="menuitem"
                  className={styles.dropdownItem}
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Partner Preferences</span>
                </Link>
                <Link
                  href="/onboarding/review"
                  role="menuitem"
                  className={styles.dropdownItem}
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  <span>Profile Summary</span>
                </Link>
                <Link
                  href="/membership"
                  role="menuitem"
                  className={styles.dropdownItem}
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                  </svg>
                  <span>Membership Plans</span>
                </Link>
                <Link
                  href="/help"
                  role="menuitem"
                  className={styles.dropdownItem}
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span>Help Center</span>
                </Link>
                <div className={styles.dropdownDivider} />
                <button
                  type="button"
                  role="menuitem"
                  className={`${styles.dropdownItem} ${styles.dropdownLogout}`}
                  onClick={handleLogout}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
            className={styles.mobileNavToggle}
            aria-expanded={isMobileNavOpen}
            aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
          >
            {isMobileNavOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileNavOpen && (
        <div className={styles.mobileDrawer} role="dialog" aria-label="Mobile Navigation">
          <nav className={styles.mobileNavList}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ""}`}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <span>{link.label}</span>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className={styles.navBadge} style={{ marginLeft: 8 }}>
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <div className={styles.mobileDrawerDivider} />
            <Link
              href="/onboarding/review"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileNavOpen(false)}
            >
              My Profile
            </Link>
            <Link
              href="/onboarding/personal-details?mode=edit"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileNavOpen(false)}
            >
              Edit Profile
            </Link>
            <Link
              href="/membership"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileNavOpen(false)}
            >
              Membership Plans
            </Link>
            <Link
              href="/help"
              className={styles.mobileNavLink}
              onClick={() => setIsMobileNavOpen(false)}
            >
              Help Center
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.mobileLogoutBtn}
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
