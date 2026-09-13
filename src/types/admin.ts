export interface AdminUserData {
  id: string;
  email: string;
  role: "ADMIN";
}

export interface AdminDashboardStats {
  users: number;
  profiles: number;
  activeProfiles: number;
  incompleteProfiles: number;
}

export interface AdminLoginData {
  token: string;
  admin: AdminUserData;
}

export interface AdminPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AdminProfileListItem {
  id: string;
  userId: string;
  profileStatus: "ACTIVE" | "INCOMPLETE" | "IN_REVIEW" | "REJECTED" | "SUSPENDED";
  completionPercentage: number;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string | null;
    status: "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DELETED";
    role: string;
  };
  personalDetails: {
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    city: string | null;
    state: string | null;
  } | null;
  primaryPhotoUrl: string | null;
}

export interface AdminProfileListResponse {
  profiles: AdminProfileListItem[];
  pagination: AdminPagination;
}

export interface AdminProfileListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  gender?: string;
  profileStatus?: string;
  userStatus?: string;
  sort?: string;
}

export interface AdminProfileDetailPhoto {
  id: string;
  photoType: "PRIMARY" | "ADDITIONAL";
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  url: string;
  originalFileName?: string;
  fileSize: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  isPrimary?: boolean;
  moderationReason?: string | null;
  moderatedAt?: string | null;
  moderatedByUserId?: string | null;
  sortOrder?: number;
}

export interface AdminProfileDetail {
  id: string;
  userId: string;
  profileCreatedFor: string;
  profileStatus: "ACTIVE" | "INCOMPLETE" | "IN_REVIEW" | "REJECTED" | "SUSPENDED";
  completionPercentage: number;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    status: "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DELETED";
    role: string;
    phoneVerifiedAt: string | null;
    emailVerifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  personalDetails: {
    firstName: string;
    lastName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth: string;
    maritalStatus: string;
    heightCm: number;
    motherTongueId: string;
    motherTongue?: { id: string; name: string };
    city: string | null;
    state: string | null;
  } | null;
  religion: {
    religion?: { id: string; name: string };
    community?: { id: string; name: string } | null;
    subCommunity?: { id: string; name: string } | null;
    caste?: { id: string; name: string } | null;
    subCaste?: { id: string; name: string } | null;
    gotra?: { id: string; name: string } | null;
    manglik: string;
    customReligion?: string | null;
    customCommunity?: string | null;
  } | null;
  education: {
    education?: { id: string; name: string };
    specializationId?: string | null;
    institutionId?: string | null;
    institutionName?: string | null;
  } | null;
  career: {
    employmentStatus?: { id: string; name: string };
    occupation?: { id: string; name: string } | null;
    companyName?: string | null;
    employmentType?: string | null;
    annualIncomeRange?: string | null;
  } | null;
  partnerPreference: {
    minAge?: number | null;
    maxAge?: number | null;
    minHeightCm?: number | null;
    maxHeightCm?: number | null;
    religions?: Array<{ religion: { id: string; name: string } }>;
    communities?: Array<{ community: { id: string; name: string } }>;
    subCommunities?: Array<{ subCommunity: { id: string; name: string } }>;
    castes?: Array<{ caste: { id: string; name: string } }>;
    gotras?: Array<{ gotra: { id: string; name: string } }>;
    educations?: Array<{ education: { id: string; name: string } }>;
    occupations?: Array<{ occupation: { id: string; name: string } }>;
    manglik?: Array<{ manglik: string }>;
    maritalStatuses?: Array<{ maritalStatus: string }>;
  } | null;
  photos: AdminProfileDetailPhoto[];
  languages: Array<{ id: string; name: string; code: string }>;
  lastEditedAt?: string | null;
  lastEditedByUserId?: string | null;
  lastEditedByUser?: { id: string; email: string | null } | null;
}

export interface AdminUpdateProfileCreatedForPayload {
  profileCreatedFor: string;
  expectedUpdatedAt: string;
}

export interface AdminUpdatePersonalDetailsPayload {
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  maritalStatus: string;
  heightCm: number;
  motherTongueId: string;
  languageIds?: string[];
  city?: string | null;
  state?: string | null;
  expectedUpdatedAt: string;
}

export interface AdminUpdateReligionPayload {
  religionId: string;
  communityId?: string | null;
  subCommunityId?: string | null;
  casteId?: string | null;
  subCasteId?: string | null;
  gotraId?: string | null;
  manglik?: string | null;
  customReligion?: string | null;
  customCommunity?: string | null;
  customCaste?: string | null;
  customSubCaste?: string | null;
  expectedUpdatedAt: string;
}

export interface AdminUpdateEducationCareerPayload {
  education: {
    educationId: string;
    specializationId?: string | null;
    institutionId?: string | null;
    institutionName?: string | null;
  };
  career: {
    employmentStatusId: string;
    occupationId?: string | null;
    companyName?: string | null;
    employmentType?: string | null;
    annualIncomeRange?: string | null;
  };
  expectedUpdatedAt: string;
}

export interface AdminUpdatePartnerPreferencesPayload {
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
  manglikStatuses?: string[];
  maritalStatuses?: string[];
  expectedUpdatedAt: string;
}

export interface AdminUpdateProfileCreatedForResponse {
  profile: AdminProfileDetail;
}

export interface AdminUpdatePersonalDetailsResponse {
  personalDetails: NonNullable<AdminProfileDetail["personalDetails"]>;
  languages: Array<{ id: string; name: string; code: string }>;
  profile: AdminProfileDetail;
}

export interface AdminUpdateReligionResponse {
  religion: NonNullable<AdminProfileDetail["religion"]>;
  profile: AdminProfileDetail;
}

export interface AdminUpdateEducationCareerResponse {
  education: NonNullable<AdminProfileDetail["education"]>;
  career: NonNullable<AdminProfileDetail["career"]>;
  profile: AdminProfileDetail;
}

export interface AdminUpdatePartnerPreferencesResponse {
  partnerPreferences: Record<string, unknown>;
  profile: AdminProfileDetail;
}

export interface AdminUserProfileSummary {
  profileId: string;
  profileStatus: "ACTIVE" | "INCOMPLETE" | "IN_REVIEW" | "REJECTED" | "SUSPENDED" | string;
  completionPercentage: number;
  profileCreatedFor: string;
  gender: string | null;
  city: string | null;
  state: string | null;
  firstName: string | null;
  lastName: string | null;
  submittedAt: string | null;
  createdAt: string;
  primaryPhotoUrl: string | null;
}

export interface AdminUserListItem {
  id: string;
  email: string | null;
  maskedPhone: string | null;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DELETED";
  activationStatus?: "PENDING_ACTIVATION" | "ACTIVE";
  activationPending?: boolean;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  statusChangedAt?: string | null;
  statusChangedByUser?: { id: string; email: string | null } | null;
  createdAt: string;
  updatedAt: string;
  profile: AdminUserProfileSummary | null;
}

export interface AdminUserListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  role?: string;
  activationStatus?: string;
  emailVerified?: boolean | string;
  phoneVerified?: boolean | string;
  sort?: string;
}

export interface AdminUserListResponse {
  users: AdminUserListItem[];
  pagination: AdminPagination;
}

export interface AdminUserDetail {
  id: string;
  email: string | null;
  maskedPhone: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DELETED";
  activationStatus?: "PENDING_ACTIVATION" | "ACTIVE";
  activationPending?: boolean;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  phoneVerified: boolean;
  phoneVerifiedAt: string | null;
  statusChangedAt?: string | null;
  statusChangedByUser?: { id: string; email: string | null } | null;
  createdAt: string;
  updatedAt: string;
  profile: AdminUserProfileSummary | null;
}

export interface AdminCreateUserData {
  email: string;
  firstName?: string;
  lastName?: string;
  gender?: "MALE" | "FEMALE" | string;
  profileCreatedFor?: "MYSELF" | "SON" | "DAUGHTER" | "BROTHER" | "SISTER" | "FRIEND" | "RELATIVE" | string;
}

export interface AdminCreateUserResponse {
  success: boolean;
  code?: string;
  message: string;
  warning?: string;
  data?: {
    user?: AdminUserDetail;
    debugOtp?: string;
  };
}

export interface AdminResendActivationResponse {
  success: boolean;
  code?: string;
  message: string;
  data?: {
    debugOtp?: string;
  };
}

export interface AdminVerifyActivationOtpResponse {
  success: boolean;
  code?: string;
  message: string;
  data?: {
    userId: string;
    status: string;
    activationStatus: string;
    emailVerified: boolean;
    activatedAt?: string | null;
    activatedByUserId?: string | null;
  };
}

export interface AdminPhotoModerator {
  id: string;
  email: string | null;
}

export interface AdminPhotoListItem {
  id: string;
  url: string;
  moderationStatus: "PENDING" | "APPROVED" | "REJECTED";
  moderationReason: string | null;
  moderatedAt: string | null;
  moderatedByUserId: string | null;
  photoType: "PRIMARY" | "ADDITIONAL";
  isPrimary: boolean;
  sortOrder: number;
  width: number | null;
  height: number | null;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    gender: string | null;
    city: string | null;
    state: string | null;
    profileStatus: string;
    completionPercentage: number;
  };
  user: {
    id: string;
    email: string | null;
    maskedPhone: string | null;
    status: string;
  };
}

export interface AdminPhotoDetail extends AdminPhotoListItem {
  moderator: AdminPhotoModerator | null;
}

export interface AdminPhotoStats {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface AdminPhotoListResponse {
  photos: AdminPhotoListItem[];
  pagination: AdminPagination;
  stats: AdminPhotoStats;
}

export interface AdminPhotoListParams {
  page?: number;
  pageSize?: number;
  q?: string;
  moderationStatus?: "ALL" | "PENDING" | "APPROVED" | "REJECTED" | string;
  sort?: "newest" | "oldest" | string;
}

