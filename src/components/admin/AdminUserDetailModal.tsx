"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AdminUserDetail } from "@/types/admin";
import {
  getAdminUserDetail,
  suspendAdminUser,
  blockAdminUser,
  restoreAdminUser,
  resendAdminUserActivation,
  verifyAdminUserActivationOtp,
  permanentlyDeleteAdminUser,
  activateAdminUserProfile,
} from "@/lib/api/admin";
import { OtpInput } from "@/components/auth/OtpInput";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import styles from "./AdminActivationSection.module.css";
import dangerStyles from "./AdminDangerZone.module.css";
import { AdminPhotoUploadSection } from "./AdminPhotoUploadSection";

interface AdminUserDetailModalProps {
  userId: string | null;
  onClose: () => void;
  onViewProfile?: (profileId: string) => void;
  onEditProfile?: (profileId: string) => void;
  onUserUpdated?: (updatedUser: AdminUserDetail) => void;
  onUserDeleted?: (deletedUserId: string, message: string) => void;
}

function getUserStatusBadgeColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" };
    case "SUSPENDED":
      return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" };
    case "BLOCKED":
      return { bg: "#F3F4F6", text: "#4B5563", border: "#D1D5DB" };
    case "DELETED":
      return { bg: "#FEE2E2", text: "#991B1B", border: "#F87171" };
    default:
      return { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" };
  }
}

function getProfileStatusBadgeColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" };
    case "INCOMPLETE":
      return { bg: "#FEF3C7", text: "#B45309", border: "#FDE68A" };
    case "IN_REVIEW":
      return { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" };
    case "SUSPENDED":
    case "REJECTED":
      return { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" };
    default:
      return { bg: "#F3F4F6", text: "#4B5563", border: "#E5E7EB" };
  }
}

export function AdminUserDetailModal({
  userId,
  onClose,
  onViewProfile,
  onEditProfile,
  onUserUpdated,
  onUserDeleted,
}: AdminUserDetailModalProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status Action States
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "SUSPEND" | "BLOCK" | "RESTORE";
    title: string;
    message: string;
    confirmButtonText: string;
    confirmButtonColor: string;
  } | null>(null);

  // Activation Resend & Verification State
  const [isResendingActivation, setIsResendingActivation] = useState(false);
  const [activationMessage, setActivationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [adminOtp, setAdminOtp] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Permanent Account Deletion (Hard Delete) States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Profile Activation & Publishing States
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePublishProfile = async () => {
    if (!user || !user.profile) return;
    setIsPublishing(true);
    setPublishMessage(null);

    try {
      const res = await activateAdminUserProfile(user.id);
      if (res.success) {
        setIsPublishConfirmOpen(false);
        setPublishMessage({
          type: "success",
          text: "Profile published successfully! It is now visible to eligible members in Matches.",
        });
        const updatedUser: AdminUserDetail = {
          ...user,
          profile: {
            ...user.profile,
            profileStatus: "ACTIVE",
          },
        };
        setUser(updatedUser);
        onUserUpdated?.(updatedUser);
      } else {
        setIsPublishConfirmOpen(false);
        setPublishMessage({
          type: "error",
          text: res.message || "Failed to publish profile.",
        });
      }
    } catch {
      setIsPublishConfirmOpen(false);
      setPublishMessage({
        type: "error",
        text: "An unexpected error occurred while publishing profile.",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleResendActivation = async () => {
    if (!user || isResendingActivation || resendCooldown > 0) return;
    setIsResendingActivation(true);
    setActivationMessage(null);
    setOtpError(null);
    setAdminOtp("");
    try {
      const res = await resendAdminUserActivation(user.id);
      if (res.success) {
        setActivationMessage({
          type: "success",
          text: res.message || "Activation email resent successfully.",
        });
        setResendCooldown(60);
      } else {
        if (res.code === "OTP_COOLDOWN") {
          setResendCooldown(60);
        }
        setActivationMessage({
          type: "error",
          text: res.message || "Failed to resend activation email.",
        });
      }
    } catch (err) {
      console.error("Resend activation error:", err);
      setActivationMessage({
        type: "error",
        text: "Network or server error while resending activation.",
      });
    } finally {
      setIsResendingActivation(false);
    }
  };

  const handleVerifyActivationOtp = async (otpToVerify?: string) => {
    const code = (typeof otpToVerify === "string" ? otpToVerify : adminOtp).trim();
    if (!user || isVerifyingOtp || code.length !== 6) return;
    setIsVerifyingOtp(true);
    setOtpError(null);
    setActivationMessage(null);

    try {
      const res = await verifyAdminUserActivationOtp(user.id, code);
      if (res.success && res.data) {
        const nowIso = new Date().toISOString();
        const updatedUser: AdminUserDetail = {
          ...user,
          activationStatus: "ACTIVE",
          activationPending: false,
          emailVerified: true,
          emailVerifiedAt: nowIso,
          updatedAt: nowIso,
        };
        setUser(updatedUser);
        onUserUpdated?.(updatedUser);
        setAdminOtp("");
        setActivationMessage({
          type: "success",
          text: "✓ Account Activated. You can now manage and edit this profile.",
        });
      } else {
        let displayError = res.message || "Failed to verify activation code.";
        if (res.code === "INVALID_OTP") {
          displayError = "That code is incorrect. Please check the code and try again.";
        } else if (res.code === "OTP_EXPIRED") {
          displayError = "This activation code has expired. Send a new code to continue.";
        } else if (res.code === "OTP_MAX_ATTEMPTS") {
          displayError = "This activation code has reached its attempt limit. Send a new code to continue.";
        } else if (res.code === "ACCOUNT_ALREADY_ACTIVATED" || res.code === "ALREADY_ACTIVATED") {
          displayError = "This account has already been activated.";
          const refetch = await getAdminUserDetail(user.id);
          if (refetch.success && refetch.data?.user) {
            setUser(refetch.data.user);
            onUserUpdated?.(refetch.data.user);
          }
        }
        setOtpError(displayError);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setOtpError("Network or server error while verifying activation code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadUser() {
      if (!userId) return;
      try {
        const res = await getAdminUserDetail(userId);
        if (!ignore) {
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            setError(res.message || "Failed to retrieve user details.");
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error loading admin user detail:", err);
          setError("Network or server error while loading user details.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }
    loadUser();
    return () => {
      ignore = true;
    };
  }, [userId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDeleteModalOpen) {
          if (!isDeletingUser) setIsDeleteModalOpen(false);
        } else if (confirmAction) {
          setConfirmAction(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmAction, isDeleteModalOpen, isDeletingUser, onClose]);

  const handleOpenDeleteModal = () => {
    setDeleteConfirmationInput("");
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeletingUser) return;
    setIsDeleteModalOpen(false);
    setDeleteConfirmationInput("");
    setDeleteError(null);
  };

  const handleExecutePermanentDelete = async () => {
    if (!user || isDeletingUser) return;
    if (deleteConfirmationInput !== "DELETE") {
      setDeleteError("You must type DELETE exactly to confirm.");
      return;
    }

    setIsDeletingUser(true);
    setDeleteError(null);

    try {
      const res = await permanentlyDeleteAdminUser(user.id, "DELETE");

      if (res.success) {
        setIsDeleteModalOpen(false);
        const successMsg = res.message || "User account permanently deleted.";
        onUserDeleted?.(user.id, successMsg);
        onClose();
      } else {
        if (res.code === "USER_NOT_FOUND") {
          setDeleteError("That user account no longer exists.");
        } else if (res.code === "FORBIDDEN") {
          setDeleteError("You do not have permission to delete this account.");
        } else if (res.code === "CANNOT_DELETE_ADMIN") {
          setDeleteError("Administrator accounts cannot be deleted.");
        } else if (res.code === "DELETE_FAILED") {
          setDeleteError("We couldn't permanently delete this account. No partial account deletion was completed.");
        } else {
          setDeleteError(res.message || "Failed to permanently delete account.");
        }
      }
    } catch (err) {
      console.error("[ADMIN DELETE ERROR]:", err);
      setDeleteError("A network error occurred while deleting the account.");
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleInitiateSuspend = () => {
    setActionError(null);
    setActionSuccess(null);
    setConfirmAction({
      type: "SUSPEND",
      title: "Suspend this account?",
      message:
        "This will prevent the user from accessing their Manglam Matrimony account until the account is restored.",
      confirmButtonText: "Suspend Account",
      confirmButtonColor: "#D97706",
    });
  };

  const handleInitiateBlock = () => {
    setActionError(null);
    setActionSuccess(null);
    setConfirmAction({
      type: "BLOCK",
      title: "Block this account?",
      message:
        "This will prevent the user from accessing their Manglam Matrimony account.",
      confirmButtonText: "Block Account",
      confirmButtonColor: "#DC2626",
    });
  };

  const handleInitiateRestore = () => {
    setActionError(null);
    setActionSuccess(null);
    setConfirmAction({
      type: "RESTORE",
      title: "Restore this account?",
      message:
        "This will restore the user's account access.",
      confirmButtonText: "Restore Account",
      confirmButtonColor: "#059669",
    });
  };

  const handleExecuteStatusChange = async () => {
    if (!user || !confirmAction) return;

    setIsActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      let res;
      if (confirmAction.type === "SUSPEND") {
        res = await suspendAdminUser(user.id, user.status);
      } else if (confirmAction.type === "BLOCK") {
        res = await blockAdminUser(user.id, user.status);
      } else if (confirmAction.type === "RESTORE") {
        res = await restoreAdminUser(user.id, user.status);
      }

      // Check for conflict or concurrent change
      if (res && !res.success && res.code === "ACCOUNT_STATUS_CONFLICT") {
        setActionError(
          "This account status changed. Refreshing the latest status."
        );
        setConfirmAction(null);
        const refetch = await getAdminUserDetail(user.id);
        if (refetch.success && refetch.data?.user) {
          setUser(refetch.data.user);
          onUserUpdated?.(refetch.data.user);
        }
        return;
      }

      if (res && res.success && res.data?.user) {
        const updated = res.data.user;
        const updatedUser: AdminUserDetail = {
          ...user,
          status: updated.status,
          statusChangedAt: updated.statusChangedAt,
          statusChangedByUser: updated.statusChangedByUser,
          updatedAt: updated.updatedAt,
        };
        setUser(updatedUser);
        setActionSuccess(res.message || "Account status updated successfully.");
        setConfirmAction(null);
        onUserUpdated?.(updatedUser);
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        setActionError(res?.message || "Failed to update account status.");
        setConfirmAction(null);
      }
    } catch (err) {
      console.error("Error updating account status:", err);
      setActionError("An unexpected error occurred while updating account status.");
      setConfirmAction(null);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!userId) return null;

  const statusColors = getUserStatusBadgeColor(user?.status || "");
  const profileStatusColors = getProfileStatusBadgeColor(user?.profile?.profileStatus || "");

  const displayName =
    user?.profile?.firstName || user?.profile?.lastName
      ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim()
      : user?.email || "User Account";

  return (
    <div
      id="admin-user-detail-modal"
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "var(--font-bricolage)",
        boxSizing: "border-box",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "760px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor:
                  user?.role === "ADMIN"
                    ? "rgba(180, 83, 9, 0.1)"
                    : "rgba(123, 17, 35, 0.08)",
                color: user?.role === "ADMIN" ? "#B45309" : "var(--color-maroon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.125rem",
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {displayName}
                </h3>
                {user && (
                  <>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`,
                        textTransform: "uppercase",
                      }}
                    >
                      {user.status}
                    </span>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "12px",
                        backgroundColor: user.role === "ADMIN" ? "#FEF3C7" : "#F3F4F6",
                        color: user.role === "ADMIN" ? "#92400E" : "#4B5563",
                        border: `1px solid ${user.role === "ADMIN" ? "#FDE68A" : "#E5E7EB"}`,
                      }}
                    >
                      {user.role}
                    </span>
                    {user.activationStatus === "PENDING_ACTIVATION" && (
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          backgroundColor: "#FEF3C7",
                          color: "#B45309",
                          border: "1px solid #FDE68A",
                        }}
                      >
                        PENDING ACTIVATION
                      </span>
                    )}
                  </>
                )}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                User ID: {userId}
              </div>
            </div>
          </div>

          <button
            id="admin-user-detail-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "none",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              minHeight: "40px",
            }}
          >
            <span>&times;</span> Close
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1, backgroundColor: "#FFFFFF" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-maroon)" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  border: "3px solid #EFE8E9",
                  borderTopColor: "var(--color-maroon)",
                  borderRadius: "50%",
                  margin: "0 auto 12px",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>Loading user account details...</p>
            </div>
          ) : error ? (
            <div
              style={{
                backgroundColor: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                padding: "16px",
                color: "#991B1B",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          ) : user ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Account Status & Lifecycle Controls Section */}
              <section
                style={{
                  backgroundColor: "#FCFAF7",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h4
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 700,
                        margin: 0,
                        color: "var(--color-maroon)",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Account Status &amp; Access Controls
                    </h4>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "14px",
                        backgroundColor: statusColors.bg,
                        color: statusColors.text,
                        border: `1px solid ${statusColors.border}`,
                        textTransform: "uppercase",
                      }}
                    >
                      {user.status}
                    </span>
                  </div>
                </div>

                {/* Action Alerts */}
                {actionError && (
                  <div
                    style={{
                      backgroundColor: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#991B1B",
                      fontSize: "0.8125rem",
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{actionError}</span>
                    <button
                      onClick={() => setActionError(null)}
                      style={{ background: "none", border: "none", color: "#991B1B", cursor: "pointer", fontSize: "1rem" }}
                    >
                      &times;
                    </button>
                  </div>
                )}

                {actionSuccess && (
                  <div
                    style={{
                      backgroundColor: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#065F46",
                      fontSize: "0.8125rem",
                      marginBottom: "14px",
                    }}
                  >
                    {actionSuccess}
                  </div>
                )}

                {/* Status Audit Info */}
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Status Audit Record
                    </span>
                    <strong style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>
                      {user.statusChangedAt
                        ? `Changed ${new Date(user.statusChangedAt).toLocaleString()}`
                        : "Default account state"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Changed By Administrator
                    </span>
                    <strong style={{ fontSize: "0.8125rem", color: "var(--color-text-primary)" }}>
                      {user.statusChangedAt
                        ? (user.statusChangedByUser?.email || "Previous administrator unavailable")
                        : "None (System initial)"}
                    </strong>
                  </div>
                </div>

                {/* Status Controls based on status and role */}
                {user.role === "ADMIN" ? (
                  <div
                    style={{
                      backgroundColor: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#1E40AF",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                    }}
                  >
                    Administrative accounts cannot be modified through user controls.
                  </div>
                ) : user.status === "DELETED" ? (
                  <div
                    style={{
                      backgroundColor: "#FEE2E2",
                      border: "1px solid #F87171",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      color: "#991B1B",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                    }}
                  >
                    Account is deleted and cannot be modified.
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                    {user.status === "ACTIVE" && (
                      <>
                        <button
                          onClick={handleInitiateSuspend}
                          disabled={isActionLoading}
                          style={{
                            backgroundColor: "#FFFBEB",
                            color: "#B45309",
                            border: "1px solid #FDE68A",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: isActionLoading ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActionLoading) e.currentTarget.style.backgroundColor = "#FEF3C7";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActionLoading) e.currentTarget.style.backgroundColor = "#FFFBEB";
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="10" y1="15" x2="10" y2="9" />
                            <line x1="14" y1="15" x2="14" y2="9" />
                          </svg>
                          Suspend Account
                        </button>

                        <button
                          onClick={handleInitiateBlock}
                          disabled={isActionLoading}
                          style={{
                            backgroundColor: "#FEF2F2",
                            color: "#B91C1C",
                            border: "1px solid #FECACA",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: isActionLoading ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActionLoading) e.currentTarget.style.backgroundColor = "#FEE2E2";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActionLoading) e.currentTarget.style.backgroundColor = "#FEF2F2";
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                          Block Account
                        </button>
                      </>
                    )}

                    {user.status === "SUSPENDED" && (
                      <>
                        <button
                          onClick={handleInitiateRestore}
                          disabled={isActionLoading}
                          style={{
                            backgroundColor: "#ECFDF5",
                            color: "#047857",
                            border: "1px solid #A7F3D0",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: isActionLoading ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActionLoading) e.currentTarget.style.backgroundColor = "#D1FAE5";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActionLoading) e.currentTarget.style.backgroundColor = "#ECFDF5";
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                            <polyline points="21 3 21 8 16 8" />
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                            <polyline points="8 16 3 16 3 21" />
                          </svg>
                          Restore Account
                        </button>

                        <button
                          onClick={handleInitiateBlock}
                          disabled={isActionLoading}
                          style={{
                            backgroundColor: "#FEF2F2",
                            color: "#B91C1C",
                            border: "1px solid #FECACA",
                            borderRadius: "6px",
                            padding: "8px 16px",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            cursor: isActionLoading ? "not-allowed" : "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActionLoading) e.currentTarget.style.backgroundColor = "#FEE2E2";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActionLoading) e.currentTarget.style.backgroundColor = "#FEF2F2";
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                          Block Account
                        </button>
                      </>
                    )}

                    {user.status === "BLOCKED" && (
                      <button
                        onClick={handleInitiateRestore}
                        disabled={isActionLoading}
                        style={{
                          backgroundColor: "#ECFDF5",
                          color: "#047857",
                          border: "1px solid #A7F3D0",
                          borderRadius: "6px",
                          padding: "8px 16px",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          cursor: isActionLoading ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActionLoading) e.currentTarget.style.backgroundColor = "#D1FAE5";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActionLoading) e.currentTarget.style.backgroundColor = "#ECFDF5";
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <polyline points="21 3 21 8 16 8" />
                          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                          <polyline points="8 16 3 16 3 21" />
                        </svg>
                        Restore Account
                      </button>
                    )}
                  </div>
                )}
              </section>

              {/* Account Ownership & Activation Section */}
              <section className={styles.activationSection}>
                <div className={styles.headerRow}>
                  <div className={styles.titleGroup}>
                    <h4 className={styles.sectionTitle}>
                      <svg className={styles.titleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <polyline points="17 11 19 13 23 9" />
                      </svg>
                      Account Ownership &amp; Activation
                    </h4>

                    {user.activationStatus === "PENDING_ACTIVATION" ? (
                      <Badge id="ownership-status-badge" variant="warning" size="sm">
                        Pending Activation
                      </Badge>
                    ) : (
                      <Badge id="ownership-status-badge" variant="success" size="sm">
                        Verified &amp; Claimed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Activation Alert Messages */}
                {activationMessage && (
                  <div
                    className={`${styles.alertBanner} ${
                      activationMessage.type === "success" ? styles.alertSuccess : styles.alertError
                    }`}
                  >
                    <span>{activationMessage.text}</span>
                    <button
                      className={styles.alertDismissBtn}
                      onClick={() => setActivationMessage(null)}
                      aria-label="Dismiss alert"
                    >
                      &times;
                    </button>
                  </div>
                )}

                {/* Ownership Details Grid */}
                <div className={styles.detailsCard}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Ownership Status</span>
                    <strong
                      id="ownership-status-text"
                      className={`${styles.detailValue} ${
                        user.activationStatus === "PENDING_ACTIVATION" ? styles.statusPending : styles.statusActive
                      }`}
                    >
                      {user.activationStatus === "PENDING_ACTIVATION" ? "Pending Activation" : "Active"}
                    </strong>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email Verification</span>
                    <strong
                      id="email-verification-text"
                      className={`${styles.detailValue} ${
                        user.emailVerifiedAt ? styles.statusActive : styles.statusPending
                      }`}
                    >
                      {user.emailVerifiedAt
                        ? `Verified on ${new Date(user.emailVerifiedAt).toLocaleDateString()}`
                        : "Email verification: Not verified"}
                    </strong>
                  </div>

                  {user.activationStatus === "ACTIVE" && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Activated</span>
                      <strong className={`${styles.detailValue} ${styles.statusActive}`}>
                        {user.emailVerifiedAt ? "Just now" : "Verified"}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Activation OTP Section for PENDING_ACTIVATION users */}
                {user.activationStatus === "PENDING_ACTIVATION" && (
                  <div className={styles.otpVerificationBox}>
                    <h5 className={styles.otpBoxTitle}>Activation OTP</h5>
                    <p className={styles.otpInstruction}>
                      Enter the 6-digit code received by the user to verify and activate this account immediately.
                    </p>

                    <div className={styles.otpInputContainer}>
                      <OtpInput
                        value={adminOtp}
                        onChange={(val) => {
                          setAdminOtp(val);
                          setOtpError(null);
                        }}
                        onComplete={handleVerifyActivationOtp}
                        disabled={isVerifyingOtp}
                      />
                    </div>

                    {otpError && (
                      <div className={styles.otpErrorFeedback} role="alert">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{otpError}</span>
                      </div>
                    )}

                    <div className={styles.otpActionsRow}>
                      <Button
                        id="verify-activate-button"
                        type="button"
                        variant="primary"
                        size="md"
                        disabled={isVerifyingOtp || adminOtp.length !== 6}
                        onClick={() => handleVerifyActivationOtp()}
                        className={styles.verifyBtn}
                      >
                        {isVerifyingOtp ? "Verifying…" : "Verify & Activate"}
                      </Button>

                      <Button
                        id="resend-activation-button"
                        type="button"
                        variant="outline"
                        size="md"
                        disabled={isResendingActivation || resendCooldown > 0}
                        onClick={handleResendActivation}
                        className={styles.resendBtn}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                        </svg>
                        {isResendingActivation
                          ? "Sending..."
                          : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend Activation Email"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Prompt after activation: Immediate access to Profile Management */}
                {user.activationStatus === "ACTIVE" && user.profile?.profileId && onEditProfile && (
                  <div className={styles.activeProfilePrompt}>
                    <span className={styles.activePromptText}>
                      ✓ Account is active and ready for profile management.
                    </span>
                    <button
                      id="activate-edit-profile-button"
                      type="button"
                      className={styles.editProfileBtn}
                      onClick={() => onEditProfile(user.profile!.profileId)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                      Edit Profile Now
                    </button>
                  </div>
                )}
              </section>

              {/* Account Information Card */}
              <section>
                <h4
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    margin: "0 0 12px 0",
                    color: "var(--color-maroon)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Account Profile
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "14px",
                    backgroundColor: "#FCFAF7",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Registered Email
                    </span>
                    <strong style={{ fontSize: "0.875rem", wordBreak: "break-all" }}>
                      {user.email || "No email provided"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Masked Phone Number
                    </span>
                    <strong style={{ fontSize: "0.875rem" }}>
                      {user.maskedPhone || "No phone provided"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Associated Name
                    </span>
                    <strong style={{ fontSize: "0.875rem" }}>
                      {user.profile?.firstName || user.profile?.lastName
                        ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim()
                        : "Not set on account"}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Account Role
                    </span>
                    <strong style={{ fontSize: "0.875rem" }}>{user.role}</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Account Status
                    </span>
                    <strong style={{ fontSize: "0.875rem" }}>{user.status}</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Registration Date
                    </span>
                    <strong style={{ fontSize: "0.8125rem" }}>
                      {new Date(user.createdAt).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Last Updated
                    </span>
                    <strong style={{ fontSize: "0.8125rem" }}>
                      {new Date(user.updatedAt).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Status Audit Record
                    </span>
                    <strong style={{ fontSize: "0.8125rem" }}>
                      {user.statusChangedAt
                        ? `${new Date(user.statusChangedAt).toLocaleDateString()} (${user.statusChangedByUser?.email || "Previous administrator unavailable"})`
                        : "Default active state"}
                    </strong>
                  </div>
                </div>
              </section>

              {/* Security & Verification Card */}
              <section>
                <h4
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 700,
                    margin: "0 0 12px 0",
                    color: "var(--color-maroon)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Security &amp; Verification
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "14px",
                    backgroundColor: "#FCFAF7",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Email Verification
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: user.emailVerifiedAt ? "#10B981" : "#EF4444",
                        }}
                      />
                      <strong style={{ fontSize: "0.8125rem" }}>
                        {user.emailVerifiedAt
                          ? `Verified (${new Date(user.emailVerifiedAt).toLocaleDateString()})`
                          : "Unverified"}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Phone Verification
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: user.phoneVerifiedAt ? "#10B981" : "#EF4444",
                        }}
                      />
                      <strong style={{ fontSize: "0.8125rem" }}>
                        {user.phoneVerifiedAt
                          ? `Verified (${new Date(user.phoneVerifiedAt).toLocaleDateString()})`
                          : "Unverified"}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Password &amp; Credentials
                    </span>
                    <strong style={{ fontSize: "0.8125rem", color: "#047857" }}>
                      bcrypt-hashed &bull; Protected
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                      Account Ownership
                    </span>
                    <strong
                      style={{
                        fontSize: "0.8125rem",
                        color: user.activationStatus === "PENDING_ACTIVATION" ? "#B45309" : "#047857",
                      }}
                    >
                      {user.activationStatus === "PENDING_ACTIVATION"
                        ? "Pending Activation"
                        : "Verified & Claimed"}
                    </strong>
                  </div>
                </div>
              </section>

              {/* Matrimonial Profile Association Card */}
              <section>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 700,
                      margin: 0,
                      color: "var(--color-maroon)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Associated Matrimonial Profile
                  </h4>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {user.profile && onEditProfile && (
                      <button
                        onClick={() => onEditProfile(user.profile!.profileId)}
                        style={{
                          backgroundColor: "#C59B27",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          minHeight: "36px",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#B38A20";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#C59B27";
                        }}
                      >
                        <span>Edit Profile</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    )}
                    {user.profile && onViewProfile && (
                      <button
                        onClick={() => onViewProfile(user.profile!.profileId)}
                        style={{
                          backgroundColor: "rgba(123, 17, 35, 0.08)",
                          color: "var(--color-maroon)",
                          border: "1px solid rgba(123, 17, 35, 0.2)",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          minHeight: "36px",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(123, 17, 35, 0.14)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(123, 17, 35, 0.08)";
                        }}
                      >
                        <span>View Full Profile</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </button>
                    )}

                    {user.profile && user.profile.profileStatus !== "ACTIVE" && (
                      <button
                        type="button"
                        id="publish-profile-button"
                        onClick={() => setIsPublishConfirmOpen(true)}
                        disabled={user.profile.completionPercentage < 100}
                        title={
                          user.profile.completionPercentage < 100
                            ? "Profile must be 100% complete before publishing"
                            : "Activate and publish this matrimonial profile to Matches"
                        }
                        style={{
                          backgroundColor:
                            user.profile.completionPercentage < 100
                              ? "#E5E7EB"
                              : "#047857",
                          color:
                            user.profile.completionPercentage < 100
                              ? "#9CA3AF"
                              : "#FFFFFF",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 14px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          cursor:
                            user.profile.completionPercentage < 100
                              ? "not-allowed"
                              : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          minHeight: "36px",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (user.profile && user.profile.completionPercentage >= 100) {
                            e.currentTarget.style.backgroundColor = "#065F46";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (user.profile && user.profile.completionPercentage >= 100) {
                            e.currentTarget.style.backgroundColor = "#047857";
                          }
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <span>Activate &amp; Publish Profile</span>
                      </button>
                    )}

                    {user.profile && user.profile.profileStatus === "ACTIVE" && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          backgroundColor: "#ECFDF5",
                          color: "#047857",
                          border: "1px solid #A7F3D0",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          minHeight: "36px",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>Profile Published</span>
                      </div>
                    )}
                  </div>
                </div>

                {publishMessage && (
                  <div
                    role="alert"
                    style={{
                      padding: "10px 14px",
                      borderRadius: "6px",
                      marginBottom: "12px",
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      backgroundColor: publishMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
                      color: publishMessage.type === "success" ? "#047857" : "#B91C1C",
                      border: `1px solid ${publishMessage.type === "success" ? "#A7F3D0" : "#FECACA"}`,
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{publishMessage.text}</span>
                  </div>
                )}

                {user.profile ? (
                  <div
                    style={{
                      backgroundColor: "#FCFAF7",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                      {/* Photo Thumbnail */}
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "8px",
                          overflow: "hidden",
                          backgroundColor: "#EFE8E9",
                          flexShrink: 0,
                          position: "relative",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {user.profile.primaryPhotoUrl ? (
                          <Image
                            src={user.profile.primaryPhotoUrl}
                            alt="Profile Photo"
                            fill
                            sizes="64px"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--color-text-muted)",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                            }}
                          >
                            No Photo
                          </div>
                        )}
                      </div>

                      {/* Profile Summary Header */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <strong style={{ fontSize: "1rem", color: "var(--color-text-primary)" }}>
                            {user.profile.firstName || user.profile.lastName
                              ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim()
                              : "Name not entered"}
                          </strong>
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "12px",
                              backgroundColor: profileStatusColors.bg,
                              color: profileStatusColors.text,
                              border: `1px solid ${profileStatusColors.border}`,
                              textTransform: "uppercase",
                            }}
                          >
                            {user.profile.profileStatus}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                          Profile ID: {user.profile.profileId} &bull; Created For: {user.profile.profileCreatedFor}
                        </div>
                      </div>
                    </div>

                    {/* Profile Field Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: "12px",
                        paddingTop: "12px",
                        borderTop: "1px solid var(--color-border)",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                          Gender
                        </span>
                        <strong style={{ fontSize: "0.875rem" }}>
                          {user.profile.gender || "N/A"}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                          Location
                        </span>
                        <strong style={{ fontSize: "0.875rem" }}>
                          {user.profile.city || "Unknown"}
                          {user.profile.state ? `, ${user.profile.state}` : ""}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                          Profile Completion
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                          <div
                            style={{
                              flex: 1,
                              height: "6px",
                              backgroundColor: "#E5E7EB",
                              borderRadius: "3px",
                              overflow: "hidden",
                              maxWidth: "100px",
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(user.profile.completionPercentage, 100)}%`,
                                height: "100%",
                                backgroundColor:
                                  user.profile.completionPercentage === 100
                                    ? "#10B981"
                                    : "var(--color-gold)",
                              }}
                            />
                          </div>
                          <strong style={{ fontSize: "0.8125rem" }}>
                            {user.profile.completionPercentage}%
                          </strong>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>
                          Profile Created Date
                        </span>
                        <strong style={{ fontSize: "0.8125rem" }}>
                          {new Date(user.profile.createdAt).toLocaleDateString()}
                        </strong>
                      </div>
                    </div>

                    {/* Admin Photo Upload & Management Section */}
                    <div style={{ paddingTop: "14px", borderTop: "1px solid var(--color-border)" }}>
                      <AdminPhotoUploadSection
                        userId={user.id}
                        profileId={user.profile.profileId}
                        onProfileUpdated={(newCompletion) => {
                          setUser((prev) =>
                            prev && prev.profile
                              ? {
                                  ...prev,
                                  profile: {
                                    ...prev.profile,
                                    completionPercentage: newCompletion,
                                  },
                                }
                              : prev
                          );
                        }}
                        onPhotosUpdated={(photos) => {
                          const primary = photos.find((p) => p.photoType === "PRIMARY" || p.isPrimary);
                          if (primary?.url) {
                            setUser((prev) =>
                              prev && prev.profile
                                ? {
                                    ...prev,
                                    profile: {
                                      ...prev.profile,
                                      primaryPhotoUrl: primary.url,
                                    },
                                  }
                                : prev
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: "24px",
                      borderRadius: "10px",
                      backgroundColor: "#F9FAFB",
                      border: "1px dashed var(--color-border)",
                      textAlign: "center",
                      color: "var(--color-text-muted)",
                      fontSize: "0.875rem",
                    }}
                  >
                    No matrimonial profile associated with this account.
                  </div>
                )}
              </section>

              {/* DANGER ZONE: Hard Delete capability */}
              {user.role === "USER" && (
                <div className={dangerStyles.dangerZoneContainer}>
                  <div className={dangerStyles.dangerZoneHeader}>
                    <svg className={dangerStyles.dangerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <h4 className={dangerStyles.dangerZoneTitle}>Danger Zone</h4>
                  </div>
                  <div className={dangerStyles.dangerZoneContent}>
                    <div className={dangerStyles.dangerZoneText}>
                      <p className={dangerStyles.dangerZoneDescription}>
                        Permanently delete this account and its associated data. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      type="button"
                      id="btn-open-delete-modal"
                      className={dangerStyles.deleteInitiateBtn}
                      onClick={handleOpenDeleteModal}
                      disabled={isActionLoading || isDeletingUser}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#FCFAF7",
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
            Administrative Account Management &bull; Changes to account status immediately restrict or restore platform access.
          </div>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "var(--color-maroon)",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "6px",
              padding: "8px 18px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            zIndex: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => !isActionLoading && setConfirmAction(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "14px",
              width: "100%",
              maxWidth: "460px",
              padding: "24px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3)",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: `${confirmAction.confirmButtonColor}15`,
                  color: confirmAction.confirmButtonColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h4
                id="confirm-modal-title"
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--color-text-primary)",
                }}
              >
                {confirmAction.title}
              </h4>
            </div>

            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.5,
                margin: "0 0 24px 0",
              }}
            >
              {confirmAction.message}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setConfirmAction(null)}
                disabled={isActionLoading}
                style={{
                  backgroundColor: "#FFFFFF",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: isActionLoading ? "not-allowed" : "pointer",
                  minHeight: "38px",
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteStatusChange}
                disabled={isActionLoading}
                style={{
                  backgroundColor: confirmAction.confirmButtonColor,
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 18px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: isActionLoading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "38px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {isActionLoading ? (
                  <>
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid #FFFFFF",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  confirmAction.confirmButtonText
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Permanent Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && user && (
        <div
          className={dangerStyles.modalOverlay}
          onClick={() => !isDeletingUser && handleCloseDeleteModal()}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className={dangerStyles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={dangerStyles.modalHeader}>
              <div className={dangerStyles.modalIconWrapper}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <h4 id="delete-modal-title" className={dangerStyles.modalTitle}>
                Delete Account Permanently?
              </h4>
            </div>

            <p className={dangerStyles.modalDescription}>
              This will permanently delete this user&apos;s account and associated profile data, photos, preferences, requests, favourites and other stored data.
              <strong style={{ display: "block", marginTop: "6px", color: "#DC2626" }}>
                This action cannot be undone.
              </strong>
            </p>

            {/* Target Identity Display */}
            <div className={dangerStyles.identityCard}>
              <div className={dangerStyles.identityRow}>
                <span className={dangerStyles.identityLabel}>Name:</span>
                <span className={dangerStyles.identityValue}>
                  {user.profile?.firstName || user.profile?.lastName
                    ? `${user.profile.firstName || ""} ${user.profile.lastName || ""}`.trim()
                    : user.email || "Unnamed User"}
                </span>
              </div>
              <div className={dangerStyles.identityRow}>
                <span className={dangerStyles.identityLabel}>Email:</span>
                <span className={dangerStyles.identityValue}>{user.email || "No email associated"}</span>
              </div>
              <div className={dangerStyles.identityRow}>
                <span className={dangerStyles.identityLabel}>User ID:</span>
                <span className={dangerStyles.identityValue}>{user.id}</span>
              </div>
            </div>

            {/* Confirmation input prompt */}
            <div>
              <label htmlFor="confirm-delete-input" className={dangerStyles.inputLabel}>
                Type <strong>DELETE</strong> to confirm:
              </label>
              <input
                id="confirm-delete-input"
                type="text"
                autoComplete="off"
                placeholder="DELETE"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                disabled={isDeletingUser}
                className={dangerStyles.confirmInput}
              />
            </div>

            {deleteError && (
              <div className={dangerStyles.errorBanner} role="alert">
                {deleteError}
              </div>
            )}

            <div className={dangerStyles.modalActions}>
              <button
                type="button"
                id="btn-cancel-delete"
                onClick={handleCloseDeleteModal}
                disabled={isDeletingUser}
                className={dangerStyles.cancelBtn}
              >
                Cancel
              </button>

              <button
                type="button"
                id="btn-confirm-permanent-delete"
                onClick={handleExecutePermanentDelete}
                disabled={deleteConfirmationInput !== "DELETE" || isDeletingUser}
                className={dangerStyles.deleteConfirmBtn}
              >
                {isDeletingUser ? (
                  <>
                    <div className={dangerStyles.spinner} />
                    <span>Deleting Account&hellip;</span>
                  </>
                ) : (
                  <span>Delete Permanently</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate & Publish Profile Confirmation Modal */}
      {isPublishConfirmOpen && user && user.profile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-modal-title"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "16px",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#047857",
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 id="publish-modal-title" style={{ margin: 0, fontSize: "1.125rem", color: "var(--color-text-primary)" }}>
                Publish this profile?
              </h3>
            </div>

            <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: "0 0 20px 0" }}>
              This will make the completed profile visible to eligible members in <strong>Matches</strong>.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsPublishConfirmOpen(false)}
                disabled={isPublishing}
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "#FFFFFF",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: isPublishing ? "not-allowed" : "pointer",
                  color: "var(--color-text-primary)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-publish-profile-button"
                onClick={handlePublishProfile}
                disabled={isPublishing}
                style={{
                  padding: "8px 18px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#047857",
                  color: "#FFFFFF",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: isPublishing ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isPublishing ? "Publishing..." : "Publish Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
