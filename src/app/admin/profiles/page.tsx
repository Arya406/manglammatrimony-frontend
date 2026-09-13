"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";
import { getAdminProfiles } from "@/lib/api/admin";
import {
  AdminProfileListItem,
  AdminPagination,
  AdminProfileListParams,
} from "@/types/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminProfileDetailModal } from "@/components/admin/AdminProfileDetailModal";

function calculateAge(dobString?: string): number | null {
  if (!dobString) return null;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

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

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName ? firstName.charAt(0).toUpperCase() : "";
  const l = lastName ? lastName.charAt(0).toUpperCase() : "";
  return f + l || "MM";
}

function getProfileStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        bg: "#ECFDF5",
        text: "#047857",
        border: "#A7F3D0",
      };
    case "INCOMPLETE":
      return {
        label: "Incomplete",
        bg: "#FFFBEB",
        text: "#B45309",
        border: "#FDE68A",
      };
    case "IN_REVIEW":
      return {
        label: "In Review",
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
        label: status,
        bg: "#F9FAFB",
        text: "#6B7280",
        border: "#E5E7EB",
      };
  }
}

function getUserStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return {
        label: "Active",
        bg: "#ECFDF5",
        text: "#065F46",
        dot: "#10B981",
      };
    case "PENDING":
      return {
        label: "Pending",
        bg: "#FFFBEB",
        text: "#92400E",
        dot: "#F59E0B",
      };
    case "SUSPENDED":
      return {
        label: "Suspended",
        bg: "#FEF2F2",
        text: "#991B1B",
        dot: "#EF4444",
      };
    case "DELETED":
      return {
        label: "Deleted",
        bg: "#F3F4F6",
        text: "#374151",
        dot: "#9CA3AF",
      };
    default:
      return {
        label: status,
        bg: "#F9FAFB",
        text: "#4B5563",
        dot: "#9CA3AF",
      };
  }
}

function AdminProfilesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { admin, logout } = useAdminAuth();

  // URL state synchronization
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialPageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const initialQ = searchParams.get("q") || "";
  const initialGender = searchParams.get("gender") || "ALL";
  const initialProfileStatus = searchParams.get("profileStatus") || "ALL";
  const initialUserStatus = searchParams.get("userStatus") || "ALL";
  const initialSort = searchParams.get("sort") || "newest";

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedGender, setSelectedGender] = useState(initialGender);
  const [selectedProfileStatus, setSelectedProfileStatus] = useState(initialProfileStatus);
  const [selectedUserStatus, setSelectedUserStatus] = useState(initialUserStatus);
  const [selectedSort, setSelectedSort] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Data state
  const [profiles, setProfiles] = useState<AdminProfileListItem[]>([]);
  const [pagination, setPagination] = useState<AdminPagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Synchronize local filter changes with URL
  const updateUrlParams = useCallback(
    (params: {
      q?: string;
      gender?: string;
      profileStatus?: string;
      userStatus?: string;
      sort?: string;
      page?: number;
      pageSize?: number;
    }) => {
      const sp = new URLSearchParams();
      const qVal = params.q !== undefined ? params.q : searchQuery;
      const genderVal = params.gender !== undefined ? params.gender : selectedGender;
      const profileStatusVal =
        params.profileStatus !== undefined ? params.profileStatus : selectedProfileStatus;
      const userStatusVal =
        params.userStatus !== undefined ? params.userStatus : selectedUserStatus;
      const sortVal = params.sort !== undefined ? params.sort : selectedSort;
      const pageVal = params.page !== undefined ? params.page : currentPage;
      const pageSizeVal = params.pageSize !== undefined ? params.pageSize : pageSize;

      if (qVal.trim()) sp.set("q", qVal.trim());
      if (genderVal && genderVal !== "ALL") sp.set("gender", genderVal);
      if (profileStatusVal && profileStatusVal !== "ALL")
        sp.set("profileStatus", profileStatusVal);
      if (userStatusVal && userStatusVal !== "ALL") sp.set("userStatus", userStatusVal);
      if (sortVal && sortVal !== "newest") sp.set("sort", sortVal);
      if (pageVal > 1) sp.set("page", pageVal.toString());
      if (pageSizeVal !== 20) sp.set("pageSize", pageSizeVal.toString());

      const newUrl = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
      router.replace(newUrl);
    },
    [
      searchQuery,
      selectedGender,
      selectedProfileStatus,
      selectedUserStatus,
      selectedSort,
      currentPage,
      pageSize,
      pathname,
      router,
    ]
  );

  const fetchProfiles = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setError(null);

    const queryParams: AdminProfileListParams = {
      page: currentPage,
      pageSize: pageSize,
    };
    if (searchQuery.trim()) queryParams.q = searchQuery.trim();
    if (selectedGender !== "ALL") queryParams.gender = selectedGender;
    if (selectedProfileStatus !== "ALL") queryParams.profileStatus = selectedProfileStatus;
    if (selectedUserStatus !== "ALL") queryParams.userStatus = selectedUserStatus;
    if (selectedSort) queryParams.sort = selectedSort;

    try {
      const res = await getAdminProfiles(queryParams);
      if (res.success && res.data) {
        setProfiles(res.data.profiles);
        setPagination(res.data.pagination);
      } else {
        setError(res.message || "Failed to load profiles.");
      }
    } catch (err) {
      console.error("Failed to load profiles:", err);
      setError("Unable to connect to administration server. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    searchQuery,
    selectedGender,
    selectedProfileStatus,
    selectedUserStatus,
    selectedSort,
  ]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!isMounted) return;
      await fetchProfiles();
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [fetchProfiles]);

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
    setSelectedGender("ALL");
    setSelectedProfileStatus("ALL");
    setSelectedUserStatus("ALL");
    setSelectedSort("newest");
    setCurrentPage(1);
    updateUrlParams({
      q: "",
      gender: "ALL",
      profileStatus: "ALL",
      userStatus: "ALL",
      sort: "newest",
      page: 1,
    });
  };

  const isFilteringActive =
    searchQuery.trim() !== "" ||
    selectedGender !== "ALL" ||
    selectedProfileStatus !== "ALL" ||
    selectedUserStatus !== "ALL" ||
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
        currentPath="/admin/profiles"
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
                  Profiles
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
                  All Profiles
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
                profiles
              </span>
            )}
            <button
              onClick={() => fetchProfiles()}
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
              aria-label="Refresh profile list"
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
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main
          style={{
            flex: 1,
            padding: "24px",
            maxWidth: "1400px",
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Filter & Search Bar Card */}
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
            {/* Search Form */}
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
                  type="text"
                  placeholder="Search by first name, last name, email, or phone..."
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
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "12px",
                paddingTop: "12px",
                borderTop: "1px solid var(--color-border-subtle)",
              }}
            >
              {/* Profile Status Filter */}
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
                  Profile Status
                </label>
                <select
                  value={selectedProfileStatus}
                  onChange={(e) => {
                    setSelectedProfileStatus(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ profileStatus: e.target.value, page: 1 });
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
                  <option value="ALL">All Profile Statuses</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INCOMPLETE">INCOMPLETE</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              {/* Gender Filter */}
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
                  Gender
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => {
                    setSelectedGender(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ gender: e.target.value, page: 1 });
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
                  <option value="ALL">All Genders</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* User Status Filter */}
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
                  User Status
                </label>
                <select
                  value={selectedUserStatus}
                  onChange={(e) => {
                    setSelectedUserStatus(e.target.value);
                    setCurrentPage(1);
                    updateUrlParams({ userStatus: e.target.value, page: 1 });
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
                  <option value="ALL">All User Statuses</option>
                  <option value="ACTIVE">Active User</option>
                  <option value="PENDING">Pending OTP</option>
                  <option value="SUSPENDED">Suspended User</option>
                  <option value="DELETED">Deleted User</option>
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
                  <option value="completion_desc">Completion (High to Low)</option>
                  <option value="completion_asc">Completion (Low to High)</option>
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
                onClick={() => fetchProfiles()}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: "36px",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Profiles Data Presentation */}
          {isLoading ? (
            /* Loading Skeletons */
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: "20px",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      backgroundColor: "#E5E7EB",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        width: "180px",
                        height: "16px",
                        backgroundColor: "#E5E7EB",
                        borderRadius: "4px",
                        marginBottom: "8px",
                      }}
                    />
                    <div
                      style={{
                        width: "260px",
                        height: "12px",
                        backgroundColor: "#F3F4F6",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      width: "90px",
                      height: "26px",
                      backgroundColor: "#F3F4F6",
                      borderRadius: "20px",
                    }}
                  />
                  <div
                    style={{
                      width: "80px",
                      height: "36px",
                      backgroundColor: "#E5E7EB",
                      borderRadius: "6px",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : profiles.length === 0 ? (
            /* Empty State */
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                padding: "60px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-ivory)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  color: "var(--color-text-muted)",
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
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  marginBottom: "6px",
                }}
              >
                {isFilteringActive
                  ? "No profiles match your filter criteria"
                  : "No profiles found in the database"}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  maxWidth: "460px",
                  margin: "0 auto 20px auto",
                  lineHeight: 1.5,
                }}
              >
                {isFilteringActive
                  ? "Try adjusting your search terms, changing the status filter, or clearing filters to see more results."
                  : "Matrimonial candidate registrations will appear here once users submit or start creating profiles."}
              </p>
              {isFilteringActive && (
                <button
                  onClick={handleClearFilters}
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
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.03)",
                }}
                className="desktop-table-container"
              >
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.875rem",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "#F9FAFB",
                          borderBottom: "1px solid var(--color-border)",
                          color: "var(--color-text-muted)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}
                      >
                        <th style={{ padding: "14px 16px" }}>Candidate</th>
                        <th style={{ padding: "14px 16px" }}>User & Contact</th>
                        <th style={{ padding: "14px 16px" }}>Demographics</th>
                        <th style={{ padding: "14px 16px" }}>Location</th>
                        <th style={{ padding: "14px 16px" }}>Profile Status</th>
                        <th style={{ padding: "14px 16px" }}>Progress</th>
                        <th style={{ padding: "14px 16px" }}>Registered</th>
                        <th style={{ padding: "14px 16px", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((p, idx) => {
                        const statusBadge = getProfileStatusBadge(p.profileStatus);
                        const userStatusBadge = getUserStatusBadge(p.user.status);
                        const age = calculateAge(p.personalDetails?.dateOfBirth);
                        const fullName = p.personalDetails
                          ? `${p.personalDetails.firstName} ${p.personalDetails.lastName}`
                          : "Incomplete Profile";
                        const initials = getInitials(
                          p.personalDetails?.firstName,
                          p.personalDetails?.lastName
                        );

                        return (
                          <tr
                            key={p.id}
                            style={{
                              borderBottom:
                                idx === profiles.length - 1
                                  ? "none"
                                  : "1px solid var(--color-border-subtle)",
                              transition: "background-color 0.15s ease",
                            }}
                            className="admin-table-row"
                          >
                            {/* Candidate & Avatar */}
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {p.primaryPhotoUrl ? (
                                  <div
                                    style={{
                                      width: "44px",
                                      height: "44px",
                                      borderRadius: "50%",
                                      overflow: "hidden",
                                      position: "relative",
                                      flexShrink: 0,
                                      border: "1px solid var(--color-border)",
                                    }}
                                  >
                                    <Image
                                      src={p.primaryPhotoUrl}
                                      alt={fullName}
                                      fill
                                      style={{ objectFit: "cover" }}
                                      sizes="44px"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      width: "44px",
                                      height: "44px",
                                      borderRadius: "50%",
                                      backgroundColor: "var(--color-ivory)",
                                      color: "var(--color-maroon)",
                                      border: "1px solid var(--color-border)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.875rem",
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
                                    ID: {p.id.slice(0, 8)}...
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* User & Contact */}
                            <td style={{ padding: "14px 16px" }}>
                              <div
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                {p.user.email || "No email"}
                              </div>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontSize: "0.6875rem",
                                  fontWeight: 600,
                                  color: userStatusBadge.text,
                                  marginTop: "2px",
                                }}
                              >
                                <span
                                  style={{
                                    width: "6px",
                                    height: "6px",
                                    borderRadius: "50%",
                                    backgroundColor: userStatusBadge.dot,
                                  }}
                                />
                                User: {userStatusBadge.label}
                              </div>
                            </td>

                            {/* Demographics */}
                            <td style={{ padding: "14px 16px" }}>
                              <div
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                {p.personalDetails?.gender || "—"}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {age !== null ? `${age} yrs` : "—"}
                              </div>
                            </td>

                            {/* Location */}
                            <td style={{ padding: "14px 16px" }}>
                              <div
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--color-text-primary)",
                                }}
                              >
                                {p.personalDetails?.city || "—"}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {p.personalDetails?.state || "—"}
                              </div>
                            </td>

                            {/* Profile Status Badge */}
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "3px 10px",
                                  borderRadius: "12px",
                                  fontSize: "0.75rem",
                                  fontWeight: 600,
                                  backgroundColor: statusBadge.bg,
                                  color: statusBadge.text,
                                  border: `1px solid ${statusBadge.border}`,
                                }}
                              >
                                {statusBadge.label}
                              </span>
                            </td>

                            {/* Profile Progress */}
                            <td style={{ padding: "14px 16px" }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <div
                                  style={{
                                    width: "64px",
                                    height: "6px",
                                    backgroundColor: "#E5E7EB",
                                    borderRadius: "3px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: `${p.completionPercentage}%`,
                                      height: "100%",
                                      backgroundColor:
                                        p.completionPercentage >= 70
                                          ? "#10B981"
                                          : p.completionPercentage >= 40
                                          ? "#F59E0B"
                                          : "#EF4444",
                                      borderRadius: "3px",
                                    }}
                                  />
                                </div>
                                <span
                                  style={{
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "var(--color-text-muted)",
                                  }}
                                >
                                  {p.completionPercentage}%
                                </span>
                              </div>
                            </td>

                            {/* Registration Date */}
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  fontSize: "0.8125rem",
                                  color: "var(--color-text-muted)",
                                }}
                              >
                                {formatDate(p.createdAt)}
                              </span>
                            </td>

                            {/* Action: View Only */}
                            <td style={{ padding: "14px 16px", textAlign: "right" }}>
                              <button
                                onClick={() => setSelectedProfileId(p.id)}
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
                {profiles.map((p) => {
                  const statusBadge = getProfileStatusBadge(p.profileStatus);
                  const userStatusBadge = getUserStatusBadge(p.user.status);
                  const age = calculateAge(p.personalDetails?.dateOfBirth);
                  const fullName = p.personalDetails
                    ? `${p.personalDetails.firstName} ${p.personalDetails.lastName}`
                    : "Incomplete Profile";
                  const initials = getInitials(
                    p.personalDetails?.firstName,
                    p.personalDetails?.lastName
                  );

                  return (
                    <div
                      key={p.id}
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
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {p.primaryPhotoUrl ? (
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
                                src={p.primaryPhotoUrl}
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
                                backgroundColor: "var(--color-ivory)",
                                color: "var(--color-maroon)",
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
                              ID: {p.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "12px",
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            backgroundColor: statusBadge.bg,
                            color: statusBadge.text,
                            border: `1px solid ${statusBadge.border}`,
                          }}
                        >
                          {statusBadge.label}
                        </span>
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
                        <div>
                          <strong>User:</strong> {p.user.email || "No email"}
                        </div>
                        <div>
                          <strong>User Status:</strong> {userStatusBadge.label}
                        </div>
                        <div>
                          <strong>Gender / Age:</strong>{" "}
                          {p.personalDetails?.gender || "—"}{" "}
                          {age !== null ? `(${age} yrs)` : ""}
                        </div>
                        <div>
                          <strong>Location:</strong>{" "}
                          {p.personalDetails?.city || "—"},{" "}
                          {p.personalDetails?.state || "—"}
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <span>Profile Completion:</span>
                            <strong style={{ color: "var(--color-text-primary)" }}>
                              {p.completionPercentage}%
                            </strong>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "6px",
                              backgroundColor: "#E5E7EB",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${p.completionPercentage}%`,
                                height: "100%",
                                backgroundColor:
                                  p.completionPercentage >= 70
                                    ? "#10B981"
                                    : p.completionPercentage >= 40
                                    ? "#F59E0B"
                                    : "#EF4444",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* View Button */}
                      <button
                        onClick={() => setSelectedProfileId(p.id)}
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
                        <span>View Profile Details</span>
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
                    of <strong>{pagination.total}</strong> profiles
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

      {/* Read-Only Profile Detail Modal */}
      {selectedProfileId && (
        <AdminProfileDetailModal
          profileId={selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
          onProfileUpdated={() => fetchProfiles()}
        />
      )}

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

export default function AdminProfilesPage() {
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
          Loading Admin Profiles...
        </div>
      }
    >
      <AdminProfilesContent />
    </Suspense>
  );
}
