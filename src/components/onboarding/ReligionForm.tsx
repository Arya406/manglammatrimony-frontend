"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ManglikStatus,
  ReligionItem,
  CommunityItem,
  SubCommunityItem,
  CasteItem,
  SubCasteItem,
  GotraItem,
  SaveReligionPayload,
} from "@/types/profile";
import {
  saveReligion,
  fetchReligions,
  fetchCommunities,
  fetchSubCommunities,
  fetchCastes,
  fetchSubCastes,
  fetchGotras,
  getProfile,
} from "@/lib/api/profile";
import { DEFAULT_RELIGIONS, DEFAULT_COMMUNITIES } from "@/data/religions";
import { CustomSelect, SelectOption } from "@/components/common/CustomSelect";
import { OnboardingProgress } from "./OnboardingProgress";
import styles from "./ReligionForm.module.css";

const TOKEN_OTHER = "__OTHER__";
const TOKEN_PREFER_NOT_TO_SAY = "__PREFER_NOT_TO_SAY__";
const TOKEN_NOT_APPLICABLE = "__NOT_APPLICABLE__";

const MANGLIK_OPTIONS: Array<{ value: ManglikStatus; label: string }> = [
  { value: "YES", label: "Yes" },
  { value: "NO", label: "No" },
  { value: "DONT_KNOW", label: "Don't Know" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
];

const ERROR_MESSAGE_MAP: Record<string, string> = {
  INVALID_RELIGION: "Please select a valid religion.",
  INVALID_COMMUNITY: "Please select a valid community.",
  INVALID_CUSTOM_RELIGION: "Please specify your religion.",
  INVALID_CUSTOM_COMMUNITY: "Please specify your community.",
  INVALID_CUSTOM_CASTE: "Please specify your caste.",
  INVALID_CUSTOM_SUB_CASTE: "Please specify your sub-caste.",
  COMMUNITY_RELIGION_MISMATCH: "The selected community does not belong to this religion.",
  INVALID_SUB_COMMUNITY: "Please select a valid sub-community.",
  SUB_COMMUNITY_COMMUNITY_MISMATCH: "The selected sub-community does not belong to this community.",
  INVALID_CASTE: "Please select a valid caste.",
  CASTE_COMMUNITY_MISMATCH: "The selected caste does not belong to this community.",
  INVALID_SUB_CASTE: "Please select a valid sub-caste.",
  SUB_CASTE_CASTE_MISMATCH: "The selected sub-caste does not belong to this caste.",
  INVALID_GOTRA: "Please select a valid gotra.",
  GOTRA_COMMUNITY_MISMATCH: "The selected gotra does not belong to this community.",
  GOTRA_RELIGION_MISMATCH: "Gotra is only applicable for Hindu religion.",
  INVALID_MANGLIK_STATUS: "Please select a valid Manglik status.",
};

export function ReligionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";

  // Form State
  const [religionValue, setReligionValue] = useState<string>("");
  const [customReligion, setCustomReligion] = useState<string>("");

  const [communityValue, setCommunityValue] = useState<string>("");
  const [customCommunity, setCustomCommunity] = useState<string>("");

  const [casteValue, setCasteValue] = useState<string>("");
  const [customCaste, setCustomCaste] = useState<string>("");

  const [subCasteValue, setSubCasteValue] = useState<string>("");
  const [customSubCaste, setCustomSubCaste] = useState<string>("");

  const [subCommunityId, setSubCommunityId] = useState<string>("");
  const [gotraId, setGotraId] = useState<string>("");
  const [manglik, setManglik] = useState<ManglikStatus | null>(null);

  // Master Data Lists
  const [religions, setReligions] = useState<ReligionItem[]>(DEFAULT_RELIGIONS);
  const [communities, setCommunities] = useState<CommunityItem[]>(DEFAULT_COMMUNITIES);
  const [subCommunities, setSubCommunities] = useState<SubCommunityItem[]>([]);
  const [castes, setCastes] = useState<CasteItem[]>([]);
  const [subCastes, setSubCastes] = useState<SubCasteItem[]>([]);
  const [gotras, setGotras] = useState<GotraItem[]>([]);

  // Loading & Submission State
  const [isLoadingReligions, setIsLoadingReligions] = useState(false);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Helper taxonomy finders
  const hinduReligion = religions.find((r) => r.slug === "hindu");
  const otherReligion = religions.find((r) => r.slug === "other");
  const preferNotToSayReligion = religions.find((r) => r.slug === "prefer-not-to-say");

  const otherCommunity = communities.find((c) => c.slug === "other");
  const preferNotToSayCommunity = communities.find((c) => c.slug === "prefer-not-to-say");

  // Determine active states
  const isHindu =
    Boolean(hinduReligion?.id) && religionValue === hinduReligion?.id;

  const isOtherReligion =
    religionValue === TOKEN_OTHER ||
    (Boolean(otherReligion?.id) && religionValue === otherReligion?.id);

  const isOtherCommunity =
    communityValue === TOKEN_OTHER ||
    (Boolean(otherCommunity?.id) && communityValue === otherCommunity?.id);

  const isOtherCaste = casteValue === TOKEN_OTHER;
  const isOtherSubCaste = subCasteValue === TOKEN_OTHER;


  // 1. Initial Load: Fetch Religions & Communities and Prefill
  useEffect(() => {
    let isMounted = true;
    async function loadMasterData() {
      setIsLoadingReligions(true);
      try {
        const [relRes, comRes, profileRes] = await Promise.all([
          fetchReligions(),
          fetchCommunities(),
          getProfile(),
        ]);

        if (!isMounted) return;

        let loadedReligions = DEFAULT_RELIGIONS;
        let loadedCommunities = DEFAULT_COMMUNITIES;

        if (relRes.success && Array.isArray(relRes.data) && relRes.data.length > 0) {
          loadedReligions = relRes.data;
          setReligions(loadedReligions);
        }
        if (comRes.success && Array.isArray(comRes.data) && comRes.data.length > 0) {
          loadedCommunities = comRes.data;
          setCommunities(loadedCommunities);
        }

        if (profileRes.success && profileRes.data?.religion) {
          const r = profileRes.data.religion;

          // Prefill Religion
          if (r.religionId) {
            setReligionValue(r.religionId);
            if (r.customReligion) {
              setCustomReligion(r.customReligion);
            }
          }

          // Prefill Community
          if (r.customCommunity === "Not Applicable") {
            setCommunityValue(TOKEN_NOT_APPLICABLE);
          } else if (
            r.customCommunity === "Prefer not to say" ||
            r.community?.slug === "prefer-not-to-say"
          ) {
            const pnts = loadedCommunities.find((c) => c.slug === "prefer-not-to-say");
            setCommunityValue(pnts?.id || TOKEN_PREFER_NOT_TO_SAY);
          } else if (r.community?.slug === "other" || (r.customCommunity && !r.communityId)) {
            const oth = loadedCommunities.find((c) => c.slug === "other");
            setCommunityValue(oth?.id || TOKEN_OTHER);
            setCustomCommunity(r.customCommunity || "");
          } else if (r.communityId) {
            setCommunityValue(r.communityId);
            if (r.customCommunity) setCustomCommunity(r.customCommunity);

            // Fetch dependent children for structured community
            const isProfileHindu = r.religion?.slug === "hindu";
            const [subComRes, casteRes, gotraRes] = await Promise.all([
              fetchSubCommunities(r.communityId),
              fetchCastes(r.communityId),
              isProfileHindu
                ? fetchGotras(r.communityId)
                : Promise.resolve({ success: true, data: [] }),
            ]);
            if (isMounted) {
              setSubCommunities(
                subComRes.success && Array.isArray(subComRes.data) ? subComRes.data : []
              );
              setCastes(casteRes.success && Array.isArray(casteRes.data) ? casteRes.data : []);
              setGotras(
                isProfileHindu && gotraRes.success && Array.isArray(gotraRes.data)
                  ? gotraRes.data
                  : []
              );
            }
          }

          // Prefill Caste
          if (r.customCaste === "Not Applicable") {
            setCasteValue(TOKEN_NOT_APPLICABLE);
          } else if (r.customCaste === "Prefer not to say") {
            setCasteValue(TOKEN_PREFER_NOT_TO_SAY);
          } else if (r.customCaste) {
            setCasteValue(TOKEN_OTHER);
            setCustomCaste(r.customCaste);
          } else if (r.casteId) {
            setCasteValue(r.casteId);
            const subCasteRes = await fetchSubCastes(r.casteId);
            if (isMounted && subCasteRes.success && Array.isArray(subCasteRes.data)) {
              setSubCastes(subCasteRes.data);
            }
          }

          // Prefill Sub-Caste
          if (r.customSubCaste === "Not Applicable") {
            setSubCasteValue(TOKEN_NOT_APPLICABLE);
          } else if (r.customSubCaste === "Prefer not to say") {
            setSubCasteValue(TOKEN_PREFER_NOT_TO_SAY);
          } else if (r.customSubCaste) {
            setSubCasteValue(TOKEN_OTHER);
            setCustomSubCaste(r.customSubCaste);
          } else if (r.subCasteId) {
            setSubCasteValue(r.subCasteId);
          }

          if (r.subCommunityId) setSubCommunityId(r.subCommunityId);
          if (r.religion?.slug === "hindu" && r.gotraId) {
            setGotraId(r.gotraId);
          } else {
            setGotraId("");
          }
          if (r.manglik) setManglik(r.manglik);
        }
      } catch (err) {
        console.warn("Using fallback master data for religions:", err);
      } finally {
        if (isMounted) setIsLoadingReligions(false);
      }
    }

    loadMasterData();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Cascade when Religion changes (Atomic Dependency Clearing)
  const handleReligionChange = async (newVal: string) => {
    setReligionValue(newVal);
    setCustomReligion("");

    if (errors.religionId || errors.customReligion) {
      setErrors((prev) => ({ ...prev, religionId: "", customReligion: "" }));
    }

    // ATOMIC CLEAR: Religion → clears Community/Caste/Sub-caste/Gotra
    setCommunityValue("");
    setCustomCommunity("");
    setCasteValue("");
    setCustomCaste("");
    setSubCasteValue("");
    setCustomSubCaste("");
    setSubCommunityId("");
    setGotraId("");
    setSubCommunities([]);
    setCastes([]);
    setSubCastes([]);
    setGotras([]);

    if (!newVal || newVal === TOKEN_OTHER || newVal === TOKEN_PREFER_NOT_TO_SAY) return;

    // Fetch communities filtered by religion
    setIsLoadingCommunities(true);
    try {
      const res = await fetchCommunities(newVal);
      if (res.success && Array.isArray(res.data)) {
        setCommunities(res.data);
      }
    } catch (err) {
      console.warn("Error fetching communities for religion:", err);
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  // 3. Cascade when Community changes (Atomic Dependency Clearing)
  const handleCommunityChange = async (newVal: string) => {
    setCommunityValue(newVal);
    setCustomCommunity("");

    if (errors.communityId || errors.customCommunity) {
      setErrors((prev) => ({ ...prev, communityId: "", customCommunity: "" }));
    }

    // ATOMIC CLEAR: Community → clears Caste/Sub-caste/Gotra
    setCasteValue("");
    setCustomCaste("");
    setSubCasteValue("");
    setCustomSubCaste("");
    setSubCommunityId("");
    setGotraId("");
    setSubCommunities([]);
    setCastes([]);
    setSubCastes([]);
    setGotras([]);

    if (
      !newVal ||
      newVal === TOKEN_OTHER ||
      newVal === TOKEN_PREFER_NOT_TO_SAY ||
      newVal === TOKEN_NOT_APPLICABLE ||
      newVal === otherCommunity?.id ||
      newVal === preferNotToSayCommunity?.id
    ) {
      return;
    }

    // Fetch sub-communities, castes, and gotras in parallel for structured community
    setIsLoadingChildren(true);
    try {
      const [subComRes, casteRes, gotraRes] = await Promise.all([
        fetchSubCommunities(newVal),
        fetchCastes(newVal),
        isHindu ? fetchGotras(newVal) : Promise.resolve({ success: true, data: [] }),
      ]);

      setSubCommunities(subComRes.success && Array.isArray(subComRes.data) ? subComRes.data : []);
      setCastes(casteRes.success && Array.isArray(casteRes.data) ? casteRes.data : []);
      setGotras(isHindu && gotraRes.success && Array.isArray(gotraRes.data) ? gotraRes.data : []);
    } catch (err) {
      console.warn("Error fetching community children:", err);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  // 4. Cascade when Caste changes (Atomic Dependency Clearing)
  const handleCasteChange = async (newVal: string) => {
    setCasteValue(newVal);
    setCustomCaste("");

    if (errors.casteId || errors.customCaste) {
      setErrors((prev) => ({ ...prev, casteId: "", customCaste: "" }));
    }

    // ATOMIC CLEAR: Caste → clears Sub-caste
    setSubCasteValue("");
    setCustomSubCaste("");
    setSubCastes([]);

    if (
      !newVal ||
      newVal === TOKEN_OTHER ||
      newVal === TOKEN_PREFER_NOT_TO_SAY ||
      newVal === TOKEN_NOT_APPLICABLE
    ) {
      return;
    }

    try {
      const res = await fetchSubCastes(newVal);
      setSubCastes(res.success && Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn("Error fetching sub-castes:", err);
    }
  };

  // Build Options Lists
  // 1. Religion Options: structured religions, then Other / Not listed, then Prefer not to say
  const baseReligions = religions.filter(
    (r) => r.slug !== "other" && r.slug !== "prefer-not-to-say"
  );
  const religionOptions: SelectOption[] = [
    ...baseReligions.map((r) => ({ value: r.id, label: r.name })),
    {
      value: otherReligion?.id || TOKEN_OTHER,
      label: "Other / Not listed",
    },
    {
      value: preferNotToSayReligion?.id || TOKEN_PREFER_NOT_TO_SAY,
      label: "Prefer not to say",
    },
  ];

  // 2. Community Options
  const baseCommunities = communities.filter(
    (c) => c.slug !== "other" && c.slug !== "prefer-not-to-say"
  );
  const communityOptions: SelectOption[] = [
    ...baseCommunities.map((c) => ({ value: c.id, label: c.name })),
    {
      value: otherCommunity?.id || TOKEN_OTHER,
      label: "Other / Not listed",
    },
    {
      value: preferNotToSayCommunity?.id || TOKEN_PREFER_NOT_TO_SAY,
      label: "Prefer not to say",
    },
    {
      value: TOKEN_NOT_APPLICABLE,
      label: "Not Applicable",
    },
  ];

  // 3. Caste Options
  const baseCastes = castes.filter(
    (c) => c.slug !== "other" && c.slug !== "prefer-not-to-say"
  );
  const casteOptions: SelectOption[] = [
    ...baseCastes.map((c) => ({ value: c.id, label: c.name })),
    { value: TOKEN_OTHER, label: "Other / Not listed" },
    { value: TOKEN_PREFER_NOT_TO_SAY, label: "Prefer not to say" },
    { value: TOKEN_NOT_APPLICABLE, label: "Not Applicable" },
  ];

  // 4. Sub-caste Options
  const baseSubCastes = subCastes.filter(
    (sc) => sc.slug !== "other" && sc.slug !== "prefer-not-to-say"
  );
  const subCasteOptions: SelectOption[] = [
    ...baseSubCastes.map((sc) => ({ value: sc.id, label: sc.name })),
    { value: TOKEN_OTHER, label: "Other / Not listed" },
    { value: TOKEN_PREFER_NOT_TO_SAY, label: "Prefer not to say" },
    { value: TOKEN_NOT_APPLICABLE, label: "Not Applicable" },
  ];

  // 5. Sub-community Options
  const subCommunityOptions: SelectOption[] = subCommunities.map((sc) => ({
    value: sc.id,
    label: sc.name,
  }));

  // 6. Gotra Options (Hindu only: API gotras + Other + Not Applicable)
  const gotraOptions: SelectOption[] = [
    ...gotras.map((g) => ({
      value: g.id,
      label: g.name,
    })),
    { value: TOKEN_OTHER, label: "Other" },
    { value: TOKEN_NOT_APPLICABLE, label: "Not Applicable" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!religionValue) {
      newErrors.religionId = "Please select your religion.";
    } else if (isOtherReligion && !customReligion.trim()) {
      newErrors.customReligion = "Please specify your religion.";
    }

    if (isOtherCommunity && !customCommunity.trim()) {
      newErrors.customCommunity = "Please specify your community.";
    }

    if (isOtherCaste && !customCaste.trim()) {
      newErrors.customCaste = "Please specify your caste.";
    }

    if (isOtherSubCaste && !customSubCaste.trim()) {
      newErrors.customSubCaste = "Please specify your sub-caste.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Resolve Religion
    let resolvedReligionId = religionValue;
    let resolvedCustomReligion: string | null = null;
    if (isOtherReligion) {
      resolvedReligionId = otherReligion?.id || religionValue;
      resolvedCustomReligion = customReligion.trim();
    } else if (
      religionValue === TOKEN_PREFER_NOT_TO_SAY ||
      religionValue === preferNotToSayReligion?.id
    ) {
      resolvedReligionId = preferNotToSayReligion?.id || religionValue;
      resolvedCustomReligion = null;
    }

    // Resolve Community
    let resolvedCommunityId: string | null = null;
    let resolvedCustomCommunity: string | null = null;
    if (isOtherCommunity) {
      resolvedCommunityId = otherCommunity?.id || null;
      resolvedCustomCommunity = customCommunity.trim();
    } else if (communityValue === TOKEN_NOT_APPLICABLE) {
      resolvedCommunityId = null;
      resolvedCustomCommunity = "Not Applicable";
    } else if (
      communityValue === TOKEN_PREFER_NOT_TO_SAY ||
      communityValue === preferNotToSayCommunity?.id
    ) {
      resolvedCommunityId = preferNotToSayCommunity?.id || null;
      resolvedCustomCommunity = preferNotToSayCommunity?.id ? null : "Prefer not to say";
    } else if (communityValue) {
      resolvedCommunityId = communityValue;
      resolvedCustomCommunity = null;
    }

    // Resolve Caste
    let resolvedCasteId: string | null = null;
    let resolvedCustomCaste: string | null = null;
    if (isOtherCaste) {
      resolvedCasteId = null;
      resolvedCustomCaste = customCaste.trim();
    } else if (casteValue === TOKEN_NOT_APPLICABLE) {
      resolvedCasteId = null;
      resolvedCustomCaste = "Not Applicable";
    } else if (casteValue === TOKEN_PREFER_NOT_TO_SAY) {
      resolvedCasteId = null;
      resolvedCustomCaste = "Prefer not to say";
    } else if (casteValue) {
      resolvedCasteId = casteValue;
      resolvedCustomCaste = null;
    }

    // Resolve Sub-Caste
    let resolvedSubCasteId: string | null = null;
    let resolvedCustomSubCaste: string | null = null;
    if (isOtherSubCaste) {
      resolvedSubCasteId = null;
      resolvedCustomSubCaste = customSubCaste.trim();
    } else if (subCasteValue === TOKEN_NOT_APPLICABLE) {
      resolvedSubCasteId = null;
      resolvedCustomSubCaste = "Not Applicable";
    } else if (subCasteValue === TOKEN_PREFER_NOT_TO_SAY) {
      resolvedSubCasteId = null;
      resolvedCustomSubCaste = "Prefer not to say";
    } else if (subCasteValue) {
      resolvedSubCasteId = subCasteValue;
      resolvedCustomSubCaste = null;
    }

    const resolvedGotraId =
      isHindu && gotraId && gotraId !== TOKEN_OTHER && gotraId !== TOKEN_NOT_APPLICABLE
        ? gotraId
        : null;

    const payload: SaveReligionPayload = {
      religionId: resolvedReligionId,
      customReligion: resolvedCustomReligion,
      communityId: resolvedCommunityId,
      customCommunity: resolvedCustomCommunity,
      subCommunityId: subCommunityId || null,
      casteId: resolvedCasteId,
      customCaste: resolvedCustomCaste,
      subCasteId: resolvedSubCasteId,
      customSubCaste: resolvedCustomSubCaste,
      gotraId: resolvedGotraId,
      manglik: manglik || null,
    };

    try {
      const response = await saveReligion(payload);

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

      // Navigate to Screen 4: Education & Career
      router.push("/onboarding/education-career");
    } catch (err) {
      console.error("Religion details submission error:", err);
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
            <span>EDIT PROFILE • RELIGION & COMMUNITY</span>
          </div>
        ) : (
          <div className={styles.progressHeader}>
            <OnboardingProgress currentStep={3} totalSteps={6} />
          </div>
        )}

        {/* Main Heading & Subtitle */}
        <div className={styles.headerGroup}>
          <h1 className={styles.title}>
            {isEditMode ? "Edit Religion & Community" : "Tell us about your background"}
          </h1>
          <p className={styles.subtitle}>
            {isEditMode
              ? "Update religion, community, caste, and horoscope details."
              : "Your cultural preferences help us find more meaningful matches."}
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

        {/* Religion & Cultural Form */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {/* Section 1: Cultural Background */}
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>CULTURAL BACKGROUND</span>
          </div>

          {/* Field 1: Religion (Required) */}
          <div className={styles.formFullWidth}>
            <CustomSelect
              id="religion"
              label="Religion"
              placeholder={isLoadingReligions ? "Loading religions..." : "Select your religion"}
              options={religionOptions}
              value={religionValue}
              onChange={handleReligionChange}
              isSearchable
              searchPlaceholder="Search religion (e.g. Hindu, Sikh)..."
              error={errors.religionId}
              required
              disabled={isSubmitting || isLoadingReligions}
            />

            {/* Custom Religion Input when Other / Not listed is selected */}
            {isOtherReligion && (
              <div className={styles.customFieldContainer}>
                <label htmlFor="customReligion" className={styles.label}>
                  Please specify your religion <span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="customReligion"
                  type="text"
                  className={[styles.input, errors.customReligion ? styles.inputError : ""]
                    .filter(Boolean)
                    .join(" ")}
                  placeholder="Please specify your religion"
                  value={customReligion}
                  onChange={(e) => {
                    setCustomReligion(e.target.value);
                    if (errors.customReligion) {
                      setErrors((prev) => ({ ...prev, customReligion: "" }));
                    }
                  }}
                  disabled={isSubmitting}
                  maxLength={100}
                  autoFocus
                />
                {errors.customReligion && (
                  <span className={styles.fieldError}>{errors.customReligion}</span>
                )}
              </div>
            )}
          </div>

          {/* Progressive Disclosure: Community appears when Religion is chosen */}
          {Boolean(religionValue) && (
            <div className={styles.formFullWidth}>
              <CustomSelect
                id="community"
                label="Community"
                placeholder={
                  isLoadingCommunities ? "Loading communities..." : "Select your community"
                }
                options={communityOptions}
                value={communityValue}
                onChange={handleCommunityChange}
                isSearchable
                searchPlaceholder="Search community (e.g. Brahmin, Rajput)..."
                disabled={isSubmitting || isLoadingCommunities}
              />

              {/* Custom Community Input when Other / Not listed is selected */}
              {isOtherCommunity && (
                <div className={styles.customFieldContainer}>
                  <label htmlFor="customCommunity" className={styles.label}>
                    Please specify your community <span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="customCommunity"
                    type="text"
                    className={[styles.input, errors.customCommunity ? styles.inputError : ""]
                      .filter(Boolean)
                      .join(" ")}
                    placeholder="Please specify your community"
                    value={customCommunity}
                    onChange={(e) => {
                      setCustomCommunity(e.target.value);
                      if (errors.customCommunity) {
                        setErrors((prev) => ({ ...prev, customCommunity: "" }));
                      }
                    }}
                    disabled={isSubmitting}
                    maxLength={100}
                    autoFocus
                  />
                  {errors.customCommunity && (
                    <span className={styles.fieldError}>{errors.customCommunity}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Progressive Disclosure: Caste & Gotra when Community is chosen */}
          {Boolean(communityValue) && (
            <div className={isHindu ? styles.formRow : styles.formFullWidth}>
              {/* Caste */}
              <div className={styles.formGroup}>
                <CustomSelect
                  id="caste"
                  label="Caste"
                  placeholder={isLoadingChildren ? "Loading castes..." : "Select your caste"}
                  options={casteOptions}
                  value={casteValue}
                  onChange={handleCasteChange}
                  isSearchable
                  searchPlaceholder="Search caste..."
                  disabled={isSubmitting || isLoadingChildren}
                />

                {/* Custom Caste Input when Other / Not listed is selected */}
                {isOtherCaste && (
                  <div className={styles.customFieldContainer}>
                    <label htmlFor="customCaste" className={styles.label}>
                      Please specify your caste <span className={styles.requiredStar}>*</span>
                    </label>
                    <input
                      id="customCaste"
                      type="text"
                      className={[styles.input, errors.customCaste ? styles.inputError : ""]
                        .filter(Boolean)
                        .join(" ")}
                      placeholder="Please specify your caste"
                      value={customCaste}
                      onChange={(e) => {
                        setCustomCaste(e.target.value);
                        if (errors.customCaste) {
                          setErrors((prev) => ({ ...prev, customCaste: "" }));
                        }
                      }}
                      disabled={isSubmitting}
                      maxLength={100}
                      autoFocus
                    />
                    {errors.customCaste && (
                      <span className={styles.fieldError}>{errors.customCaste}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Gotra (Hindu only) */}
              {isHindu && (
                <div className={styles.formGroup}>
                  <CustomSelect
                    id="gotra"
                    label="Gotra"
                    placeholder={isLoadingChildren ? "Loading gotras..." : "Select gotra"}
                    options={gotraOptions}
                    value={gotraId}
                    onChange={(val) => setGotraId(val)}
                    isSearchable
                    searchPlaceholder="Search gotra..."
                    disabled={isSubmitting || isLoadingChildren}
                  />
                </div>
              )}
            </div>
          )}

          {/* Progressive Disclosure: Sub-community & Sub-caste */}
          {Boolean(communityValue) && (subCommunityOptions.length > 0 || Boolean(casteValue)) && (
            <div className={styles.formRow}>
              {/* Sub-community (if master data available) */}
              {subCommunityOptions.length > 0 && (
                <div className={styles.formGroup}>
                  <CustomSelect
                    id="subCommunity"
                    label="Sub-community"
                    placeholder="Select sub-community"
                    options={subCommunityOptions}
                    value={subCommunityId}
                    onChange={(val) => setSubCommunityId(val)}
                    isSearchable
                    searchPlaceholder="Search sub-community..."
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Sub-caste when Caste is chosen */}
              {Boolean(casteValue) && (
                <div className={styles.formGroup}>
                  <CustomSelect
                    id="subCaste"
                    label="Sub-caste"
                    placeholder="Select your sub-caste"
                    options={subCasteOptions}
                    value={subCasteValue}
                    onChange={(val) => {
                      setSubCasteValue(val);
                      setCustomSubCaste("");
                      if (errors.customSubCaste) {
                        setErrors((prev) => ({ ...prev, customSubCaste: "" }));
                      }
                    }}
                    isSearchable
                    searchPlaceholder="Search sub-caste..."
                    disabled={isSubmitting}
                  />

                  {/* Custom Sub-Caste Input when Other / Not listed is selected */}
                  {isOtherSubCaste && (
                    <div className={styles.customFieldContainer}>
                      <label htmlFor="customSubCaste" className={styles.label}>
                        Please specify your sub-caste{" "}
                        <span className={styles.requiredStar}>*</span>
                      </label>
                      <input
                        id="customSubCaste"
                        type="text"
                        className={[
                          styles.input,
                          errors.customSubCaste ? styles.inputError : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        placeholder="Please specify your sub-caste"
                        value={customSubCaste}
                        onChange={(e) => {
                          setCustomSubCaste(e.target.value);
                          if (errors.customSubCaste) {
                            setErrors((prev) => ({ ...prev, customSubCaste: "" }));
                          }
                        }}
                        disabled={isSubmitting}
                        maxLength={100}
                        autoFocus
                      />
                      {errors.customSubCaste && (
                        <span className={styles.fieldError}>{errors.customSubCaste}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Manglik Status */}
          <div className={styles.sectionDivider} aria-hidden="true" />

          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>MANGLIK STATUS</span>
            <p className={styles.sectionHelper}>Select the option that best describes you.</p>
          </div>

          <div className={styles.manglikGrid}>
            {MANGLIK_OPTIONS.map((opt) => {
              const isSelected = manglik === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setManglik(isSelected ? null : opt.value)}
                  className={[
                    styles.manglikCapsule,
                    isSelected ? styles.manglikCapsuleSelected : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-pressed={isSelected}
                >
                  <span className={styles.manglikLabel}>{opt.label}</span>
                  {isSelected && (
                    <svg
                      className={styles.checkmarkIcon}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.739a.75.75 0 0 1 1.04-.208Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
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
                  {isSubmitting ? "Saving..." : saveSuccess ? "Saved ✓" : "Save Changes"}
                </span>
              </button>
            </div>
          ) : (
            <div className={styles.actionRow}>
              <Link
                href="/onboarding/personal-details"
                className={styles.backButton}
                aria-label="Go back to Step 2: Personal Details"
              >
                ← Back
              </Link>

              <button type="submit" disabled={isSubmitting} className={styles.continueButton}>
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
