"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { AuthUserData } from "@/types/auth";
import { CompleteProfileData } from "@/types/profile";
import {
  getAuthToken,
  getAuthUser,
  clearAuthSession,
  logout as performLogout,
  AUTH_CHANGE_EVENT,
} from "./authSession";
import { getProfile } from "@/lib/api/profile";

export type AuthStatus =
  | "AUTH_LOADING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED"
  | "AUTH_ERROR";

export type ProfileStatus =
  | "ACTIVE"
  | "IN_REVIEW"
  | "INCOMPLETE"
  | "REJECTED"
  | "SUSPENDED"
  | null;

export interface AuthContextValue {
  /**
   * The explicit three-phase + error authentication status:
   * - AUTH_LOADING: Initial hydration / session verification in progress
   * - AUTHENTICATED: Active valid token confirmed by backend session verification
   * - UNAUTHENTICATED: Verified absence of token, or confirmed 401 response
   * - AUTH_ERROR: Persistent network/5xx issue verifying session (token preserved)
   */
  authStatus: AuthStatus;

  /** True ONLY when authStatus === "AUTHENTICATED" */
  isAuthenticated: boolean;

  /** True when authStatus === "AUTH_LOADING" */
  isLoading: boolean;

  /** Authenticated user metadata */
  user: AuthUserData | null;

  /** Active JWT session token */
  token: string | null;

  /** Complete authenticated profile payload from backend */
  profile: CompleteProfileData | null;

  /** Authoritative profile lifecycle status from backend */
  profileStatus: ProfileStatus;

  /** Error message if authStatus is AUTH_ERROR */
  error: string | null;

  /** Retry validation action following persistent network failure */
  retryValidation: () => Promise<void>;

  /** Manually refresh auth state and profile payload */
  refreshAuth: () => Promise<void>;

  /** Explicit user logout */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MAX_VALIDATION_RETRIES = 2;
const RETRY_DELAY_MS = 600;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("AUTH_LOADING");
  const [user, setUser] = useState<AuthUserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<CompleteProfileData | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidatingRef = useRef(false);

  const validateSession = useCallback(async () => {
    if (isValidatingRef.current) return;
    isValidatingRef.current = true;

    // Yield to microtask to prevent synchronous setState inside effect body
    await Promise.resolve();

    const currentToken = getAuthToken();

    // 1. No token in storage -> definitively UNAUTHENTICATED
    if (!currentToken) {
      setAuthStatus("UNAUTHENTICATED");
      setToken(null);
      setUser(null);
      setProfile(null);
      setProfileStatus(null);
      setError(null);
      isValidatingRef.current = false;
      return;
    }

    setToken(currentToken);
    setAuthStatus("AUTH_LOADING");
    setError(null);

    // 2. Validate token against backend with bounded retry
    let lastError: string | null = null;
    let success = false;

    for (let attempt = 0; attempt <= MAX_VALIDATION_RETRIES; attempt++) {
      if (attempt > 0) {
        await wait(RETRY_DELAY_MS * attempt);
      }

      try {
        const res = await getProfile();

        if (res.success && res.data) {
          const rawStatus = (res.data.profile?.profileStatus || res.data.profileStatus) as ProfileStatus;
          const resolvedStatus: ProfileStatus = rawStatus || null;

          // Resolve display user
          const cachedUser = getAuthUser();
          const resolvedUser: AuthUserData = cachedUser || {
            id: res.data.profile?.userId || "",
            status: (resolvedStatus as string) || "ACTIVE",
          };

          setProfile(res.data);
          setProfileStatus(resolvedStatus);
          setUser(resolvedUser);
          setAuthStatus("AUTHENTICATED");
          setError(null);
          success = true;
          break;
        }

        // Explicit 401 / Unauthorized -> token is revoked or expired
        if (!res.success && res.code === "UNAUTHORIZED") {
          clearAuthSession();
          setAuthStatus("UNAUTHENTICATED");
          setToken(null);
          setUser(null);
          setProfile(null);
          setProfileStatus(null);
          setError(null);
          success = true;
          break;
        }

        // Server returned another error code (e.g. 500 or network issue)
        lastError = res.message || "Validation failed";
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : "Network error while validating session";
      }
    }

    // 3. Persistent network or 5xx failure: Non-destructive error state
    if (!success) {
      // DO NOT call clearAuthSession()
      // DO NOT set UNAUTHENTICATED
      // DO NOT promote unverified cached user to AUTHENTICATED
      setAuthStatus("AUTH_ERROR");
      setError(
        typeof lastError === "string"
          ? lastError
          : "Unable to connect to authentication server. Please check your connection and retry."
      );
    }

    isValidatingRef.current = false;
  }, []);

  // Initial validation on mount
  useEffect(() => {
    let isMounted = true;
    const runValidation = async () => {
      if (!isMounted) return;
      await validateSession();
    };
    runValidation();
    return () => {
      isMounted = false;
    };
  }, [validateSession]);

  // Subscribe to same-tab and multi-tab auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const currentToken = getAuthToken();
      if (!currentToken) {
        setAuthStatus("UNAUTHENTICATED");
        setToken(null);
        setUser(null);
        setProfile(null);
        setProfileStatus(null);
        setError(null);
      } else {
        // Token was created or updated -> re-validate
        validateSession();
      }
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [validateSession]);

  const handleLogout = useCallback(() => {
    // Explicit user logout only
    performLogout();
  }, []);

  const value: AuthContextValue = {
    authStatus,
    isAuthenticated: authStatus === "AUTHENTICATED",
    isLoading: authStatus === "AUTH_LOADING",
    user,
    token,
    profile,
    profileStatus,
    error,
    retryValidation: validateSession,
    refreshAuth: validateSession,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
