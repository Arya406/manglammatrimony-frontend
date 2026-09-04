"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  EmploymentType,
  AnnualIncomeRange,
  EducationItem,
  SpecializationItem,
  InstitutionItem,
  EmploymentStatusItem,
  OccupationItem,
  SaveEducationCareerPayload,
} from "@/types/profile";
import {
  saveEducationCareer,
  getProfile,
  fetchEducations,
  fetchSpecializations,
  fetchInstitutions,
  fetchEmploymentStatuses,
  fetchOccupations,
} from "@/lib/api/profile";
import {
  DEFAULT_EDUCATIONS,
  DEFAULT_EMPLOYMENT_STATUSES,
  EMPLOYMENT_TYPE_OPTIONS,
  ANNUAL_INCOME_OPTIONS,
} from "@/data/educationCareer";
import { CustomSelect, SelectOption } from "@/components/common/CustomSelect";
import { OnboardingProgress } from "./OnboardingProgress";
import styles from "./EducationCareerForm.module.css";

const ERROR_MESSAGE_MAP: Record<string, string> = {
  INVALID_EDUCATION: "Please select a valid education.",
  INVALID_SPECIALIZATION: "Please select a valid specialization.",
  SPECIALIZATION_EDUCATION_MISMATCH: "The selected specialization does not belong to this education.",
  INVALID_INSTITUTION: "Please select a valid institution.",
  INVALID_EMPLOYMENT_STATUS: "Please select a valid employment status.",
  INVALID_OCCUPATION: "Please select a valid occupation.",
  OCCUPATION_EMPLOYMENT_STATUS_MISMATCH: "The selected occupation does not belong to this employment status.",
  INVALID_EMPLOYMENT_TYPE: "Please select a valid employment type.",
  INVALID_ANNUAL_INCOME_RANGE: "Please select a valid income range.",
};

export function EducationCareerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Form State: Education
  const [educationId, setEducationId] = useState<string>("");
  const [specializationId, setSpecializationId] = useState<string>("");
  const [institutionId, setInstitutionId] = useState<string>("");
  const [institutionName, setInstitutionName] = useState<string>("");

  // Form State: Career
  const [employmentStatusId, setEmploymentStatusId] = useState<string>("");
  const [occupationId, setOccupationId] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">("");
  const [annualIncomeRange, setAnnualIncomeRange] = useState<AnnualIncomeRange | "">("");

  // Master Data Lists
  const [educations, setEducations] = useState<EducationItem[]>(DEFAULT_EDUCATIONS);
  const [specializations, setSpecializations] = useState<SpecializationItem[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<EmploymentStatusItem[]>(
    DEFAULT_EMPLOYMENT_STATUSES
  );
  const [occupations, setOccupations] = useState<OccupationItem[]>([]);

  // Loading States
  const [isLoadingEducations, setIsLoadingEducations] = useState(false);
  const [isLoadingSpecializations, setIsLoadingSpecializations] = useState(false);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [isLoadingOccupations, setIsLoadingOccupations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Validation & Error States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Initial Load: Pre-populate from existing profile and load master data
  useEffect(() => {
    let isMounted = true;

    async function initializeData() {
      setIsLoadingEducations(true);
      setIsLoadingInstitutions(true);

      try {
        const [profileRes, eduRes, instRes, empRes] = await Promise.all([
          getProfile(),
          fetchEducations(),
          fetchInstitutions(),
          fetchEmploymentStatuses(),
        ]);

        if (!isMounted) return;

        if (eduRes.success && Array.isArray(eduRes.data) && eduRes.data.length > 0) {
          setEducations(eduRes.data);
        }
        if (instRes.success && Array.isArray(instRes.data)) {
          setInstitutions(instRes.data);
        }
        if (empRes.success && Array.isArray(empRes.data) && empRes.data.length > 0) {
          setEmploymentStatuses(empRes.data);
        }

        // Restore existing user profile data if available
        if (profileRes.success && profileRes.data) {
          const { education, career } = profileRes.data;

          if (education) {
            setEducationId(education.educationId || "");
            setSpecializationId(education.specializationId || "");
            if (education.institutionId) {
              setInstitutionId(education.institutionId);
            } else if (education.institutionName) {
              setInstitutionId("OTHER");
              setInstitutionName(education.institutionName);
            }

            if (education.educationId) {
              const specRes = await fetchSpecializations(education.educationId);
              if (isMounted && specRes.success && Array.isArray(specRes.data)) {
                setSpecializations(specRes.data);
              }
            }
          }

          if (career) {
            setEmploymentStatusId(career.employmentStatusId || "");
            setOccupationId(career.occupationId || "");
            setCompanyName(career.companyName || "");
            setEmploymentType(career.employmentType || "");
            setAnnualIncomeRange(career.annualIncomeRange || "");

            if (career.employmentStatusId) {
              const occRes = await fetchOccupations(career.employmentStatusId);
              if (isMounted && occRes.success && Array.isArray(occRes.data)) {
                setOccupations(occRes.data);
              }
            }
          }
        }
      } catch (err) {
        console.warn("Error initializing education/career data:", err);
      } finally {
        if (isMounted) {
          setIsLoadingEducations(false);
          setIsLoadingInstitutions(false);
        }
      }
    }

    initializeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Cascade when Education changes
  const handleEducationChange = async (newEducationId: string) => {
    setEducationId(newEducationId);
    if (errors.educationId) {
      setErrors((prev) => ({ ...prev, educationId: "" }));
    }

    // Reset dependent specialization
    setSpecializationId("");

    if (!newEducationId) {
      setSpecializations([]);
      return;
    }

    setIsLoadingSpecializations(true);
    try {
      const res = await fetchSpecializations(newEducationId);
      setSpecializations(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Error fetching specializations:", err);
    } finally {
      setIsLoadingSpecializations(false);
    }
  };

  // 3. Cascade when Employment Status changes
  const handleEmploymentStatusChange = async (newStatusId: string) => {
    setEmploymentStatusId(newStatusId);
    if (errors.employmentStatusId) {
      setErrors((prev) => ({ ...prev, employmentStatusId: "" }));
    }

    // Reset dependent occupation
    setOccupationId("");

    if (!newStatusId) {
      setOccupations([]);
      return;
    }

    setIsLoadingOccupations(true);
    try {
      const res = await fetchOccupations(newStatusId);
      setOccupations(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Error fetching occupations:", err);
    } finally {
      setIsLoadingOccupations(false);
    }
  };

  // 4. Institution selection
  const handleInstitutionChange = (val: string) => {
    setInstitutionId(val);
    if (val !== "OTHER") {
      setInstitutionName("");
    }
    if (errors.institutionName) {
      setErrors((prev) => ({ ...prev, institutionName: "" }));
    }
  };

  // Select Option Mappings
  const educationOptions: SelectOption[] = educations.map((e) => ({
    value: e.id,
    label: e.name,
  }));

  const specializationOptions: SelectOption[] = specializations.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const institutionOptions: SelectOption[] = [
    ...institutions.map((inst) => ({
      value: inst.id,
      label: inst.name,
    })),
    { value: "OTHER", label: "Other (Enter institution name)" },
  ];

  const employmentStatusOptions: SelectOption[] = employmentStatuses.map((st) => ({
    value: st.id,
    label: st.name,
  }));

  const occupationOptions: SelectOption[] = occupations.map((occ) => ({
    value: occ.id,
    label: occ.name,
  }));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!educationId) {
      newErrors.educationId = "Please select your highest education.";
    }

    if (!employmentStatusId) {
      newErrors.employmentStatusId = "Please select your employment status.";
    }

    if (institutionId === "OTHER" && !institutionName.trim()) {
      newErrors.institutionName = "Please enter your college or university name.";
    } else if (institutionName.trim().length > 200) {
      newErrors.institutionName = "Institution name must be 200 characters or less.";
    }

    if (companyName.trim().length > 200) {
      newErrors.companyName = "Company name must be 200 characters or less.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    const isOtherInst = institutionId === "OTHER";
    const resolvedInstitutionId = !isOtherInst && institutionId ? institutionId : null;
    const resolvedInstitutionName = isOtherInst ? institutionName.trim() : null;

    const payload: SaveEducationCareerPayload = {
      education: {
        educationId,
        specializationId: specializationId || null,
        institutionId: resolvedInstitutionId,
        institutionName: resolvedInstitutionName,
      },
      career: {
        employmentStatusId,
        occupationId: occupationId || null,
        companyName: companyName.trim() || null,
        employmentType: (employmentType as EmploymentType) || null,
        annualIncomeRange: (annualIncomeRange as AnnualIncomeRange) || null,
      },
    };

    try {
      const response = await saveEducationCareer(payload);

      if (!response.success) {
        if (response.code === "UNAUTHORIZED") {
          setServerError("Your session has expired. Please log in again.");
          setTimeout(() => {
            router.push("/register");
          }, 1500);
          setIsSubmitting(false);
          return;
        }

        const friendlyMessage =
          (response.code && ERROR_MESSAGE_MAP[response.code]) ||
          response.message ||
          "We couldn't save your details. Please try again.";

        setServerError(friendlyMessage);
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

      // Navigate to Screen 5: Photos
      router.push("/onboarding/photos");
    } catch (err) {
      console.error("Education & career submission error:", err);
      setServerError("We couldn't save your details. Please try again.");
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
            <span>EDIT PROFILE • EDUCATION & CAREER</span>
          </div>
        ) : (
          <div className={styles.progressHeader}>
            <OnboardingProgress currentStep={4} totalSteps={6} />
          </div>
        )}

        {/* Main Heading & Subtitle */}
        <div className={styles.headerGroup}>
          <h1 className={styles.title}>
            {isEditMode ? "Edit Education & Career" : "Tell us about your education & work"}
          </h1>
          <p className={styles.subtitle}>
            {isEditMode
              ? "Update your educational qualification, occupation, and company."
              : "Your education and career help us find compatible matches."}
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

        {/* Education & Career Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* SECTION 1: EDUCATION */}
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>EDUCATION</span>
          </div>

          {/* Highest Education (Full Width) */}
          <div className={styles.formFullWidth}>
            <CustomSelect
              id="education"
              label="Highest Education"
              placeholder={
                isLoadingEducations
                  ? "Loading educations..."
                  : "Select your highest education"
              }
              options={educationOptions}
              value={educationId}
              onChange={handleEducationChange}
              isSearchable
              searchPlaceholder="Search education (e.g. B.Tech, MBA)..."
              error={errors.educationId}
              required
              disabled={isSubmitting || isLoadingEducations}
            />
          </div>

          {/* Progressive Disclosure: Specialization + Institution appear when Education is selected */}
          {educationId && (
            <div className={styles.formRow}>
              {/* Specialization */}
              <div className={styles.formGroup}>
                <CustomSelect
                  id="specialization"
                  label="Specialization"
                  placeholder={
                    isLoadingSpecializations
                      ? "Loading specializations..."
                      : specializationOptions.length > 0
                      ? "Select your specialization"
                      : "General / Not Applicable"
                  }
                  options={specializationOptions}
                  value={specializationId}
                  onChange={(val) => setSpecializationId(val)}
                  isSearchable
                  searchPlaceholder="Search specialization..."
                  disabled={
                    isSubmitting ||
                    isLoadingSpecializations ||
                    specializationOptions.length === 0
                  }
                />
              </div>

              {/* Institution */}
              <div className={styles.formGroup}>
                <CustomSelect
                  id="institution"
                  label="College / University / Institution"
                  placeholder={
                    isLoadingInstitutions
                      ? "Loading institutions..."
                      : "Select your institution"
                  }
                  options={institutionOptions}
                  value={institutionId}
                  onChange={handleInstitutionChange}
                  isSearchable
                  searchPlaceholder="Search college or university..."
                  disabled={isSubmitting || isLoadingInstitutions}
                />
              </div>
            </div>
          )}

          {/* Custom Institution Name Input when "Other" is selected */}
          {educationId && institutionId === "OTHER" && (
            <div className={styles.formFullWidth}>
              <div className={styles.formGroup}>
                <label htmlFor="institutionName" className={styles.label}>
                  Enter institution name <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="institutionName"
                  type="text"
                  value={institutionName}
                  onChange={(e) => {
                    setInstitutionName(e.target.value);
                    if (errors.institutionName) {
                      setErrors((prev) => ({ ...prev, institutionName: "" }));
                    }
                  }}
                  placeholder="Enter your college or university name"
                  maxLength={200}
                  disabled={isSubmitting}
                  className={[
                    styles.input,
                    errors.institutionName ? styles.inputError : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
                {errors.institutionName && (
                  <span className={styles.fieldError}>{errors.institutionName}</span>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: CAREER */}
          <div className={styles.sectionDivider} aria-hidden="true" />

          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>CAREER</span>
          </div>

          {/* Employment Status (Full Width) */}
          <div className={styles.formFullWidth}>
            <CustomSelect
              id="employmentStatus"
              label="Employment Status"
              placeholder="Select your employment status"
              options={employmentStatusOptions}
              value={employmentStatusId}
              onChange={handleEmploymentStatusChange}
              isSearchable
              searchPlaceholder="Search employment status..."
              error={errors.employmentStatusId}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Progressive Disclosure: Occupation + Employment Type appear when Employment Status is chosen */}
          {employmentStatusId && (
            <div className={styles.formRow}>
              {/* Occupation */}
              <div className={styles.formGroup}>
                <CustomSelect
                  id="occupation"
                  label="Occupation"
                  placeholder={
                    isLoadingOccupations
                      ? "Loading occupations..."
                      : occupationOptions.length > 0
                      ? "Select occupation"
                      : "General / Other"
                  }
                  options={occupationOptions}
                  value={occupationId}
                  onChange={(val) => setOccupationId(val)}
                  isSearchable
                  searchPlaceholder="Search occupation..."
                  disabled={
                    isSubmitting ||
                    isLoadingOccupations ||
                    occupationOptions.length === 0
                  }
                />
              </div>

              {/* Employment Type */}
              <div className={styles.formGroup}>
                <CustomSelect
                  id="employmentType"
                  label="Employment Type"
                  placeholder="Select employment type"
                  options={EMPLOYMENT_TYPE_OPTIONS}
                  value={employmentType}
                  onChange={(val) => setEmploymentType(val as EmploymentType)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}

          {/* Company Name */}
          <div className={styles.formFullWidth}>
            <div className={styles.formGroup}>
              <label htmlFor="companyName" className={styles.label}>
                Company Name
              </label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) {
                    setErrors((prev) => ({ ...prev, companyName: "" }));
                  }
                }}
                placeholder="Enter your company name (optional)"
                maxLength={200}
                disabled={isSubmitting}
                className={[
                  styles.input,
                  errors.companyName ? styles.inputError : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              {errors.companyName && (
                <span className={styles.fieldError}>{errors.companyName}</span>
              )}
            </div>
          </div>

          {/* Annual Income */}
          <div className={styles.formFullWidth}>
            <CustomSelect
              id="annualIncome"
              label="Annual Income"
              placeholder="Select annual income range"
              options={ANNUAL_INCOME_OPTIONS}
              value={annualIncomeRange}
              onChange={(val) => setAnnualIncomeRange(val as AnnualIncomeRange)}
              disabled={isSubmitting}
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
                href="/onboarding/religion"
                className={styles.backButton}
                aria-label="Go back to Step 3: Religion & Community"
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
