"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";
import { getAdminUsers } from "@/lib/api/admin";
import {
  AdminUserListItem,
  AdminUserDetail,
  AdminPagination,
  AdminUserListParams,
} from "@/types/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminUserDetailModal } from "@/components/admin/AdminUserDetailModal";
import { AdminProfileDetailModal } from "@/components/admin/AdminProfileDetailModal";
import { AdminCreateUserModal } from "@/components/admin/AdminCreateUserModal";

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function getInitials(displayName: string, email?: string | null): string {
  if (displayName && displayName !== "Unnamed User") {
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.charAt(0).toUpperCase();
  return "U";
}

function getUserStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        bg: "#ECFDF5",
        text: "#065F46",
        border: "#A7F3D0",
        dot: "#10B981",
      };
    case "SUSPENDED":
      return {
        label: "Suspended",
        bg: "#FEF2F2",
        text: "#991B1B",
        border: "#FECACA",
        dot: "#EF4444",
      };
    case "BLOCKED":
      return {
        label: "Blocked",
        bg: "#F3F4F6",
        text: "#374151",
        border: "#D1D5DB",
        dot: "#6B7280",
      };
    case "DELETED":
      return {
        label: "Deleted",
        bg: "#FEE2E2",
        text: "#991B1B",
        border: "#F87171",
        dot: "#DC2626",
      };
    default:
      return {
        label: status,
        bg: "#F9FAFB",
        text: "#4B5563",
        border: "#E5E7EB",
        dot: "#9CA3AF",
      };
  }
}

function getProfileBadge(profile: AdminUserListItem["profile"]) {
  if (!profile) {
    return {
      label: "No Profile",
      bg: "#F3F4F6",
      text: "#6B7280",
      border: "#E5E7EB",
    };
  }
  switch (profile.profileStatus) {
    case "ACTIVE":
      return {
        label: `Active (${profile.completionPercentage}%)`,
        bg: "#ECFDF5",
        text: "#047857",
        border: "#A7F3D0",
      };
    case "INCOMPLETE":
      return {
        label: `Incomplete (${profile.completionPercentage}%)`,
        bg: "#FFFBEB",
        text: "#B45309",
        border: "#FDE68A",
      };
    case "IN_REVIEW":
      return {
        label: `In Review (${profile.completionPercentage}%)`,
        bg: "#EFF6FF",
        text: "#1D4ED8",
        border: "#BFDBFE",
      };
    case "SUSPENDED":
      return {
        label: "Suspended",
        bg: "#FEF2F2",
        text: "#B91C1C",
        border: "#FECACA",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        bg: "#F3F4F6",
        text: "#4B5563",
        border: "#E5E7EB",
      };
    default:
      return {
        label: `${profile.profileStatus} (${profile.completionPercentage}%)`,
        bg: "#F9FAFB",
        text: "#6B7280",
        border: "#E5E7EB",
      };
  }
}

function AdminUsersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { admin, logout } = useAdminAuth();

  // URL State
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialPageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const initialQ = searchParams.get("q") || "";
  const initialStatus = searchParams.get("status") || "ALL";
  const initialRole = searchParams.get("role") || "ALL";
  const initialEmailVerified = searchParams.get("emailVerified") || "ALL";
  const initialPhoneVerified = searchParams.get("phoneVerified") || "ALL";
  const initialActivationStatus = searchParams.get("activationStatus") || "ALL";
  const initialSort = searchParams.get("sort") || "newest";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [selectedEmailVerified, setSelectedEmailVerified] = useState(initialEmailVerified);
  const [selectedPhoneVerified, setSelectedPhoneVerified] = useState(initialPhoneVerified);
  const [selectedActivationStatus, setSelectedActivationStatus] = useState(initialActivationStatus);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Data state
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [openProfileEditOnLoad, setOpenProfileEditOnLoad] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleUserDeleted = useCallback((deletedUserId: string, message: string) => {
    setSelectedUserId(null);
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== deletedUserId));
    setPagination((prevPagination) =>
      prevPagination
        ? {
            ...prevPagination,
            total: Math.max(0, prevPagination.total - 1),
          }
        : null
    );
    setSuccessToast(message);
  }, []);

  const handleUserUpdated = useCallback((updatedUser: AdminUserDetail) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === updatedUser.id
          ? {
              ...u,
              status: updatedUser.status,
              statusChangedAt: updatedUser.statusChangedAt,
              statusChangedByUser: updatedUser.statusChangedByUser,
              updatedAt: updatedUser.updatedAt,
              profile: updatedUser.profile
                ? {
                    ...(u.profile || {
                      profileId: updatedUser.profile.profileId,
                      profileCreatedFor: updatedUser.profile.profileCreatedFor,
                      gender: updatedUser.profile.gender,
                      city: updatedUser.profile.city,
                      state: updatedUser.profile.state,
                      firstName: updatedUser.profile.firstName,
                      lastName: updatedUser.profile.lastName,
                      submittedAt: updatedUser.profile.submittedAt,
                      createdAt: updatedUser.profile.createdAt,
                      primaryPhotoUrl: updatedUser.profile.primaryPhotoUrl,
                    }),
                    profileStatus: updatedUser.profile.profileStatus,
                    completionPercentage: updatedUser.profile.completionPercentage,
                  }
                : u.profile,
            }
          : u
      )
    );
  }, []);

  // Synchronize local filter changes with URL
  const updateUrlParams = useCallback(
    (params: {
      q?: string;
      status?: string;
      role?: string;
      activationStatus?: string;
      emailVerified?: string;
      phoneVerified?: string;
      sort?: string;
      page?: number;
      pageSize?: number;
    }) => {
      const sp = new URLSearchParams();
      const qVal = params.q !== undefined ? params.q : searchQuery;
      const statusVal = params.status !== undefined ? params.status : selectedStatus;
      const roleVal = params.role !== undefined ? params.role : selectedRole;
      const activationStatusVal =
        params.activationStatus !== undefined ? params.activationStatus : selectedActivationStatus;
      const emailVerifiedVal =
        params.emailVerified !== undefined ? params.emailVerified : selectedEmailVerified;
      const phoneVerifiedVal =
        params.phoneVerified !== undefined ? params.phoneVerified : selectedPhoneVerified;
      const sortVal = params.sort !== undefined ? params.sort : selectedSort;
      const pageVal = params.page !== undefined ? params.page : currentPage;
      const pageSizeVal = params.pageSize !== undefined ? params.pageSize : pageSize;

      if (qVal.trim()) sp.set("q", qVal.trim());
      if (statusVal && statusVal !== "ALL") sp.set("status", statusVal);
      if (roleVal && roleVal !== "ALL") sp.set("role", roleVal);
      if (activationStatusVal && activationStatusVal !== "ALL")
        sp.set("activationStatus", activationStatusVal);
      if (emailVerifiedVal && emailVerifiedVal !== "ALL") sp.set("emailVerified", emailVerifiedVal);
      if (phoneVerifiedVal && phoneVerifiedVal !== "ALL") sp.set("phoneVerified", phoneVerifiedVal);
      if (sortVal && sortVal !== "newest") sp.set("sort", sortVal);
      if (pageVal > 1) sp.set("page", pageVal.toString());
      if (pageSizeVal !== 20) sp.set("pageSize", pageSizeVal.toString());

      const newUrl = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
      router.replace(newUrl);
    },
    [
      searchQuery,
      selectedStatus,
      selectedRole,
      selectedActivationStatus,
      selectedEmailVerified,
      selectedPhoneVerified,
      selectedSort,
      currentPage,
      pageSize,
      pathname,
      router,
    ]
  );

  const fetchUsers = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);

    const queryParams: AdminUserListParams = {
      page: currentPage,
      pageSize: pageSize,
    };
    if (searchQuery.trim()) queryParams.q = searchQuery.trim();
    if (selectedStatus !== "ALL") {
      queryParams.status = selectedStatus;
    }
    if (selectedRole !== "ALL") {
      queryParams.role = selectedRole;
    }
    if (selectedActivationStatus !== "ALL") {
      queryParams.activationStatus = selectedActivationStatus;
    }
    if (selectedEmailVerified !== "ALL") {
      queryParams.emailVerified = selectedEmailVerified === "true";
    }
    if (selectedPhoneVerified !== "ALL") {
      queryParams.phoneVerified = selectedPhoneVerified === "true";
    }
    if (selectedSort !== "newest") {
      queryParams.sort = selectedSort;
    }

    try {
      const res = await getAdminUsers(queryParams);
      if (res.success && res.data) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || "Failed to load users from the server.");
      }
    } catch (err) {
      console.error("Admin user list fetch error:", err);
      setError("An unexpected network or server error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    selectedStatus,
    selectedRole,
    selectedEmailVerified,
    selectedPhoneVerified,
    selectedActivationStatus,
    selectedSort,
  ]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!isMounted) return;
      await fetchUsers();
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [fetchUsers]);

  const handleLogout = () => {
    logout();
    router.replace("/admin/login");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    updateUrlParams({ q: searchQuery, page: 1 });
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("ALL");
    setSelectedRole("ALL");
    setSelectedEmailVerified("ALL");
    setSelectedPhoneVerified("ALL");
    setSelectedSort("newest");
    setCurrentPage(1);
    updateUrlParams({
      q: "",
      status: "ALL",
      role: "ALL",
      emailVerified: "ALL",
      phoneVerified: "ALL",
      sort: "newest",
      page: 1,
    });
  };

  const isFilteringActive =
    searchQuery.trim() !== "" ||
    selectedStatus !== "ALL" ||
    selectedRole !== "ALL" ||
    selectedEmailVerified !== "ALL" ||
    selectedPhoneVerified !== "ALL" ||
    selectedSort !== "newest";

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
      {/* Admin Navigation Sidebar */}
      <AdminSidebar
        currentPath="/admin/users"
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
          className="admin-top-header"
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
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    fontWeight: 500,
                  }}
                >
                  Users
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>/</span>
                <h1
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--color-text-primary)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  All Users
                </h1>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {pagination && (
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-muted)",
                  fontWeight: 500,
                }}
                className="desktop-only"
              >
                Total:{" "}
                <strong style={{ color: "var(--color-text-primary)" }}>
                  {pagination.total}
                </strong>{" "}
                users
              </span>
            )}
              <button
                onClick={() => fetchUsers()}
                disabled={isLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--color-text-primary)",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  minHeight: "44px",
                }}
                aria-label="Refresh user list"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    animation: isLoading ? "spin 1s linear infinite" : "none",
                  }}
                >
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <span className="desktop-only">Refresh</span>
              </button>

              <button
                id="create-user-button"
                data-testid="create-user-button"
                onClick={() => setIsCreateUserModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "var(--color-maroon)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(139, 21, 56, 0.2)",
                  minHeight: "44px",
                }}
                aria-label="Create new user"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>+ Create User</span>
              </button>
            </div>
          </header>

        {/* Content Body */}
        <main
          className="admin-main-content"
          style={{
            flex: 1,
            padding: "24px",
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Success Notification Banner */}
          {successToast && (
            <div
              id="admin-user-success-toast"
              style={{
                backgroundColor: "#ECFDF5",
                border: "1px solid #A7F3D0",
                borderRadius: "8px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                color: "#065F46",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>{successToast}</span>
              </div>
              <button
                onClick={() => setSuccessToast(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#047857",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Dismiss message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Search & Filters Card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--color-border)",
              borderRadius: "10px",
              padding: "18px 20px",
              marginBottom: "20px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
            }}
          >
            {/* Search Input Bar */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  flex: "1 1 280px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "12px",
                    color: "var(--color-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    pointerEvents: "none",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  id="admin-users-search-input"
                  type="text"
                  placeholder="Search by email, phone, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 36px 10px 36px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontFamily: "inherit",
                    backgroundColor: "var(--color-ivory)",
                    color: "var(--color-text-primary)",
                    outline: "none",
                    minHeight: "44px",
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                      updateUrlParams({ q: "", page: 1 });
                    }}
                    style={{
                      position: "absolute",
                      right: "10px",
                      background: "none",
                      border: "none",
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                      fontSize: "1rem",
                      padding: "4px",
                    }}
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>

              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "var(--color-maroon)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: "44px",
                  whiteSpace: "nowrap",
                }}
              >
                Search
              </button>

              {isFilteringActive && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "transparent",
                    color: "#9B1C1C",
                    border: "1px solid #F8B4B4",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    minHeight: "44px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Reset Filters
                </button>
              )}
            </form>

            {/* Filter Dropdowns Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: "12px",
                paddingTop: "12px",
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              {/* Status Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Account Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ status: e.target.value, page: 1 });
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-primary)",
                    minHeight: "44px",
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="DELETED">DELETED</option>
                </select>
              </div>

              {/* Role Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  User Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ role: e.target.value, page: 1 });
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-primary)",
                    minHeight: "44px",
                  }}
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Email Verification Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Email Verified
                </label>
                <select
                  value={selectedEmailVerified}
                  onChange={(e) => {
                    setSelectedEmailVerified(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ emailVerified: e.target.value, page: 1 });
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-primary)",
                    minHeight: "44px",
                  }}
                >
                  <option value="ALL">All Verification</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </select>
              </div>

              {/* Phone Verification Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Phone Verified
                </label>
                <select
                  value={selectedPhoneVerified}
                  onChange={(e) => {
                    setSelectedPhoneVerified(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ phoneVerified: e.target.value, page: 1 });
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-primary)",
                    minHeight: "44px",
                  }}
                >
                  <option value="ALL">All Verification</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </select>
              </div>

              {/* Activation Status Filter */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Activation Status
                </label>
                <select
                  id="filter-activation-status"
                  value={selectedActivationStatus}
                  onChange={(e) => {
                    setSelectedActivationStatus(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ activationStatus: e.target.value, page: 1 });
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-primary)",
                    minHeight: "44px",
                  }}
                >
                  <option value="ALL">All</option>
                  <option value="PENDING_ACTIVATION">Pending Activation</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--color-text-muted)",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Sort By
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => {
                    setSelectedSort(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ sort: e.target.value, page: 1 });
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-primary)",
                    minHeight: "44px",
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="email_asc">Email (A-Z)</option>
                  <option value="email_desc">Email (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #F87171",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: "0.875rem", color: "#991B1B", fontWeight: 500 }}>
                  {error}
                </span>
              </div>
              <button
                onClick={() => fetchUsers()}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DC2626",
                  borderRadius: "4px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "#DC2626",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoading && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    animation: "pulse 1.5s infinite ease-in-out",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: "160px",
                        height: "14px",
                        backgroundColor: "#E5E7EB",
                        borderRadius: "4px",
                        marginBottom: "6px",
                      }}
                    />
                    <div
                      style={{
                        width: "100px",
                        height: "10px",
                        backgroundColor: "#F3F4F6",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "70px",
                      height: "22px",
                      backgroundColor: "#E5E7EB",
                      borderRadius: "12px",
                    }}
                  />
                  <div
                    style={{
                      width: "80px",
                      height: "22px",
                      backgroundColor: "#E5E7EB",
                      borderRadius: "12px",
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && users.length === 0 && (
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                padding: "64px 24px",
                textAlign: "center",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(123, 17, 35, 0.06)",
                  color: "var(--color-maroon)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: "0 0 8px 0",
                }}
              >
                No users found
              </h2>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  maxWidth: "400px",
                  margin: "0 auto 16px",
                }}
              >
                {isFilteringActive
                  ? "No registered user accounts match the current filter criteria. Try clearing or relaxing your filters."
                  : "There are currently no registered users in the database."}
              </p>
              {isFilteringActive && (
                <button
                  onClick={handleClearFilters}
                  style={{
                    padding: "8px 18px",
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
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {/* User Results */}
          {!isLoading && !error && users.length > 0 && (
            <>
              {/* Desktop Table View */}
              <div
                className="desktop-table-container"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                }}
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#FCFAF7",
                          borderBottom: "1px solid var(--color-border)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        <th style={{ padding: "14px 16px" }}>User</th>
                        <th style={{ padding: "14px 16px" }}>Contact</th>
                        <th style={{ padding: "14px 16px" }}>Role</th>
                        <th style={{ padding: "14px 16px" }}>Verification</th>
                        <th style={{ padding: "14px 16px" }}>Matrimonial Profile</th>
                        <th style={{ padding: "14px 16px" }}>Status</th>
                        <th style={{ padding: "14px 16px" }}>Registered</th>
                        <th style={{ padding: "14px 16px", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const statusBadge = getUserStatusBadge(u.status);
                        const profileBadge = getProfileBadge(u.profile);
                        const fullName = u.displayName || "Unnamed User";
                        const initials = getInitials(fullName, u.email);

                        return (
                          <tr
                            key={u.id}
                            className="admin-table-row"
                            style={{
                              borderBottom: "1px solid var(--color-border-subtle)",
                              transition: "background-color 0.15s ease",
                            }}
                          >
                            {/* User column */}
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {u.profile?.primaryPhotoUrl ? (
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      overflow: "hidden",
                                      position: "relative",
                                      flexShrink: 0,
                                      border: "1px solid var(--color-border)",
                                    }}
                                  >
                                    <Image
                                      src={u.profile.primaryPhotoUrl}
                                      alt={fullName}
                                      fill
                                      style={{ objectFit: "cover" }}
                                      sizes="40px"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      backgroundColor:
                                        u.role === "ADMIN"
                                          ? "rgba(180, 83, 9, 0.1)"
                                          : "var(--color-ivory)",
                                      color:
                                        u.role === "ADMIN" ? "#B45309" : "var(--color-maroon)",
                                      border: "1px solid var(--color-border)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.8125rem",
                                      fontWeight: 700,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {initials}
                                  </div>
                                )}
                                <div>
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "0.9375rem",
                                      color: "var(--color-text-primary)",
                                    }}
                                  >
                                    {fullName}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.6875rem",
                                      color: "var(--color-text-muted)",
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    ID: {u.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Contact */}
                            <td style={{ padding: "14px 16px" }}>
                              <div
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--color-text-primary)",
                                  wordBreak: "break-all",
                                }}
                              >
                                {u.email || "No email"}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--color-text-muted)",
                                  marginTop: "2px",
                                }}
                              >
                                {u.maskedPhone || "No phone"}
                              </div>
                            </td>

                            {/* Role */}
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 8px",
                                  borderRadius: "12px",
                                  fontSize: "0.6875rem",
                                  fontWeight: 700,
                                  backgroundColor: u.role === "ADMIN" ? "#FEF3C7" : "#F3F4F6",
                                  color: u.role === "ADMIN" ? "#92400E" : "#4B5563",
                                  border: `1px solid ${
                                    u.role === "ADMIN" ? "#FDE68A" : "#E5E7EB"
                                  }`,
                                }}
                              >
                                {u.role}
                              </span>
                            </td>

                            {/* Verification */}
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.6875rem" }}>
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: u.emailVerified ? "#10B981" : "#EF4444",
                                    }}
                                  />
                                  <span style={{ color: u.emailVerified ? "#047857" : "#B91C1C", fontWeight: 600 }}>
                                    Email: {u.emailVerified ? "Verified" : "Unverified"}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.6875rem" }}>
                                  <span
                                    style={{
                                      width: "6px",
                                      height: "6px",
                                      borderRadius: "50%",
                                      backgroundColor: u.phoneVerified ? "#10B981" : "#EF4444",
                                    }}
                                  />
                                  <span style={{ color: u.phoneVerified ? "#047857" : "#B91C1C", fontWeight: 600 }}>
                                    Phone: {u.phoneVerified ? "Verified" : "Unverified"}
                                  </span>
                                </div>
                                {u.activationStatus === "PENDING_ACTIVATION" && (
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "2px 6px",
                                      borderRadius: "8px",
                                      fontSize: "0.625rem",
                                      fontWeight: 700,
                                      backgroundColor: "#FEF3C7",
                                      color: "#B45309",
                                      border: "1px solid #FDE68A",
                                      width: "fit-content",
                                    }}
                                  >
                                    Pending Activation
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Matrimonial Profile */}
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 10px",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  backgroundColor: profileBadge.bg,
                                  color: profileBadge.text,
                                  border: `1px solid ${profileBadge.border}`,
                                }}
                              >
                                {profileBadge.label}
                              </span>
                            </td>

                            {/* Account Status */}
                            <td style={{ padding: "14px 16px" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "3px 10px",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  backgroundColor: statusBadge.bg,
                                  color: statusBadge.text,
                                  border: `1px solid ${statusBadge.border}`,
                                }}
                              >
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: statusBadge.dot,
                                  }}
                                />
                                {statusBadge.label}
                              </div>
                            </td>

                            {/* Registered */}
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {formatDate(u.createdAt)}
                              </span>
                            </td>

                            {/* Action: View Only */}
                            <td style={{ padding: "14px 16px", textAlign: "right" }}>
                              <button
                                id={`admin-user-action-view-${u.id}`}
                                onClick={() => setSelectedUserId(u.id)}
                                style={{
                                  padding: "6px 14px",
                                  backgroundColor: "#FFFFFF",
                                  color: "var(--color-maroon)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "6px",
                                  fontSize: "0.8125rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  transition: "all 0.15s ease",
                                  minHeight: "36px",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "var(--color-maroon)";
                                  e.currentTarget.style.color = "#FFFFFF";
                                  e.currentTarget.style.borderColor = "var(--color-maroon)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "#FFFFFF";
                                  e.currentTarget.style.color = "var(--color-maroon)";
                                  e.currentTarget.style.borderColor = "var(--color-border)";
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards View */}
              <div className="mobile-cards-container">
                {users.map((u) => {
                  const statusBadge = getUserStatusBadge(u.status);
                  const profileBadge = getProfileBadge(u.profile);
                  const fullName = u.displayName || "Unnamed User";
                  const initials = getInitials(fullName, u.email);

                  return (
                    <div
                      key={u.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--color-border)",
                        borderRadius: "10px",
                        padding: "16px",
                        marginBottom: "12px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                      }}
                    >
                      {/* Card Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: "1 1 auto", minWidth: 0 }}>
                          {u.profile?.primaryPhotoUrl ? (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                position: "relative",
                                flexShrink: 0,
                                border: "1px solid var(--color-border)",
                              }}
                            >
                              <Image
                                src={u.profile.primaryPhotoUrl}
                                alt={fullName}
                                fill
                                style={{ objectFit: "cover" }}
                                sizes="40px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                backgroundColor:
                                  u.role === "ADMIN"
                                    ? "rgba(180, 83, 9, 0.1)"
                                    : "var(--color-ivory)",
                                color:
                                  u.role === "ADMIN" ? "#B45309" : "var(--color-maroon)",
                                border: "1px solid var(--color-border)",
                                display: "flex",
                                alignItems: "center",
                                justifySelf: "center",
                                justifyContent: "center",
                                fontSize: "0.8125rem",
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.9375rem",
                                color: "var(--color-text-primary)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fullName}
                            </div>
                            <div
                              style={{
                                fontSize: "0.6875rem",
                                color: "var(--color-text-muted)",
                                fontFamily: "monospace",
                              }}
                            >
                              ID: {u.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", alignItems: "center" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: "10px",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              backgroundColor: u.role === "ADMIN" ? "#FEF3C7" : "#F3F4F6",
                              color: u.role === "ADMIN" ? "#92400E" : "#4B5563",
                              border: `1px solid ${
                                u.role === "ADMIN" ? "#FDE68A" : "#E5E7EB"
                              }`,
                            }}
                          >
                            {u.role}
                          </span>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              backgroundColor: statusBadge.bg,
                              color: statusBadge.text,
                              border: `1px solid ${statusBadge.border}`,
                            }}
                          >
                            {statusBadge.label}
                          </span>
                          {u.activationStatus === "PENDING_ACTIVATION" && (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 6px",
                                borderRadius: "10px",
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                backgroundColor: "#FEF3C7",
                                color: "#B45309",
                                border: "1px solid #FDE68A",
                              }}
                            >
                              Pending Activation
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Details */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "8px",
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          padding: "8px 0",
                          borderTop: "1px solid var(--color-border-subtle)",
                          borderBottom: "1px solid var(--color-border-subtle)",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ gridColumn: "span 2" }}>
                          <strong>Email:</strong> {u.email || "No email"}
                        </div>
                        <div>
                          <strong>Phone:</strong> {u.maskedPhone || "No phone"}
                        </div>
                        <div>
                          <strong>Registered:</strong> {formatDate(u.createdAt)}
                        </div>
                        <div>
                          <strong>Email Status:</strong>{" "}
                          <span style={{ color: u.emailVerified ? "#047857" : "#B91C1C", fontWeight: 600 }}>
                            {u.emailVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                        <div>
                          <strong>Phone Status:</strong>{" "}
                          <span style={{ color: u.phoneVerified ? "#047857" : "#B91C1C", fontWeight: 600 }}>
                            {u.phoneVerified ? "Verified" : "Unverified"}
                          </span>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <strong>Profile:</strong>{" "}
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 6px",
                              borderRadius: "8px",
                              fontSize: "0.6875rem",
                              fontWeight: 600,
                              backgroundColor: profileBadge.bg,
                              color: profileBadge.text,
                              border: `1px solid ${profileBadge.border}`,
                            }}
                          >
                            {profileBadge.label}
                          </span>
                        </div>
                      </div>

                      {/* View Button */}
                      <button
                        id={`admin-user-action-view-mobile-${u.id}`}
                        onClick={() => setSelectedUserId(u.id)}
                        style={{
                          width: "100%",
                          minHeight: "44px",
                          backgroundColor: "#FFFFFF",
                          color: "var(--color-maroon)",
                          border: "1px solid var(--color-maroon)",
                          borderRadius: "6px",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <span>View User Details</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginTop: "20px",
                    padding: "12px 16px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Showing{" "}
                    <strong>
                      {(pagination.page - 1) * pagination.pageSize + 1}
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {Math.min(
                        pagination.page * pagination.pageSize,
                        pagination.total
                      )}
                    </strong>{" "}
                    of <strong>{pagination.total}</strong> users
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value, 10);
                          setPageSize(newSize);
                          setCurrentPage(1);
                          updateUrlParams({ pageSize: newSize, page: 1 });
                        }}
                        style={{
                          padding: "6px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--color-border)",
                          backgroundColor: "#FFFFFF",
                          fontSize: "0.8125rem",
                          color: "var(--color-text-primary)",
                          minHeight: "36px",
                        }}
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const newPage = pagination.page - 1;
                        setCurrentPage(newPage);
                        updateUrlParams({ page: newPage });
                      }}
                      disabled={!pagination.hasPrevPage}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: pagination.hasPrevPage
                          ? "var(--color-text-primary)"
                          : "var(--color-text-muted)",
                        cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
                        minHeight: "44px",
                      }}
                    >
                      &larr; Previous
                    </button>

                    <span
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                        padding: "0 8px",
                      }}
                    >
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <button
                      onClick={() => {
                        const newPage = pagination.page + 1;
                        setCurrentPage(newPage);
                        updateUrlParams({ page: newPage });
                      }}
                      disabled={!pagination.hasNextPage}
                      style={{
                        padding: "8px 14px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--color-border)",
                        borderRadius: "6px",
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: pagination.hasNextPage
                          ? "var(--color-text-primary)"
                          : "var(--color-text-muted)",
                        cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
                        minHeight: "44px",
                      }}
                    >
                      Next &rarr;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Read-Only User Detail Modal */}
      {selectedUserId && (
        <AdminUserDetailModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onViewProfile={(profileId) => {
            setSelectedUserId(null);
            setSelectedProfileId(profileId);
            setOpenProfileEditOnLoad(false);
          }}
          onEditProfile={(profileId) => {
            setSelectedUserId(null);
            setSelectedProfileId(profileId);
            setOpenProfileEditOnLoad(true);
          }}
          onUserUpdated={handleUserUpdated}
          onUserDeleted={handleUserDeleted}
        />
      )}

      {/* Cross-navigation Matrimonial Profile Modal */}
      {selectedProfileId && (
        <AdminProfileDetailModal
          profileId={selectedProfileId}
          onClose={() => {
            setSelectedProfileId(null);
            setOpenProfileEditOnLoad(false);
          }}
          initialOpenEdit={openProfileEditOnLoad}
          onProfileUpdated={() => fetchUsers()}
        />
      )}

      {/* Create User Modal */}
      <AdminCreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onUserCreated={() => {
          fetchUsers();
        }}
        onViewUser={(userId) => {
          setSelectedUserId(userId);
        }}
      />

      <style jsx global>{`
        @media (min-width: 769px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .admin-main-wrapper {
            margin-left: 260px;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-cards-container {
            display: none !important;
          }
          .desktop-table-container {
            display: block !important;
          }
        }
        @media (max-width: 768px) {
          .admin-top-header {
            padding: 0 12px !important;
          }
          .admin-main-content {
            padding: 16px 12px !important;
          }
          .mobile-menu-btn {
            display: inline-flex !important;
          }
          .mobile-close-btn {
            display: inline-flex !important;
          }
          .desktop-only {
            display: none !important;
          }
          .desktop-table-container {
            display: none !important;
          }
          .mobile-cards-container {
            display: block !important;
          }
        }
        .admin-table-row:hover {
          background-color: #FDFBF7 !important;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--color-ivory)",
            color: "var(--color-maroon)",
            fontWeight: 600,
          }}
        >
          Loading Admin Users...
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  );
}
