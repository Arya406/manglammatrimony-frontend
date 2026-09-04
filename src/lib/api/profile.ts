import { ApiResponse } from "@/types/auth";
import {
  ProfileCreatedFor,
  InitializeProfileResponseData,
  SavePersonalDetailsPayload,
  PersonalDetailsResponseData,
  LanguageItem,
  SaveReligionPayload,
  ReligionResponseData,
  ReligionItem,
  CommunityItem,
  SubCommunityItem,
  CasteItem,
  SubCasteItem,
  GotraItem,
  SaveEducationCareerPayload,
  EducationCareerResponseData,
  EducationItem,
  SpecializationItem,
  InstitutionItem,
  EmploymentStatusItem,
  OccupationItem,
  CompleteProfileData,
  PhotoType,
  ProfilePhotoItem,
  PhotoListResponseData,
  UploadPhotoResponseData,
  SavePartnerPreferencesPayload,
  PartnerPreferencesResponseData,
  SavePartnerPreferencesResponseData,
  SubmitProfileResponseData,
} from "@/types/profile";
import { getAuthToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Initializes or updates the matrimonial profile creation owner for the authenticated user.
 * Calls POST /api/profile
 */
export async function createProfile(
  profileCreatedFor: ProfileCreatedFor
): Promise<ApiResponse<InitializeProfileResponseData>> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profileCreatedFor }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - createProfile]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

/**
 * Retrieves the complete profile for the authenticated user.
 * Calls GET /api/profile
 */
export async function getProfile(): Promise<
  ApiResponse<CompleteProfileData>
> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - getProfile]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Saves or updates personal details and spoken languages for the authenticated user.
 * Calls PUT /api/profile/personal-details
 */
export async function savePersonalDetails(
  payload: SavePersonalDetailsPayload
): Promise<ApiResponse<PersonalDetailsResponseData>> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/personal-details`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - savePersonalDetails]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

/**
 * Saves or updates religion and community details for the authenticated user.
 * Calls PUT /api/profile/religion
 */
export async function saveReligion(
  payload: SaveReligionPayload
): Promise<ApiResponse<ReligionResponseData>> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/religion`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - saveReligion]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

/**
 * Saves or updates education and career details for the authenticated user.
 * Calls PUT /api/profile/education-career
 */
export async function saveEducationCareer(
  payload: SaveEducationCareerPayload
): Promise<ApiResponse<EducationCareerResponseData>> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/education-career`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - saveEducationCareer]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

/**
 * Fetches all active languages from the backend master data API.
 * Calls GET /api/profile/languages
 */
export async function fetchLanguages(): Promise<ApiResponse<LanguageItem[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/languages`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchLanguages]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches all active religions from master data API.
 * Calls GET /api/profile/religions
 */
export async function fetchReligions(): Promise<ApiResponse<ReligionItem[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/religions`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchReligions]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active communities (optionally filtered by religion).
 * Calls GET /api/profile/communities
 */
export async function fetchCommunities(
  religionId?: string
): Promise<ApiResponse<CommunityItem[]>> {
  try {
    const url = religionId
      ? `${API_BASE_URL}/api/profile/communities?religionId=${encodeURIComponent(
          religionId
        )}`
      : `${API_BASE_URL}/api/profile/communities`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchCommunities]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active sub-communities for a given community.
 * Calls GET /api/profile/sub-communities
 */
export async function fetchSubCommunities(
  communityId?: string
): Promise<ApiResponse<SubCommunityItem[]>> {
  try {
    const url = communityId
      ? `${API_BASE_URL}/api/profile/sub-communities?communityId=${encodeURIComponent(
          communityId
        )}`
      : `${API_BASE_URL}/api/profile/sub-communities`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchSubCommunities]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active castes for a given community.
 * Calls GET /api/profile/castes
 */
export async function fetchCastes(
  communityId?: string
): Promise<ApiResponse<CasteItem[]>> {
  try {
    const url = communityId
      ? `${API_BASE_URL}/api/profile/castes?communityId=${encodeURIComponent(
          communityId
        )}`
      : `${API_BASE_URL}/api/profile/castes`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchCastes]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active sub-castes for a given caste.
 * Calls GET /api/profile/sub-castes
 */
export async function fetchSubCastes(
  casteId?: string
): Promise<ApiResponse<SubCasteItem[]>> {
  try {
    const url = casteId
      ? `${API_BASE_URL}/api/profile/sub-castes?casteId=${encodeURIComponent(
          casteId
        )}`
      : `${API_BASE_URL}/api/profile/sub-castes`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchSubCastes]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active gotras for a given community.
 * Calls GET /api/profile/gotras
 */
export async function fetchGotras(
  communityId?: string
): Promise<ApiResponse<GotraItem[]>> {
  try {
    const url = communityId
      ? `${API_BASE_URL}/api/profile/gotras?communityId=${encodeURIComponent(
          communityId
        )}`
      : `${API_BASE_URL}/api/profile/gotras`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchGotras]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches all active educations from master data API.
 * Calls GET /api/profile/educations
 */
export async function fetchEducations(): Promise<ApiResponse<EducationItem[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/educations`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchEducations]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active specializations for a given education.
 * Calls GET /api/profile/specializations
 */
export async function fetchSpecializations(
  educationId?: string
): Promise<ApiResponse<SpecializationItem[]>> {
  try {
    const url = educationId
      ? `${API_BASE_URL}/api/profile/specializations?educationId=${encodeURIComponent(
          educationId
        )}`
      : `${API_BASE_URL}/api/profile/specializations`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchSpecializations]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active institutions.
 * Calls GET /api/profile/institutions
 */
export async function fetchInstitutions(): Promise<
  ApiResponse<InstitutionItem[]>
> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/institutions`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchInstitutions]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active employment statuses.
 * Calls GET /api/profile/employment-statuses
 */
export async function fetchEmploymentStatuses(): Promise<
  ApiResponse<EmploymentStatusItem[]>
> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/employment-statuses`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchEmploymentStatuses]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Fetches active occupations for a given employment status.
 * Calls GET /api/profile/occupations
 */
export async function fetchOccupations(
  employmentStatusId?: string
): Promise<ApiResponse<OccupationItem[]>> {
  try {
    const url = employmentStatusId
      ? `${API_BASE_URL}/api/profile/occupations?employmentStatusId=${encodeURIComponent(
          employmentStatusId
        )}`
      : `${API_BASE_URL}/api/profile/occupations`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - fetchOccupations]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Retrieves all photos for the authenticated user.
 * Calls GET /api/profile/photos
 */
export async function getPhotos(): Promise<
  ApiResponse<PhotoListResponseData>
> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/photos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - getPhotos]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Uploads a new profile photo for the authenticated user.
 * Calls POST /api/profile/photos (multipart/form-data)
 */
export async function uploadPhoto(
  file: File,
  photoType?: PhotoType
): Promise<ApiResponse<UploadPhotoResponseData>> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  const formData = new FormData();
  formData.append("photo", file);
  if (photoType) {
    formData.append("photoType", photoType);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/photos`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - uploadPhoto]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Deletes a photo belonging to the authenticated user.
 * Calls DELETE /api/profile/photos/:photoId
 */
export async function deletePhoto(
  photoId: string
): Promise<
  ApiResponse<{ deletedPhotoId: string; newPrimaryPhoto?: ProfilePhotoItem | null }>
> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/photos/${encodeURIComponent(photoId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - deletePhoto]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Approves a photo for development/testing purposes.
 * Calls POST /api/profile/photos/:photoId/dev-approve
 * ONLY available when NODE_ENV !== "production" and DEV_PHOTO_APPROVAL_ENABLED === "true".
 */
export async function devApprovePhoto(
  photoId: string
): Promise<
  ApiResponse<{
    photoId: string;
    moderationStatus: "APPROVED";
  }>
> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/photos/${encodeURIComponent(photoId)}/dev-approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - devApprovePhoto]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Resolves a photo URL so that relative URLs correctly point to the API base URL.
 */
export function resolvePhotoUrl(url?: string | null): string {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (typeof window !== "undefined") {
    // In browser: relative path routes through Next.js proxy rewrite on same origin
    return cleanPath;
  }
  const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  return `${base}${cleanPath}`;
}

/**
 * Promotes a photo to PRIMARY for the authenticated user.
 * Calls PUT /api/profile/photos/:photoId/primary
 */
export async function setPrimaryPhoto(
  photoId: string
): Promise<ApiResponse<{ primaryPhoto: ProfilePhotoItem }>> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/photos/${encodeURIComponent(photoId)}/primary`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - setPrimaryPhoto]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Reorders photos for the authenticated user.
 * Calls PUT /api/profile/photos/reorder
 */
export async function reorderPhotos(
  photoIds: string[]
): Promise<ApiResponse<{ photos: ProfilePhotoItem[] }>> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/photos/reorder`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ photoIds }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - reorderPhotos]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Retrieves partner preferences for the authenticated user.
 * Calls GET /api/profile/partner-preferences
 */
export async function getPartnerPreferences(): Promise<
  ApiResponse<PartnerPreferencesResponseData>
> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/partner-preferences`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - getPartnerPreferences]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server.",
    };
  }
}

/**
 * Saves or updates partner preferences for the authenticated user.
 * Calls PUT /api/profile/partner-preferences
 */
export async function savePartnerPreferences(
  payload: SavePartnerPreferencesPayload
): Promise<ApiResponse<SavePartnerPreferencesResponseData>> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/profile/partner-preferences`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - savePartnerPreferences]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

/**
 * Submits the completed profile for verification and approval.
 * Calls POST /api/profile/submit
 */
export async function submitProfile(): Promise<
  ApiResponse<SubmitProfileResponseData>
> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Your session has expired. Please log in again.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/profile/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - submitProfile]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}
