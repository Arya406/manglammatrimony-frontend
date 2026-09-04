export type ProfileCreatedFor =
  | "MYSELF"
  | "MY_SON"
  | "MY_DAUGHTER"
  | "MY_BROTHER"
  | "MY_SISTER"
  | "MY_RELATIVE"
  | "OTHER";

export type Gender = "MALE" | "FEMALE" | "OTHER";

export type MaritalStatus =
  | "NEVER_MARRIED"
  | "DIVORCED"
  | "WIDOWED"
  | "AWAITING_DIVORCE"
  | "ANNULLED";

export type ManglikStatus = "YES" | "NO" | "DONT_KNOW" | "NOT_APPLICABLE";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "FREELANCE"
  | "INTERNSHIP"
  | "OTHER";

export type AnnualIncomeRange =
  | "BELOW_2_LAKH"
  | "TWO_TO_FIVE_LAKH"
  | "FIVE_TO_TEN_LAKH"
  | "TEN_TO_FIFTEEN_LAKH"
  | "FIFTEEN_TO_TWENTY_LAKH"
  | "TWENTY_TO_THIRTY_LAKH"
  | "THIRTY_TO_FIFTY_LAKH"
  | "FIFTY_LAKH_TO_ONE_CRORE"
  | "ABOVE_ONE_CRORE"
  | "PREFER_NOT_TO_SAY";

export type PhotoType = "PRIMARY" | "ADDITIONAL";

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProfilePhotoItem {
  id: string;
  profileId: string;
  photoType: PhotoType;
  moderationStatus: ModerationStatus;
  moderationReason?: string | null;
  sortOrder: number;
  fileSize: number;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoListResponseData {
  photos: ProfilePhotoItem[];
  primaryPhoto?: ProfilePhotoItem | null;
  totalCount: number;
  maxAllowed: number;
}

export interface UploadPhotoResponseData {
  photo: ProfilePhotoItem;
  profile: {
    completionPercentage: number;
    profileStatus: string;
  };
}

export interface ProfileSummary {
  id: string;
  userId: string;
  profileCreatedFor: ProfileCreatedFor;
  profileStatus: string;
  completionPercentage: number;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InitializeProfileResponseData {
  profile: ProfileSummary;
  isNew: boolean;
}

export interface ProfileCreatedForOption {
  value: ProfileCreatedFor;
  title: string;
  description?: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  code: string;
  sortOrder?: number;
}

export interface ReligionItem {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
}

export interface CommunityItem {
  id: string;
  name: string;
  slug: string;
  religionId?: string | null;
  sortOrder?: number;
}

export interface SubCommunityItem {
  id: string;
  name: string;
  slug: string;
  communityId?: string;
  sortOrder?: number;
}

export interface CasteItem {
  id: string;
  name: string;
  slug: string;
  communityId?: string;
  sortOrder?: number;
}

export interface SubCasteItem {
  id: string;
  name: string;
  slug: string;
  casteId?: string;
  sortOrder?: number;
}

export interface GotraItem {
  id: string;
  name: string;
  slug: string;
  communityId?: string;
  sortOrder?: number;
}

export interface EducationItem {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
}

export interface SpecializationItem {
  id: string;
  name: string;
  slug: string;
  educationId?: string;
  sortOrder?: number;
}

export interface InstitutionItem {
  id: string;
  name: string;
  type?: string | null;
}

export interface EmploymentStatusItem {
  id: string;
  name: string;
  slug: string;
  sortOrder?: number;
}

export interface OccupationItem {
  id: string;
  name: string;
  slug: string;
  employmentStatusId?: string;
  sortOrder?: number;
}

export interface SavePersonalDetailsPayload {
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string; // YYYY-MM-DD
  maritalStatus: MaritalStatus;
  heightCm: number;
  motherTongueId: string;
  city?: string;
  state?: string;
  languageIds: string[];
}

export interface PersonalDetailsResponseData {
  personalDetails: {
    id: string;
    profileId: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth: string;
    maritalStatus: MaritalStatus;
    heightCm: number;
    motherTongueId: string;
    city?: string | null;
    state?: string | null;
  };
  languages: Array<{
    languageId: string;
    name?: string;
  }>;
  completionPercentage: number;
}

export interface SaveReligionPayload {
  religionId: string;
  communityId: string | null;
  subCommunityId: string | null;
  casteId: string | null;
  subCasteId: string | null;
  gotraId: string | null;
  manglik: ManglikStatus | null;
  customReligion?: string | null;
  customCommunity?: string | null;
  customCaste?: string | null;
  customSubCaste?: string | null;
}

export interface ReligionResponseData {
  religion: {
    id: string;
    profileId: string;
    religionId: string;
    communityId?: string | null;
    subCommunityId?: string | null;
    casteId?: string | null;
    subCasteId?: string | null;
    gotraId?: string | null;
    manglik?: ManglikStatus | null;
  };
  completionPercentage: number;
}

export interface SaveEducationCareerPayload {
  education: {
    educationId: string;
    specializationId: string | null;
    institutionId: string | null;
    institutionName: string | null;
  };
  career: {
    employmentStatusId: string;
    occupationId: string | null;
    companyName: string | null;
    employmentType: EmploymentType | null;
    annualIncomeRange: AnnualIncomeRange | null;
  };
}

export interface EducationCareerResponseData {
  education: {
    id: string;
    profileId: string;
    educationId: string;
    specializationId?: string | null;
    institutionId?: string | null;
    institutionName?: string | null;
  };
  career: {
    id: string;
    profileId: string;
    employmentStatusId: string;
    occupationId?: string | null;
    companyName?: string | null;
    employmentType?: EmploymentType | null;
    annualIncomeRange?: AnnualIncomeRange | null;
  };
  completionPercentage: number;
}

export interface MasterDataItem {
  id: string;
  name: string;
  slug?: string;
  code?: string;
}

export interface SavePartnerPreferencesPayload {
  minAge?: number | null;
  maxAge?: number | null;
  minHeightCm?: number | null;
  maxHeightCm?: number | null;
  religionIds?: string[];
  communityIds?: string[];
  subCommunityIds?: string[];
  casteIds?: string[];
  gotraIds?: string[];
  educationIds?: string[];
  occupationIds?: string[];
  manglikStatuses?: ManglikStatus[];
  maritalStatuses?: MaritalStatus[];
}

export interface PartnerPreferencesResponseData {
  id: string;
  profileId: string;
  minAge: number | null;
  maxAge: number | null;
  minHeightCm: number | null;
  maxHeightCm: number | null;
  religions: MasterDataItem[];
  communities: MasterDataItem[];
  subCommunities: MasterDataItem[];
  castes: MasterDataItem[];
  gotras: MasterDataItem[];
  educations: MasterDataItem[];
  occupations: MasterDataItem[];
  manglikStatuses: ManglikStatus[];
  maritalStatuses: MaritalStatus[];
}

export interface SavePartnerPreferencesResponseData {
  partnerPreferences: PartnerPreferencesResponseData;
  profile: {
    completionPercentage: number;
    profileStatus: string;
  };
}

export interface CompleteProfileData {
  profile?: ProfileSummary;
  id?: string;
  userId?: string;
  profileCreatedFor?: ProfileCreatedFor;
  profileStatus?: string;
  completionPercentage?: number;
  personalDetails?: {
    id?: string;
    firstName: string;
    lastName: string;
    gender: Gender;
    dateOfBirth: string;
    maritalStatus: MaritalStatus;
    heightCm: number;
    motherTongueId?: string;
    city?: string | null;
    state?: string | null;
    motherTongue?: {
      id: string;
      name: string;
      code?: string;
    } | null;
  } | null;
  languages?: Array<{
    languageId: string;
    name?: string;
    code?: string;
  }>;
  religion?: {
    id?: string;
    religionId?: string;
    religion?: { id: string; name: string; slug?: string } | null;
    communityId?: string | null;
    community?: { id: string; name: string; slug?: string } | null;
    subCommunityId?: string | null;
    subCommunity?: { id: string; name: string; slug?: string } | null;
    casteId?: string | null;
    caste?: { id: string; name: string; slug?: string } | null;
    subCasteId?: string | null;
    subCaste?: { id: string; name: string; slug?: string } | null;
    gotraId?: string | null;
    gotra?: { id: string; name: string; slug?: string } | null;
    manglik?: ManglikStatus | null;
    customReligion?: string | null;
    customCommunity?: string | null;
    customCaste?: string | null;
    customSubCaste?: string | null;
    effectiveReligion?: string | null;
    effectiveCommunity?: string | null;
    effectiveCaste?: string | null;
    effectiveSubCaste?: string | null;
  } | null;
  education?: {
    id?: string;
    educationId?: string;
    education?: { id: string; name: string } | null;
    specializationId?: string | null;
    specialization?: { id: string; name: string } | null;
    institutionId?: string | null;
    institution?: { id: string; name: string } | null;
    institutionName?: string | null;
  } | null;
  career?: {
    id?: string;
    employmentStatusId?: string;
    employmentStatus?: { id: string; name: string } | null;
    occupationId?: string | null;
    occupation?: { id: string; name: string } | null;
    companyName?: string | null;
    employmentType?: EmploymentType | null;
    annualIncomeRange?: AnnualIncomeRange | null;
  } | null;
  photos?: ProfilePhotoItem[];
  partnerPreferences?: PartnerPreferencesResponseData | null;
  partnerPreference?: PartnerPreferencesResponseData | null;
}

export interface SubmitProfileResponseData {
  profile: {
    id: string;
    profileStatus: string;
    completionPercentage: number;
    submittedAt?: string | null;
  };
}
