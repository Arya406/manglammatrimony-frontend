import { AdminUserData } from "@/types/admin";

export const ADMIN_AUTH_TOKEN_KEY = "manglam_admin_auth_token";
export const ADMIN_AUTH_USER_KEY = "manglam_admin_auth_user";
export const ADMIN_AUTH_CHANGE_EVENT = "manglam_admin_auth_state_change";

export function notifyAdminAuthChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
  }
}

/**
 * Returns the stored admin JWT string from localStorage, or null if none exists.
 */
export function getAdminAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(ADMIN_AUTH_TOKEN_KEY);
  } catch (e) {
    console.error("Failed to read admin auth token from localStorage", e);
    return null;
  }
}

/**
 * Persists the administrative session token and admin user payload.
 * Optional notify parameter allows internal validation to persist without recursive event triggers.
 */
export function saveAdminAuthSession(
  session: { token: string; admin?: AdminUserData },
  notify: boolean = true
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, session.token);
    if (session.admin) {
      localStorage.setItem(ADMIN_AUTH_USER_KEY, JSON.stringify(session.admin));
    }
    if (notify) {
      notifyAdminAuthChange();
    }
  } catch (e) {
    console.error("Failed to persist admin session to localStorage", e);
  }
}

/**
 * Returns the cached admin user object from localStorage.
 */
export function getAdminAuthUser(): AdminUserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUserData;
  } catch (e) {
    console.error("Failed to read admin user from localStorage", e);
    return null;
  }
}

/**
 * Clears the admin session token and cached admin user data.
 * Does NOT touch normal user authentication state (manglam_auth_token).
 */
export function clearAdminAuthSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_AUTH_USER_KEY);
    notifyAdminAuthChange();
  } catch (e) {
    console.error("Failed to clear admin auth session", e);
  }
}

/**
 * Returns true if an admin session token is present in localStorage.
 */
export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminAuthToken());
}
