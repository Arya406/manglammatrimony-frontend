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
import { AdminUserData, AdminLoginData } from "@/types/admin";
import {
  getAdminAuthToken,
  saveAdminAuthSession,
  clearAdminAuthSession,
  ADMIN_AUTH_CHANGE_EVENT,
} from "./adminAuthSession";
import { getAdminMe } from "@/lib/api/admin";

export type AdminAuthStatus =
  | "LOADING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED"
  | "AUTH_ERROR";

export interface AdminAuthContextValue {
  status: AdminAuthStatus;
  admin: AdminUserData | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: AdminLoginData) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminAuthStatus>("LOADING");
  const [admin, setAdmin] = useState<AdminUserData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isValidatingRef = useRef(false);

  const validateSession = useCallback(async () => {
    if (isValidatingRef.current) return;
    isValidatingRef.current = true;

    // Yield to microtask
    await Promise.resolve();

    const currentToken = getAdminAuthToken();

    if (!currentToken) {
      setToken(null);
      setAdmin(null);
      setError(null);
      setStatus("UNAUTHENTICATED");
      isValidatingRef.current = false;
      return;
    }

    try {
      // Authoritatively validate token directly against backend /api/admin/auth/me
      const res = await getAdminMe();

      if (res.success && res.data?.admin && res.data.admin.role === "ADMIN") {
        setToken(currentToken);
        setAdmin(res.data.admin);
        setError(null);
        // Persist verified admin metadata to storage without recursive event loop (notify = false)
        saveAdminAuthSession({ token: currentToken, admin: res.data.admin }, false);
        setStatus("AUTHENTICATED");
      } else {
        // Stale, forged, expired, or non-admin token: clear storage and revoke access
        clearAdminAuthSession();
        setToken(null);
        setAdmin(null);
        setError(res.message || "Admin session is invalid or expired.");
        setStatus("UNAUTHENTICATED");
      }
    } catch (e) {
      console.error("[ADMIN AUTH CONTEXT] Verification network error:", e);
      // Network failure: transition to AUTH_ERROR.
      // Security rule: NEVER grant access based on unverified cached admin data!
      setError("Unable to connect to the administration server. Please verify your connection.");
      setStatus("AUTH_ERROR");
    } finally {
      isValidatingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const runValidation = async () => {
      if (!isMounted) return;
      await validateSession();
    };
    runValidation();

    const handleAuthChange = () => {
      if (isMounted) {
        void validateSession();
      }
    };

    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, handleAuthChange);
    return () => {
      isMounted = false;
      window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, [validateSession]);

  const login = useCallback((data: AdminLoginData) => {
    saveAdminAuthSession({ token: data.token, admin: data.admin }, false);
    setToken(data.token);
    setAdmin(data.admin);
    setError(null);
    setStatus("AUTHENTICATED");
  }, []);

  const logout = useCallback(() => {
    clearAdminAuthSession();
    setToken(null);
    setAdmin(null);
    setError(null);
    setStatus("UNAUTHENTICATED");
  }, []);

  const value: AdminAuthContextValue = {
    status,
    admin,
    token,
    isAuthenticated: status === "AUTHENTICATED",
    isLoading: status === "LOADING",
    error,
    login,
    logout,
    refreshSession: validateSession,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
