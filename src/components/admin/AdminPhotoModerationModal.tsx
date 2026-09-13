"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { AdminPhotoDetail, AdminPhotoListItem } from "@/types/admin";
import { getAdminPhotoDetail, approveAdminPhoto, rejectAdminPhoto } from "@/lib/api/admin";

interface AdminPhotoModerationModalProps {
  photoId: string | null;
  initialPhoto?: AdminPhotoListItem | null;
  onClose: () => void;
  onModerated: (updatedPhoto: AdminPhotoDetail | AdminPhotoListItem) => void;
  onViewProfile?: (profileId: string) => void;
}

function formatDate(dateString?: string | null): string {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    return d.toLocaleString("en-US", {
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

function formatFileSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

const CANNED_REASONS = [
  "Face is not clearly visible or covered",
  "Image is blurry, pixelated, or low quality",
  "Group photo with multiple individuals",
  "Watermark, promotional text, or overlay detected",
  "Inappropriate or non-compliant matrimonial photo",
];

export function AdminPhotoModerationModal({
  photoId,
  initialPhoto,
  onClose,
  onModerated,
  onViewProfile,
}: AdminPhotoModerationModalProps) {
  const [photo, setPhoto] = useState<AdminPhotoDetail | null>(() =>
    initialPhoto && initialPhoto.id === photoId
      ? { ...initialPhoto, moderator: null }
      : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(() => !(initialPhoto && initialPhoto.id === photoId));
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rejection Form State
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const fetchDetail = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminPhotoDetail(id);
      if (res.success && res.data?.photo) {
        setPhoto(res.data.photo);
      } else {
        setError(res.message || "Failed to retrieve photo inspection details.");
      }
    } catch (err) {
      console.error("[MODAL ERROR fetchDetail]:", err);
      setError("Network error loading photo details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!photoId) return;

    let isMounted = true;
    const run = async () => {
      await Promise.resolve();
      if (!isMounted) return;
      await fetchDetail(photoId);
    };
    run();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [photoId, fetchDetail, onClose]);

  if (!photoId) return null;

  const currentStatus = photo?.moderationStatus || initialPhoto?.moderationStatus || "PENDING";
  const badge = getStatusBadge(currentStatus);

  const handleApprove = async () => {
    if (!photoId || actionLoading) return;
    setActionLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await approveAdminPhoto(photoId);
      if (res.success) {
        setSuccessMessage("Photo approved successfully. Candidate's profile is updated.");
        if (res.data?.photo) {
          setPhoto(res.data.photo);
          onModerated(res.data.photo);
        } else {
          // Refresh detail
          await fetchDetail(photoId);
        }
      } else {
        if (res.code === "MODERATION_CONFLICT") {
          setError("State conflict: This photo was already moderated by another session. Refreshed.");
          await fetchDetail(photoId);
        } else {
          setError(res.message || "Failed to approve photo.");
        }
      }
    } catch (err) {
      console.error("[MODAL ERROR handleApprove]:", err);
      setError("Network error while approving photo.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const trimmed = rejectionReason.trim();
    if (!trimmed) {
      setReasonError("Rejection reason is required (1–500 characters).");
      return;
    }
    if (trimmed.length > 500) {
      setReasonError("Rejection reason cannot exceed 500 characters.");
      return;
    }

    if (!photoId || actionLoading) return;
    setActionLoading(true);
    setError(null);
    setReasonError(null);
    setSuccessMessage(null);

    try {
      const res = await rejectAdminPhoto(photoId, trimmed);
      if (res.success) {
        setSuccessMessage("Photo rejected. Reason recorded in audit log.");
        setShowRejectForm(false);
        if (res.data?.photo) {
          setPhoto(res.data.photo);
          onModerated(res.data.photo);
        } else {
          await fetchDetail(photoId);
        }
      } else {
        if (res.code === "MODERATION_CONFLICT") {
          setError("State conflict: This photo was already moderated. Refreshed.");
          await fetchDetail(photoId);
        } else {
          setError(res.message || "Failed to reject photo.");
        }
      }
    } catch (err) {
      console.error("[MODAL ERROR handleReject]:", err);
      setError("Network error while rejecting photo.");
    } finally {
      setActionLoading(false);
    }
  };

  const candidateName = photo?.profile?.firstName
    ? `${photo.profile.firstName} ${photo.profile.lastName || ""}`.trim()
    : initialPhoto?.profile?.firstName
    ? `${initialPhoto.profile.firstName} ${initialPhoto.profile.lastName || ""}`.trim()
    : "Candidate Profile";

  const photoUrl = photo?.url || initialPhoto?.url;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
        fontFamily: "var(--font-bricolage)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "960px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FCFAF7",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h2
              id="photo-modal-title"
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-maroon)",
                margin: 0,
              }}
            >
              Photo Moderation Inspection
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                fontWeight: 600,
                backgroundColor: badge.bg,
                color: badge.text,
                border: `1px solid ${badge.border}`,
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: badge.dot,
                }}
              />
              {badge.label}
            </span>
            {isLoading && (
              <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>
                Refreshing details...
              </span>
            )}
            {photo?.isPrimary && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  backgroundColor: "rgba(123, 17, 35, 0.08)",
                  color: "var(--color-maroon)",
                  border: "1px solid rgba(123, 17, 35, 0.2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Primary Avatar
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              minWidth: "44px",
              minHeight: "44px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-secondary)",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Feedback messages */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                color: "#991B1B",
                fontSize: "0.875rem",
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
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor: "#ECFDF5",
                border: "1px solid #A7F3D0",
                color: "#065F46",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Main Inspection Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr)",
              gap: "24px",
              alignItems: "start",
            }}
            className="photo-modal-grid"
          >
            {/* Left: Large Photo Preview */}
            <div
              style={{
                backgroundColor: "#111827",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "360px",
                position: "relative",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              {photoUrl ? (
                <div style={{ position: "relative", width: "100%", height: "420px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image
                    src={photoUrl}
                    alt={`Photo of ${candidateName}`}
                    fill
                    unoptimized
                    style={{
                      objectFit: "contain",
                    }}
                    sizes="(max-width: 768px) 100vw, 480px"
                  />
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    color: "#9CA3AF",
                    padding: "32px",
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span style={{ fontSize: "0.875rem" }}>Photo preview unavailable</span>
                </div>
              )}

              {/* Resolution & Type pill overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  right: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  backdropFilter: "blur(4px)",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  color: "#E5E7EB",
                }}
              >
                <span>
                  {photo?.width && photo?.height ? `${photo.width} × ${photo.height} px` : "Dimension pending"}
                </span>
                <span>{formatFileSize(photo?.fileSize || initialPhoto?.fileSize)}</span>
              </div>
            </div>

            {/* Right: Inspection Data & Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Candidate Info Card */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#FCFAF7",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "var(--color-maroon)" }}>
                      {candidateName}
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Profile ID: {photo?.profile?.id || initialPhoto?.profile?.id || "—"}
                    </span>
                  </div>
                  {onViewProfile && (photo?.profile?.id || initialPhoto?.profile?.id) && (
                    <button
                      onClick={() => onViewProfile((photo?.profile?.id || initialPhoto?.profile?.id)!)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--color-border)",
                        backgroundColor: "#FFFFFF",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--color-maroon)",
                        cursor: "pointer",
                        minHeight: "36px",
                      }}
                    >
                      View Profile →
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    marginTop: "12px",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.6875rem" }}>
                      User Email
                    </span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {photo?.user?.email || initialPhoto?.user?.email || "—"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.6875rem" }}>
                      Masked Phone
                    </span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {photo?.user?.maskedPhone || initialPhoto?.user?.maskedPhone || "—"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.6875rem" }}>
                      Location
                    </span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {[photo?.profile?.city, photo?.profile?.state].filter(Boolean).join(", ") || "Not specified"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.6875rem" }}>
                      Profile Status
                    </span>
                    <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>
                      {photo?.profile?.profileStatus || initialPhoto?.profile?.profileStatus || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical File Metadata */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--color-border)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "0.8125rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.6875rem" }}>
                    Uploaded At
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {formatDate(photo?.createdAt || initialPhoto?.createdAt)}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.6875rem" }}>
                    MIME Type
                  </span>
                  <span style={{ fontWeight: 500, fontFamily: "monospace", fontSize: "0.75rem" }}>
                    {photo?.mimeType || initialPhoto?.mimeType || "image/jpeg"}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.6875rem" }}>
                    Photo Placement
                  </span>
                  <span style={{ fontWeight: 500 }}>
                    {photo?.isPrimary ? "Primary Profile Photo" : `Additional Photo (Slot ${photo?.sortOrder ?? 1})`}
                  </span>
                </div>
                <div>
                  <span style={{ color: "var(--color-text-muted)", display: "block", fontSize: "0.6875rem" }}>
                    Photo ID
                  </span>
                  <span style={{ fontWeight: 500, fontFamily: "monospace", fontSize: "0.6875rem", wordBreak: "break-all" }}>
                    {photoId}
                  </span>
                </div>
              </div>

              {/* Moderation Audit History */}
              {(currentStatus === "APPROVED" || currentStatus === "REJECTED") && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    backgroundColor: currentStatus === "APPROVED" ? "#F0FDF4" : "#FEF2F2",
                    border: `1px solid ${currentStatus === "APPROVED" ? "#BBF7D0" : "#FECACA"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: currentStatus === "APPROVED" ? "#166534" : "#991B1B",
                      }}
                    >
                      {currentStatus === "APPROVED" ? "Moderation Audit: Approved" : "Moderation Audit: Rejected"}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "#374151" }}>
                    <span>
                      Moderated on <strong>{formatDate(photo?.moderatedAt)}</strong>
                      {photo?.moderator?.email && (
                        <> by <strong>{photo.moderator.email}</strong></>
                      )}
                    </span>
                  </div>

                  {photo?.moderationReason && (
                    <div
                      style={{
                        marginTop: "10px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #FCA5A5",
                        fontSize: "0.8125rem",
                      }}
                    >
                      <span style={{ display: "block", fontSize: "0.6875rem", fontWeight: 700, color: "#991B1B", textTransform: "uppercase" }}>
                        Rejection Reason
                      </span>
                      <span style={{ color: "#7F1D1D", marginTop: "2px", display: "block" }}>
                        {photo.moderationReason}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons Section */}
              {currentStatus === "PENDING" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "auto" }}>
                  {!showRejectForm ? (
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      <button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        style={{
                          flex: "1 1 140px",
                          minHeight: "44px",
                          borderRadius: "8px",
                          backgroundColor: "#059669",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 2px 4px rgba(5, 150, 105, 0.2)",
                          opacity: actionLoading ? 0.7 : 1,
                        }}
                      >
                        {actionLoading ? (
                          "Processing..."
                        ) : (
                          <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Approve Photo
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowRejectForm(true)}
                        disabled={actionLoading}
                        style={{
                          flex: "1 1 140px",
                          minHeight: "44px",
                          borderRadius: "8px",
                          backgroundColor: "#DC2626",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 600,
                          fontSize: "0.9375rem",
                          cursor: actionLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          boxShadow: "0 2px 4px rgba(220, 38, 38, 0.2)",
                          opacity: actionLoading ? 0.7 : 1,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Reject Photo...
                      </button>
                    </div>
                  ) : (
                    /* Rejection Form Drawer */
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "12px",
                        backgroundColor: "#FEF2F2",
                        border: "1px solid #FECACA",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#991B1B" }}>
                          Specify Rejection Reason (Mandatory)
                        </span>
                        <button
                          onClick={() => {
                            setShowRejectForm(false);
                            setReasonError(null);
                          }}
                          style={{
                            background: "transparent",
                            border: "none",
                            fontSize: "0.75rem",
                            color: "#6B7280",
                            cursor: "pointer",
                            padding: "4px 8px",
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Quick Canned Reason Chips */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {CANNED_REASONS.map((canned, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setRejectionReason(canned);
                              setReasonError(null);
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              backgroundColor: rejectionReason === canned ? "#B91C1C" : "#FFFFFF",
                              color: rejectionReason === canned ? "#FFFFFF" : "#374151",
                              border: "1px solid #D1D5DB",
                              fontSize: "0.6875rem",
                              cursor: "pointer",
                              transition: "all 0.1s ease",
                            }}
                          >
                            {canned}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={rejectionReason}
                        onChange={(e) => {
                          setRejectionReason(e.target.value);
                          if (reasonError) setReasonError(null);
                        }}
                        placeholder="State why this photo cannot be approved for matrimonial discovery..."
                        rows={3}
                        maxLength={500}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: reasonError ? "2px solid #DC2626" : "1px solid #D1D5DB",
                          fontSize: "0.8125rem",
                          fontFamily: "inherit",
                          resize: "vertical",
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                      />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.6875rem", color: rejectionReason.length > 480 ? "#DC2626" : "#6B7280" }}>
                          {rejectionReason.length} / 500 characters
                        </span>
                        {reasonError && (
                          <span style={{ fontSize: "0.75rem", color: "#DC2626", fontWeight: 600 }}>
                            {reasonError}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleReject}
                        disabled={actionLoading || !rejectionReason.trim()}
                        style={{
                          width: "100%",
                          minHeight: "44px",
                          borderRadius: "8px",
                          backgroundColor: "#DC2626",
                          color: "#FFFFFF",
                          border: "none",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          cursor: actionLoading || !rejectionReason.trim() ? "not-allowed" : "pointer",
                          opacity: actionLoading || !rejectionReason.trim() ? 0.6 : 1,
                        }}
                      >
                        {actionLoading ? "Submitting Rejection..." : "Confirm Photo Rejection"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Already Moderated Banner */
                <div
                  style={{
                    padding: "14px 16px",
                    borderRadius: "8px",
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    fontSize: "0.8125rem",
                    color: "#6B7280",
                    textAlign: "center",
                  }}
                >
                  This photo has completed review and cannot be re-moderated directly to maintain data integrity.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "#FCFAF7",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              minHeight: "44px",
              borderRadius: "8px",
              border: "1px solid var(--color-border)",
              backgroundColor: "#FFFFFF",
              color: "var(--color-text-secondary)",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .photo-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
