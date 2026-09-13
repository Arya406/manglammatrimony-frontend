"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AdminProfileDetail,
  AdminUpdatePersonalDetailsPayload,
  AdminUpdateReligionPayload,
  AdminUpdateEducationCareerPayload,
  AdminUpdatePartnerPreferencesPayload,
} from "@/types/admin";
import {
  updateAdminProfileCreatedFor,
  updateAdminProfilePersonalDetails,
  updateAdminProfileReligion,
  updateAdminProfileEducationCareer,
  updateAdminProfilePartnerPreferences,
  getAdminProfileDetail,
} from "@/lib/api/admin";
import {
  fetchLanguages,
  fetchReligions,
  fetchCommunities,
  fetchSubCommunities,
  fetchCastes,
  fetchSubCastes,
  fetchGotras,
  fetchEducations,
  fetchSpecializations,
  fetchInstitutions,
  fetchEmploymentStatuses,
  fetchOccupations,
} from "@/lib/api/profile";
import {
  LanguageItem,
  ReligionItem,
  CommunityItem,
  SubCommunityItem,
  CasteItem,
  SubCasteItem,
  GotraItem,
  EducationItem,
  SpecializationItem,
  InstitutionItem,
  EmploymentStatusItem,
  OccupationItem,
  ProfileCreatedFor,
} from "@/types/profile";
import styles from "./AdminProfileEditModal.module.css";

interface AdminProfileEditModalProps {
  profileId: string;
  initialProfile: AdminProfileDetail;
  onClose: () => void;
  onProfileUpdated: (updatedProfile: AdminProfileDetail) => void;
}

type TabKey =
  | "profileCreatedFor"
  | "personalDetails"
  | "religion"
  | "educationCareer"
  | "partnerPreferences";

const PROFILE_CREATED_FOR_OPTIONS: Array<{ value: ProfileCreatedFor; label: string }> = [
  { value: "MYSELF", label: "Myself" },
  { value: "MY_SON", label: "Son" },
  { value: "MY_DAUGHTER", label: "Daughter" },
  { value: "MY_BROTHER", label: "Brother" },
  { value: "MY_SISTER", label: "Sister" },
  { value: "MY_RELATIVE", label: "Relative" },
  { value: "OTHER", label: "Client / Other" },
];

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const MARITAL_STATUS_OPTIONS = [
  { value: "NEVER_MARRIED", label: "Never Married" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
  { value: "AWAITING_DIVORCE", label: "Awaiting Divorce" },
  { value: "ANNULLED", label: "Annulled" },
];

const MANGLIK_OPTIONS = [
  { value: "NO", label: "No (Non-Manglik)" },
  { value: "YES", label: "Yes (Manglik)" },
  { value: "DONT_KNOW", label: "Don't Know" },
  { value: "NOT_APPLICABLE", label: "Not Applicable" },
];

const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "OTHER", label: "Other" },
];

const INCOME_RANGES = [
  { value: "BELOW_2_LAKH", label: "Below ₹2 Lakh" },
  { value: "TWO_TO_FIVE_LAKH", label: "₹2 - ₹5 Lakh" },
  { value: "FIVE_TO_TEN_LAKH", label: "₹5 - ₹10 Lakh" },
  { value: "TEN_TO_FIFTEEN_LAKH", label: "₹10 - ₹15 Lakh" },
  { value: "FIFTEEN_TO_TWENTY_LAKH", label: "₹15 - ₹20 Lakh" },
  { value: "TWENTY_TO_THIRTY_LAKH", label: "₹20 - ₹30 Lakh" },
  { value: "THIRTY_TO_FIFTY_LAKH", label: "₹30 - ₹50 Lakh" },
  { value: "FIFTY_LAKH_TO_ONE_CRORE", label: "₹50 Lakh - ₹1 Crore" },
  { value: "ABOVE_ONE_CRORE", label: "Above ₹1 Crore" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer Not To Say" },
];

export function AdminProfileEditModal({
  profileId,
  initialProfile,
  onClose,
  onProfileUpdated,
}: AdminProfileEditModalProps) {
  const [profile, setProfile] = useState<AdminProfileDetail>(initialProfile);
  const [activeTab, setActiveTab] = useState<TabKey>("profileCreatedFor");

  // Concurrency state
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState<string>(
    initialProfile.updatedAt
  );
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  // Status feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<TabKey | "close" | null>(null);

  // Master Data Catalogs
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [religions, setReligions] = useState<ReligionItem[]>([]);
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [subCommunities, setSubCommunities] = useState<SubCommunityItem[]>([]);
  const [castes, setCastes] = useState<CasteItem[]>([]);
  const [subCastes, setSubCastes] = useState<SubCasteItem[]>([]);
  const [gotras, setGotras] = useState<GotraItem[]>([]);
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationItem[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [employmentStatuses, setEmploymentStatuses] = useState<EmploymentStatusItem[]>([]);
  const [occupations, setOccupations] = useState<OccupationItem[]>([]);

  // ----------------------------------------------------
  // Form States
  // ----------------------------------------------------
  // Section A: Profile Created For
  const [profileCreatedFor, setProfileCreatedFor] = useState<ProfileCreatedFor>(
    (initialProfile.profileCreatedFor as ProfileCreatedFor) || "MYSELF"
  );

  // Section B: Personal Details
  const [firstName, setFirstName] = useState(initialProfile.personalDetails?.firstName || "");
  const [lastName, setLastName] = useState(initialProfile.personalDetails?.lastName || "");
  const [gender, setGender] = useState<"MALE" | "FEMALE" | "OTHER">(
    initialProfile.personalDetails?.gender || "MALE"
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    initialProfile.personalDetails?.dateOfBirth
      ? new Date(initialProfile.personalDetails.dateOfBirth).toISOString().split("T")[0]
      : ""
  );
  const [maritalStatus, setMaritalStatus] = useState(
    initialProfile.personalDetails?.maritalStatus || "NEVER_MARRIED"
  );
  const [heightCm, setHeightCm] = useState(
    initialProfile.personalDetails?.heightCm ? String(initialProfile.personalDetails.heightCm) : "170"
  );
  const [motherTongueId, setMotherTongueId] = useState(
    initialProfile.personalDetails?.motherTongueId || ""
  );
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>(
    initialProfile.languages ? initialProfile.languages.map((l) => l.id) : []
  );
  const [city, setCity] = useState(initialProfile.personalDetails?.city || "");
  const [state, setState] = useState(initialProfile.personalDetails?.state || "");

  // Section C: Religion & Community
  const [religionId, setReligionId] = useState("");
  const [customReligion, setCustomReligion] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [customCommunity, setCustomCommunity] = useState("");
  const [subCommunityId, setSubCommunityId] = useState("");
  const [casteId, setCasteId] = useState("");
  const [customCaste, setCustomCaste] = useState("");
  const [subCasteId, setSubCasteId] = useState("");
  const [customSubCaste, setCustomSubCaste] = useState("");
  const [gotraId, setGotraId] = useState("");
  const [manglik, setManglik] = useState<string>("DONT_KNOW");

  // Section D: Education & Career
  const [educationId, setEducationId] = useState("");
  const [specializationId, setSpecializationId] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [employmentStatusId, setEmploymentStatusId] = useState("");
  const [occupationId, setOccupationId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [annualIncomeRange, setAnnualIncomeRange] = useState("");

  // Section E: Partner Preferences
  const [prefMinAge, setPrefMinAge] = useState<string>("");
  const [prefMaxAge, setPrefMaxAge] = useState<string>("");
  const [prefMinHeight, setPrefMinHeight] = useState<string>("");
  const [prefMaxHeight, setPrefMaxHeight] = useState<string>("");
  const [prefReligionIds, setPrefReligionIds] = useState<string[]>([]);
  const [prefCommunityIds, setPrefCommunityIds] = useState<string[]>([]);
  const [prefSubCommunityIds, setPrefSubCommunityIds] = useState<string[]>([]);
  const [prefCasteIds, setPrefCasteIds] = useState<string[]>([]);
  const [prefGotraIds, setPrefGotraIds] = useState<string[]>([]);
  const [prefEducationIds, setPrefEducationIds] = useState<string[]>([]);
  const [prefOccupationIds, setPrefOccupationIds] = useState<string[]>([]);
  const [prefManglikStatuses, setPrefManglikStatuses] = useState<string[]>([]);
  const [prefMaritalStatuses, setPrefMaritalStatuses] = useState<string[]>([]);

  // Field level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ----------------------------------------------------
  // Load Master Data & Prefill
  // ----------------------------------------------------
  const populateProfileValues = useCallback((p: AdminProfileDetail) => {
    setProfile(p);
    setExpectedUpdatedAt(p.updatedAt);
    setProfileCreatedFor((p.profileCreatedFor as ProfileCreatedFor) || "MYSELF");

    // Personal Details
    if (p.personalDetails) {
      setFirstName(p.personalDetails.firstName || "");
      setLastName(p.personalDetails.lastName || "");
      setGender(p.personalDetails.gender || "MALE");
      setDateOfBirth(
        p.personalDetails.dateOfBirth
          ? new Date(p.personalDetails.dateOfBirth).toISOString().split("T")[0]
          : ""
      );
      setMaritalStatus(p.personalDetails.maritalStatus || "NEVER_MARRIED");
      setHeightCm(p.personalDetails.heightCm ? String(p.personalDetails.heightCm) : "170");
      setMotherTongueId(p.personalDetails.motherTongueId || "");
      setCity(p.personalDetails.city || "");
      setState(p.personalDetails.state || "");
    }
    if (p.languages) {
      setSelectedLanguageIds(p.languages.map((l) => l.id));
    }

    // Religion
    if (p.religion) {
      const r = p.religion as Record<string, unknown>;
      const relObj = r.religion as { id?: string } | undefined;
      const comObj = r.community as { id?: string } | undefined;
      const subComObj = r.subCommunity as { id?: string } | undefined;
      const casteObj = r.caste as { id?: string } | undefined;
      const subCasteObj = r.subCaste as { id?: string } | undefined;
      const gotraObj = r.gotra as { id?: string } | undefined;

      setReligionId((r.religionId as string) || relObj?.id || "");
      setCustomReligion((r.customReligion as string) || "");
      setCommunityId((r.communityId as string) || comObj?.id || "");
      setCustomCommunity((r.customCommunity as string) || "");
      setSubCommunityId((r.subCommunityId as string) || subComObj?.id || "");
      setCasteId((r.casteId as string) || casteObj?.id || "");
      setCustomCaste((r.customCaste as string) || "");
      setSubCasteId((r.subCasteId as string) || subCasteObj?.id || "");
      setCustomSubCaste((r.customSubCaste as string) || "");
      setGotraId((r.gotraId as string) || gotraObj?.id || "");
      setManglik((r.manglik as string) || "DONT_KNOW");
    }

    // Education & Career
    if (p.education) {
      const e = p.education as Record<string, unknown>;
      const eduObj = e.education as { id?: string } | undefined;
      setEducationId((e.educationId as string) || eduObj?.id || "");
      setSpecializationId((e.specializationId as string) || "");
      setInstitutionId((e.institutionId as string) || "");
      setInstitutionName((e.institutionName as string) || "");
    }
    if (p.career) {
      const c = p.career as Record<string, unknown>;
      const empObj = c.employmentStatus as { id?: string } | undefined;
      const occObj = c.occupation as { id?: string } | undefined;
      setEmploymentStatusId((c.employmentStatusId as string) || empObj?.id || "");
      setOccupationId((c.occupationId as string) || occObj?.id || "");
      setCompanyName((c.companyName as string) || "");
      setEmploymentType((c.employmentType as string) || "");
      setAnnualIncomeRange((c.annualIncomeRange as string) || "");
    }

    // Partner Preferences
    if (p.partnerPreference) {
      const pref = p.partnerPreference;
      setPrefMinAge(pref.minAge ? String(pref.minAge) : "");
      setPrefMaxAge(pref.maxAge ? String(pref.maxAge) : "");
      setPrefMinHeight(pref.minHeightCm ? String(pref.minHeightCm) : "");
      setPrefMaxHeight(pref.maxHeightCm ? String(pref.maxHeightCm) : "");
      setPrefReligionIds((pref.religions || []).map((r) => r.religion?.id || (r as unknown as { id?: string }).id || "").filter(Boolean));
      setPrefCommunityIds((pref.communities || []).map((c) => c.community?.id || (c as unknown as { id?: string }).id || "").filter(Boolean));
      setPrefSubCommunityIds((pref.subCommunities || []).map((sc) => sc.subCommunity?.id || (sc as unknown as { id?: string }).id || "").filter(Boolean));
      setPrefCasteIds((pref.castes || []).map((ca) => ca.caste?.id || (ca as unknown as { id?: string }).id || "").filter(Boolean));
      setPrefGotraIds((pref.gotras || []).map((g) => g.gotra?.id || (g as unknown as { id?: string }).id || "").filter(Boolean));
      setPrefEducationIds((pref.educations || []).map((e) => e.education?.id || (e as unknown as { id?: string }).id || "").filter(Boolean));
      setPrefOccupationIds((pref.occupations || []).map((o) => o.occupation?.id || (o as unknown as { id?: string }).id || "").filter(Boolean));
      setPrefManglikStatuses((pref.manglik || []).map((m) => m.manglik || (m as unknown as string)).filter(Boolean));
      setPrefMaritalStatuses((pref.maritalStatuses || []).map((ms) => ms.maritalStatus || (ms as unknown as string)).filter(Boolean));
    }

    setIsDirty(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadCatalogs() {
      try {
        const [langRes, relRes, comRes, eduRes, empRes] = await Promise.all([
          fetchLanguages(),
          fetchReligions(),
          fetchCommunities(),
          fetchEducations(),
          fetchEmploymentStatuses(),
        ]);

        if (!isMounted) return;
        if (langRes.success && Array.isArray(langRes.data)) setLanguages(langRes.data);
        if (relRes.success && Array.isArray(relRes.data)) setReligions(relRes.data);
        if (comRes.success && Array.isArray(comRes.data)) setCommunities(comRes.data);
        if (eduRes.success && Array.isArray(eduRes.data)) setEducations(eduRes.data);
        if (empRes.success && Array.isArray(empRes.data)) setEmploymentStatuses(empRes.data);

        populateProfileValues(initialProfile);

        // Fetch dependent taxonomy for initial profile if present
        const initRel = initialProfile.religion as Record<string, unknown> | null;
        const initRelCom = initRel?.community as { id?: string } | undefined;
        const cId = (initRel?.communityId as string) || initRelCom?.id;
        if (cId) {
          const [subCom, cst, gtr] = await Promise.all([
            fetchSubCommunities(cId),
            fetchCastes(cId),
            fetchGotras(cId),
          ]);
          if (isMounted) {
            if (subCom.success && Array.isArray(subCom.data)) setSubCommunities(subCom.data);
            if (cst.success && Array.isArray(cst.data)) setCastes(cst.data);
            if (gtr.success && Array.isArray(gtr.data)) setGotras(gtr.data);
          }
        }
        const initRelCst = initRel?.caste as { id?: string } | undefined;
        const caId = (initRel?.casteId as string) || initRelCst?.id;
        if (caId) {
          const subC = await fetchSubCastes(caId);
          if (isMounted && subC.success && Array.isArray(subC.data)) setSubCastes(subC.data);
        }

        // Fetch specializations for initial education
        const initEdu = initialProfile.education as Record<string, unknown> | null;
        const initEduItem = initEdu?.education as { id?: string } | undefined;
        const eId = (initEdu?.educationId as string) || initEduItem?.id;
        if (eId) {
          const specRes = await fetchSpecializations(eId);
          if (isMounted && specRes.success && Array.isArray(specRes.data)) {
            setSpecializations(specRes.data);
          }
        }
        // Fetch institutions
        const instRes = await fetchInstitutions();
        if (isMounted && instRes.success && Array.isArray(instRes.data)) {
          setInstitutions(instRes.data);
        }
        // Fetch occupations
        const occRes = await fetchOccupations();
        if (isMounted && occRes.success && Array.isArray(occRes.data)) {
          setOccupations(occRes.data);
        }
      } catch (err) {
        console.error("Error loading master catalogs:", err);
      }
    }

    loadCatalogs();
    return () => {
      isMounted = false;
    };
  }, [initialProfile, populateProfileValues]);

  // ----------------------------------------------------
  // Cultural Cascading Select Handlers
  // ----------------------------------------------------
  const handleReligionChange = async (newRelId: string) => {
    setReligionId(newRelId);
    setCustomReligion("");
    setIsDirty(true);

    // ATOMIC CLEAR: Dependent taxonomy
    setCommunityId("");
    setCustomCommunity("");
    setSubCommunityId("");
    setCasteId("");
    setCustomCaste("");
    setSubCasteId("");
    setCustomSubCaste("");
    setGotraId("");
    setSubCommunities([]);
    setCastes([]);
    setSubCastes([]);
    setGotras([]);

    if (newRelId) {
      try {
        const res = await fetchCommunities(newRelId);
        if (res.success && Array.isArray(res.data)) {
          setCommunities(res.data);
        }
      } catch (err) {
        console.warn("Failed fetching communities for religion:", err);
      }
    }
  };

  const handleCommunityChange = async (newComId: string) => {
    setCommunityId(newComId);
    setCustomCommunity("");
    setIsDirty(true);

    // ATOMIC CLEAR: Dependent sub-community, caste, sub-caste, gotra
    setSubCommunityId("");
    setCasteId("");
    setCustomCaste("");
    setSubCasteId("");
    setCustomSubCaste("");
    setGotraId("");
    setSubCommunities([]);
    setCastes([]);
    setSubCastes([]);
    setGotras([]);

    if (newComId) {
      try {
        const [subComRes, casteRes, gotraRes] = await Promise.all([
          fetchSubCommunities(newComId),
          fetchCastes(newComId),
          fetchGotras(newComId),
        ]);
        if (subComRes.success && Array.isArray(subComRes.data)) setSubCommunities(subComRes.data);
        if (casteRes.success && Array.isArray(casteRes.data)) setCastes(casteRes.data);
        if (gotraRes.success && Array.isArray(gotraRes.data)) setGotras(gotraRes.data);
      } catch (err) {
        console.warn("Failed fetching community children:", err);
      }
    }
  };

  const handleCasteChange = async (newCasteId: string) => {
    setCasteId(newCasteId);
    setCustomCaste("");
    setIsDirty(true);

    // ATOMIC CLEAR: Dependent sub-caste
    setSubCasteId("");
    setCustomSubCaste("");
    setSubCastes([]);

    if (newCasteId) {
      try {
        const res = await fetchSubCastes(newCasteId);
        if (res.success && Array.isArray(res.data)) {
          setSubCastes(res.data);
        }
      } catch (err) {
        console.warn("Failed fetching sub-castes:", err);
      }
    }
  };

  const handleEducationChange = async (newEduId: string) => {
    setEducationId(newEduId);
    setSpecializationId("");
    setIsDirty(true);

    if (newEduId) {
      try {
        const res = await fetchSpecializations(newEduId);
        if (res.success && Array.isArray(res.data)) {
          setSpecializations(res.data);
        }
      } catch (err) {
        console.warn("Failed fetching specializations:", err);
      }
    }
  };

  // Helper flags
  const selectedRel = religions.find((r) => r.id === religionId);
  const isHindu = selectedRel?.slug === "hindu";
  const isOtherRel = selectedRel?.slug === "other";
  const selectedCom = communities.find((c) => c.id === communityId);
  const isOtherCom = selectedCom?.slug === "other";
  const selectedCst = castes.find((c) => c.id === casteId);
  const isOtherCst = selectedCst?.slug === "other";
  const selectedSubCst = subCastes.find((sc) => sc.id === subCasteId);
  const isOtherSubCst = selectedSubCst?.slug === "other";

  // ----------------------------------------------------
  // Concurrency Conflict Resolution
  // ----------------------------------------------------
  const handleReloadLatest = async () => {
    setIsReloading(true);
    setConflictError(null);
    setGeneralError(null);
    try {
      const res = await getAdminProfileDetail(profileId);
      if (res.success && res.data?.profile) {
        populateProfileValues(res.data.profile);
        onProfileUpdated(res.data.profile);
        setSuccessMessage("Latest profile details reloaded successfully.");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setGeneralError("Failed to reload latest profile data.");
      }
    } catch (err) {
      console.error("Error reloading profile:", err);
      setGeneralError("Network error while reloading profile.");
    } finally {
      setIsReloading(false);
    }
  };

  // ----------------------------------------------------
  // Save Handlers for Each Section
  // ----------------------------------------------------
  const handleSaveProfileCreatedFor = async () => {
    setIsSaving(true);
    setGeneralError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      const res = await updateAdminProfileCreatedFor(profileId, {
        profileCreatedFor,
        expectedUpdatedAt,
      });

      if (!res.success) {
        if (res.code === "PROFILE_EDIT_CONFLICT") {
          setConflictError(res.message);
        } else {
          setGeneralError(res.message || "Failed to update profile created for.");
        }
        return;
      }

      setExpectedUpdatedAt(res.data.profile.updatedAt);
      setProfile((prev) => ({
        ...prev,
        profileCreatedFor: res.data.profile.profileCreatedFor,
        completionPercentage: res.data.profile.completionPercentage,
        updatedAt: res.data.profile.updatedAt,
        lastEditedAt: res.data.profile.lastEditedAt,
        lastEditedByUserId: res.data.profile.lastEditedByUserId,
        lastEditedByUser: res.data.profile.lastEditedByUser,
      }));
      onProfileUpdated({
        ...profile,
        profileCreatedFor: res.data.profile.profileCreatedFor,
        completionPercentage: res.data.profile.completionPercentage,
        updatedAt: res.data.profile.updatedAt,
        lastEditedAt: res.data.profile.lastEditedAt,
        lastEditedByUserId: res.data.profile.lastEditedByUserId,
        lastEditedByUser: res.data.profile.lastEditedByUser,
      });
      setIsDirty(false);
      setSuccessMessage("Profile created for relationship updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error updating profile created for:", err);
      setGeneralError("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePersonalDetails = async () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = "First name is required.";
    if (!lastName.trim()) errors.lastName = "Last name is required.";
    if (!dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
    if (!heightCm || isNaN(Number(heightCm)) || Number(heightCm) < 100 || Number(heightCm) > 250) {
      errors.heightCm = "Height must be between 100 and 250 cm.";
    }
    if (!motherTongueId) errors.motherTongueId = "Mother tongue is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setGeneralError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      const payload: AdminUpdatePersonalDetailsPayload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dateOfBirth,
        maritalStatus,
        heightCm: parseInt(heightCm, 10),
        motherTongueId,
        languageIds: selectedLanguageIds,
        city: city.trim() || null,
        state: state.trim() || null,
        expectedUpdatedAt,
      };

      const res = await updateAdminProfilePersonalDetails(profileId, payload);

      if (!res.success) {
        if (res.code === "PROFILE_EDIT_CONFLICT") {
          setConflictError(res.message);
        } else {
          setGeneralError(res.message || "Failed to update personal details.");
        }
        return;
      }

      setExpectedUpdatedAt(res.data.profile.updatedAt);
      const updatedProfileObj: AdminProfileDetail = {
        ...profile,
        personalDetails: res.data.personalDetails,
        languages: res.data.languages,
        completionPercentage: res.data.profile.completionPercentage,
        updatedAt: res.data.profile.updatedAt,
        lastEditedAt: res.data.profile.lastEditedAt,
        lastEditedByUserId: res.data.profile.lastEditedByUserId,
        lastEditedByUser: res.data.profile.lastEditedByUser,
      };
      setProfile(updatedProfileObj);
      onProfileUpdated(updatedProfileObj);
      setIsDirty(false);
      setSuccessMessage("Personal details saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error updating personal details:", err);
      setGeneralError("An unexpected error occurred while saving personal details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveReligion = async () => {
    const errors: Record<string, string> = {};
    if (!religionId) errors.religionId = "Religion is required.";
    if (isOtherRel && !customReligion.trim()) {
      errors.customReligion = "Please specify your religion.";
    }
    if (isOtherCom && !customCommunity.trim()) {
      errors.customCommunity = "Please specify your community.";
    }
    if (isOtherCst && !customCaste.trim()) {
      errors.customCaste = "Please specify your caste.";
    }
    if (isOtherSubCst && !customSubCaste.trim()) {
      errors.customSubCaste = "Please specify your sub-caste.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setGeneralError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      const payload: AdminUpdateReligionPayload = {
        religionId,
        communityId: communityId || null,
        subCommunityId: subCommunityId || null,
        casteId: casteId || null,
        subCasteId: subCasteId || null,
        gotraId: isHindu && gotraId ? gotraId : null,
        manglik: manglik || "DONT_KNOW",
        customReligion: isOtherRel ? customReligion.trim() : null,
        customCommunity: isOtherCom ? customCommunity.trim() : null,
        customCaste: isOtherCst ? customCaste.trim() : null,
        customSubCaste: isOtherSubCst ? customSubCaste.trim() : null,
        expectedUpdatedAt,
      };

      const res = await updateAdminProfileReligion(profileId, payload);

      if (!res.success) {
        if (res.code === "PROFILE_EDIT_CONFLICT") {
          setConflictError(res.message);
        } else {
          setGeneralError(res.message || "Failed to update religion details.");
        }
        return;
      }

      setExpectedUpdatedAt(res.data.profile.updatedAt);
      const updatedProfileObj: AdminProfileDetail = {
        ...profile,
        religion: res.data.religion,
        completionPercentage: res.data.profile.completionPercentage,
        updatedAt: res.data.profile.updatedAt,
        lastEditedAt: res.data.profile.lastEditedAt,
        lastEditedByUserId: res.data.profile.lastEditedByUserId,
        lastEditedByUser: res.data.profile.lastEditedByUser,
      };
      setProfile(updatedProfileObj);
      onProfileUpdated(updatedProfileObj);
      setIsDirty(false);
      setSuccessMessage("Religion and community details saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error updating religion:", err);
      setGeneralError("An unexpected error occurred while saving religion details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveEducationCareer = async () => {
    const errors: Record<string, string> = {};
    if (!educationId) errors.educationId = "Highest education is required.";
    if (!employmentStatusId) errors.employmentStatusId = "Employment status is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setGeneralError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      const payload: AdminUpdateEducationCareerPayload = {
        education: {
          educationId,
          specializationId: specializationId || null,
          institutionId: institutionId || null,
          institutionName: institutionName.trim() || null,
        },
        career: {
          employmentStatusId,
          occupationId: occupationId || null,
          companyName: companyName.trim() || null,
          employmentType: employmentType || null,
          annualIncomeRange: annualIncomeRange || null,
        },
        expectedUpdatedAt,
      };

      const res = await updateAdminProfileEducationCareer(profileId, payload);

      if (!res.success) {
        if (res.code === "PROFILE_EDIT_CONFLICT") {
          setConflictError(res.message);
        } else {
          setGeneralError(res.message || "Failed to update education and career.");
        }
        return;
      }

      setExpectedUpdatedAt(res.data.profile.updatedAt);
      const updatedProfileObj: AdminProfileDetail = {
        ...profile,
        education: res.data.education,
        career: res.data.career,
        completionPercentage: res.data.profile.completionPercentage,
        updatedAt: res.data.profile.updatedAt,
        lastEditedAt: res.data.profile.lastEditedAt,
        lastEditedByUserId: res.data.profile.lastEditedByUserId,
        lastEditedByUser: res.data.profile.lastEditedByUser,
      };
      setProfile(updatedProfileObj);
      onProfileUpdated(updatedProfileObj);
      setIsDirty(false);
      setSuccessMessage("Education and career details saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error updating education/career:", err);
      setGeneralError("An unexpected error occurred while saving education details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePartnerPreferences = async () => {
    const errors: Record<string, string> = {};
    const minA = prefMinAge ? parseInt(prefMinAge, 10) : null;
    const maxA = prefMaxAge ? parseInt(prefMaxAge, 10) : null;
    const minH = prefMinHeight ? parseInt(prefMinHeight, 10) : null;
    const maxH = prefMaxHeight ? parseInt(prefMaxHeight, 10) : null;

    if (minA && maxA && minA > maxA) {
      errors.prefAge = "Minimum age cannot be greater than maximum age.";
    }
    if (minH && maxH && minH > maxH) {
      errors.prefHeight = "Minimum height cannot be greater than maximum height.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSaving(true);
    setGeneralError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      const payload: AdminUpdatePartnerPreferencesPayload = {
        minAge: minA,
        maxAge: maxA,
        minHeightCm: minH,
        maxHeightCm: maxH,
        religionIds: prefReligionIds,
        communityIds: prefCommunityIds,
        subCommunityIds: prefSubCommunityIds,
        casteIds: prefCasteIds,
        gotraIds: prefGotraIds,
        educationIds: prefEducationIds,
        occupationIds: prefOccupationIds,
        manglikStatuses: prefManglikStatuses,
        maritalStatuses: prefMaritalStatuses,
        expectedUpdatedAt,
      };

      const res = await updateAdminProfilePartnerPreferences(profileId, payload);

      if (!res.success) {
        if (res.code === "PROFILE_EDIT_CONFLICT") {
          setConflictError(res.message);
        } else {
          setGeneralError(res.message || "Failed to update partner preferences.");
        }
        return;
      }

      setExpectedUpdatedAt(res.data.profile.updatedAt);
      const updatedProfileObj: AdminProfileDetail = {
        ...profile,
        partnerPreference: res.data.partnerPreferences,
        completionPercentage: res.data.profile.completionPercentage,
        updatedAt: res.data.profile.updatedAt,
        lastEditedAt: res.data.profile.lastEditedAt,
        lastEditedByUserId: res.data.profile.lastEditedByUserId,
        lastEditedByUser: res.data.profile.lastEditedByUser,
      };
      setProfile(updatedProfileObj);
      onProfileUpdated(updatedProfileObj);
      setIsDirty(false);
      setSuccessMessage("Partner preferences saved successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error updating partner preferences:", err);
      setGeneralError("An unexpected error occurred while saving partner preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // Unsaved Tab Navigation Guard
  // ----------------------------------------------------
  const handleTabClick = (targetTab: TabKey) => {
    if (activeTab === targetTab) return;
    if (isDirty) {
      setPendingTabSwitch(targetTab);
    } else {
      setActiveTab(targetTab);
      setFieldErrors({});
    }
  };

  const handleCloseAttempt = () => {
    if (isDirty) {
      setPendingTabSwitch("close");
    } else {
      onClose();
    }
  };

  const confirmDiscard = () => {
    if (pendingTabSwitch === "close") {
      onClose();
    } else if (pendingTabSwitch) {
      populateProfileValues(profile);
      setActiveTab(pendingTabSwitch);
      setIsDirty(false);
      setFieldErrors({});
    }
    setPendingTabSwitch(null);
  };

  const toggleLanguageChip = (id: string) => {
    setIsDirty(true);
    setSelectedLanguageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={handleCloseAttempt}>
      <div id="admin-profile-edit-modal" className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <div className={styles.headerAvatar}>
              {profile.personalDetails?.firstName
                ? profile.personalDetails.firstName.charAt(0).toUpperCase()
                : "P"}
            </div>
            <div>
              <div className={styles.headerTitleRow}>
                <h3 className={styles.headerTitle}>
                  Edit Profile:{" "}
                  {profile.personalDetails?.firstName
                    ? `${profile.personalDetails.firstName} ${profile.personalDetails.lastName}`
                    : "Incomplete Shell"}
                </h3>
                <span
                  className={styles.statusBadge}
                  style={{
                    backgroundColor:
                      profile.profileStatus === "ACTIVE"
                        ? "#ECFDF5"
                        : profile.profileStatus === "INCOMPLETE"
                        ? "#FEF3C7"
                        : "#EFF6FF",
                    color:
                      profile.profileStatus === "ACTIVE"
                        ? "#047857"
                        : profile.profileStatus === "INCOMPLETE"
                        ? "#B45309"
                        : "#1D4ED8",
                    borderColor:
                      profile.profileStatus === "ACTIVE"
                        ? "#A7F3D0"
                        : profile.profileStatus === "INCOMPLETE"
                        ? "#FDE68A"
                        : "#BFDBFE",
                  }}
                >
                  {profile.profileStatus}
                </span>
              </div>
              <div className={styles.headerSub}>
                ID: {profile.id} &bull; Completion: {profile.completionPercentage}%
                {profile.lastEditedAt && (
                  <span>
                    {" "}&bull; Last admin edit:{" "}
                    {new Date(profile.lastEditedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button id="close-edit-modal-button" className={styles.btnClose} onClick={handleCloseAttempt} aria-label="Close editor">
            <span>&times;</span> Close
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={styles.tabNav}>
          <button
            id="tab-btn-profile-for"
            className={`${styles.tabBtn} ${activeTab === "profileCreatedFor" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabClick("profileCreatedFor")}
          >
            Profile For
          </button>
          <button
            id="tab-btn-personal-details"
            className={`${styles.tabBtn} ${activeTab === "personalDetails" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabClick("personalDetails")}
          >
            Personal Details
          </button>
          <button
            id="tab-btn-religion"
            className={`${styles.tabBtn} ${activeTab === "religion" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabClick("religion")}
          >
            Religion &amp; Community
          </button>
          <button
            id="tab-btn-education-career"
            className={`${styles.tabBtn} ${activeTab === "educationCareer" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabClick("educationCareer")}
          >
            Education &amp; Career
          </button>
          <button
            id="tab-btn-partner-preferences"
            className={`${styles.tabBtn} ${activeTab === "partnerPreferences" ? styles.tabBtnActive : ""}`}
            onClick={() => handleTabClick("partnerPreferences")}
          >
            Partner Preferences
          </button>
        </div>

        {/* Body Content */}
        <div className={styles.modalBody}>
          {/* Concurrency Conflict Banner */}
          {conflictError && (
            <div id="conflict-banner" className={styles.conflictBanner}>
              <div>
                <h4 className={styles.conflictTitle}>Concurrency Conflict Detected</h4>
                <p id="conflict-message" className={styles.conflictText}>{conflictError}</p>
              </div>
              <button
                id="btn-reload-latest-changes"
                className={styles.btnReloadConflict}
                onClick={handleReloadLatest}
                disabled={isReloading}
              >
                {isReloading ? "Reloading..." : "Reload Latest Changes"}
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {successMessage && <div id="alert-success" className={styles.successBanner}>✓ {successMessage}</div>}
          {generalError && <div id="alert-error" className={styles.errorBanner}>✗ {generalError}</div>}

          {/* TAB 1: Profile Created For */}
          {activeTab === "profileCreatedFor" && (
            <div>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBottom: "16px" }}>
                Select who this matrimonial profile is being managed for:
              </p>
              <div className={styles.capsuleGrid}>
                {PROFILE_CREATED_FOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.capsuleBtn} ${
                      profileCreatedFor === opt.value ? styles.capsuleBtnActive : ""
                    }`}
                    onClick={() => {
                      setProfileCreatedFor(opt.value);
                      setIsDirty(true);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Personal Details */}
          {activeTab === "personalDetails" && (
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  First Name<span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="input-first-name"
                  type="text"
                  className={`${styles.formInput} ${fieldErrors.firstName ? styles.inputError : ""}`}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="First Name"
                />
                {fieldErrors.firstName && <span className={styles.fieldError}>{fieldErrors.firstName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Last Name<span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="input-last-name"
                  type="text"
                  className={`${styles.formInput} ${fieldErrors.lastName ? styles.inputError : ""}`}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="Last Name"
                />
                {fieldErrors.lastName && <span className={styles.fieldError}>{fieldErrors.lastName}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Gender<span className={styles.requiredStar}>*</span>
                </label>
                <select
                  id="select-gender"
                  className={styles.formSelect}
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value as "MALE" | "FEMALE" | "OTHER");
                    setIsDirty(true);
                  }}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Date of Birth<span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="input-date-of-birth"
                  type="date"
                  className={`${styles.formInput} ${fieldErrors.dateOfBirth ? styles.inputError : ""}`}
                  value={dateOfBirth}
                  onChange={(e) => {
                    setDateOfBirth(e.target.value);
                    setIsDirty(true);
                  }}
                />
                {fieldErrors.dateOfBirth && <span className={styles.fieldError}>{fieldErrors.dateOfBirth}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Marital Status<span className={styles.requiredStar}>*</span>
                </label>
                <select
                  id="select-marital-status"
                  className={styles.formSelect}
                  value={maritalStatus}
                  onChange={(e) => {
                    setMaritalStatus(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  {MARITAL_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Height (cm)<span className={styles.requiredStar}>*</span>
                </label>
                <input
                  id="input-height-cm"
                  type="number"
                  min="100"
                  max="250"
                  className={`${styles.formInput} ${fieldErrors.heightCm ? styles.inputError : ""}`}
                  value={heightCm}
                  onChange={(e) => {
                    setHeightCm(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. 175"
                />
                {fieldErrors.heightCm && <span className={styles.fieldError}>{fieldErrors.heightCm}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Mother Tongue<span className={styles.requiredStar}>*</span>
                </label>
                <select
                  id="select-mother-tongue"
                  className={`${styles.formSelect} ${fieldErrors.motherTongueId ? styles.inputError : ""}`}
                  value={motherTongueId}
                  onChange={(e) => {
                    setMotherTongueId(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  <option value="">Select Mother Tongue</option>
                  {languages.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.motherTongueId && (
                  <span className={styles.fieldError}>{fieldErrors.motherTongueId}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>City (Optional)</label>
                <input
                  id="input-city"
                  type="text"
                  className={styles.formInput}
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Jaipur"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>State (Optional)</label>
                <input
                  id="input-state"
                  type="text"
                  className={styles.formInput}
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Rajasthan"
                />
              </div>

              {/* Spoken Languages Multi-Select Chips */}
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <label className={styles.formLabel}>Spoken Languages (Click to toggle)</label>
                <div className={styles.chipContainer}>
                  {languages.map((l) => {
                    const isSelected = selectedLanguageIds.includes(l.id);
                    return (
                      <button
                        key={l.id}
                        type="button"
                        className={`${styles.chip} ${isSelected ? styles.chipActive : ""}`}
                        onClick={() => toggleLanguageChip(l.id)}
                      >
                        {isSelected && <span>✓</span>}
                        {l.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Religion & Cultural Hierarchy */}
          {activeTab === "religion" && (
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Religion<span className={styles.requiredStar}>*</span>
                </label>
                <select
                  id="select-religion"
                  className={`${styles.formSelect} ${fieldErrors.religionId ? styles.inputError : ""}`}
                  value={religionId}
                  onChange={(e) => handleReligionChange(e.target.value)}
                >
                  <option value="">Select Religion</option>
                  {religions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.religionId && (
                  <span className={styles.fieldError}>{fieldErrors.religionId}</span>
                )}
              </div>

              {isOtherRel && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Specify Religion<span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="input-custom-religion"
                    type="text"
                    className={`${styles.formInput} ${fieldErrors.customReligion ? styles.inputError : ""}`}
                    value={customReligion}
                    onChange={(e) => {
                      setCustomReligion(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Enter custom religion"
                  />
                  {fieldErrors.customReligion && (
                    <span className={styles.fieldError}>{fieldErrors.customReligion}</span>
                  )}
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Community</label>
                <select
                  id="select-community"
                  className={styles.formSelect}
                  value={communityId}
                  onChange={(e) => handleCommunityChange(e.target.value)}
                >
                  <option value="">Select Community</option>
                  {communities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {isOtherCom && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Specify Community<span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="input-custom-community"
                    type="text"
                    className={`${styles.formInput} ${fieldErrors.customCommunity ? styles.inputError : ""}`}
                    value={customCommunity}
                    onChange={(e) => {
                      setCustomCommunity(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Enter custom community"
                  />
                  {fieldErrors.customCommunity && (
                    <span className={styles.fieldError}>{fieldErrors.customCommunity}</span>
                  )}
                </div>
              )}

              {subCommunities.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sub-Community</label>
                  <select
                    id="select-sub-community"
                    className={styles.formSelect}
                    value={subCommunityId}
                    onChange={(e) => {
                      setSubCommunityId(e.target.value);
                      setIsDirty(true);
                    }}
                  >
                    <option value="">Select Sub-Community</option>
                    {subCommunities.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Caste</label>
                <select
                  id="select-caste"
                  className={styles.formSelect}
                  value={casteId}
                  onChange={(e) => handleCasteChange(e.target.value)}
                >
                  <option value="">Select Caste</option>
                  {castes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {isOtherCst && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Specify Caste<span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="input-custom-caste"
                    type="text"
                    className={`${styles.formInput} ${fieldErrors.customCaste ? styles.inputError : ""}`}
                    value={customCaste}
                    onChange={(e) => {
                      setCustomCaste(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Enter custom caste"
                  />
                  {fieldErrors.customCaste && (
                    <span className={styles.fieldError}>{fieldErrors.customCaste}</span>
                  )}
                </div>
              )}

              {subCastes.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Sub-Caste</label>
                  <select
                    id="select-sub-caste"
                    className={styles.formSelect}
                    value={subCasteId}
                    onChange={(e) => {
                      setSubCasteId(e.target.value);
                      setIsDirty(true);
                    }}
                  >
                    <option value="">Select Sub-Caste</option>
                    {subCastes.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isOtherSubCst && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Specify Sub-Caste<span className={styles.requiredStar}>*</span>
                  </label>
                  <input
                    id="input-custom-sub-caste"
                    type="text"
                    className={`${styles.formInput} ${fieldErrors.customSubCaste ? styles.inputError : ""}`}
                    value={customSubCaste}
                    onChange={(e) => {
                      setCustomSubCaste(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="Enter custom sub-caste"
                  />
                  {fieldErrors.customSubCaste && (
                    <span className={styles.fieldError}>{fieldErrors.customSubCaste}</span>
                  )}
                </div>
              )}

              {/* Gotra: Strictly Hindu only */}
              {isHindu && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Gotra (Hindu only)</label>
                  <select
                    id="select-gotra"
                    className={styles.formSelect}
                    value={gotraId}
                    onChange={(e) => {
                      setGotraId(e.target.value);
                      setIsDirty(true);
                    }}
                  >
                    <option value="">Select Gotra</option>
                    {gotras.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Manglik Status</label>
                <select
                  id="select-manglik"
                  className={styles.formSelect}
                  value={manglik}
                  onChange={(e) => {
                    setManglik(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  {MANGLIK_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 4: Education & Career */}
          {activeTab === "educationCareer" && (
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Highest Education<span className={styles.requiredStar}>*</span>
                </label>
                <select
                  id="select-education"
                  className={`${styles.formSelect} ${fieldErrors.educationId ? styles.inputError : ""}`}
                  value={educationId}
                  onChange={(e) => handleEducationChange(e.target.value)}
                >
                  <option value="">Select Highest Education</option>
                  {educations.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.educationId && (
                  <span className={styles.fieldError}>{fieldErrors.educationId}</span>
                )}
              </div>

              {specializations.length > 0 && (
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Specialization</label>
                  <select
                    id="select-specialization"
                    className={styles.formSelect}
                    value={specializationId}
                    onChange={(e) => {
                      setSpecializationId(e.target.value);
                      setIsDirty(true);
                    }}
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Institution</label>
                <select
                  id="select-institution"
                  className={styles.formSelect}
                  value={institutionId}
                  onChange={(e) => {
                    setInstitutionId(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  <option value="">Select Institution (Optional)</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Institution Name (if not listed)</label>
                <input
                  id="input-institution-name"
                  type="text"
                  className={styles.formInput}
                  value={institutionName}
                  onChange={(e) => {
                    setInstitutionName(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Delhi University"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Employment Status<span className={styles.requiredStar}>*</span>
                </label>
                <select
                  id="select-employment-status"
                  className={`${styles.formSelect} ${fieldErrors.employmentStatusId ? styles.inputError : ""}`}
                  value={employmentStatusId}
                  onChange={(e) => {
                    setEmploymentStatusId(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  <option value="">Select Employment Status</option>
                  {employmentStatuses.map((es) => (
                    <option key={es.id} value={es.id}>
                      {es.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.employmentStatusId && (
                  <span className={styles.fieldError}>{fieldErrors.employmentStatusId}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Occupation</label>
                <select
                  id="select-occupation"
                  className={styles.formSelect}
                  value={occupationId}
                  onChange={(e) => {
                    setOccupationId(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  <option value="">Select Occupation</option>
                  {occupations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Company / Organization</label>
                <input
                  id="input-company-name"
                  type="text"
                  className={styles.formInput}
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setIsDirty(true);
                  }}
                  placeholder="e.g. Infosys Technologies"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Employment Type</label>
                <select
                  id="select-employment-type"
                  className={styles.formSelect}
                  value={employmentType}
                  onChange={(e) => {
                    setEmploymentType(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  <option value="">Select Employment Type</option>
                  {EMPLOYMENT_TYPES.map((et) => (
                    <option key={et.value} value={et.value}>
                      {et.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Annual Income</label>
                <select
                  id="select-annual-income"
                  className={styles.formSelect}
                  value={annualIncomeRange}
                  onChange={(e) => {
                    setAnnualIncomeRange(e.target.value);
                    setIsDirty(true);
                  }}
                >
                  <option value="">Select Annual Income</option>
                  {INCOME_RANGES.map((ir) => (
                    <option key={ir.value} value={ir.value}>
                      {ir.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: Partner Preferences */}
          {activeTab === "partnerPreferences" && (
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Preferred Age Range</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    id="input-pref-min-age"
                    type="number"
                    min="18"
                    max="100"
                    placeholder="Min"
                    className={styles.formInput}
                    value={prefMinAge}
                    onChange={(e) => {
                      setPrefMinAge(e.target.value);
                      setIsDirty(true);
                    }}
                  />
                  <span>to</span>
                  <input
                    id="input-pref-max-age"
                    type="number"
                    min="18"
                    max="100"
                    placeholder="Max"
                    className={styles.formInput}
                    value={prefMaxAge}
                    onChange={(e) => {
                      setPrefMaxAge(e.target.value);
                      setIsDirty(true);
                    }}
                  />
                </div>
                {fieldErrors.prefAge && (
                  <span className={styles.fieldError}>{fieldErrors.prefAge}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Preferred Height (cm)</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    id="input-pref-min-height"
                    type="number"
                    min="100"
                    max="250"
                    placeholder="Min cm"
                    className={styles.formInput}
                    value={prefMinHeight}
                    onChange={(e) => {
                      setPrefMinHeight(e.target.value);
                      setIsDirty(true);
                    }}
                  />
                  <span>to</span>
                  <input
                    id="input-pref-max-height"
                    type="number"
                    min="100"
                    max="250"
                    placeholder="Max cm"
                    className={styles.formInput}
                    value={prefMaxHeight}
                    onChange={(e) => {
                      setPrefMaxHeight(e.target.value);
                      setIsDirty(true);
                    }}
                  />
                </div>
                {fieldErrors.prefHeight && (
                  <span className={styles.fieldError}>{fieldErrors.prefHeight}</span>
                )}
              </div>

              {/* Preferred Religions Multi-Select */}
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <label className={styles.formLabel}>Preferred Religions (Click to toggle)</label>
                <div className={styles.chipContainer}>
                  {religions.map((r) => {
                    const isSelected = prefReligionIds.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={`${styles.chip} ${isSelected ? styles.chipActive : ""}`}
                        onClick={() => {
                          setIsDirty(true);
                          setPrefReligionIds((prev) =>
                            prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id]
                          );
                        }}
                      >
                        {isSelected && <span>✓</span>}
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Communities Multi-Select */}
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <label className={styles.formLabel}>Preferred Communities (Click to toggle)</label>
                <div className={styles.chipContainer}>
                  {communities.map((c) => {
                    const isSelected = prefCommunityIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`${styles.chip} ${isSelected ? styles.chipActive : ""}`}
                        onClick={() => {
                          setIsDirty(true);
                          setPrefCommunityIds((prev) =>
                            prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                          );
                        }}
                      >
                        {isSelected && <span>✓</span>}
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Educations Multi-Select */}
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <label className={styles.formLabel}>Preferred Educations (Click to toggle)</label>
                <div className={styles.chipContainer}>
                  {educations.map((e) => {
                    const isSelected = prefEducationIds.includes(e.id);
                    return (
                      <button
                        key={e.id}
                        type="button"
                        className={`${styles.chip} ${isSelected ? styles.chipActive : ""}`}
                        onClick={() => {
                          setIsDirty(true);
                          setPrefEducationIds((prev) =>
                            prev.includes(e.id) ? prev.filter((id) => id !== e.id) : [...prev, e.id]
                          );
                        }}
                      >
                        {isSelected && <span>✓</span>}
                        {e.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Occupations Multi-Select */}
              <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                <label className={styles.formLabel}>Preferred Occupations (Click to toggle)</label>
                <div className={styles.chipContainer}>
                  {occupations.map((o) => {
                    const isSelected = prefOccupationIds.includes(o.id);
                    return (
                      <button
                        key={o.id}
                        type="button"
                        className={`${styles.chip} ${isSelected ? styles.chipActive : ""}`}
                        onClick={() => {
                          setIsDirty(true);
                          setPrefOccupationIds((prev) =>
                            prev.includes(o.id) ? prev.filter((id) => id !== o.id) : [...prev, o.id]
                          );
                        }}
                      >
                        {isSelected && <span>✓</span>}
                        {o.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={styles.modalFooter}>
          <div className={styles.footerInfo}>
            {isDirty ? (
              <span style={{ color: "#B45309", fontWeight: 600 }}>• Unsaved changes in this section</span>
            ) : (
              <span>All changes in this section saved</span>
            )}
          </div>

          <div className={styles.footerActions}>
            <button
              id="btn-cancel-edit-profile"
              type="button"
              className={styles.btnCancel}
              onClick={handleCloseAttempt}
              disabled={isSaving}
            >
              Cancel
            </button>

            {activeTab === "profileCreatedFor" && (
              <button
                id="btn-save-profile-created-for"
                type="button"
                className={styles.btnSubmit}
                onClick={handleSaveProfileCreatedFor}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Profile Relationship"}
              </button>
            )}

            {activeTab === "personalDetails" && (
              <button
                id="btn-save-personal-details"
                type="button"
                className={styles.btnSubmit}
                onClick={handleSavePersonalDetails}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Personal Details"}
              </button>
            )}

            {activeTab === "religion" && (
              <button
                id="btn-save-religion"
                type="button"
                className={styles.btnSubmit}
                onClick={handleSaveReligion}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Religion & Community"}
              </button>
            )}

            {activeTab === "educationCareer" && (
              <button
                id="btn-save-education-career"
                type="button"
                className={styles.btnSubmit}
                onClick={handleSaveEducationCareer}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Education & Career"}
              </button>
            )}

            {activeTab === "partnerPreferences" && (
              <button
                id="btn-save-partner-preferences"
                type="button"
                className={styles.btnSubmit}
                onClick={handleSavePartnerPreferences}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Partner Preferences"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unsaved Changes Branded Confirmation Dialog */}
      {pendingTabSwitch && (
        <div className={styles.confirmOverlay} onClick={() => setPendingTabSwitch(null)}>
          <div id="unsaved-confirm-dialog" className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h4 id="unsaved-confirm-title" className={styles.confirmTitle}>Unsaved Changes</h4>
            <p className={styles.confirmText}>
              You have unsaved changes in this section. If you leave now without saving, your edits will be discarded.
            </p>
            <div className={styles.confirmActions}>
              <button
                id="btn-confirm-discard"
                type="button"
                className={styles.btnConfirmDiscard}
                onClick={confirmDiscard}
              >
                Discard Changes
              </button>
              <button
                id="btn-confirm-stay"
                type="button"
                className={styles.btnConfirmStay}
                onClick={() => setPendingTabSwitch(null)}
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
