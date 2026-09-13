"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

interface AdminSidebarProps {
  currentPath: string;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
  onLogout: () => void;
  adminEmail?: string | null;
}

export function AdminSidebar({
  currentPath,
  mobileMenuOpen,
  onCloseMobileMenu,
  onLogout,
  adminEmail,
}: AdminSidebarProps) {
  const isDashboardActive = currentPath === "/admin";
  const isProfilesActive = currentPath.startsWith("/admin/profiles");
  const isUsersActive = currentPath.startsWith("/admin/users");
  const isPhotosActive = currentPath.startsWith("/admin/photos");

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={onCloseMobileMenu}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 40,
            transition: "opacity 0.2s",
          }}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: "260px",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          fontFamily: "var(--font-bricolage)",
        }}
        className="admin-sidebar"
      >
        <div>
          {/* Brand Header */}
          <div
            style={{
              padding: "24px 20px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Logo size="sm" href="/admin" />
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    color: "var(--color-maroon)",
                    lineHeight: 1.1,
                  }}
                >
                  Manglam Admin
                </span>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>
                  Platform Control Panel
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobileMenu}
              aria-label="Close menu"
              style={{
                background: "none",
                border: "none",
                fontSize: "1.25rem",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: "8px",
                minHeight: "44px",
                minWidth: "44px",
                display: "none",
              }}
              className="mobile-close-btn"
            >
              &times;
            </button>
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: "16px 12px" }}>
            <div
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "var(--color-text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                padding: "8px 12px",
                marginBottom: "4px",
              }}
            >
              Management
            </div>

            {/* Dashboard Item */}
            <Link
              href="/admin"
              onClick={onCloseMobileMenu}
              style={{
                width: "100%",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: isDashboardActive
                  ? "rgba(123, 17, 35, 0.08)"
                  : "transparent",
                color: isDashboardActive
                  ? "var(--color-maroon)"
                  : "var(--color-text-secondary)",
                fontWeight: isDashboardActive ? 600 : 500,
                fontSize: "0.875rem",
                border: isDashboardActive
                  ? "1px solid rgba(123, 17, 35, 0.12)"
                  : "1px solid transparent",
                textDecoration: "none",
                boxSizing: "border-box",
                marginBottom: "6px",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Dashboard</span>
            </Link>

            {/* Profiles Item (Active navigation in Step 2) */}
            <Link
              href="/admin/profiles"
              onClick={onCloseMobileMenu}
              style={{
                width: "100%",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: isProfilesActive
                  ? "rgba(123, 17, 35, 0.08)"
                  : "transparent",
                color: isProfilesActive
                  ? "var(--color-maroon)"
                  : "var(--color-text-secondary)",
                fontWeight: isProfilesActive ? 600 : 500,
                fontSize: "0.875rem",
                border: isProfilesActive
                  ? "1px solid rgba(123, 17, 35, 0.12)"
                  : "1px solid transparent",
                textDecoration: "none",
                boxSizing: "border-box",
                marginBottom: "6px",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Profiles</span>
            </Link>

            {/* Users Item (Active in Step 3) */}
            <Link
              href="/admin/users"
              onClick={onCloseMobileMenu}
              style={{
                width: "100%",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: isUsersActive
                  ? "rgba(123, 17, 35, 0.08)"
                  : "transparent",
                color: isUsersActive
                  ? "var(--color-maroon)"
                  : "var(--color-text-secondary)",
                fontWeight: isUsersActive ? 600 : 500,
                fontSize: "0.875rem",
                border: isUsersActive
                  ? "1px solid rgba(123, 17, 35, 0.12)"
                  : "1px solid transparent",
                textDecoration: "none",
                boxSizing: "border-box",
                marginBottom: "6px",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Users</span>
            </Link>

            {/* Photos Item (Photo Moderation Queue - Step 4) */}
            <Link
              href="/admin/photos"
              onClick={onCloseMobileMenu}
              style={{
                width: "100%",
                minHeight: "44px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "8px",
                backgroundColor: isPhotosActive
                  ? "rgba(123, 17, 35, 0.08)"
                  : "transparent",
                color: isPhotosActive
                  ? "var(--color-maroon)"
                  : "var(--color-text-secondary)",
                fontWeight: isPhotosActive ? 600 : 500,
                fontSize: "0.875rem",
                border: isPhotosActive
                  ? "1px solid rgba(123, 17, 35, 0.12)"
                  : "1px solid transparent",
                textDecoration: "none",
                boxSizing: "border-box",
                marginBottom: "6px",
                transition: "background-color 0.15s, color 0.15s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Photos</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer / User Profile & Logout */}
        <div
          style={{
            padding: "16px 14px",
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "#FCFAF7",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--color-maroon)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.875rem",
              }}
            >
              {adminEmail ? adminEmail.charAt(0).toUpperCase() : "A"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {adminEmail || "Administrator"}
              </div>
              <div style={{ fontSize: "0.6875rem", color: "var(--color-gold-hover)", fontWeight: 600 }}>
                Role: ADMIN
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              width: "100%",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "6px",
              backgroundColor: "#FFFFFF",
              color: "#9B1C1C",
              border: "1px solid #F8B4B4",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FDF2F2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFFFFF";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
