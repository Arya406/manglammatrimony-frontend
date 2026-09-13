"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/lib/auth/AdminAuthContext";

function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { status, isAuthenticated, isLoading, refreshSession, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !isLoginPage && status !== "AUTH_ERROR") {
      router.replace("/admin/login");
    } else if (isAuthenticated && isLoginPage) {
      router.replace("/admin");
    }
  }, [isAuthenticated, isLoading, isLoginPage, status, router]);

  // If on /admin/login and unauthenticated (or still validating), render login page
  if (isLoginPage) {
    if (isAuthenticated) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-ivory)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontFamily: "var(--font-bricolage)",
              color: "var(--color-maroon)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid #EFE8E9",
                borderTopColor: "var(--color-maroon)",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ fontSize: "0.9375rem", fontWeight: 500 }}>
              Redirecting to Administration...
            </p>
          </div>
        </div>
      );
    }
    return <>{children}</>;
  }

  // If loading protected admin route, display polished loading shell
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-ivory)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-bricolage)",
            color: "var(--color-maroon)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #EFE8E9",
              borderTopColor: "var(--color-maroon)",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: "1rem", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Authenticating Manglam Admin Session...
          </p>
        </div>
      </div>
    );
  }

  // If session verification failed due to network error on protected route
  if (status === "AUTH_ERROR") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--color-ivory)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-bricolage)",
            maxWidth: "400px",
            padding: "24px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#FEE2E2",
              color: "#DC2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "8px",
            }}
          >
            Session Verification Failed
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              marginBottom: "20px",
              lineHeight: 1.5,
            }}
          >
            Unable to reach the administration server to verify your session. Please verify your connection.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={() => refreshSession()}
              style={{
                padding: "10px 18px",
                backgroundColor: "var(--color-maroon)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                minHeight: "44px",
              }}
            >
              Retry Connection
            </button>
            <button
              onClick={() => {
                logout();
                router.replace("/admin/login");
              }}
              style={{
                padding: "10px 18px",
                backgroundColor: "#FFFFFF",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                minHeight: "44px",
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated on protected admin route, block rendering while redirect takes place
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminRouteGuard>{children}</AdminRouteGuard>
    </AdminAuthProvider>
  );
}
