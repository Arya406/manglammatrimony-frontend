"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { AdminProfileDetailPhoto } from "@/types/admin";
import { uploadAdminProfilePhoto, getAdminProfileDetail } from "@/lib/api/admin";

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

interface AdminPhotoUploadSectionProps {
  userId: string;
  profileId?: string;
  photos?: AdminProfileDetailPhoto[];
  onPhotosUpdated?: (photos: AdminProfileDetailPhoto[]) => void;
  onProfileUpdated?: (completionPercentage: number) => void;
  title?: string;
}

export function AdminPhotoUploadSection({
  userId,
  profileId,
  photos: initialPhotos,
  onPhotosUpdated,
  onProfileUpdated,
  title = "Profile Photos",
}: AdminPhotoUploadSectionProps) {
  const [internalPhotos, setInternalPhotos] = useState<AdminProfileDetailPhoto[]>(initialPhotos || []);
  const photos = initialPhotos !== undefined ? initialPhotos : internalPhotos;
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialPhotos === undefined && profileId) {
      let isMounted = true;
      getAdminProfileDetail(profileId)
        .then((res) => {
          if (isMounted && res.success && res.data?.profile?.photos) {
            setInternalPhotos(res.data.profile.photos);
          }
        })
        .catch((err) => {
          console.error("Error fetching photos for AdminPhotoUploadSection:", err);
        });
      return () => {
        isMounted = false;
      };
    }
  }, [initialPhotos, profileId]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
    };
  }, [stagedFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalError(null);
    setGlobalSuccess(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newStaged: StagedFile[] = [];
    const maxPhotosAllowed = 6;
    const currentTotal = photos.length + stagedFiles.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (currentTotal + newStaged.length >= maxPhotosAllowed) {
        setGlobalError(
          `Maximum limit of ${maxPhotosAllowed} profile photos reached. You can only add up to ${maxPhotosAllowed - photos.length} more photos.`
        );
        break;
      }

      // 5MB pre-check
      if (file.size > 5 * 1024 * 1024) {
        setGlobalError(`"${file.name}" exceeds the maximum allowed size of 5 MB.`);
        continue;
      }

      const previewUrl = URL.createObjectURL(file);
      newStaged.push({
        id: `staged_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`,
        file,
        previewUrl,
        status: "pending",
      });
    }

    setStagedFiles((prev) => [...prev, ...newStaged]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveStaged = (id: string) => {
    setStagedFiles((prev) => {
      const item = prev.find((sf) => sf.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((sf) => sf.id !== id);
    });
  };

  const handleUploadSingle = async (stagedItem: StagedFile) => {
    // Mark uploading
    setStagedFiles((prev) =>
      prev.map((sf) =>
        sf.id === stagedItem.id ? { ...sf, status: "uploading", errorMessage: undefined } : sf
      )
    );

    try {
      const res = await uploadAdminProfilePhoto(userId, stagedItem.file);

      if (res.success && res.data?.photo) {
        const newPhoto = res.data.photo;
        const currentList = photos;
        const updatedList = newPhoto.photoType === "PRIMARY"
          ? currentList.map((p) => ({ ...p, photoType: "ADDITIONAL" as const, isPrimary: false }))
          : [...currentList];
        const finalList = [...updatedList, newPhoto];

        setInternalPhotos(finalList);
        onPhotosUpdated?.(finalList);

        if (res.data.profile?.completionPercentage !== undefined) {
          onProfileUpdated?.(res.data.profile.completionPercentage);
        }

        // Mark success and remove after short delay
        setStagedFiles((prev) =>
          prev.map((sf) => (sf.id === stagedItem.id ? { ...sf, status: "success" } : sf))
        );

        setTimeout(() => {
          setStagedFiles((prev) => {
            const item = prev.find((sf) => sf.id === stagedItem.id);
            if (item) URL.revokeObjectURL(item.previewUrl);
            return prev.filter((sf) => sf.id !== stagedItem.id);
          });
        }, 1200);

        setGlobalSuccess("Photo uploaded and approved successfully.");
      } else {
        const errorCode = (res as { code?: string }).code;
        const errorMsg =
          errorCode === "PHOTO_LIMIT_REACHED"
            ? "Maximum limit of 6 photos reached for this profile."
            : errorCode === "FILE_TOO_LARGE"
            ? "File exceeds maximum size of 5 MB."
            : errorCode === "UNSUPPORTED_IMAGE_TYPE"
            ? "Unsupported file type. Please select a valid JPEG, PNG, WebP, or HEIC image."
            : res.message || "Failed to upload photo.";

        setStagedFiles((prev) =>
          prev.map((sf) =>
            sf.id === stagedItem.id ? { ...sf, status: "error", errorMessage: errorMsg } : sf
          )
        );
      }
    } catch (err) {
      console.error("[ADMIN PHOTO UPLOAD ERROR]:", err);
      setStagedFiles((prev) =>
        prev.map((sf) =>
          sf.id === stagedItem.id
            ? { ...sf, status: "error", errorMessage: "Network error during photo upload." }
            : sf
        )
      );
    }
  };

  const handleUploadAll = async () => {
    const pendingItems = stagedFiles.filter((sf) => sf.status === "pending" || sf.status === "error");
    if (pendingItems.length === 0 || isUploading) return;

    setIsUploading(true);
    setGlobalError(null);
    setGlobalSuccess(null);

    for (const item of pendingItems) {
      await handleUploadSingle(item);
    }

    setIsUploading(false);
  };

  const handleClearAllStaged = () => {
    stagedFiles.forEach((sf) => URL.revokeObjectURL(sf.previewUrl));
    setStagedFiles([]);
    setGlobalError(null);
  };

  const pendingCount = stagedFiles.filter((sf) => sf.status === "pending" || sf.status === "error").length;

  return (
    <div
      style={{
        backgroundColor: "#FCFAF7",
        border: "1px solid var(--color-border)",
        borderRadius: "12px",
        padding: "18px 20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {title} ({photos.length}/6)
          </h4>
          <span
            style={{
              fontSize: "0.6875rem",
              color: "var(--color-text-muted)",
              backgroundColor: "#EFE8E9",
              padding: "2px 8px",
              borderRadius: "10px",
              fontWeight: 600,
            }}
          >
            WebP Optimized &bull; Instant Approval
          </span>
        </div>

        {/* Action button */}
        {photos.length < 6 && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept=".jpg,.jpeg,.png,.webp,.heic,.heif,image/jpeg,image/png,image/webp,image/heic,image/heif"
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                backgroundColor: "var(--color-maroon)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: isUploading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                minHeight: "36px",
                boxShadow: "0 1px 3px rgba(123, 17, 35, 0.2)",
                transition: "background-color 0.15s",
                opacity: isUploading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isUploading) e.currentTarget.style.backgroundColor = "#620D1C";
              }}
              onMouseLeave={(e) => {
                if (!isUploading) e.currentTarget.style.backgroundColor = "var(--color-maroon)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              + Add Photos
            </button>
          </div>
        )}
      </div>

      {/* Global Alerts */}
      {globalError && (
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
          <span>{globalError}</span>
          <button
            onClick={() => setGlobalError(null)}
            style={{ background: "none", border: "none", color: "#991B1B", cursor: "pointer", fontSize: "1rem" }}
          >
            &times;
          </button>
        </div>
      )}

      {globalSuccess && (
        <div
          style={{
            backgroundColor: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: "8px",
            padding: "10px 14px",
            color: "#047857",
            fontSize: "0.8125rem",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{globalSuccess}</span>
          <button
            onClick={() => setGlobalSuccess(null)}
            style={{ background: "none", border: "none", color: "#047857", cursor: "pointer", fontSize: "1rem" }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Staging / Pre-upload Area */}
      {stagedFiles.length > 0 && (
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "2px dashed #C59B27",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#92400E" }}>
              Pending Uploads ({stagedFiles.length})
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={handleClearAllStaged}
                disabled={isUploading}
                style={{
                  background: "none",
                  border: "1px solid var(--color-border)",
                  borderRadius: "4px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  cursor: isUploading ? "not-allowed" : "pointer",
                }}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={isUploading || pendingCount === 0}
                style={{
                  backgroundColor: "#C59B27",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 12px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: isUploading || pendingCount === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: isUploading || pendingCount === 0 ? 0.6 : 1,
                }}
              >
                {isUploading ? "Uploading..." : `Upload All (${pendingCount})`}
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
              gap: "12px",
            }}
          >
            {stagedFiles.map((sf) => (
              <div
                key={sf.id}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "#FCFAF7",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ position: "relative", width: "100%", height: "110px", backgroundColor: "#EFE8E9" }}>
                  <Image
                    src={sf.previewUrl}
                    alt={sf.file.name}
                    fill
                    sizes="130px"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />

                  {/* Cancel / Remove Button */}
                  {sf.status !== "uploading" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStaged(sf.id)}
                      aria-label="Remove image"
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        lineHeight: 1,
                      }}
                    >
                      &times;
                    </button>
                  )}

                  {/* Status Overlay */}
                  {sf.status === "uploading" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                      }}
                    >
                      Uploading...
                    </div>
                  )}

                  {sf.status === "success" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(4, 120, 87, 0.75)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      Uploaded ✓
                    </div>
                  )}
                </div>

                <div style={{ padding: "6px 8px", fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                  <div
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontWeight: 600,
                    }}
                    title={sf.file.name}
                  >
                    {sf.file.name}
                  </div>
                  <div style={{ color: "var(--color-text-muted)" }}>
                    {Math.round(sf.file.size / 1024)} KB
                  </div>

                  {sf.status === "error" && (
                    <div style={{ marginTop: "4px" }}>
                      <div style={{ color: "#991B1B", fontSize: "0.625rem", lineHeight: 1.2 }}>
                        {sf.errorMessage || "Failed"}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUploadSingle(sf)}
                        disabled={isUploading}
                        style={{
                          marginTop: "4px",
                          backgroundColor: "var(--color-maroon)",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "3px",
                          padding: "2px 6px",
                          fontSize: "0.625rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {sf.status === "pending" && !isUploading && (
                    <button
                      type="button"
                      onClick={() => handleUploadSingle(sf)}
                      style={{
                        marginTop: "4px",
                        backgroundColor: "rgba(123, 17, 35, 0.08)",
                        color: "var(--color-maroon)",
                        border: "1px solid rgba(123, 17, 35, 0.2)",
                        borderRadius: "3px",
                        padding: "2px 6px",
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        width: "100%",
                      }}
                    >
                      Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Photos Grid */}
      {photos.length === 0 && stagedFiles.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "24px 16px",
            backgroundColor: "#FFFFFF",
            border: "1px dashed var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text-muted)",
          }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>📷</div>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
            No profile photographs uploaded yet.
          </div>
          <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
            Click &ldquo;+ Add Photos&rdquo; above to attach trusted photographs to this profile.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: "12px",
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#FFFFFF",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "150px", backgroundColor: "#EFE8E9" }}>
                <Image
                  src={photo.url}
                  alt={photo.originalFileName || "Profile Photo"}
                  fill
                  sizes="150px"
                  style={{ objectFit: "cover" }}
                  unoptimized
                />
                {(photo.photoType === "PRIMARY" || photo.isPrimary) && (
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      left: "6px",
                      backgroundColor: "var(--color-maroon)",
                      color: "#FFFFFF",
                      fontSize: "0.625rem",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    PRIMARY
                  </span>
                )}
                <span
                  style={{
                    position: "absolute",
                    bottom: "6px",
                    right: "6px",
                    backgroundColor:
                      photo.moderationStatus === "APPROVED"
                        ? "rgba(4, 120, 87, 0.9)"
                        : photo.moderationStatus === "REJECTED"
                        ? "rgba(185, 28, 28, 0.9)"
                        : "rgba(180, 83, 9, 0.9)",
                    color: "#FFFFFF",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {photo.moderationStatus}
                </span>
              </div>

              <div style={{ padding: "8px 10px", fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                <div style={{ fontWeight: 600, color: "#047857" }}>
                  ✓ Approved
                </div>
                <div style={{ color: "var(--color-text-muted)", marginTop: "2px" }}>
                  {Math.round(photo.fileSize / 1024)} KB
                  {photo.width && photo.height ? ` • ${photo.width}x${photo.height}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
