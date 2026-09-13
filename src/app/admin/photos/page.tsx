"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/auth/AdminAuthContext";
import { getAdminPhotos, approveAdminPhoto } from "@/lib/api/admin";
import {
  AdminPhotoListItem,
  AdminPhotoStats,
  AdminPagination,
  AdminPhotoListParams,
  AdminPhotoDetail,
} from "@/types/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminPhotoModerationModal } from "@/components/admin/AdminPhotoModerationModal";
import { AdminProfileDetailModal } from "@/components/admin/AdminProfileDetailModal";

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending Review",
        bg: "#FEF3C7",
        text: "#B45309",
        border: "#FDE68A",
        dot: "#F59E0B",
      };
    case "APPROVED":
      return {
        label: "Approved",
        bg: "#ECFDF5",
        text: "#047857",
        border: "#A7F3D0",
        dot: "#10B981",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        bg: "#FEF2F2",
        text: "#B91C1C",
        border: "#FECACA",
        dot: "#EF4444",
      };
    default:
      return {
        label: status,
        bg: "#F3F4F6",
        text: "#4B5563",
        border: "#E5E7EB",
        dot: "#9CA3AF",
      };
  }
}

function AdminPhotosContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { admin, logout, isAuthenticated, isLoading: authLoading } = useAdminAuth();

  // Data state
  const [photos, setPhotos] = useState<AdminPhotoListItem[]>([]);
  const [stats, setStats] = useState<AdminPhotoStats>({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState<AdminPagination>({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // In-flight quick action tracking
  const [quickActionLoadingId, setQuickActionLoadingId] = useState<string | null>(null);

  // Modals state
  const [inspectPhotoId, setInspectPhotoId] = useState<string | null>(null);
  const [inspectProfileId, setInspectProfileId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter params from URL
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const pageSizeParam = parseInt(searchParams.get("pageSize") || "20", 10);
  const qParam = searchParams.get("q") || "";
  const statusParam = searchParams.get("moderationStatus") || "ALL";
  const sortParam = searchParams.get("sort") || "newest";

  // Local filter inputs for immediate UI reaction
  const [searchTerm, setSearchTerm] = useState(qParam);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) setSearchTerm(qParam);
    });
    return () => {
      isMounted = false;
    };
  }, [qParam]);

  // Push URL update
  const updateUrlParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      Object.entries(newParams).forEach(([key, val]) => {
        if (val === undefined || val === "" || (key === "page" && val === 1) || (key === "moderationStatus" && val === "ALL")) {
          current.delete(key);
        } else {
          current.set(key, String(val));
        }
      });

      const search = current.toString();
      const query = search ? `?${search}` : "";
      router.push(`${pathname}${query}`);
    },
    [router, pathname, searchParams]
  );

  // Fetch photos
  const loadPhotos = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setErrorMessage(null);

    const params: AdminPhotoListParams = {
      page: pageParam,
      pageSize: pageSizeParam,
      q: qParam || undefined,
      moderationStatus: statusParam === "ALL" ? undefined : statusParam,
      sort: sortParam,
    };

    try {
      const res = await getAdminPhotos(params);
      if (res.success && res.data) {
        setPhotos(res.data.photos);
        setPagination(res.data.pagination);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      } else {
        setErrorMessage(res.message || "Failed to retrieve photos.");
      }
    } catch (err) {
      console.error("[PHOTOS PAGE] Failed to load photos:", err);
      setErrorMessage("Network error while connecting to administrative server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [pageParam, pageSizeParam, qParam, statusParam, sortParam]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      if (isAuthenticated) {
        await loadPhotos();
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, loadPhotos]);

  // Search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchTerm.trim(), page: 1 });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateUrlParams({ q: undefined, page: 1 });
  };

  // Status Tab switch
  const handleTabChange = (newStatus: string) => {
    updateUrlParams({ moderationStatus: newStatus, page: 1 });
  };

  // Sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlParams({ sort: e.target.value, page: 1 });
  };

  // Page change
  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrlParams({ pageSize: parseInt(e.target.value, 10), page: 1 });
  };

  // Quick 1-click Approve directly from card
  const handleQuickApprove = async (e: React.MouseEvent, photoId: string) => {
    e.stopPropagation();
    if (quickActionLoadingId) return;

    setQuickActionLoadingId(photoId);
    setErrorMessage(null);

    try {
      const res = await approveAdminPhoto(photoId);
      if (res.success) {
        setSuccessToast("Photo approved successfully.");
        // Optimistically update item in photos list
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId
              ? {
                  ...p,
                  moderationStatus: "APPROVED",
                  moderatedAt: new Date().toISOString(),
                }
              : p
          )
        );
        // Adjust counts
        setStats((prev) => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
        }));
      } else {
        setErrorMessage(res.message || "Failed to approve photo.");
        // Reload to sync authoritative state
        loadPhotos();
      }
    } catch (err) {
      console.error("[QUICK APPROVE ERROR]:", err);
      setErrorMessage("Network error approving photo.");
    } finally {
      setQuickActionLoadingId(null);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  // Callback when moderation is completed inside modal
  const handleModeratedInModal = (updated: AdminPhotoDetail | AdminPhotoListItem) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
    );
    // Refresh authoritative counts in background
    getAdminPhotos({ page: 1, pageSize: 1 }).then((res) => {
      if (res.success && res.data?.stats) {
        setStats(res.data.stats);
      }
    });
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FDFBF9",
          fontFamily: "var(--font-bricolage)",
        }}
      >
        <div style={{ textAlign: "center", color: "var(--color-maroon)" }}>
          <div
            style={{
              display: "inline-block",
              width: "36px",
              height: "36px",
              border: "3px solid rgba(123, 17, 35, 0.2)",
              borderTopColor: "var(--color-maroon)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ marginTop: "12px", fontSize: "0.875rem", fontWeight: 500 }}>
            Verifying administrative access...
          </p>
        </div>
      </div>
    );
  }

  const selectedPhotoForModal = photos.find((p) => p.id === inspectPhotoId) || null;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#FDFBF9",
        fontFamily: "var(--font-bricolage)",
      }}
    >
      {/* Admin Navigation Sidebar */}
      <AdminSidebar
        currentPath={pathname}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
        onLogout={logout}
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
        {/* Top Navbar */}
        <header
          style={{
            height: "64px",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "#FFFFFF",
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
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                minHeight: "44px",
                minWidth: "44px",
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-secondary)",
              }}
              className="mobile-hamburger-btn"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Admin</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>/</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-maroon)" }}>
                Photo Moderation
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => {
                setIsRefreshing(true);
                loadPhotos();
              }}
              disabled={isRefreshing}
              style={{
                padding: "6px 12px",
                minHeight: "44px",
                borderRadius: "8px",
                border: "1px solid var(--color-border)",
                backgroundColor: "#FFFFFF",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  animation: isRefreshing ? "spin 0.8s linear infinite" : "none",
                }}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: "24px", maxWidth: "1400px", width: "100%", margin: "0 auto" }}>
          {/* Header Banner */}
          <div style={{ marginBottom: "24px" }}>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--color-maroon)",
                margin: "0 0 6px 0",
              }}
            >
              Photo Moderation Queue
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              Inspect and moderate candidate profile photos. Only photos with status <strong>APPROVED</strong> are visible to matching users in discovery.
            </p>
          </div>

          {/* Toast notifications */}
          {successToast && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "#ECFDF5",
                border: "1px solid #A7F3D0",
                color: "#065F46",
                fontSize: "0.875rem",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successToast}</span>
            </div>
          )}

          {errorMessage && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#991B1B",
                fontSize: "0.875rem",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Aggregation Metric Tabs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            {[
              {
                id: "ALL",
                label: "All Photos",
                count: stats.all,
                borderActive: "var(--color-maroon)",
                bgActive: "rgba(123, 17, 35, 0.06)",
                countColor: "var(--color-maroon)",
              },
              {
                id: "PENDING",
                label: "Pending Review",
                count: stats.pending,
                borderActive: "#D97706",
                bgActive: "#FEF3C7",
                countColor: "#B45309",
                hasBadge: stats.pending > 0,
              },
              {
                id: "APPROVED",
                label: "Approved",
                count: stats.approved,
                borderActive: "#059669",
                bgActive: "#ECFDF5",
                countColor: "#047857",
              },
              {
                id: "REJECTED",
                label: "Rejected",
                count: stats.rejected,
                borderActive: "#DC2626",
                bgActive: "#FEF2F2",
                countColor: "#B91C1C",
              },
            ].map((tab) => {
              const isSelected = statusParam === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  style={{
                    backgroundColor: isSelected ? tab.bgActive : "#FFFFFF",
                    border: isSelected ? `2px solid ${tab.borderActive}` : "1px solid var(--color-border)",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "left",
                    cursor: "pointer",
                    minHeight: "44px",
                    boxShadow: isSelected ? "0 4px 6px -1px rgba(0, 0, 0, 0.05)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", fontWeight: 600 }}>
                      {tab.label}
                    </span>
                    {tab.hasBadge && (
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#F59E0B",
                          boxShadow: "0 0 0 2px #FDE68A",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ fontSize: "1.625rem", fontWeight: 800, color: tab.countColor, marginTop: "6px" }}>
                    {tab.count}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search and Filters Bar */}
          <div
            style={{
              padding: "16px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              marginBottom: "24px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            {/* Search Input Form */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                flex: "1 1 300px",
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone, photo ID..."
                style={{
                  width: "100%",
                  height: "44px",
                  paddingLeft: "38px",
                  paddingRight: searchTerm ? "72px" : "12px",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                    padding: "4px 8px",
                    minHeight: "44px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Clear
                </button>
              )}
            </form>

            {/* Status & Sort Selectors */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <select
                value={statusParam}
                onChange={(e) => handleTabChange(e.target.value)}
                style={{
                  height: "44px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.875rem",
                  color: "var(--color-text-primary)",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">Status: All</option>
                <option value="PENDING">Status: Pending</option>
                <option value="APPROVED">Status: Approved</option>
                <option value="REJECTED">Status: Rejected</option>
              </select>

              <select
                value={sortParam}
                onChange={handleSortChange}
                style={{
                  height: "44px",
                  padding: "0 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.875rem",
                  color: "var(--color-text-primary)",
                  fontFamily: "inherit",
                  cursor: "pointer",
                }}
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>

              {(qParam || statusParam !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    router.push(pathname);
                  }}
                  style={{
                    height: "44px",
                    padding: "0 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "#991B1B",
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Photo Moderation Cards Grid */}
          {isLoading ? (
            /* Loading Skeletons */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((sk) => (
                <div
                  key={sk}
                  style={{
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    height: "380px",
                    animation: "pulse 1.5s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
          ) : photos.length === 0 ? (
            /* Empty State */
            <div
              style={{
                padding: "64px 24px",
                textAlign: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(123, 17, 35, 0.08)",
                  color: "var(--color-maroon)",
                  marginBottom: "16px",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-maroon)", margin: "0 0 6px 0" }}>
                No Photos Found
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", maxWidth: "420px", margin: "0 auto" }}>
                {statusParam === "PENDING"
                  ? "Good job! There are currently no pending photos in the queue awaiting review."
                  : "No photo records match the active search query and filter criteria."}
              </p>
            </div>
          ) : (
            /* Real Cards Grid */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {photos.map((item) => {
                const badgeStyle = getStatusBadge(item.moderationStatus);
                const isItemLoading = quickActionLoadingId === item.id;
                const candidateName = item.profile?.firstName
                  ? `${item.profile.firstName} ${item.profile.lastName || ""}`.trim()
                  : "Candidate Profile";

                return (
                  <div
                    key={item.id}
                    onClick={() => setInspectPhotoId(item.id)}
                    style={{
                      borderRadius: "14px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "#FFFFFF",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                      cursor: "pointer",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 16px -4px rgba(0, 0, 0, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)";
                    }}
                  >
                    {/* Card Photo Preview Area */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "240px",
                        backgroundColor: "#1F2937",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {item.url ? (
                        <Image
                          src={item.url}
                          alt={`Photo of ${candidateName}`}
                          fill
                          unoptimized
                          style={{
                            objectFit: "cover",
                          }}
                          sizes="(max-width: 768px) 100vw, 320px"
                        />
                      ) : (
                        <div style={{ color: "#9CA3AF", textAlign: "center", padding: "16px" }}>
                          <span style={{ fontSize: "0.75rem" }}>Photo preview unavailable</span>
                        </div>
                      )}

                      {/* Top Badges Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          right: "10px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          pointerEvents: "none",
                        }}
                      >
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "9999px",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            backgroundColor: badgeStyle.bg,
                            color: badgeStyle.text,
                            border: `1px solid ${badgeStyle.border}`,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                          }}
                        >
                          {badgeStyle.label}
                        </span>

                        {item.isPrimary && (
                          <span
                            style={{
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "0.625rem",
                              fontWeight: 700,
                              backgroundColor: "rgba(0, 0, 0, 0.75)",
                              color: "#FFFFFF",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Avatar
                          </span>
                        )}
                      </div>

                      {/* Bottom Time Overlay */}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "8px",
                          left: "8px",
                          right: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.6875rem",
                          color: "#E5E7EB",
                          backgroundColor: "rgba(0,0,0,0.6)",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          backdropFilter: "blur(2px)",
                        }}
                      >
                        <span>{formatDate(item.createdAt)}</span>
                        {item.width && item.height && <span>{item.width}×{item.height}</span>}
                      </div>
                    </div>

                    {/* Card Content Information */}
                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
                      <div>
                        <h4
                          style={{
                            margin: 0,
                            fontSize: "0.9375rem",
                            fontWeight: 700,
                            color: "var(--color-maroon)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {candidateName}
                        </h4>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                          {[item.profile?.city, item.profile?.state].filter(Boolean).join(", ") || "Location not set"}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          ✉ {item.user?.email || "No email"}
                        </div>
                        <div>
                          📞 {item.user?.maskedPhone || "No phone"}
                        </div>
                      </div>

                      {/* Rejection reason snippet if rejected */}
                      {item.moderationStatus === "REJECTED" && item.moderationReason && (
                        <div
                          style={{
                            padding: "6px 8px",
                            borderRadius: "6px",
                            backgroundColor: "#FEF2F2",
                            border: "1px solid #FECACA",
                            fontSize: "0.6875rem",
                            color: "#991B1B",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          <strong>Reason:</strong> {item.moderationReason}
                        </div>
                      )}

                      {/* Bottom Action Section */}
                      <div
                        style={{
                          marginTop: "auto",
                          paddingTop: "10px",
                          borderTop: "1px solid #F3F4F6",
                          display: "flex",
                          gap: "8px",
                        }}
                      >
                        {item.moderationStatus === "PENDING" ? (
                          <>
                            <button
                              onClick={(e) => handleQuickApprove(e, item.id)}
                              disabled={Boolean(quickActionLoadingId)}
                              style={{
                                flex: 1,
                                height: "38px",
                                borderRadius: "6px",
                                backgroundColor: "#059669",
                                color: "#FFFFFF",
                                border: "none",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                cursor: quickActionLoadingId ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                opacity: isItemLoading ? 0.6 : 1,
                              }}
                            >
                              {isItemLoading ? (
                                "Approving..."
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  Approve
                                </>
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setInspectPhotoId(item.id);
                              }}
                              style={{
                                flex: 1,
                                height: "38px",
                                borderRadius: "6px",
                                backgroundColor: "#FFFFFF",
                                color: "var(--color-maroon)",
                                border: "1px solid var(--color-border)",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              Inspect / Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectPhotoId(item.id);
                            }}
                            style={{
                              width: "100%",
                              height: "38px",
                              borderRadius: "6px",
                              backgroundColor: "#FFFFFF",
                              color: "var(--color-text-secondary)",
                              border: "1px solid var(--color-border)",
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            Inspect Audit Record
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer Controls */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                marginTop: "32px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "16px",
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                Showing{" "}
                <strong>
                  {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                </strong>{" "}
                of <strong>{pagination.total}</strong> photos
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  style={{
                    padding: "8px 14px",
                    minHeight: "44px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: pagination.hasPrevPage ? "var(--color-text-primary)" : "var(--color-text-muted)",
                    cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
                  }}
                >
                  ← Previous
                </button>

                <span style={{ fontSize: "0.8125rem", padding: "0 8px" }}>
                  Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                </span>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  style={{
                    padding: "8px 14px",
                    minHeight: "44px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                    color: pagination.hasNextPage ? "var(--color-text-primary)" : "var(--color-text-muted)",
                    cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
                  }}
                >
                  Next →
                </button>

                <select
                  value={pagination.pageSize}
                  onChange={handlePageSizeChange}
                  style={{
                    height: "44px",
                    padding: "0 8px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-primary)",
                    cursor: "pointer",
                    marginLeft: "8px",
                  }}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Photo Moderation Inspection Modal */}
      {inspectPhotoId && (
        <AdminPhotoModerationModal
          photoId={inspectPhotoId}
          initialPhoto={selectedPhotoForModal}
          onClose={() => setInspectPhotoId(null)}
          onModerated={handleModeratedInModal}
          onViewProfile={(pId) => setInspectProfileId(pId)}
        />
      )}

      {/* Candidate Full Profile Detail Modal */}
      {inspectProfileId && (
        <AdminProfileDetailModal
          profileId={inspectProfileId}
          onClose={() => setInspectProfileId(null)}
        />
      )}

      <style jsx global>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        @media (min-width: 1024px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .admin-main-wrapper {
            margin-left: 260px !important;
          }
        }
        @media (max-width: 1023px) {
          .mobile-hamburger-btn {
            display: flex !important;
          }
          .mobile-close-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminPhotosPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FDFBF9",
          }}
        >
          <div style={{ color: "var(--color-maroon)", fontWeight: 600 }}>Loading Photo Moderation...</div>
        </div>
      }
    >
      <AdminPhotosContent />
    </Suspense>
  );
}
