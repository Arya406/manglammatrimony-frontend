"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";
import { getAdminDashboardStats } from "@/lib/api/admin";
import { AdminDashboardStats } from "@/types/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { admin, logout } = useAdminAuth();

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    // Yield to microtask to prevent synchronous setState inside effect body
    await Promise.resolve();
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      } else {
        setError(res.message || "Failed to load dashboard metrics.");
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Unable to connect to administration service. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      if (!isMounted) return;
      await fetchStats();
    };
    loadStats();
    return () => {
      isMounted = false;
    };
  }, [fetchStats]);

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--color-ivory)",
        fontFamily: "var(--font-bricolage)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* Sidebar Navigation */}
      <AdminSidebar
        currentPath="/admin"
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
        adminEmail={admin?.email}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
        className="admin-main-wrapper"
      >
        {/* Top Header */}
        <header
          style={{
            height: "64px",
            backgroundColor: "#FFFFFF",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Hamburger Button for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar menu"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "none",
                color: "var(--color-text-primary)",
                minHeight: "44px",
                minWidth: "44px",
                alignItems: "center",
                justifyContent: "center",
              }}
              className="mobile-menu-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <h1
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Platform Administration
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                color: "#047857",
                backgroundColor: "#ECFDF5",
                border: "1px solid #A7F3D0",
                padding: "4px 10px",
                borderRadius: "20px",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#10B981",
                }}
              />
              System Online
            </span>

            <button
              onClick={fetchStats}
              title="Refresh Platform Metrics"
              aria-label="Refresh platform metrics"
              style={{
                background: "#FFFFFF",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                cursor: "pointer",
                padding: "6px 10px",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary)",
                minHeight: "36px",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main style={{ padding: "28px 24px", flex: 1, maxWidth: "1200px", width: "100%", boxSizing: "border-box" }}>
          {/* Subheading */}
          <div style={{ marginBottom: "28px" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--color-maroon)",
                letterSpacing: "-0.02em",
                margin: "0 0 6px 0",
              }}
            >
              Dashboard Overview
            </h2>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)", margin: 0 }}>
              Live, database-verified counts of registered user accounts and matrimonial profiles.
            </p>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div
              style={{
                backgroundColor: "#FDF2F2",
                border: "1px solid #F8B4B4",
                borderRadius: "10px",
                padding: "16px 20px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#9B1C1C" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{error}</span>
              </div>
              <button
                onClick={fetchStats}
                style={{
                  backgroundColor: "var(--color-maroon)",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* 4 Stats Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
              marginBottom: "36px",
            }}
          >
            {/* Card 1: Total Users */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "24px 20px",
                border: "1px solid var(--color-border)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Total Users
                </span>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(123, 17, 35, 0.08)",
                    color: "var(--color-maroon)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
              </div>

              {isLoading ? (
                <div style={{ height: "36px", width: "80px", backgroundColor: "#F3F4F6", borderRadius: "6px", animation: "pulse 1.5s infinite" }} />
              ) : (
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
                  {stats?.users ?? 0}
                </div>
              )}
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "8px" }}>
                Registered account records in database
              </div>
            </div>

            {/* Card 2: Total Profiles */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "24px 20px",
                border: "1px solid var(--color-border)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Total Profiles
                </span>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(197, 155, 39, 0.12)",
                    color: "var(--color-gold-hover)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              </div>

              {isLoading ? (
                <div style={{ height: "36px", width: "80px", backgroundColor: "#F3F4F6", borderRadius: "6px", animation: "pulse 1.5s infinite" }} />
              ) : (
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1.1 }}>
                  {stats?.profiles ?? 0}
                </div>
              )}
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "8px" }}>
                All candidate profiles created
              </div>
            </div>

            {/* Card 3: Active Profiles */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "24px 20px",
                border: "1px solid var(--color-border)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Active Profiles
                </span>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#ECFDF5",
                    color: "#059669",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>

              {isLoading ? (
                <div style={{ height: "36px", width: "80px", backgroundColor: "#F3F4F6", borderRadius: "6px", animation: "pulse 1.5s infinite" }} />
              ) : (
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#059669", lineHeight: 1.1 }}>
                  {stats?.activeProfiles ?? 0}
                </div>
              )}
              <div style={{ fontSize: "0.75rem", color: "#047857", marginTop: "8px", fontWeight: 500 }}>
                100% completed &amp; active in discovery
              </div>
            </div>

            {/* Card 4: Incomplete Profiles */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "24px 20px",
                border: "1px solid var(--color-border)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Incomplete Profiles
                </span>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#FEF3C7",
                    color: "#D97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
              </div>

              {isLoading ? (
                <div style={{ height: "36px", width: "80px", backgroundColor: "#F3F4F6", borderRadius: "6px", animation: "pulse 1.5s infinite" }} />
              ) : (
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#D97706", lineHeight: 1.1 }}>
                  {stats?.incompleteProfiles ?? 0}
                </div>
              )}
              <div style={{ fontSize: "0.75rem", color: "#B45309", marginTop: "8px", fontWeight: 500 }}>
                Onboarding not yet submitted
              </div>
            </div>
          </div>

          {/* Recent Activity Placeholder Section */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "28px 24px",
              border: "1px solid var(--color-border)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    margin: "0 0 4px 0",
                  }}
                >
                  Recent Platform Activity
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0 }}>
                  System logs, audit trails, and moderation queue.
                </p>
              </div>

              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  backgroundColor: "#F3F4F6",
                  color: "#6B7280",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                Step 1 Foundation
              </span>
            </div>

            <div
              style={{
                border: "1px dashed var(--color-border)",
                borderRadius: "8px",
                padding: "36px 20px",
                textAlign: "center",
                backgroundColor: "#FCFAF7",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(123, 17, 35, 0.06)",
                  color: "var(--color-maroon)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h4
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: "0 0 6px 0",
                }}
              >
                Activity Stream Standby
              </h4>
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                  maxWidth: "420px",
                  margin: "0 auto",
                  lineHeight: 1.5,
                }}
              >
                Real-time activity logs, user status adjustments, and full profile inspection
                tools will be activated in subsequent administration phases.
              </p>
            </div>
          </div>
        </main>
      </div>

      <style jsx global>{`
        @media (min-width: 768px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .admin-main-wrapper {
            margin-left: 260px;
          }
          .mobile-menu-btn {
            display: none !important;
          }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
