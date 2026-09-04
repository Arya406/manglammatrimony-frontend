import { AuthUserData, VerificationState } from "@/types/auth";

export const AUTH_TOKEN_KEY = "manglam_auth_token";
export const AUTH_USER_KEY = "manglam_auth_user";
export const VERIFICATION_STORAGE_KEY = "manglam_auth_verification_session";
export const AUTH_CHANGE_EVENT = "manglam_auth_state_change";

export function notifyAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}

/**
 * Returns the current authenticated JWT string from localStorage, or null if none exists.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    console.error("Failed to read auth token from localStorage", e);
    return null;
  }
}

/**
 * Persists the authenticated session token and optional user metadata.
 */
export function saveAuthSession(session: { token: string; user?: AuthUserData }): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    if (session.user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
    }
    notifyAuthChange();
  } catch (e) {
    console.error("Failed to persist auth session to localStorage", e);
  }
}

/**
 * Returns the cached authenticated user object from localStorage.
 */
export function getAuthUser(): AuthUserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUserData;
  } catch (e) {
    console.error("Failed to read auth user from localStorage", e);
    return null;
  }
}

/**
 * Clears the authentication token and user data from localStorage.
 */
export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    notifyAuthChange();
  } catch (e) {
    console.error("Failed to clear auth session", e);
  }
}

/**
 * Returns true if a non-empty auth token is stored in localStorage.
 */
export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

/**
 * Persists in-flight OTP verification metadata to sessionStorage.
 */
export function saveVerificationState(state: VerificationState): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to persist verification state to sessionStorage", e);
  }
}

/**
 * Retrieves in-flight OTP verification metadata from sessionStorage.
 */
export function getVerificationState(): VerificationState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(VERIFICATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VerificationState;
  } catch (e) {
    console.error("Failed to parse verification state from sessionStorage", e);
    return null;
  }
}

/**
 * Clears in-flight OTP verification metadata from sessionStorage.
 */
export function clearVerificationState(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(VERIFICATION_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear verification state", e);
  }
}

/**
 * Centralized logout:
 * 1. Clears manglam_auth_token from localStorage
 * 2. Clears manglam_auth_user from localStorage
 * 3. Clears temporary verification state from sessionStorage
 * 4. Redirects to /login
 *
 * NOTE: Does NOT delete any database data.
 */
export function logout(): void {
  clearAuthSession();
  clearVerificationState();
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/login");
  }
}
