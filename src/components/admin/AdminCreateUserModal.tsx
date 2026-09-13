"use client";

import React, { useState } from "react";
import { createAdminUser } from "@/lib/api/admin";
import { AdminUserDetail } from "@/types/admin";

interface AdminCreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: (user: AdminUserDetail) => void;
  onViewUser?: (userId: string) => void;
}

export function AdminCreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
  onViewUser,
}: AdminCreateUserModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<string>("MALE");
  const [profileCreatedFor, setProfileCreatedFor] = useState<string>("MYSELF");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<AdminUserDetail | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail("");
    setFirstName("");
    setLastName("");
    setGender("MALE");
    setProfileCreatedFor("MYSELF");
    setIsSubmitting(false);
    setErrorMessage(null);
    setCreatedUser(null);
    setDebugOtp(null);
    setWarningMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please provide a properly formatted email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAdminUser({
        email: trimmedEmail,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        gender: gender || undefined,
        profileCreatedFor: profileCreatedFor || undefined,
      });

      if (res.success && res.data?.user) {
        setCreatedUser(res.data.user);
        if (res.data.debugOtp) {
          setDebugOtp(res.data.debugOtp);
        }
        if (res.warning === "EMAIL_DISPATCH_FAILED") {
          setWarningMessage(
            "Account was created, but email dispatch failed. You can resend the activation code from user details."
          );
        }
        if (onUserCreated) {
          onUserCreated(res.data.user);
        }
      } else {
        if (res.code === "EMAIL_ALREADY_REGISTERED") {
          setErrorMessage("An account with this email address already exists.");
        } else {
          setErrorMessage(res.message || "Failed to create user account. Please try again.");
        }
      }
    } catch (err) {
      console.error("[ADMIN CREATE USER ERROR]:", err);
      setErrorMessage("A network or server error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        padding: "16px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "14px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid var(--color-border)",
        }}
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
          <div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--color-maroon)",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Create User &amp; Profile
            </h3>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary)",
                margin: "4px 0 0",
              }}
            >
              Add a candidate account and invite them to claim ownership.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              lineHeight: 1,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              color: "var(--color-text-muted)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            &times;
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {createdUser ? (
            /* Success State */
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#ECFDF5",
                  border: "2px solid #A7F3D0",
                  color: "#047857",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "#065F46",
                  margin: "0 0 6px",
                }}
              >
                Account Created Successfully!
              </h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-secondary)",
                  margin: "0 0 20px",
                }}
              >
                An activation email with a 6-digit verification code has been dispatched to{" "}
                <strong>{createdUser.email}</strong>.
              </p>

              {warningMessage && (
                <div
                  style={{
                    backgroundColor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#92400E",
                    fontSize: "0.8125rem",
                    marginBottom: "16px",
                    textAlign: "left",
                  }}
                >
                  {warningMessage}
                </div>
              )}

              {debugOtp && (
                <div
                  style={{
                    backgroundColor: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#1E40AF",
                    fontSize: "0.8125rem",
                    marginBottom: "16px",
                    textAlign: "left",
                  }}
                >
                  <strong>Dev Dummy OTP:</strong> <code>{debugOtp}</code> (Local dev helper)
                </div>
              )}

              <div
                style={{
                  backgroundColor: "#FCFAF7",
                  borderRadius: "10px",
                  padding: "16px",
                  border: "1px solid var(--color-border)",
                  textAlign: "left",
                  marginBottom: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>User ID</span>
                  <span style={{ fontSize: "0.75rem", fontFamily: "monospace" }}>{createdUser.id}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Email</span>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{createdUser.email}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Account Status</span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      backgroundColor: "#FEF3C7",
                      color: "#B45309",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    PENDING ACTIVATION
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Profile Status</span>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      backgroundColor: "#FEF3C7",
                      color: "#92400E",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    INCOMPLETE (0%)
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  id="modal-done-btn"
                  type="button"
                  onClick={handleClose}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--color-text-primary)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
                {onViewUser && (
                  <button
                    id="modal-view-user-details-btn"
                    type="button"
                    onClick={() => {
                      const id = createdUser.id;
                      handleClose();
                      onViewUser(id);
                    }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "var(--color-maroon)",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    View User Details
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Creation Form */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Informational Banner */}
              <div
                style={{
                  backgroundColor: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="2"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div style={{ fontSize: "0.8125rem", color: "#166534", lineHeight: 1.45 }}>
                  <strong>Ownership Verification:</strong> The candidate will receive a 6-digit OTP code to claim
                  ownership. Administrators never create passwords or impersonate candidates.
                </div>
              </div>

              {errorMessage && (
                <div
                  style={{
                    backgroundColor: "#FEF2F2",
                    border: "1px solid #FECACA",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#991B1B",
                    fontSize: "0.8125rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errorMessage}
                </div>
              )}

              {/* Email (Required) */}
              <div>
                <label
                  htmlFor="create-user-email"
                  style={{
                    display: "block",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: "6px",
                  }}
                >
                  Email Address <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  id="create-user-email"
                  type="email"
                  required
                  placeholder="candidate@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.875rem",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Name Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label
                    htmlFor="create-user-firstname"
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    First Name (Optional)
                  </label>
                  <input
                    id="create-user-firstname"
                    type="text"
                    placeholder="e.g. Rahul"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.875rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="create-user-lastname"
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    Last Name (Optional)
                  </label>
                  <input
                    id="create-user-lastname"
                    type="text"
                    placeholder="e.g. Sharma"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.875rem",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* Gender & Profile Created For */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label
                    htmlFor="create-user-gender"
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    Gender
                  </label>
                  <select
                    id="create-user-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.875rem",
                      backgroundColor: "#FFFFFF",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="create-user-createdfor"
                    style={{
                      display: "block",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: "6px",
                    }}
                  >
                    Profile Created For
                  </label>
                  <select
                    id="create-user-createdfor"
                    value={profileCreatedFor}
                    onChange={(e) => setProfileCreatedFor(e.target.value)}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.875rem",
                      backgroundColor: "#FFFFFF",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="MYSELF">Myself</option>
                    <option value="MY_SON">Son</option>
                    <option value="MY_DAUGHTER">Daughter</option>
                    <option value="MY_BROTHER">Brother</option>
                    <option value="MY_SISTER">Sister</option>
                    <option value="MY_RELATIVE">Relative</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "12px",
                  paddingTop: "16px",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <button
                  id="modal-cancel-create-user-btn"
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "#FFFFFF",
                    color: "var(--color-text-secondary)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  id="modal-submit-create-user-btn"
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isSubmitting ? "#9CA3AF" : "var(--color-maroon)",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 4px rgba(139, 21, 56, 0.2)",
                  }}
                >
                  {isSubmitting && (
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255,255,255,0.4)",
                        borderTopColor: "#FFFFFF",
                        borderRadius: "50%",
                        animation: "spin 0.6s linear infinite",
                      }}
                    />
                  )}
                  {isSubmitting ? "Creating Account..." : "Create & Send Activation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
