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
  resolvePhotoUrl,
} from "@/lib/api/profile";
import { OnboardingProgress } from "./OnboardingProgress";
import styles from "./PhotoUpload.module.css";

const MAX_PHOTOS = 6;

type UploadStatus = "IDLE" | "UPLOADING" | "SUCCESS" | "ERROR";

export function PhotoUpload() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo State
  const [photos, setPhotos] = useState<ProfilePhotoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("IDLE");
  const [uploadProgressText, setUploadProgressText] = useState("Uploading photo...");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [photoToDelete, setPhotoToDelete] = useState<ProfilePhotoItem | null>(null);

  // Drag & Drop State
  const [isDragOver, setIsDragOver] = useState(false);

  // User Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Initial Load: Fetch authoritative photos list from backend
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

  // 2. Keyboard listener for Escape to close delete modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && photoToDelete) {
        setPhotoToDelete(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [photoToDelete]);

  // 3. Multi-file selection change handler
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const selectedFiles = Array.from(fileList);
    // Reset input value so the user can re-select the same file if needed
    e.target.value = "";
    await uploadMultipleFiles(selectedFiles);
  };

  // 4. Multi-file sequential uploader with validation and backend refresh
  const uploadMultipleFiles = async (files: File[]) => {
    if (uploadStatus === "UPLOADING") return;
    setErrorMessage(null);
    setSuccessMessage(null);

    const availableSlots = MAX_PHOTOS - photos.length;
    if (availableSlots <= 0) {
      setErrorMessage(`You have already uploaded the maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    let filesToUpload = files;
    if (files.length > availableSlots) {
      setErrorMessage(
        `You can only add ${availableSlots} more photo${
          availableSlots === 1 ? "" : "s"
        }. Uploading the first ${availableSlots}.`
      );
      filesToUpload = files.slice(0, availableSlots);
    }

    setUploadStatus("UPLOADING");

    const uploadErrors: string[] = [];
    let successfulUploads = 0;

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setUploadProgressText(
        filesToUpload.length > 1
          ? `Uploading photo ${i + 1} of ${filesToUpload.length}...`
          : "Uploading photo..."
      );

      try {
        const response = await uploadPhoto(file);
        if (!response.success) {
          if (response.code === "UNAUTHORIZED") {
            setErrorMessage("Your session has expired. Please log in again.");
            setTimeout(() => router.push("/login"), 1500);
            setUploadStatus("IDLE");
            return;
          }

          let userMsg =
            response.message || `Failed to process "${file.name}". Please try another image.`;
          if (response.code === "FILE_TOO_LARGE" || response.code === "IMAGE_TOO_LARGE") {
            userMsg = `"${file.name}" is too large. Photos must be 20MB or less.`;
          } else if (response.code === "IMAGE_DIMENSIONS_TOO_LARGE") {
            userMsg = `"${file.name}" resolution is too high. Please select a photo with lower resolution.`;
          } else if (
            response.code === "INVALID_IMAGE" ||
            response.code === "UNSUPPORTED_FILE_TYPE" ||
            response.code === "UNSUPPORTED_IMAGE_FORMAT"
          ) {
            userMsg = `"${file.name}" is an unsupported format. Please upload JPG, PNG, WebP, or HEIC.`;
          } else if (response.code === "IMAGE_TOO_SMALL") {
            userMsg = `"${file.name}" is too small (minimum 150x150 pixels required).`;
          } else if (response.code === "PHOTO_LIMIT_REACHED") {
            userMsg = `You have reached the maximum allowed limit of ${MAX_PHOTOS} photos.`;
          }
          uploadErrors.push(userMsg);
        } else {
          successfulUploads++;
        }
      } catch (err) {
        console.error("Photo upload error:", err);
        uploadErrors.push(`Failed to upload "${file.name}". Please try again.`);
      }
    }

    // Always fetch authoritative latest photo list from backend
    try {
      const refreshRes = await getPhotos();
      if (refreshRes.success && refreshRes.data) {
        setPhotos(refreshRes.data.photos || []);
      }
    } catch (err) {
      console.error("Error refreshing photos after upload:", err);
    }

    if (uploadErrors.length > 0) {
      setUploadStatus("ERROR");
      setErrorMessage(uploadErrors.join(" "));
      setTimeout(() => setUploadStatus("IDLE"), 5000);
    } else {
      setUploadStatus("SUCCESS");
      setSuccessMessage(
        successfulUploads > 1
          ? `Successfully uploaded and approved ${successfulUploads} photos.`
          : "Photo uploaded and approved."
      );
      setTimeout(() => {
        setUploadStatus("IDLE");
        setSuccessMessage(null);
      }, 2000);
    }
  };

  // 5. Set Primary / Main Photo
  const handleSetPrimary = async (photo: ProfilePhotoItem) => {
    if (photo.photoType === "PRIMARY") return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setActionLoadingId(photo.id);

    try {
      const response = await setPrimaryPhoto(photo.id);
      if (!response.success) {
        setErrorMessage(
          response.message || "We couldn't set this photo as primary. Please try again."
        );
        return;
      }

      // Refresh authoritative photos list from backend
      const refreshRes = await getPhotos();
      if (refreshRes.success && refreshRes.data) {
        setPhotos(refreshRes.data.photos || []);
      }
      setSuccessMessage("Main photo updated successfully.");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error("Set primary error:", err);
      setErrorMessage("We couldn't update your primary photo. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6. Delete Photo with confirmation
  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    const photoId = photoToDelete.id;
    setPhotoToDelete(null);
    setActionLoadingId(photoId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await deletePhoto(photoId);
      if (!response.success) {
        setErrorMessage(response.message || "We couldn't remove your photo. Please try again.");
        return;
      }

      // Refresh authoritative photos list from backend
      const refreshRes = await getPhotos();
      if (refreshRes.success && refreshRes.data) {
        setPhotos(refreshRes.data.photos || []);
      } else {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
      setSuccessMessage("Photo removed successfully.");
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      console.error("Delete photo error:", err);
      setErrorMessage("We couldn't remove your photo. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 7. Form Submission / Continue Navigation
  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (photos.length === 0) {
      setErrorMessage("Please add at least one photo to continue.");
      return;
    }

    if (isEditMode) {
      router.push("/onboarding/review");
      return;
    }

    // Navigate to Step 6: Partner Preferences
    router.push("/onboarding/partner-preferences");
  };

  // 8. Drag and Drop Handlers
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
    if (photos.length >= MAX_PHOTOS || uploadStatus === "UPLOADING") return;

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      await uploadMultipleFiles(droppedFiles);
    }
  };

  const isBusy = uploadStatus === "UPLOADING";

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        {/* Header / Onboarding Progress */}
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

        {/* Heading & Subtitle */}
        <div className={styles.headerGroup}>
          <h1 className={styles.title}>
            {isEditMode ? "Manage Photos" : "Add your photos"}
          </h1>
          <p className={styles.subtitle}>
            {isEditMode
              ? "Upload, set your main photo, or manage existing photos. Changes save automatically."
              : "Profiles with clear photos receive significantly more meaningful responses."}
          </p>
        </div>

        {/* Informative Guidance Banner */}
        <div className={styles.instructionBanner}>
          <span>
            Upload up to {MAX_PHOTOS} photos. Your first photo will be your main profile photo.
          </span>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className={styles.errorAlert} role="alert" aria-live="assertive">
            <svg
              className={styles.alertIcon}
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
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className={styles.successAlert} role="status" aria-live="polite">
            <svg
              className={styles.alertIcon}
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Native Hidden Multi-File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFilesChange}
          className={styles.hiddenFileInput}
          aria-hidden="true"
          tabIndex={-1}
          disabled={isBusy || photos.length >= MAX_PHOTOS}
        />

        {/* Main Content Section */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading your photos...</p>
          </div>
        ) : (
          <div className={styles.contentSection}>
            {/* Grid Header with Redesigned Photo Count Pill */}
            <div className={styles.gridHeader}>
              <div className={styles.gridHeaderLeft}>
                <h2 className={styles.gridTitle}>Your Photos</h2>
                <span className={styles.gridSubtitle}>
                  {photos.length === 0
                    ? "Upload your first photo to get started"
                    : "Main photo is displayed to other members first"}
                </span>
              </div>
              <div
                className={styles.photoCountPill}
                aria-label={`${photos.length} of ${MAX_PHOTOS} photos uploaded`}
              >
                <span className={styles.countNumber}>{photos.length}</span>
                <span className={styles.countDivider}>/</span>
                <span className={styles.countMax}>{MAX_PHOTOS}</span>
                <span className={styles.countLabel}>photos</span>
              </div>
            </div>

            {/* Empty-State Upload Card (When photos.length === 0) */}
            {photos.length === 0 ? (
              <div
                className={[
                  styles.emptyUploadCard,
                  isDragOver ? styles.emptyUploadCardActive : "",
                  isBusy ? styles.emptyUploadCardBusy : "",
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
                aria-label="Upload photos"
              >
                <div className={styles.emptyUploadIconCircle}>
                  {isBusy ? (
                    <div className={styles.spinnerSmall} />
                  ) : (
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
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

                <div className={styles.emptyUploadContent}>
                  <p className={styles.emptyUploadTitle}>
                    {isBusy ? uploadProgressText : "Add your photos"}
                  </p>
                  <p className={styles.emptyUploadSubtitle}>
                    {isBusy
                      ? "Optimizing resolution and securely storing your photos..."
                      : "Drag & drop your photos here, or click to choose from your device"}
                  </p>
                  <span className={styles.emptyUploadHelper}>
                    Supports JPG, PNG, WebP or HEIC • Up to 20MB each
                  </span>
                </div>

                {!isBusy && (
                  <button
                    type="button"
                    className={styles.choosePhotosButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Choose Photos</span>
                  </button>
                )}
              </div>
            ) : (
              /* Photo Grid (When photos.length > 0) */
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
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {/* Image Preview Container */}
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

                        {/* Top Badges Overlay */}
                        <div className={styles.badgeOverlay}>
                          {isPrimary ? (
                            <span className={styles.mainPhotoOverlayBadge}>
                              <svg
                                width="11"
                                height="11"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path d="M8 1.5l1.9 4.2 4.6.4-3.5 3 1 4.5L8 11.3l-4 2.3 1-4.5-3.5-3 4.6-.4L8 1.5z" />
                              </svg>
                              <span>Main Photo</span>
                            </span>
                          ) : (
                            <span />
                          )}

                          {/* Subtle Brand Approved Status Pill */}
                          <span className={styles.approvedPill}>
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M3.5 8.5l3 3 6-6" />
                            </svg>
                            <span>Approved</span>
                          </span>
                        </div>
                      </div>

                      {/* Photo Card Footer & Actions */}
                      <div className={styles.cardFooter}>
                        <div className={styles.cardMeta}>
                          <p className={styles.cardTitle}>
                            {isPrimary ? "Main Photo" : `Photo ${index + 1}`}
                          </p>
                          <p className={styles.cardSubtitle}>
                            {isPrimary
                              ? "Primary profile photo"
                              : "Visible on your profile"}
                          </p>
                        </div>

                        <div className={styles.cardActions}>
                          {!isPrimary ? (
                            <button
                              type="button"
                              className={styles.setMainButton}
                              onClick={() => handleSetPrimary(photo)}
                              disabled={isActionLoading || isBusy}
                              aria-label={`Set Photo ${index + 1} as main photo`}
                              title="Set as main profile photo"
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M8 1.5l1.9 4.2 4.6.4-3.5 3 1 4.5L8 11.3l-4 2.3 1-4.5-3.5-3 4.6-.4L8 1.5z" />
                              </svg>
                              <span>Set as Main</span>
                            </button>
                          ) : (
                            <span className={styles.defaultBadge}>Default</span>
                          )}

                          <button
                            type="button"
                            className={styles.deleteIconButton}
                            onClick={() => setPhotoToDelete(photo)}
                            disabled={isActionLoading || isBusy}
                            aria-label={
                              isPrimary
                                ? "Delete main photo"
                                : `Delete photo ${index + 1}`
                            }
                            title="Delete photo"
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
                    </div>
                  );
                })}

                {/* Integrated Upload Tile in Grid (When 1 <= photos.length < MAX_PHOTOS) */}
                {photos.length < MAX_PHOTOS && (
                  <div
                    className={[
                      styles.uploadTile,
                      isDragOver ? styles.uploadTileActive : "",
                      isBusy ? styles.uploadTileBusy : "",
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
                    aria-label="Add more photos"
                  >
                    {isBusy ? (
                      <div className={styles.uploadTileLoading}>
                        <div className={styles.spinnerSmall} />
                        <p className={styles.uploadTileTitle}>
                          {uploadProgressText}
                        </p>
                        <span className={styles.uploadTileSub}>
                          Processing securely...
                        </span>
                      </div>
                    ) : (
                      <div className={styles.uploadTileContent}>
                        <div className={styles.uploadTileIconCircle}>
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        </div>
                        <p className={styles.uploadTileTitle}>Add Photos</p>
                        <p className={styles.uploadTileSub}>
                          JPG, PNG, WebP or HEIC
                        </p>
                        <span className={styles.uploadTileSlotBadge}>
                          {MAX_PHOTOS - photos.length} slot
                          {MAX_PHOTOS - photos.length === 1 ? "" : "s"} left
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Photo Limit Notice (When MAX_PHOTOS photos exist) */}
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
                <span>
                  You have reached the maximum of {MAX_PHOTOS} photos. You can set any photo as main or delete to upload a replacement.
                </span>
              </div>
            )}

            {/* Privacy & Safety Note */}
            <div className={styles.privacyNote}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.privacyIcon}
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>
                Your photos are stored securely and visible only to verified Manglam Matrimony members.
              </span>
            </div>

            {/* Visual Divider */}
            <div className={styles.divider} aria-hidden="true" />

            {/* Navigation Actions Form */}
            <form onSubmit={handleContinue} className={styles.actionForm}>
              {isEditMode ? (
                <div className={styles.actionRow}>
                  <Link href="/onboarding/review" className={styles.backButton}>
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={photos.length === 0 || isBusy}
                    className={styles.continueButton}
                  >
                    <span>Save & Return to Summary</span>
                  </button>
                </div>
              ) : (
                <div className={styles.actionRow}>
                  <Link
                    href="/onboarding/education-career"
                    className={styles.backButton}
                  >
                    ← Back
                  </Link>

                  <button
                    type="submit"
                    disabled={photos.length === 0 || isBusy}
                    className={styles.continueButton}
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
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-photo-title"
          onClick={() => setPhotoToDelete(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalIconCircle}>
              <svg
                width="24"
                height="24"
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
            </div>

            <h3 id="delete-photo-title" className={styles.modalTitle}>
              {photoToDelete.photoType === "PRIMARY"
                ? "Delete Main Photo?"
                : "Delete Photo?"}
            </h3>

            <p className={styles.modalMessage}>
              {photoToDelete.photoType === "PRIMARY" && photos.length > 1
                ? "This is your main profile photo. Removing it will automatically promote your next photo to main."
                : "Are you sure you want to remove this photo? You can upload a replacement anytime."}
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelButton}
                onClick={() => setPhotoToDelete(null)}
                autoFocus
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.modalDeleteButton}
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
