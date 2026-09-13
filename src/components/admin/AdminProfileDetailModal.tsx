"use client";

import React, { useEffect, useState } from "react";
import { AdminProfileDetail } from "@/types/admin";
import { getAdminProfileDetail, activateAdminUserProfile } from "@/lib/api/admin";
import { AdminProfileEditModal } from "./AdminProfileEditModal";
import { AdminPhotoUploadSection } from "./AdminPhotoUploadSection";

interface AdminProfileDetailModalProps {
  profileId: string | null;
  onClose: () => void;
  initialOpenEdit?: boolean;
  onProfileUpdated?: (updated: AdminProfileDetail) => void;
}

type TabKey = "overview" | "religion" | "career" | "preferences" | "photos" | "account";

function calculateAge(dobString?: string): number | string {
  if (!dobString) return "N/A";
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : "N/A";
}

function getStatusBadgeColor(status: string) {
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

export function AdminProfileDetailModal({
  profileId,
  onClose,
  initialOpenEdit = false,
  onProfileUpdated,
}: AdminProfileDetailModalProps) {
  const [profile, setProfile] = useState<AdminProfileDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(Boolean(initialOpenEdit));

  // Profile Publishing States
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handlePublishProfile = async () => {
    if (!profile) return;
    setIsPublishing(true);
    setPublishMessage(null);

    try {
      const res = await activateAdminUserProfile(profile.userId);
      if (res.success) {
        setIsPublishConfirmOpen(false);
        setPublishMessage({
          type: "success",
          text: "Profile published successfully! It is now visible to eligible members in Matches.",
        });
        const updated: AdminProfileDetail = {
          ...profile,
          profileStatus: "ACTIVE",
        };
        setProfile(updated);
        onProfileUpdated?.(updated);
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
    if (!profileId) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getAdminProfileDetail(profileId);
        if (isMounted) {
          if (res.success && res.data?.profile) {
            setProfile(res.data.profile);
          } else {
            setError(res.message || "Unable to load profile details.");
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading admin profile detail:", err);
          setError("Failed to load profile details from server.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDetail();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      isMounted = false;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileId, onClose]);

  if (!profileId) return null;



  const statusColors = getStatusBadgeColor(profile?.profileStatus || "");

  return (
    <div
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
          maxWidth: "880px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
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
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                backgroundColor: "rgba(123, 17, 35, 0.08)",
                color: "var(--color-maroon)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "1.125rem",
              }}
            >
              {profile?.personalDetails?.firstName
                ? profile.personalDetails.firstName.charAt(0).toUpperCase()
                : "P"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    margin: 0,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {profile?.personalDetails
                    ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
                    : "Profile Inspection"}
                </h3>
                {profile && (
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
                    {profile.profileStatus}
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "2px" }}>
                ID: {profileId} &bull; Completion: {profile?.completionPercentage ?? 0}%
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {profile && profile.profileStatus !== "ACTIVE" && (
              <button
                type="button"
                id="publish-profile-detail-button"
                onClick={() => setIsPublishConfirmOpen(true)}
                disabled={profile.completionPercentage < 100}
                title={
                  profile.completionPercentage < 100
                    ? "Profile must be 100% complete before publishing"
                    : "Activate and publish this matrimonial profile to Matches"
                }
                style={{
                  backgroundColor:
                    profile.completionPercentage < 100
                      ? "#E5E7EB"
                      : "#047857",
                  color:
                    profile.completionPercentage < 100
                      ? "#9CA3AF"
                      : "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor:
                    profile.completionPercentage < 100
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  minHeight: "40px",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (profile.completionPercentage >= 100) {
                    e.currentTarget.style.backgroundColor = "#065F46";
                  }
                }}
                onMouseLeave={(e) => {
                  if (profile.completionPercentage >= 100) {
                    e.currentTarget.style.backgroundColor = "#047857";
                  }
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>Activate &amp; Publish</span>
              </button>
            )}

            {profile && profile.profileStatus === "ACTIVE" && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: "#ECFDF5",
                  color: "#047857",
                  border: "1px solid #A7F3D0",
                  borderRadius: "8px",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  minHeight: "40px",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Published in Matches</span>
              </div>
            )}

            {profile && (
              <button
                id="edit-profile-button"
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  backgroundColor: "var(--color-maroon)",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  minHeight: "40px",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#600D1B")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-maroon)")}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            )}

            <button
              id="close-detail-modal-button"
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
        </div>

        {publishMessage && (
          <div
            role="alert"
            style={{
              padding: "10px 24px",
              fontSize: "0.8125rem",
              fontWeight: 500,
              backgroundColor: publishMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
              color: publishMessage.type === "success" ? "#047857" : "#B91C1C",
              borderBottom: `1px solid ${publishMessage.type === "success" ? "#A7F3D0" : "#FECACA"}`,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{publishMessage.text}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "#FFFFFF",
            overflowX: "auto",
            padding: "0 16px",
          }}
        >
          {(
            [
              { key: "overview", label: "Overview & Personal" },
              { key: "religion", label: "Religion & Community" },
              { key: "career", label: "Education & Career" },
              { key: "preferences", label: "Partner Preferences" },
              { key: "photos", label: `Photos (${profile?.photos.length || 0})` },
              { key: "account", label: "Account Info" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 16px",
                fontSize: "0.8125rem",
                fontWeight: activeTab === tab.key ? 700 : 500,
                color: activeTab === tab.key ? "var(--color-maroon)" : "var(--color-text-secondary)",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid var(--color-maroon)" : "2px solid transparent",
                background: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
                minHeight: "44px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
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
              <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>Loading profile data...</p>
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
          ) : profile ? (
            <div>
              {/* Tab 1: Overview & Personal Details */}
              {activeTab === "overview" && (
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--color-maroon)" }}>
                    Personal Information
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      backgroundColor: "#FCFAF7",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Full Name</span>
                      <strong style={{ fontSize: "0.9375rem" }}>
                        {profile.personalDetails ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}` : "Not populated"}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Gender</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.personalDetails?.gender || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Age / DOB</span>
                      <strong style={{ fontSize: "0.9375rem" }}>
                        {profile.personalDetails?.dateOfBirth
                          ? `${calculateAge(profile.personalDetails.dateOfBirth)} yrs (${new Date(profile.personalDetails.dateOfBirth).toLocaleDateString()})`
                          : "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Height</span>
                      <strong style={{ fontSize: "0.9375rem" }}>
                        {profile.personalDetails?.heightCm ? `${profile.personalDetails.heightCm} cm` : "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Marital Status</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.personalDetails?.maritalStatus || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Location</span>
                      <strong style={{ fontSize: "0.9375rem" }}>
                        {profile.personalDetails?.city || "Unknown"}, {profile.personalDetails?.state || "Unknown"}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Mother Tongue</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.personalDetails?.motherTongue?.name || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Created For</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.profileCreatedFor || "MYSELF"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Religion & Community */}
              {activeTab === "religion" && (
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--color-maroon)" }}>
                    Religious &amp; Social Background
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      backgroundColor: "#FCFAF7",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Religion</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.religion?.religion?.name || profile.religion?.customReligion || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Community</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.religion?.community?.name || profile.religion?.customCommunity || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Sub-Community</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.religion?.subCommunity?.name || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Caste / Sub-Caste</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.religion?.caste?.name || profile.religion?.subCaste?.name || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Gotra</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.religion?.gotra?.name || "Not Specified"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Manglik Status</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.religion?.manglik || "NOT_APPLICABLE"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Education & Career */}
              {activeTab === "career" && (
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--color-maroon)" }}>
                    Education &amp; Professional Career
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      backgroundColor: "#FCFAF7",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Highest Education</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.education?.education?.name || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Institution</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.education?.institutionName || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Employment Status</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.career?.employmentStatus?.name || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Occupation</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.career?.occupation?.name || "N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Company Name</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.career?.companyName || "Confidential / N/A"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Annual Income Range</span>
                      <strong style={{ fontSize: "0.9375rem" }}>{profile.career?.annualIncomeRange || "PREFER_NOT_TO_SAY"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Partner Preferences */}
              {activeTab === "preferences" && (
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--color-maroon)" }}>
                    Desired Partner Criteria
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      backgroundColor: "#FCFAF7",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Preferred Age Range</span>
                      <strong style={{ fontSize: "0.9375rem" }}>
                        {profile.partnerPreference?.minAge ?? "Any"} - {profile.partnerPreference?.maxAge ?? "Any"} yrs
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Preferred Height Range</span>
                      <strong style={{ fontSize: "0.9375rem" }}>
                        {profile.partnerPreference?.minHeightCm ?? "Any"} - {profile.partnerPreference?.maxHeightCm ?? "Any"} cm
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Religions Selected</span>
                      <strong style={{ fontSize: "0.9375rem" }}>
                        {profile.partnerPreference?.religions?.length
                          ? profile.partnerPreference.religions.map((r) => r.religion.name).join(", ")
                          : "Any / Open"}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Communities Selected</span>
                      <strong style={{ fontSize: "0.9375rem" }}>
                        {profile.partnerPreference?.communities?.length
                          ? profile.partnerPreference.communities.map((c) => c.community.name).join(", ")
                          : "Any / Open"}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Photos */}
              {activeTab === "photos" && (
                <AdminPhotoUploadSection
                  userId={profile.user.id}
                  profileId={profile.id}
                  photos={profile.photos}
                  onPhotosUpdated={(newPhotos) => {
                    setProfile((prev) => (prev ? { ...prev, photos: newPhotos } : null));
                  }}
                  onProfileUpdated={(newCompletion) => {
                    setProfile((prev) =>
                      prev ? { ...prev, completionPercentage: newCompletion } : null
                    );
                  }}
                />
              )}

              {/* Tab 6: Account Information */}
              {activeTab === "account" && (
                <div>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 16px 0", color: "var(--color-maroon)" }}>
                    Account Identity &amp; Lifecycle
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "16px",
                      backgroundColor: "#FCFAF7",
                      padding: "16px",
                      borderRadius: "10px",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>User ID</span>
                      <strong style={{ fontSize: "0.8125rem", wordBreak: "break-all" }}>{profile.user.id}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Registered Email</span>
                      <strong style={{ fontSize: "0.875rem" }}>{profile.user.email || "None"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Phone Number</span>
                      <strong style={{ fontSize: "0.875rem" }}>{profile.user.phone || "None"}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>User Account Status</span>
                      <strong style={{ fontSize: "0.875rem" }}>{profile.user.status}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>User Role</span>
                      <strong style={{ fontSize: "0.875rem" }}>{profile.user.role}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Email Verified At</span>
                      <strong style={{ fontSize: "0.8125rem" }}>
                        {profile.user.emailVerifiedAt ? new Date(profile.user.emailVerifiedAt).toLocaleString() : "Not Verified"}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Registration Date</span>
                      <strong style={{ fontSize: "0.8125rem" }}>{new Date(profile.user.createdAt).toLocaleString()}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", display: "block" }}>Profile Created Date</span>
                      <strong style={{ fontSize: "0.8125rem" }}>{new Date(profile.createdAt).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
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
            Read-only administrative inspection view. Profile adjustments will be enabled in subsequent administration phases.
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

      {isEditModalOpen && profile && (
        <AdminProfileEditModal
          profileId={profile.id}
          initialProfile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdated={(updated) => {
            setProfile(updated);
          }}
        />
      )}

      {/* Activate & Publish Profile Confirmation Modal */}
      {isPublishConfirmOpen && profile && (
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
                id="confirm-publish-profile-detail-button"
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
