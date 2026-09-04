"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfilePhotoItem } from "@/types/profile";
import {
  getPhotos,
  uploadPhoto,
  deletePhoto,
  setPrimaryPhoto,
  reorderPhotos,
  devApprovePhoto,
  resolvePhotoUrl,
} from "@/lib/api/profile";
import { OnboardingProgress } from "./OnboardingProgress";
import styles from "./PhotoUpload.module.css";

const MAX_PHOTOS = 6;

type UploadStatus = "IDLE" | "PROCESSING" | "UPLOADING" | "SUCCESS" | "ERROR";

export function PhotoUpload() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo State
  const [photos, setPhotos] = useState<ProfilePhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("IDLE");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Delete Confirmation Modal State
  const [photoToDelete, setPhotoToDelete] = useState<ProfilePhotoItem | null>(null);

  // Errors & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // 1. Initial Load: Fetch existing photos from database
  useEffect(() => {
    let isMounted = true;

    async function loadPhotos() {
      setIsLoading(true);
      try {
        const response = await getPhotos();
        if (isMounted && response.success && response.data) {
          setPhotos(response.data.photos || []);
        }
      } catch (err) {
        console.error("Error fetching photos:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Handle File Selection -> Automatic Image Processing & Normalization
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if needed
    e.target.value = "";

    await handleImageSelection(file);
  };

  const handleImageSelection = async (rawFile: File) => {
    setErrorMessage(null);
    setValidationError(null);

    // Check limit
    if (photos.length >= MAX_PHOTOS) {
      setErrorMessage(`You can only upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    // Send raw selected file directly to backend for authoritative server-side processing
    setUploadStatus("UPLOADING");

    try {
      const response = await uploadPhoto(rawFile);

      if (!response.success) {
        if (response.code === "UNAUTHORIZED") {
          setErrorMessage("Your session has expired. Please log in again.");
          setTimeout(() => router.push("/login"), 1500);
          setUploadStatus("IDLE");
          return;
        }

        let userMsg = response.message || "We couldn't process this photo. Please try another image.";
        if (response.code === "FILE_TOO_LARGE" || response.code === "IMAGE_TOO_LARGE") {
          userMsg = "This image is too large. Please choose a photo up to 20MB.";
        } else if (response.code === "IMAGE_DIMENSIONS_TOO_LARGE") {
          userMsg = "This image resolution is too high. Please select a photo with lower resolution.";
        } else if (
          response.code === "INVALID_IMAGE" ||
          response.code === "UNSUPPORTED_FILE_TYPE" ||
          response.code === "UNSUPPORTED_IMAGE_FORMAT"
        ) {
          userMsg = "Please select a valid image (JPG, PNG, WebP, or HEIC).";
        } else if (response.code === "IMAGE_TOO_SMALL") {
          userMsg = "Image is too small. Please choose a photo with at least 150x150 pixels.";
        } else if (response.code === "PHOTO_LIMIT_REACHED") {
          userMsg = `You can only upload a maximum of ${MAX_PHOTOS} photos.`;
        }

        setUploadStatus("ERROR");
        setErrorMessage(userMsg);
        setTimeout(() => setUploadStatus("IDLE"), 4000);
        return;
      }

      // Success State
      setUploadStatus("SUCCESS");

      // Refresh photo list from backend
      const refreshRes = await getPhotos();
      if (refreshRes.success && refreshRes.data) {
        setPhotos(refreshRes.data.photos || []);
      } else if (response.data?.photo) {
        setPhotos((prev) => [...prev, response.data!.photo]);
      }

      // Transition back to idle after a moment
      setTimeout(() => {
        setUploadStatus("IDLE");
      }, 1500);
    } catch (err) {
      console.error("Photo upload error:", err);
      setUploadStatus("ERROR");
      setErrorMessage("Photo upload failed. Please try again.");
      setTimeout(() => setUploadStatus("IDLE"), 4000);
    }
  };

  // 3. Set Primary Photo
  const handleSetPrimary = async (photo: ProfilePhotoItem) => {
    if (photo.photoType === "PRIMARY" || photo.moderationStatus === "REJECTED") {
      return;
    }

    setErrorMessage(null);
    setActionLoadingId(photo.id);

    try {
      const response = await setPrimaryPhoto(photo.id);

      if (!response.success) {
        if (response.code === "PHOTO_REJECTED") {
          setErrorMessage("This photo cannot be used as your main photo.");
        } else {
          setErrorMessage(
            response.message || "We couldn't set this photo as primary. Please try again."
          );
        }
        return;
      }

      // Refresh list to update all photos' primary flags
      const refreshRes = await getPhotos();
      if (refreshRes.success && refreshRes.data) {
        setPhotos(refreshRes.data.photos || []);
      }
    } catch (err) {
      console.error("Set primary error:", err);
      setErrorMessage("We couldn't update your primary photo. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 4. Delete Photo
  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    const photoId = photoToDelete.id;
    setPhotoToDelete(null);
    setActionLoadingId(photoId);
    setErrorMessage(null);

    try {
      const response = await deletePhoto(photoId);

      if (!response.success) {
        setErrorMessage(response.message || "We couldn't remove your photo. Please try again.");
        return;
      }

      // Refresh list
      const refreshRes = await getPhotos();
      if (refreshRes.success && refreshRes.data) {
        setPhotos(refreshRes.data.photos || []);
      } else {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (err) {
      console.error("Delete photo error:", err);
      setErrorMessage("We couldn't remove your photo. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. Accessible Reorder Controls (Move Left / Move Right)
  const handleMove = async (currentIndex: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= photos.length) return;

    const reordered = [...photos];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    setPhotos(reordered);
    setIsReordering(true);

    try {
      const photoIds = reordered.map((p) => p.id);
      const res = await reorderPhotos(photoIds);
      if (res.success && res.data?.photos) {
        setPhotos(res.data.photos);
      }
    } catch (err) {
      console.error("Reorder error:", err);
      // Revert on error
      const refreshRes = await getPhotos();
      if (refreshRes.success && refreshRes.data) {
        setPhotos(refreshRes.data.photos || []);
      }
    } finally {
      setIsReordering(false);
    }
  };

  // 6. Development-Only Photo Approval
  const isDevApprovalAllowed =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_PHOTO_APPROVAL_ENABLED === "true";

  const handleDevApprove = async (photo: ProfilePhotoItem) => {
    if (photo.moderationStatus === "APPROVED") return;

    setErrorMessage(null);
    setActionLoadingId(photo.id);

    try {
      const response = await devApprovePhoto(photo.id);

      if (!response.success) {
        setErrorMessage(
          response.message || "Failed to approve photo for testing."
        );
        return;
      }

      // Refresh list to update all photos' moderation status
      const refreshRes = await getPhotos();
      if (refreshRes.success && refreshRes.data) {
        setPhotos(refreshRes.data.photos || []);
      } else {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photo.id
              ? { ...p, moderationStatus: "APPROVED" as const }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Dev approve error:", err);
      setErrorMessage("Failed to approve photo for testing.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 7. Form Submission & Continue
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setValidationError(null);

    if (photos.length === 0) {
      setValidationError("Please add at least one photo to continue.");
      return;
    }

    if (isEditMode) {
      router.push("/onboarding/review");
      return;
    }

    // Navigate to Step 6: Partner Preferences
    router.push("/onboarding/partner-preferences");
  };

  // Drag and Drop Handlers for Dropzone
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (photos.length < MAX_PHOTOS && uploadStatus === "IDLE") {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (photos.length >= MAX_PHOTOS || uploadStatus !== "IDLE") return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleImageSelection(file);
    }
  };

  const isBusy = uploadStatus === "PROCESSING" || uploadStatus === "UPLOADING";

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        {/* Step Progress Minimal Header or Edit Mode Badge */}
        {isEditMode ? (
          <div className={styles.editModeBadge}>
            <span className={styles.goldSparkle}>✦</span>
            <span>EDIT PROFILE • PHOTOS</span>
          </div>
        ) : (
          <div className={styles.progressHeader}>
            <OnboardingProgress currentStep={5} totalSteps={6} />
          </div>
        )}

        {/* Main Heading & Subtitle */}
        <div className={styles.headerGroup}>
          <h1 className={styles.title}>
            {isEditMode ? "Manage Photos" : "Add your photos"}
          </h1>
          <p className={styles.subtitle}>
            {isEditMode
              ? "Upload, set primary photo, or manage existing photos. Changes are saved automatically."
              : "Profiles with clear photos get better responses and more meaningful connections."}
          </p>
        </div>

        {/* Short Helper Copy */}
        <div className={styles.instructionBanner}>
          <span>
            Add at least one clear photo of yourself. You can add up to{" "}
            {MAX_PHOTOS} photos.
          </span>
        </div>

        {/* Accessible Alert / Error Messages */}
        {(errorMessage || validationError) && (
          <div className={styles.errorAlert} role="alert" aria-live="assertive">
            <svg
              className={styles.errorIcon}
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{errorMessage || validationError}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileChange}
          className={styles.hiddenFileInput}
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Main Content Area */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading your photos...</p>
          </div>
        ) : (
          <div className={styles.contentSection}>
            {/* Upload Area / Dropzone (Shown when under limit) */}
            {photos.length < MAX_PHOTOS && (
              <div
                className={[
                  styles.dropzone,
                  isDragOver ? styles.dropzoneActive : "",
                  isBusy ? styles.dropzoneBusy : "",
                  uploadStatus === "SUCCESS" ? styles.dropzoneSuccess : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isBusy && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (!isBusy) fileInputRef.current?.click();
                  }
                }}
                aria-label="Add photo"
              >
                <div className={styles.dropzoneIconCircle}>
                  {uploadStatus === "PROCESSING" || uploadStatus === "UPLOADING" ? (
                    <div className={styles.spinnerSmall} />
                  ) : uploadStatus === "SUCCESS" ? (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7B1123"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  )}
                </div>

                <div className={styles.dropzoneText}>
                  <p className={styles.dropzoneTitle}>
                    {uploadStatus === "PROCESSING"
                      ? "Preparing your photo..."
                      : uploadStatus === "UPLOADING"
                      ? "Uploading your photo..."
                      : uploadStatus === "SUCCESS"
                      ? "Photo ready ✓"
                      : photos.length === 0
                      ? "Add your first photo"
                      : "Add another photo"}
                  </p>
                  <p className={styles.dropzoneSubtitle}>
                    {uploadStatus === "PROCESSING"
                      ? "Optimizing resolution & square framing"
                      : uploadStatus === "UPLOADING"
                      ? "Saving securely to your profile"
                      : uploadStatus === "SUCCESS"
                      ? "Your photo has been saved to your profile"
                      : "Drag & drop your photo here or click to browse"}
                  </p>
                  {uploadStatus === "IDLE" && (
                    <span className={styles.dropzoneHelper}>
                      JPG, PNG, WebP or HEIC (up to 20MB)
                    </span>
                  )}
                </div>

                {uploadStatus === "IDLE" && (
                  <button
                    type="button"
                    className={styles.choosePhotoButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Choose Photo
                  </button>
                )}
              </div>
            )}

            {/* Photo Limit Notice (When 6/6 photos added) */}
            {photos.length >= MAX_PHOTOS && (
              <div className={styles.limitBanner}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={styles.limitIcon}
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>You&apos;ve added the maximum of {MAX_PHOTOS} photos.</span>
              </div>
            )}

            {/* Photos Grid Header */}
            {photos.length > 0 && (
              <div className={styles.gridHeader}>
                <span className={styles.gridTitle}>Your Photos</span>
                <span className={styles.gridCount}>
                  {photos.length} / {MAX_PHOTOS}
                </span>
              </div>
            )}

            {/* Photo Grid */}
            {photos.length > 0 && (
              <div className={styles.photoGrid}>
                {photos.map((photo, index) => {
                  const isPrimary = photo.photoType === "PRIMARY";
                  const isActionLoading = actionLoadingId === photo.id;

                  return (
                    <div
                      key={photo.id}
                      className={[
                        styles.photoCard,
                        isPrimary ? styles.photoCardPrimary : "",
                        photo.moderationStatus === "REJECTED"
                          ? styles.photoCardRejected
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {/* Image Preview */}
                      <div className={styles.imageContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={resolvePhotoUrl(photo.url)}
                          alt={`Profile photo ${index + 1}${
                            isPrimary ? " (Main Photo)" : ""
                          }`}
                          className={styles.photoImage}
                          loading="lazy"
                        />

                        {/* Top Badges */}
                        <div className={styles.badgeOverlay}>
                          {isPrimary && (
                            <span className={styles.primaryBadge}>
                              ★ Main Photo
                            </span>
                          )}

                          {/* Moderation Status Pill */}
                          <span
                            className={[
                              styles.moderationPill,
                              photo.moderationStatus === "PENDING"
                                ? styles.statusPending
                                : photo.moderationStatus === "APPROVED"
                                ? styles.statusApproved
                                : styles.statusRejected,
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {photo.moderationStatus === "PENDING"
                              ? "Under review"
                              : photo.moderationStatus === "APPROVED"
                              ? "Approved"
                              : "Changes requested"}
                          </span>
                        </div>
                      </div>

                      {/* Photo Actions Footer */}
                      <div className={styles.cardActions}>
                        {/* Primary Button */}
                        {!isPrimary && photo.moderationStatus !== "REJECTED" && (
                          <button
                            type="button"
                            className={styles.actionBtnText}
                            onClick={() => handleSetPrimary(photo)}
                            disabled={isActionLoading || isBusy}
                            title="Set as your main profile photo"
                          >
                            Set Main
                          </button>
                        )}

                        {isPrimary && (
                          <span className={styles.primaryLabel}>
                            Main Photo
                          </span>
                        )}

                        {/* Order Controls & Delete Button */}
                        <div className={styles.actionGroupRight}>
                          {photos.length > 1 && (
                            <>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => handleMove(index, "left")}
                                disabled={
                                  index === 0 ||
                                  isReordering ||
                                  isActionLoading ||
                                  isBusy
                                }
                                title="Move left"
                                aria-label="Move photo left"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => handleMove(index, "right")}
                                disabled={
                                  index === photos.length - 1 ||
                                  isReordering ||
                                  isActionLoading ||
                                  isBusy
                                }
                                title="Move right"
                                aria-label="Move photo right"
                              >
                                →
                              </button>
                            </>
                          )}

                          {/* Delete Button */}
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => setPhotoToDelete(photo)}
                            disabled={isActionLoading || isBusy}
                            title="Delete photo"
                            aria-label="Delete photo"
                          >
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0v-7a.75.75 0 0 1 .75-.75Zm3.59 0a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-1.5 0v-7a.75.75 0 0 1 .75-.75Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Dev-Only Photo Approval Button (Only shown in development when flag is true and photo is PENDING) */}
                      {isDevApprovalAllowed && photo.moderationStatus === "PENDING" && (
                        <div className={styles.devActionContainer}>
                          <button
                            type="button"
                            className={styles.devApproveBtn}
                            onClick={() => handleDevApprove(photo)}
                            disabled={isActionLoading || isBusy}
                            title="Approve this photo immediately for development testing"
                          >
                            <span className={styles.devBadge}>DEV</span> Approve for Testing
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Privacy & Safety Note */}
            <div className={styles.privacyNote}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C59B27"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>
                Your photos are kept secure and visible only to verified Manglam
                Matrimony members.
              </span>
            </div>

            {/* Divider */}
            <div className={styles.divider} aria-hidden="true" />

            {/* Navigation Buttons Area */}
            <form onSubmit={handleContinue} className={styles.actionsForm}>
              {isEditMode ? (
                <div className={styles.buttonGroup}>
                  <Link
                    href="/onboarding/review"
                    className={styles.backButton}
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={photos.length === 0 || isBusy}
                    className={[
                      styles.continueButton,
                      photos.length > 0 && !isBusy
                        ? styles.continueActive
                        : styles.continueDisabled,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>Save & Return to Summary</span>
                  </button>
                </div>
              ) : (
                <div className={styles.buttonGroup}>
                  <Link
                    href="/onboarding/education-career"
                    className={styles.backButton}
                  >
                    ← Back
                  </Link>

                  <button
                    type="submit"
                    disabled={photos.length === 0 || isBusy}
                    className={[
                      styles.continueButton,
                      photos.length > 0 && !isBusy
                        ? styles.continueActive
                        : styles.continueDisabled,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>Continue →</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {photoToDelete && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Delete this photo?</h3>
            <p className={styles.modalMessage}>
              Are you sure you want to remove this photo? You can upload a new
              photo anytime.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setPhotoToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalDeleteBtn}
                onClick={confirmDeletePhoto}
              >
                Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
