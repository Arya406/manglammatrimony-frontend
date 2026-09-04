"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Gender,
  MaritalStatus,
  LanguageItem,
  SavePersonalDetailsPayload,
} from "@/types/profile";
import { savePersonalDetails, fetchLanguages, getProfile } from "@/lib/api/profile";
import { DEFAULT_LANGUAGES } from "@/data/languages";
import { CustomSelect, SelectOption } from "@/components/common/CustomSelect";
import { CustomMultiSelect } from "@/components/common/CustomMultiSelect";
import { OnboardingProgress } from "./OnboardingProgress";
import styles from "./PersonalDetailsForm.module.css";

const GENDER_OPTIONS: SelectOption[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const MARITAL_STATUS_OPTIONS: SelectOption[] = [
  { value: "NEVER_MARRIED", label: "Never Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "AWAITING_DIVORCE", label: "Awaiting Divorce" },
  { value: "ANNULLED", label: "Annulled" },
];

// Generate 100 cm to 250 cm with feet/inches conversion
const HEIGHT_OPTIONS: SelectOption[] = Array.from({ length: 151 }, (_, i) => {
  const cm = 100 + i;
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return {
    value: cm.toString(),
    label: `${cm} cm (${feet}'${inches}")`,
  };
});

export function PersonalDetailsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus | "">("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [motherTongueId, setMotherTongueId] = useState<string>("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [languageIds, setLanguageIds] = useState<string[]>([]);

  // Metadata State
  const [languages, setLanguages] = useState<LanguageItem[]>(DEFAULT_LANGUAGES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Field Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch active languages and prefill existing personal details from backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [langRes, profileRes] = await Promise.all([
          fetchLanguages(),
          getProfile(),
        ]);

        if (!isMounted) return;

        if (langRes.success && Array.isArray(langRes.data) && langRes.data.length > 0) {
          setLanguages(langRes.data);
        }

        if (profileRes.success && profileRes.data?.personalDetails) {
          const pd = profileRes.data.personalDetails;
          if (pd.firstName) setFirstName(pd.firstName);
          if (pd.lastName) setLastName(pd.lastName);
          if (pd.gender) setGender(pd.gender);
          if (pd.dateOfBirth) {
            setDateOfBirth(pd.dateOfBirth.split("T")[0]);
          }
          if (pd.maritalStatus) setMaritalStatus(pd.maritalStatus);
          if (pd.heightCm) setHeightCm(pd.heightCm.toString());
          if (pd.motherTongueId) setMotherTongueId(pd.motherTongueId);
          if (pd.city) setCity(pd.city);
          if (pd.state) setState(pd.state);
          if (Array.isArray(profileRes.data.languages)) {
            setLanguageIds(profileRes.data.languages.map((l) => l.languageId));
          }
        }
      } catch (err) {
        console.warn("Using fallback languages list / prefill error:", err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Map languages to SelectOption
  const languageOptions: SelectOption[] = languages.map((lang) => ({
    value: lang.id,
    label: lang.name,
    secondaryLabel: lang.code.toUpperCase(),
  }));

  // Max selectable date: exactly 18 years ago today
  const maxDobDate = (() => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return today.toISOString().split("T")[0];
  })();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = "Please enter your first name.";
    } else if (firstName.trim().length > 100) {
      newErrors.firstName = "First name must be 100 characters or less.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Please enter your last name.";
    } else if (lastName.trim().length > 100) {
      newErrors.lastName = "Last name must be 100 characters or less.";
    }

    if (!gender) {
      newErrors.gender = "Please select your gender.";
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Please enter your date of birth.";
    } else {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      if (isNaN(dob.getTime()) || dob > today) {
        newErrors.dateOfBirth = "Please enter a valid date of birth.";
      } else if (age < 18) {
        newErrors.dateOfBirth = "You must be at least 18 years old.";
      }
    }

    if (!maritalStatus) {
      newErrors.maritalStatus = "Please select your marital status.";
    }

    if (!heightCm) {
      newErrors.heightCm = "Please select your height.";
    }

    if (!motherTongueId) {
      newErrors.motherTongueId = "Please select your mother tongue.";
    }

    if (!city.trim()) {
      newErrors.city = "Please enter your city.";
    } else if (city.trim().length > 100) {
      newErrors.city = "City cannot exceed 100 characters.";
    }

    if (!state.trim()) {
      newErrors.state = "Please enter your state or region.";
    } else if (state.trim().length > 100) {
      newErrors.state = "State cannot exceed 100 characters.";
    }

    if (languageIds.length === 0 && !motherTongueId) {
      newErrors.languageIds = "Please select at least one language.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Auto-include mother tongue in languageIds if not already present
    const combinedLanguageIds = Array.from(
      new Set([...languageIds, motherTongueId].filter(Boolean))
    );

    const payload: SavePersonalDetailsPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender: gender as Gender,
      dateOfBirth,
      maritalStatus: maritalStatus as MaritalStatus,
      heightCm: parseInt(heightCm, 10),
      motherTongueId,
      city: city.trim(),
      state: state.trim(),
      languageIds: combinedLanguageIds,
    };

    try {
      const response = await savePersonalDetails(payload);

      if (!response.success) {
        if (response.code === "UNAUTHORIZED") {
          setServerError("Your session has expired. Please log in again.");
          setTimeout(() => {
            router.push("/register");
          }, 1500);
          setIsSubmitting(false);
          return;
        }

        setServerError(
          response.message || "Something went wrong while saving your details. Please try again."
        );
        setIsSubmitting(false);
        return;
      }

      if (isEditMode) {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push("/onboarding/review");
        }, 400);
        return;
      }

      // Navigate to Screen 3: Religion & Community
      router.push("/onboarding/religion");
    } catch (err) {
      console.error("Personal details submission error:", err);
      setServerError("An unexpected network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.panelWrapper}>
      <div className={styles.panel}>
        {/* Step Progress Minimal Header or Edit Mode Badge */}
        {isEditMode ? (
          <div className={styles.editModeBadge}>
            <span className={styles.goldSparkle}>✦</span>
            <span>EDIT PROFILE • PERSONAL DETAILS</span>
          </div>
        ) : (
          <div className={styles.progressHeader}>
            <OnboardingProgress currentStep={2} totalSteps={6} />
          </div>
        )}

        {/* Main Heading & Subtitle */}
        <div className={styles.headerGroup}>
          <h1 className={styles.title}>
            {isEditMode ? "Edit Personal Details" : "Tell us about the person"}
          </h1>
          <p className={styles.subtitle}>
            {isEditMode
              ? "Update basic details, languages, and identity."
              : "Let's start with some basic details."}
          </p>
        </div>

        {/* Accessible Server Error Alert */}
        {serverError && (
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
            <span>{serverError}</span>
          </div>
        )}

        {/* Personal Details Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Row 1: First Name + Last Name */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>
                First Name <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors((prev) => ({ ...prev, firstName: "" }));
                  }
                }}
                placeholder="Enter first name"
                maxLength={100}
                disabled={isSubmitting}
                className={[
                  styles.input,
                  errors.firstName ? styles.inputError : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {errors.firstName && (
                <span className={styles.fieldError}>{errors.firstName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>
                Last Name <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors((prev) => ({ ...prev, lastName: "" }));
                  }
                }}
                placeholder="Enter last name"
                maxLength={100}
                disabled={isSubmitting}
                className={[
                  styles.input,
                  errors.lastName ? styles.inputError : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {errors.lastName && (
                <span className={styles.fieldError}>{errors.lastName}</span>
              )}
            </div>
          </div>

          {/* Row 2: Gender + Date of Birth */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <CustomSelect
                id="gender"
                label="Gender"
                placeholder="Select gender"
                options={GENDER_OPTIONS}
                value={gender}
                onChange={(val) => {
                  setGender(val as Gender);
                  if (errors.gender) {
                    setErrors((prev) => ({ ...prev, gender: "" }));
                  }
                }}
                error={errors.gender}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth" className={styles.label}>
                Date of Birth <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                max={maxDobDate}
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value);
                  if (errors.dateOfBirth) {
                    setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
                  }
                }}
                disabled={isSubmitting}
                className={[
                  styles.input,
                  styles.dateInput,
                  errors.dateOfBirth ? styles.inputError : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {errors.dateOfBirth ? (
                <span className={styles.fieldError}>{errors.dateOfBirth}</span>
              ) : (
                <span className={styles.helperText}>
                  You must be at least 18 years old.
                </span>
              )}
            </div>
          </div>

          {/* Row 3: Marital Status + Height */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <CustomSelect
                id="maritalStatus"
                label="Marital Status"
                placeholder="Select marital status"
                options={MARITAL_STATUS_OPTIONS}
                value={maritalStatus}
                onChange={(val) => {
                  setMaritalStatus(val as MaritalStatus);
                  if (errors.maritalStatus) {
                    setErrors((prev) => ({ ...prev, maritalStatus: "" }));
                  }
                }}
                error={errors.maritalStatus}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.formGroup}>
              <CustomSelect
                id="heightCm"
                label="Height"
                placeholder="Select height"
                options={HEIGHT_OPTIONS}
                value={heightCm}
                onChange={(val) => {
                  setHeightCm(val);
                  if (errors.heightCm) {
                    setErrors((prev) => ({ ...prev, heightCm: "" }));
                  }
                }}
                isSearchable
                searchPlaceholder="Search height (e.g. 165 or 5ft)..."
                error={errors.heightCm}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Row 4: City + State */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="city" className={styles.label}>
                City <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="city"
                type="text"
                maxLength={100}
                placeholder="e.g. Jaipur, Delhi, Mumbai"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) {
                    setErrors((prev) => ({ ...prev, city: "" }));
                  }
                }}
                disabled={isSubmitting}
                className={[
                  styles.input,
                  errors.city ? styles.inputError : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {errors.city && (
                <span className={styles.fieldError}>{errors.city}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state" className={styles.label}>
                State / Union Territory <span className={styles.requiredStar}>*</span>
              </label>
              <input
                id="state"
                type="text"
                maxLength={100}
                placeholder="e.g. Rajasthan, Delhi, Maharashtra"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  if (errors.state) {
                    setErrors((prev) => ({ ...prev, state: "" }));
                  }
                }}
                disabled={isSubmitting}
                className={[
                  styles.input,
                  errors.state ? styles.inputError : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {errors.state && (
                <span className={styles.fieldError}>{errors.state}</span>
              )}
            </div>
          </div>

          {/* Row 5: Mother Tongue (Full Width) */}
          <div className={styles.formFullWidth}>
            <CustomSelect
              id="motherTongue"
              label="Mother Tongue"
              placeholder="Select mother tongue"
              options={languageOptions}
              value={motherTongueId}
              onChange={(val) => {
                setMotherTongueId(val);
                if (errors.motherTongueId) {
                  setErrors((prev) => ({ ...prev, motherTongueId: "" }));
                }
              }}
              isSearchable
              searchPlaceholder="Search mother tongue (e.g. Hindi, Bengali)..."
              error={errors.motherTongueId}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Row 5: Spoken Languages (Full Width) */}
          <div className={styles.formFullWidth}>
            <CustomMultiSelect
              id="languageIds"
              label="Languages you speak"
              placeholder="Select all languages you speak"
              options={languageOptions}
              values={languageIds}
              onChange={(vals) => {
                setLanguageIds(vals);
                if (errors.languageIds) {
                  setErrors((prev) => ({ ...prev, languageIds: "" }));
                }
              }}
              error={errors.languageIds}
              disabled={isSubmitting}
              helperText="You can select multiple languages."
            />
          </div>

          {/* Subtle Panel Divider */}
          <div className={styles.divider} aria-hidden="true" />

          {/* Bottom Actions: Cancel / Save Changes in Edit Mode, Back / Continue in Onboarding */}
          {isEditMode ? (
            <div className={styles.actionRow}>
              <Link
                href="/onboarding/review"
                className={styles.backButton}
                aria-label="Cancel and return to Profile Summary"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSubmitting || saveSuccess}
                className={styles.continueButton}
              >
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : saveSuccess
                    ? "Saved ✓"
                    : "Save Changes"}
                </span>
              </button>
            </div>
          ) : (
            <div className={styles.actionRow}>
              <Link
                href="/onboarding"
                className={styles.backButton}
                aria-label="Go back to Step 1"
              >
                ← Back
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className={styles.continueButton}
              >
                <span>{isSubmitting ? "Saving details..." : "Continue"}</span>
                {!isSubmitting && (
                  <svg
                    className={styles.arrowIcon}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          )}

          {/* Privacy & Trust Reassurance */}
          <div className={styles.trustMessage}>
            <svg
              className={styles.lockIcon}
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Your information is safe and protected.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
