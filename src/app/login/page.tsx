"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import {
  isAuthenticated,
  clearAuthSession,
  getAuthUser,
  logout,
} from "@/lib/auth/authSession";
import { getProfile } from "@/lib/api/profile";
import { getProfileRedirectRoute } from "@/lib/auth/getProfileRedirectRoute";
import { CompleteProfileData } from "@/types/profile";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeProfile, setActiveProfile] = useState<CompleteProfileData | null>(null);
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const [isNavigatingProfile, setIsNavigatingProfile] = useState(false);

  useEffect(() => {
    async function checkExistingSession() {
      if (!isAuthenticated()) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const response = await getProfile();
        if (response.success && response.data) {
          setActiveProfile(response.data);
          const pd = response.data.personalDetails;
          if (pd?.firstName) {
            setUserDisplayName(`${pd.firstName} ${pd.lastName || ""}`.trim());
          } else {
            const authUser = getAuthUser();
            setUserDisplayName(authUser?.phone || authUser?.email || null);
          }
          setIsCheckingSession(false);
        } else {
          // Token is invalid/expired — clear silently so user sees fresh login form
          clearAuthSession();
          setActiveProfile(null);
          setIsCheckingSession(false);
        }
      } catch (err) {
        console.warn("Session check error on /login:", err);
        clearAuthSession();
        setActiveProfile(null);
        setIsCheckingSession(false);
      }
    }

    checkExistingSession();
  }, []);

  const handleContinueToProfile = () => {
    setIsNavigatingProfile(true);
    const targetRoute = getProfileRedirectRoute(activeProfile);
    router.push(targetRoute);
  };

  const handleLogoutHere = () => {
    clearAuthSession();
    setActiveProfile(null);
    setUserDisplayName(null);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Top Header Bar */}
      <header className={styles.topBar}>
        <Logo size="md" />

        <div className={styles.topBarRight}>
          {activeProfile ? (
            <button
              type="button"
              onClick={() => logout()}
              className={styles.headerLogoutButton}
              aria-label="Log out of current account"
            >
              Logout
            </button>
          ) : (
            <div className={styles.registerPrompt}>
              <span>New to Manglam?</span>
              <Link href="/register" className={styles.registerButton}>
                Register Free
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Login Content */}
      <main className={styles.mainSection}>
        <div className={styles.authGrid}>
          {/* Left Column: Matrimonial Couple Visual */}
          <div className={styles.visualColumn}>
            <div className={styles.imageArchWrapper}>
              <Image
                src="/images/login-hero-couple.jpg"
                alt="Indian couple smiling warmly in traditional attire"
                fill
                priority
                sizes="(max-width: 960px) 0vw, 500px"
                className={styles.heroImage}
              />
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className={styles.formColumn}>
            <div className={styles.cardWrapper}>
              {isCheckingSession ? (
                <div className={styles.loadingInner}>
                  <div className={styles.spinner} aria-hidden="true" />
                  <p className={styles.loadingText}>Checking session status...</p>
                </div>
              ) : activeProfile ? (
                /* Already Signed In View - Gives User Explicit Choice */
                <div className={styles.activeSessionCard}>
                  <div className={styles.headerGroup}>
                    <span className={styles.goldEyebrow}>ACTIVE SESSION</span>
                    <h1 className={styles.title}>Welcome back</h1>
                    <p className={styles.subtitle}>
                      You&apos;re currently signed in{userDisplayName ? ` as ` : `.`}
                      {userDisplayName && (
                        <strong className={styles.userNameHighlight}>
                          {userDisplayName}
                        </strong>
                      )}
                    </p>
                  </div>

                  <div className={styles.sessionStatusBanner}>
                    <div className={styles.sessionStatusDot} />
                    <div className={styles.sessionStatusText}>
                      <span>Authenticated account is ready</span>
                    </div>
                  </div>

                  <div className={styles.sessionActionGroup}>
                    <button
                      type="button"
                      onClick={handleContinueToProfile}
                      disabled={isNavigatingProfile}
                      className={styles.continueProfileButton}
                    >
                      {isNavigatingProfile ? (
                        <span className={styles.buttonContent}>
                          <span className={styles.smallSpinner} />
                          <span>Opening your profile...</span>
                        </span>
                      ) : (
                        <span className={styles.buttonContent}>
                          <span>Continue to my profile</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleLogoutHere}
                      className={styles.switchAccountButton}
                    >
                      Log in with another account
                    </button>
                  </div>
                </div>
              ) : (
                /* Regular Login Form */
                <LoginForm />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer Note */}
      <footer className={styles.bottomNote}>
        <p>
          © {new Date().getFullYear()} Manglam Matrimony. All rights reserved. Built with privacy and trust.
        </p>
      </footer>
    </div>
  );
}
