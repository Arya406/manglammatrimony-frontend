import { ApiResponse } from "@/types/auth";
import {
  AdminLoginData,
  AdminUserData,
  AdminDashboardStats,
  AdminProfileListResponse,
  AdminProfileListParams,
  AdminProfileDetail,
  AdminProfileDetailPhoto,
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserDetail,
  AdminCreateUserData,
  AdminCreateUserResponse,
  AdminResendActivationResponse,
  AdminVerifyActivationOtpResponse,
  AdminPhotoDetail,
  AdminPhotoListParams,
  AdminPhotoListResponse,
  AdminUpdateProfileCreatedForPayload,
  AdminUpdatePersonalDetailsPayload,
  AdminUpdateReligionPayload,
  AdminUpdateEducationCareerPayload,
  AdminUpdatePartnerPreferencesPayload,
  AdminUpdateProfileCreatedForResponse,
  AdminUpdatePersonalDetailsResponse,
  AdminUpdateReligionResponse,
  AdminUpdateEducationCareerResponse,
  AdminUpdatePartnerPreferencesResponse,
} from "@/types/admin";
import { getAdminAuthToken, clearAdminAuthSession } from "@/lib/auth/adminAuthSession";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Sends administrative login credentials to backend.
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<ApiResponse<AdminLoginData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - loginAdmin]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the administration server. Please verify your connection.",
    };
  }
}

/**
 * Validates current administrative session and returns verified admin metadata.
 */
export async function getAdminMe(): Promise<ApiResponse<{ admin: AdminUserData }>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - getAdminMe]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to verify administrative session.",
    };
  }
}

/**
 * Fetches real-time authoritative platform aggregate counts.
 */
export async function getAdminDashboardStats(): Promise<
  ApiResponse<AdminDashboardStats>
> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - getAdminDashboardStats]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to retrieve platform statistics.",
    };
  }
}

/**
 * Fetches paginated, filtered, searchable list of all matrimonial profiles.
 */
export async function getAdminProfiles(
  params: AdminProfileListParams = {}
): Promise<ApiResponse<AdminProfileListResponse>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", String(params.page));
  if (params.pageSize) queryParams.set("pageSize", String(params.pageSize));
  if (params.q) queryParams.set("q", params.q);
  if (params.gender && params.gender !== "ALL") queryParams.set("gender", params.gender);
  if (params.profileStatus && params.profileStatus !== "ALL")
    queryParams.set("profileStatus", params.profileStatus);
  if (params.userStatus && params.userStatus !== "ALL")
    queryParams.set("userStatus", params.userStatus);
  if (params.sort) queryParams.set("sort", params.sort);

  const url = `${API_BASE_URL}/api/admin/profiles?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - getAdminProfiles]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to retrieve profiles list.",
    };
  }
}

/**
 * Fetches full read-only profile details for administrative inspection.
 */
export async function getAdminProfileDetail(
  profileId: string
): Promise<ApiResponse<{ profile: AdminProfileDetail }>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/profiles/${profileId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - getAdminProfileDetail]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to retrieve profile details.",
    };
  }
}

/**
 * Fetches paginated, filtered, searchable list of all platform user accounts.
 */
export async function getAdminUsers(
  params: AdminUserListParams = {}
): Promise<ApiResponse<AdminUserListResponse>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set("page", String(params.page));
  if (params.pageSize) queryParams.set("pageSize", String(params.pageSize));
  if (params.q) queryParams.set("q", params.q);
  if (params.status && params.status !== "ALL") queryParams.set("status", params.status);
  if (params.role && params.role !== "ALL") queryParams.set("role", params.role);
  if (params.activationStatus && params.activationStatus !== "ALL")
    queryParams.set("activationStatus", params.activationStatus);
  if (params.emailVerified !== undefined && params.emailVerified !== "ALL")
    queryParams.set("emailVerified", String(params.emailVerified));
  if (params.phoneVerified !== undefined && params.phoneVerified !== "ALL")
    queryParams.set("phoneVerified", String(params.phoneVerified));
  if (params.sort) queryParams.set("sort", params.sort);

  const url = `${API_BASE_URL}/api/admin/users?${queryParams.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - getAdminUsers]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to retrieve users list.",
    };
  }
}

/**
 * Fetches full read-only details for a specific user account.
 */
export async function getAdminUserDetail(
  userId: string
): Promise<ApiResponse<{ user: AdminUserDetail }>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - getAdminUserDetail]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to retrieve user details.",
    };
  }
}

export interface AdminUserStatusUpdateResult {
  user: {
    id: string;
    email: string | null;
    role: string;
    status: "ACTIVE" | "SUSPENDED" | "BLOCKED" | "DELETED";
    statusChangedAt: string | null;
    statusChangedByUser: {
      id: string;
      email: string | null;
    } | null;
    updatedAt: string;
  };
}

/**
 * Suspends an active user account.
 */
export async function suspendAdminUser(
  userId: string,
  currentStatus?: string
): Promise<ApiResponse<AdminUserStatusUpdateResult>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/suspend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(currentStatus ? { currentStatus } : {}),
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - suspendAdminUser]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to suspend user account.",
    };
  }
}

/**
 * Blocks a user account.
 */
export async function blockAdminUser(
  userId: string,
  currentStatus?: string
): Promise<ApiResponse<AdminUserStatusUpdateResult>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/block`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(currentStatus ? { currentStatus } : {}),
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - blockAdminUser]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to block user account.",
    };
  }
}

/**
 * Restores a suspended or blocked user account back to ACTIVE.
 */
export async function restoreAdminUser(
  userId: string,
  currentStatus?: string
): Promise<ApiResponse<AdminUserStatusUpdateResult>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/restore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(currentStatus ? { currentStatus } : {}),
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - restoreAdminUser]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to restore user account.",
    };
  }
}

/**
 * Activates a user account (alias of restore).
 */
export async function activateAdminUser(
  userId: string,
  currentStatus?: string
): Promise<ApiResponse<AdminUserStatusUpdateResult>> {
  return restoreAdminUser(userId, currentStatus);
}

/**
 * Permanently deletes a user account and all owned data.
 * Irreversible hard delete.
 */
export async function permanentlyDeleteAdminUser(
  userId: string,
  confirmation: string
): Promise<ApiResponse<{ userId: string; deleted: boolean; storageCleanupPartial?: boolean }>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ confirmation }),
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - permanentlyDeleteAdminUser]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to reach server to permanently delete account.",
    };
  }
}

/**
 * Fetches paginated, searchable, filtered list of photos in the moderation queue.
 */
export async function getAdminPhotos(
  params: AdminPhotoListParams = {}
): Promise<ApiResponse<AdminPhotoListResponse>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append("page", params.page.toString());
  if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString());
  if (params.q) searchParams.append("q", params.q);
  if (params.moderationStatus && params.moderationStatus !== "ALL") {
    searchParams.append("moderationStatus", params.moderationStatus);
  }
  if (params.sort) searchParams.append("sort", params.sort);

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/api/admin/photos${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - getAdminPhotos]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to retrieve photo moderation queue.",
    };
  }
}

/**
 * Fetches full inspection details for a specific photo.
 */
export async function getAdminPhotoDetail(
  photoId: string
): Promise<ApiResponse<{ photo: AdminPhotoDetail }>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/photos/${photoId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - getAdminPhotoDetail]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to retrieve photo details.",
    };
  }
}

/**
 * Approves a photo in the moderation queue.
 */
export async function approveAdminPhoto(
  photoId: string
): Promise<ApiResponse<{ photo?: AdminPhotoDetail }>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/photos/${photoId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - approveAdminPhoto]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to approve photo.",
    };
  }
}

/**
 * Rejects a photo in the moderation queue with a mandatory reason.
 */
export async function rejectAdminPhoto(
  photoId: string,
  reason: string
): Promise<ApiResponse<{ photo?: AdminPhotoDetail }>> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/photos/${photoId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - rejectAdminPhoto]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to reject photo.",
    };
  }
}

/**
 * Admin creates a user account on behalf of a person.
 */
export async function createAdminUser(
  data: AdminCreateUserData
): Promise<AdminCreateUserResponse> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const resData = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return resData;
  } catch (error) {
    console.error("[ADMIN API ERROR - createAdminUser]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the administration server.",
    };
  }
}

/**
 * Resends activation verification email for a user in PENDING_ACTIVATION status.
 */
export async function resendAdminUserActivation(
  userId: string
): Promise<AdminResendActivationResponse> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/activation/resend`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const resData = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return resData;
  } catch (error) {
    console.error("[ADMIN API ERROR - resendAdminUserActivation]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the administration server.",
    };
  }
}

/**
 * Admin verifies activation OTP provided by user and immediately activates user account.
 */
export async function verifyAdminUserActivationOtp(
  userId: string,
  otp: string
): Promise<AdminVerifyActivationOtpResponse> {
  const token = getAdminAuthToken();

  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/activation/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      }
    );

    const resData = await response.json();
    if (response.status === 401) {
      clearAdminAuthSession();
    }
    return resData;
  } catch (error) {
    console.error("[ADMIN API ERROR - verifyAdminUserActivationOtp]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the administration server.",
    };
  }
}

/**
 * Section A: Updates profileCreatedFor target relationship.
 */
export async function updateAdminProfileCreatedFor(
  profileId: string,
  payload: AdminUpdateProfileCreatedForPayload
): Promise<ApiResponse<AdminUpdateProfileCreatedForResponse>> {
  const token = getAdminAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "No administrative token present." };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/profiles/${profileId}/profile-created-for`,
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
    if (response.status === 401) clearAdminAuthSession();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - updateAdminProfileCreatedFor]:", error);
    return { success: false, code: "NETWORK_ERROR", message: "Unable to update profile created for." };
  }
}

/**
 * Section B: Updates personal details and spoken languages.
 */
export async function updateAdminProfilePersonalDetails(
  profileId: string,
  payload: AdminUpdatePersonalDetailsPayload
): Promise<ApiResponse<AdminUpdatePersonalDetailsResponse>> {
  const token = getAdminAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "No administrative token present." };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/profiles/${profileId}/personal-details`,
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
    if (response.status === 401) clearAdminAuthSession();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - updateAdminProfilePersonalDetails]:", error);
    return { success: false, code: "NETWORK_ERROR", message: "Unable to update personal details." };
  }
}

/**
 * Section C: Updates religion and cultural hierarchy details.
 */
export async function updateAdminProfileReligion(
  profileId: string,
  payload: AdminUpdateReligionPayload
): Promise<ApiResponse<AdminUpdateReligionResponse>> {
  const token = getAdminAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "No administrative token present." };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/profiles/${profileId}/religion`,
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
    if (response.status === 401) clearAdminAuthSession();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - updateAdminProfileReligion]:", error);
    return { success: false, code: "NETWORK_ERROR", message: "Unable to update religion details." };
  }
}

/**
 * Section D: Updates education and career details.
 */
export async function updateAdminProfileEducationCareer(
  profileId: string,
  payload: AdminUpdateEducationCareerPayload
): Promise<ApiResponse<AdminUpdateEducationCareerResponse>> {
  const token = getAdminAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "No administrative token present." };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/profiles/${profileId}/education-career`,
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
    if (response.status === 401) clearAdminAuthSession();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - updateAdminProfileEducationCareer]:", error);
    return { success: false, code: "NETWORK_ERROR", message: "Unable to update education and career details." };
  }
}

/**
 * Section E: Updates partner preference details.
 */
export async function updateAdminProfilePartnerPreferences(
  profileId: string,
  payload: AdminUpdatePartnerPreferencesPayload
): Promise<ApiResponse<AdminUpdatePartnerPreferencesResponse>> {
  const token = getAdminAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "No administrative token present." };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/profiles/${profileId}/partner-preferences`,
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
    if (response.status === 401) clearAdminAuthSession();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - updateAdminProfilePartnerPreferences]:", error);
    return { success: false, code: "NETWORK_ERROR", message: "Unable to update partner preferences." };
  }
}

/**
 * Uploads a photograph to an existing user's profile on behalf of the administrator.
 */
export async function uploadAdminProfilePhoto(
  userId: string,
  file: File,
  isPrimary?: boolean
): Promise<ApiResponse<{ photo: AdminProfileDetailPhoto; profile?: { completionPercentage: number; profileStatus: string } }>> {
  const token = getAdminAuthToken();
  if (!token) {
    return { success: false, code: "UNAUTHORIZED", message: "No administrative token present." };
  }

  const formData = new FormData();
  formData.append("photo", file);
  if (isPrimary !== undefined) {
    formData.append("photoType", isPrimary ? "PRIMARY" : "ADDITIONAL");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/profile/photos`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();
    if (response.status === 401) clearAdminAuthSession();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - uploadAdminProfilePhoto]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server to upload photo. Please check your connection.",
    };
  }
}

/**
 * Activates and publishes a matrimonial profile on behalf of an administrator.
 * Calls POST /api/admin/users/:userId/profile/activate
 */
export async function activateAdminUserProfile(
  userId: string
): Promise<
  ApiResponse<{
    profileId: string;
    userId: string;
    profileStatus: string;
    completionPercentage: number;
    submittedAt: string | null;
    lastEditedAt?: string | null;
    lastEditedByUserId?: string | null;
  }>
> {
  const token = getAdminAuthToken();
  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "No administrative token present.",
    };
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/profile/activate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (response.status === 401) clearAdminAuthSession();
    return data;
  } catch (error) {
    console.error("[ADMIN API ERROR - activateAdminUserProfile]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to connect to the server to publish profile.",
    };
  }
}



