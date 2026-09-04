"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ManglikStatus,
  MaritalStatus,
  ReligionItem,
  CommunityItem,
  SubCommunityItem,
  CasteItem,
  GotraItem,
  EducationItem,
  OccupationItem,
  SavePartnerPreferencesPayload,
} from "@/types/profile";
import {
  getPartnerPreferences,
  savePartnerPreferences,
  fetchReligions,
  fetchCommunities,
  fetchSubCommunities,
  fetchCastes,
  fetchGotras,
  fetchEducations,
  fetchOccupations,
} from "@/lib/api/profile";
import { CustomSelect, SelectOption } from "@/components/common/CustomSelect";
import { CustomMultiSelect } from "@/components/common/CustomMultiSelect";
import { OnboardingProgress } from "./OnboardingProgress";
import styles from "./PartnerPreferencesForm.module.css";

// Age Options (18 to 80)
const AGE_OPTIONS: SelectOption[] = [
  { value: "", label: "No preference" },
  ...Array.from({ length: 63 }, (_, i) => {
    const age = 18 + i;
    return { value: age.toString(), label: `${age} yrs` };
  }),
];

// Height Options (120 cm to 220 cm)
const HEIGHT_OPTIONS: SelectOption[] = [
  { value: "", label: "No preference" },
  ...Array.from({ length: 101 }, (_, i) => {
    const cm = 120 + i;
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return { value: cm.toString(), label: `${cm} cm (${feet}' ${inches}")` };
  }),
];

const MANGLIK_CAPSULES: Array<{ value: ManglikStatus; label: string }> = [
  { value: "YES", label: "Manglik" },
  { value: "NO", label: "Non-Manglik" },
  { value: "DONT_KNOW", label: "Don't Know" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
];

const MARITAL_STATUS_CAPSULES: Array<{ value: MaritalStatus; label: string }> = [
  { value: "NEVER_MARRIED", label: "Never Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "AWAITING_DIVORCE", label: "Awaiting Divorce" },
  { value: "ANNULLED", label: "Annulled" },
];

const ERROR_MESSAGE_MAP: Record<string, string> = {
  INVALID_AGE_RANGE: "Minimum age cannot be greater than maximum age.",
  INVALID_HEIGHT_RANGE: "Minimum height cannot be greater than maximum height.",
  INVALID_PARTNER_RELIGION: "Please select a valid religion.",
  INVALID_PARTNER_COMMUNITY: "Please select a valid community.",
  PARTNER_COMMUNITY_RELIGION_MISMATCH: "One or more communities do not belong to the selected religions.",
  INVALID_PARTNER_SUB_COMMUNITY: "One or more selected sub-communities are invalid.",
  PARTNER_SUB_COMMUNITY_PARENT_MISMATCH: "One or more sub-communities are no longer valid for the selected communities.",
  INVALID_PARTNER_CASTE: "One or more selected castes are invalid.",
  PARTNER_CASTE_COMMUNITY_MISMATCH: "One or more castes are no longer valid for the selected communities.",
  INVALID_PARTNER_GOTRA: "One or more selected gotras are invalid.",
  PARTNER_GOTRA_COMMUNITY_MISMATCH: "One or more gotras are no longer valid for the selected communities.",
  INVALID_PARTNER_EDUCATION: "Please select a valid education.",
  INVALID_PARTNER_OCCUPATION: "Please select a valid occupation.",
  INVALID_PARTNER_MANGLIK_STATUS: "Please select a valid Manglik preference.",
  INVALID_PARTNER_MARITAL_STATUS: "Please select a valid marital status preference.",
};

export function PartnerPreferencesForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Section 1: Age & Height State
  const [minAge, setMinAge] = useState<string>("");
  const [maxAge, setMaxAge] = useState<string>("");
  const [minHeightCm, setMinHeightCm] = useState<string>("");
  const [maxHeightCm, setMaxHeightCm] = useState<string>("");

  // Section 2: Religion & Community Multi-Select State
  const [religionIds, setReligionIds] = useState<string[]>([]);
  const [communityIds, setCommunityIds] = useState<string[]>([]);
  const [subCommunityIds, setSubCommunityIds] = useState<string[]>([]);
  const [casteIds, setCasteIds] = useState<string[]>([]);
  const [gotraIds, setGotraIds] = useState<string[]>([]);

  // Section 3: Education & Career Multi-Select State
  const [educationIds, setEducationIds] = useState<string[]>([]);
  const [occupationIds, setOccupationIds] = useState<string[]>([]);

  // Section 4: Other Preferences (Capsules)
  const [manglikStatuses, setManglikStatuses] = useState<ManglikStatus[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);

  // Master Data Lists
  const [religions, setReligions] = useState<ReligionItem[]>([]);
  const [allCommunities, setAllCommunities] = useState<CommunityItem[]>([]);
  const [allSubCommunities, setAllSubCommunities] = useState<SubCommunityItem[]>([]);
  const [allCastes, setAllCastes] = useState<CasteItem[]>([]);
  const [allGotras, setAllGotras] = useState<GotraItem[]>([]);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [occupations, setOccupations] = useState<OccupationItem[]>([]);

  // UI & Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // 1. Initial Load: Fetch master data and pre-populate existing partner preferences
  useEffect(() => {
    let isMounted = true;

    async function initializeData() {
      setIsLoading(true);
      try {
        const [
          prefRes,
          relRes,
          commRes,
          subCommRes,
          casteRes,
          gotraRes,
          eduRes,
          occRes,
        ] = await Promise.all([
          getPartnerPreferences(),
          fetchReligions(),
          fetchCommunities(),
          fetchSubCommunities(),
          fetchCastes(),
          fetchGotras(),
          fetchEducations(),
          fetchOccupations(),
        ]);

        if (!isMounted) return;

        if (relRes.success && Array.isArray(relRes.data)) {
          setReligions(relRes.data);
        }
        if (commRes.success && Array.isArray(commRes.data)) {
          setAllCommunities(commRes.data);
        }
        if (subCommRes.success && Array.isArray(subCommRes.data)) {
          setAllSubCommunities(subCommRes.data);
        }
        if (casteRes.success && Array.isArray(casteRes.data)) {
          setAllCastes(casteRes.data);
        }
        if (gotraRes.success && Array.isArray(gotraRes.data)) {
          setAllGotras(gotraRes.data);
        }
        if (eduRes.success && Array.isArray(eduRes.data)) {
          setEducations(eduRes.data);
        }
        if (occRes.success && Array.isArray(occRes.data)) {
          setOccupations(occRes.data);
        }

        // Restore existing partner preferences if available
        if (prefRes.success && prefRes.data) {
          const p = prefRes.data;
          setMinAge(p.minAge ? p.minAge.toString() : "");
          setMaxAge(p.maxAge ? p.maxAge.toString() : "");
          setMinHeightCm(p.minHeightCm ? p.minHeightCm.toString() : "");
          setMaxHeightCm(p.maxHeightCm ? p.maxHeightCm.toString() : "");

          if (Array.isArray(p.religions)) {
            setReligionIds(p.religions.map((r) => r.id));
          }
          if (Array.isArray(p.communities)) {
            setCommunityIds(p.communities.map((c) => c.id));
          }
          if (Array.isArray(p.subCommunities)) {
            setSubCommunityIds(p.subCommunities.map((sc) => sc.id));
          }
          if (Array.isArray(p.castes)) {
            setCasteIds(p.castes.map((c) => c.id));
          }
          if (Array.isArray(p.gotras)) {
            setGotraIds(p.gotras.map((g) => g.id));
          }
          if (Array.isArray(p.educations)) {
            setEducationIds(p.educations.map((e) => e.id));
          }
          if (Array.isArray(p.occupations)) {
            setOccupationIds(p.occupations.map((o) => o.id));
          }
          if (Array.isArray(p.manglikStatuses)) {
            setManglikStatuses(p.manglikStatuses);
          }
          if (Array.isArray(p.maritalStatuses)) {
            setMaritalStatuses(p.maritalStatuses);
          }
        }
      } catch (err) {
        console.error("Error initializing partner preferences:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initializeData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Cascade Reset Logic when Religion Selection Changes
  const handleReligionChange = (newReligionIds: string[]) => {
    setReligionIds(newReligionIds);

    if (newReligionIds.length === 0) {
      // Clear all child community & cultural selections
      setCommunityIds([]);
      setSubCommunityIds([]);
      setCasteIds([]);
      setGotraIds([]);
      return;
    }

    // Filter available communities
    const validCommIds = new Set(
      allCommunities
        .filter((c) => c.religionId && newReligionIds.includes(c.religionId))
        .map((c) => c.id)
    );

    // Prune communities that no longer match
    const prunedCommunities = communityIds.filter((cid) => validCommIds.has(cid));
    setCommunityIds(prunedCommunities);

    if (prunedCommunities.length === 0) {
      setSubCommunityIds([]);
      setCasteIds([]);
      setGotraIds([]);
    } else {
      // Prune sub-communities, castes, gotras
      const validSubCommIds = new Set(
        allSubCommunities
          .filter((sc) => sc.communityId && prunedCommunities.includes(sc.communityId))
          .map((sc) => sc.id)
      );
      setSubCommunityIds((prev) => prev.filter((id) => validSubCommIds.has(id)));

      const validCasteIds = new Set(
        allCastes
          .filter((c) => c.communityId && prunedCommunities.includes(c.communityId))
          .map((c) => c.id)
      );
      setCasteIds((prev) => prev.filter((id) => validCasteIds.has(id)));

      const validGotraIds = new Set(
        allGotras
          .filter((g) => g.communityId && prunedCommunities.includes(g.communityId))
          .map((g) => g.id)
      );
      setGotraIds((prev) => prev.filter((id) => validGotraIds.has(id)));
    }
  };

  // 3. Cascade Reset Logic when Community Selection Changes
  const handleCommunityChange = (newCommunityIds: string[]) => {
    setCommunityIds(newCommunityIds);

    if (newCommunityIds.length === 0) {
      setSubCommunityIds([]);
      setCasteIds([]);
      setGotraIds([]);
      return;
    }

    const validSubCommIds = new Set(
      allSubCommunities
        .filter((sc) => sc.communityId && newCommunityIds.includes(sc.communityId))
        .map((sc) => sc.id)
    );
    setSubCommunityIds((prev) => prev.filter((id) => validSubCommIds.has(id)));

    const validCasteIds = new Set(
      allCastes
        .filter((c) => c.communityId && newCommunityIds.includes(c.communityId))
        .map((c) => c.id)
    );
    setCasteIds((prev) => prev.filter((id) => validCasteIds.has(id)));

    const validGotraIds = new Set(
      allGotras
        .filter((g) => g.communityId && newCommunityIds.includes(g.communityId))
        .map((g) => g.id)
    );
    setGotraIds((prev) => prev.filter((id) => validGotraIds.has(id)));
  };

  // 4. Filtered Multi-Select Options
  const religionOptions: SelectOption[] = useMemo(
    () => religions.map((r) => ({ value: r.id, label: r.name })),
    [religions]
  );

  const availableCommunities: SelectOption[] = useMemo(() => {
    if (religionIds.length === 0) {
      return allCommunities.map((c) => ({ value: c.id, label: c.name }));
    }
    return allCommunities
      .filter((c) => c.religionId && religionIds.includes(c.religionId))
      .map((c) => ({ value: c.id, label: c.name }));
  }, [allCommunities, religionIds]);

  const availableSubCommunities: SelectOption[] = useMemo(() => {
    if (communityIds.length === 0) return [];
    return allSubCommunities
      .filter((sc) => sc.communityId && communityIds.includes(sc.communityId))
      .map((sc) => ({ value: sc.id, label: sc.name }));
  }, [allSubCommunities, communityIds]);

  const availableCastes: SelectOption[] = useMemo(() => {
    if (communityIds.length === 0) return [];
    return allCastes
      .filter((c) => c.communityId && communityIds.includes(c.communityId))
      .map((c) => ({ value: c.id, label: c.name }));
  }, [allCastes, communityIds]);

  const availableGotras: SelectOption[] = useMemo(() => {
    if (communityIds.length === 0) return [];
    return allGotras
      .filter((g) => g.communityId && communityIds.includes(g.communityId))
      .map((g) => ({ value: g.id, label: g.name }));
  }, [allGotras, communityIds]);

  const educationOptions: SelectOption[] = useMemo(
    () => educations.map((e) => ({ value: e.id, label: e.name })),
    [educations]
  );

  const occupationOptions: SelectOption[] = useMemo(
    () => occupations.map((o) => ({ value: o.id, label: o.name })),
    [occupations]
  );

  // 5. Toggle Capsule Selections
  const handleToggleManglik = (status: ManglikStatus) => {
    setManglikStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleToggleMaritalStatus = (status: MaritalStatus) => {
    setMaritalStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  // Section Clear Handlers
  const handleClearAgeHeight = () => {
    setMinAge("");
    setMaxAge("");
    setMinHeightCm("");
    setMaxHeightCm("");
    setErrors((prev) => ({ ...prev, ageRange: "", heightRange: "" }));
  };

  const handleClearReligionCommunity = () => {
    setReligionIds([]);
    setCommunityIds([]);
    setSubCommunityIds([]);
    setCasteIds([]);
    setGotraIds([]);
  };

  const handleClearEducationCareer = () => {
    setEducationIds([]);
    setOccupationIds([]);
  };

  const handleClearOtherPreferences = () => {
    setManglikStatuses([]);
    setMaritalStatuses([]);
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (minAge && maxAge && parseInt(minAge, 10) > parseInt(maxAge, 10)) {
      newErrors.ageRange = "Minimum age cannot be greater than maximum age.";
    }

    if (
      minHeightCm &&
      maxHeightCm &&
      parseInt(minHeightCm, 10) > parseInt(maxHeightCm, 10)
    ) {
      newErrors.heightRange = "Minimum height cannot be greater than maximum height.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload: SavePartnerPreferencesPayload = {
      minAge: minAge ? parseInt(minAge, 10) : null,
      maxAge: maxAge ? parseInt(maxAge, 10) : null,
      minHeightCm: minHeightCm ? parseInt(minHeightCm, 10) : null,
      maxHeightCm: maxHeightCm ? parseInt(maxHeightCm, 10) : null,
      religionIds: Array.from(new Set(religionIds)),
      communityIds: Array.from(new Set(communityIds)),
      subCommunityIds: Array.from(new Set(subCommunityIds)),
      casteIds: Array.from(new Set(casteIds)),
      gotraIds: Array.from(new Set(gotraIds)),
      educationIds: Array.from(new Set(educationIds)),
      occupationIds: Array.from(new Set(occupationIds)),
      manglikStatuses: Array.from(new Set(manglikStatuses)),
      maritalStatuses: Array.from(new Set(maritalStatuses)),
    };

    try {
      const response = await savePartnerPreferences(payload);

      if (!response.success) {
        if (response.code === "UNAUTHORIZED") {
          setServerError("Your session has expired. Please log in again.");
          setTimeout(() => router.push("/register"), 1500);
          return;
        }

        const friendlyMessage =
          (response.code && ERROR_MESSAGE_MAP[response.code]) ||
          response.message ||
          "We couldn't save your preferences. Please try again.";

        setServerError(friendlyMessage);
        return;
      }

      if (isEditMode) {
        setSaveSuccess(true);
        setTimeout(() => {
          router.push("/onboarding/review");
        }, 400);
        return;
      }

      // Navigate to Review / Submission Stage
      router.push("/onboarding/review");
    } catch (err) {
      console.error("Partner preferences save error:", err);
      setServerError("We couldn't save your preferences. Please try again.");
    } finally {
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
            <span>EDIT PROFILE • PARTNER PREFERENCES</span>
          </div>
        ) : (
          <div className={styles.progressHeader}>
            <OnboardingProgress currentStep={6} totalSteps={6} />
          </div>
        )}

        {/* Main Heading & Subtitle */}
        <div className={styles.headerGroup}>
          <h1 className={styles.title}>
            {isEditMode ? "Edit Partner Preferences" : "What are you looking for?"}
          </h1>
          <p className={styles.subtitle}>
            {isEditMode
              ? "Update age, height, community, and marital status criteria."
              : "Tell us what matters to you so we can find more compatible matches."}
          </p>
        </div>

        {/* Introduction / Reassurance Banner */}
        <div className={styles.instructionBanner}>
          <span>
            {isEditMode
              ? "These preferences help us personalize your matches. Any updates will reflect immediately."
              : "These preferences help us personalize your matches. You can always change them later."}
          </span>
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

        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading your preferences...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            {/* SECTION 1: AGE & HEIGHT */}
            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionEyebrow}>AGE & HEIGHT</span>
              {(minAge || maxAge || minHeightCm || maxHeightCm) && (
                <button
                  type="button"
                  onClick={handleClearAgeHeight}
                  className={styles.sectionClearBtn}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Age Range Row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <CustomSelect
                  id="minAge"
                  label="Minimum Age"
                  placeholder="No preference"
                  options={AGE_OPTIONS}
                  value={minAge}
                  onChange={(val) => {
                    setMinAge(val);
                    if (errors.ageRange) setErrors((prev) => ({ ...prev, ageRange: "" }));
                  }}
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <CustomSelect
                  id="maxAge"
                  label="Maximum Age"
                  placeholder="No preference"
                  options={AGE_OPTIONS}
                  value={maxAge}
                  onChange={(val) => {
                    setMaxAge(val);
                    if (errors.ageRange) setErrors((prev) => ({ ...prev, ageRange: "" }));
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {errors.ageRange && (
              <span className={styles.fieldError}>{errors.ageRange}</span>
            )}

            {/* Height Range Row */}
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <CustomSelect
                  id="minHeightCm"
                  label="Minimum Height"
                  placeholder="No preference"
                  options={HEIGHT_OPTIONS}
                  value={minHeightCm}
                  onChange={(val) => {
                    setMinHeightCm(val);
                    if (errors.heightRange)
                      setErrors((prev) => ({ ...prev, heightRange: "" }));
                  }}
                  isSearchable
                  searchPlaceholder="Search height..."
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <CustomSelect
                  id="maxHeightCm"
                  label="Maximum Height"
                  placeholder="No preference"
                  options={HEIGHT_OPTIONS}
                  value={maxHeightCm}
                  onChange={(val) => {
                    setMaxHeightCm(val);
                    if (errors.heightRange)
                      setErrors((prev) => ({ ...prev, heightRange: "" }));
                  }}
                  isSearchable
                  searchPlaceholder="Search height..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
            {errors.heightRange && (
              <span className={styles.fieldError}>{errors.heightRange}</span>
            )}

            {/* SECTION 2: RELIGION & COMMUNITY */}
            <div className={styles.sectionDivider} aria-hidden="true" />

            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionEyebrow}>RELIGION & COMMUNITY</span>
              {(religionIds.length > 0 ||
                communityIds.length > 0 ||
                subCommunityIds.length > 0 ||
                casteIds.length > 0 ||
                gotraIds.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearReligionCommunity}
                  className={styles.sectionClearBtn}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Religions Multi-Select */}
            <div className={styles.formFullWidth}>
              <CustomMultiSelect
                id="partnerReligions"
                label="Religion"
                placeholder="No preference (All religions)"
                options={religionOptions}
                values={religionIds}
                onChange={handleReligionChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Communities Multi-Select (Available when religions selected or all) */}
            {religionIds.length > 0 && availableCommunities.length > 0 && (
              <div className={styles.formFullWidth}>
                <CustomMultiSelect
                  id="partnerCommunities"
                  label="Community"
                  placeholder="No preference (All communities in selected religions)"
                  options={availableCommunities}
                  values={communityIds}
                  onChange={handleCommunityChange}
                  disabled={isSubmitting}
                />
              </div>
            )}

            {/* Sub-communities, Castes, Gotras (Available when communities selected) */}
            {communityIds.length > 0 && (
              <div className={styles.childCulturalGrid}>
                {/* Sub-communities */}
                {availableSubCommunities.length > 0 && (
                  <div className={styles.formFullWidth}>
                    <CustomMultiSelect
                      id="partnerSubCommunities"
                      label="Sub-community"
                      placeholder="No preference"
                      options={availableSubCommunities}
                      values={subCommunityIds}
                      onChange={setSubCommunityIds}
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Castes */}
                {availableCastes.length > 0 && (
                  <div className={styles.formFullWidth}>
                    <CustomMultiSelect
                      id="partnerCastes"
                      label="Caste"
                      placeholder="No preference"
                      options={availableCastes}
                      values={casteIds}
                      onChange={setCasteIds}
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Gotras */}
                {availableGotras.length > 0 && (
                  <div className={styles.formFullWidth}>
                    <CustomMultiSelect
                      id="partnerGotras"
                      label="Gotra"
                      placeholder="No preference"
                      options={availableGotras}
                      values={gotraIds}
                      onChange={setGotraIds}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: EDUCATION & CAREER */}
            <div className={styles.sectionDivider} aria-hidden="true" />

            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionEyebrow}>EDUCATION & CAREER</span>
              {(educationIds.length > 0 || occupationIds.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearEducationCareer}
                  className={styles.sectionClearBtn}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Education Multi-Select */}
            <div className={styles.formFullWidth}>
              <CustomMultiSelect
                id="partnerEducations"
                label="Education"
                placeholder="No preference (All education levels)"
                options={educationOptions}
                values={educationIds}
                onChange={setEducationIds}
                disabled={isSubmitting}
              />
            </div>

            {/* Occupation Multi-Select */}
            <div className={styles.formFullWidth}>
              <CustomMultiSelect
                id="partnerOccupations"
                label="Occupation"
                placeholder="No preference (All occupations)"
                options={occupationOptions}
                values={occupationIds}
                onChange={setOccupationIds}
                disabled={isSubmitting}
              />
            </div>

            {/* SECTION 4: OTHER PREFERENCES (CAPSULES) */}
            <div className={styles.sectionDivider} aria-hidden="true" />

            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionEyebrow}>OTHER PREFERENCES</span>
              {(manglikStatuses.length > 0 || maritalStatuses.length > 0) && (
                <button
                  type="button"
                  onClick={handleClearOtherPreferences}
                  className={styles.sectionClearBtn}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Manglik Preference Capsules */}
            <div className={styles.capsuleSection}>
              <label className={styles.capsuleGroupLabel}>
                Manglik Preference
                <span className={styles.capsuleSubtext}>
                  (Select all that you are open to)
                </span>
              </label>
              <div
                className={styles.capsuleGrid}
                role="group"
                aria-label="Manglik preferences"
              >
                {MANGLIK_CAPSULES.map((item) => {
                  const isSelected = manglikStatuses.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleToggleManglik(item.value)}
                      className={[
                        styles.capsuleButton,
                        isSelected ? styles.capsuleSelected : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-pressed={isSelected}
                      disabled={isSubmitting}
                    >
                      <span className={styles.capsuleIcon}>
                        {isSelected ? "✓" : "+"}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Marital Status Preference Capsules */}
            <div className={styles.capsuleSection}>
              <label className={styles.capsuleGroupLabel}>
                Marital Status Preference
                <span className={styles.capsuleSubtext}>
                  (Select all that you are open to)
                </span>
              </label>
              <div
                className={styles.capsuleGrid}
                role="group"
                aria-label="Marital status preferences"
              >
                {MARITAL_STATUS_CAPSULES.map((item) => {
                  const isSelected = maritalStatuses.includes(item.value);
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => handleToggleMaritalStatus(item.value)}
                      className={[
                        styles.capsuleButton,
                        isSelected ? styles.capsuleSelected : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      aria-pressed={isSelected}
                      disabled={isSubmitting}
                    >
                      <span className={styles.capsuleIcon}>
                        {isSelected ? "✓" : "+"}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conclusive Callout (Onboarding Only) */}
            {!isEditMode && (
              <div className={styles.completionCallout}>
                <p className={styles.calloutTitle}>You&apos;re almost there.</p>
                <p className={styles.calloutSubtitle}>
                  Save your preferences to complete your onboarding profile.
                </p>
              </div>
            )}

            {/* Subtle Panel Divider */}
            <div className={styles.divider} aria-hidden="true" />

            {/* Bottom Actions: Cancel / Save Changes in Edit Mode, Back / Finish Profile in Onboarding */}
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
                  href="/onboarding/photos"
                  className={styles.backButton}
                  aria-label="Go back to Step 5: Photos"
                >
                  ← Back
                </Link>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.continueButton}
                >
                  <span>
                    {isSubmitting ? "Saving preferences..." : "Finish Profile"}
                  </span>
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
              <span>Your preferences are private and protected.</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
