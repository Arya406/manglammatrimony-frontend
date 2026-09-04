import { ApiResponse } from "@/types/auth";
import { ProfileCardData } from "@/types/profile-card";
import { getAuthToken } from "@/lib/auth/authSession";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface FavouritesListResponseData {
  profiles: ProfileCardData[];
  total: number;
}

export interface ReceivedLikesListResponseData {
  profiles: (ProfileCardData & { likedAt: string })[];
  total: number;
}

export interface ReceivedLikesCountData {
  count: number;
}

export interface FavouriteToggleData {
  isFavourited: boolean;
  profileId: string;
}

/**
 * Adds a profile to the current user's favourites (outgoing like).
 * POST /api/profile/favourites/:profileId
 */
export async function addFavourite(
  profileId: string
): Promise<ApiResponse<FavouriteToggleData>> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Please log in to add profiles to favourites.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/favourites/${profileId}`, {
      method: "POST",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("[ADD FAVOURITE ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Failed to add profile to favourites.",
    };
  }
}

/**
 * Removes a profile from the current user's favourites.
 * DELETE /api/profile/favourites/:profileId
 */
export async function removeFavourite(
  profileId: string
): Promise<ApiResponse<FavouriteToggleData>> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Please log in to update favourites.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/favourites/${profileId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    console.error("[REMOVE FAVOURITE ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Failed to remove profile from favourites.",
    };
  }
}

/**
 * Retrieves whether target profile is favourited by current user.
 * GET /api/profile/favourites/status/:profileId
 */
export async function getFavouriteStatus(
  profileId: string
): Promise<ApiResponse<{ isFavourited: boolean; profileId: string }>> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Please log in to check favourite status.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/favourites/status/${profileId}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return await res.json();
  } catch (err) {
    console.error("[GET FAVOURITE STATUS ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Failed to check favourite status.",
    };
  }
}

/**
 * Retrieves profiles the current user has favourited (Sent Favourites).
 * GET /api/profile/favourites
 */
export async function getFavourites(
  page = 1,
  pageSize = 20
): Promise<ApiResponse<FavouritesListResponseData>> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Please log in to view favourites.",
    };
  }

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const res = await fetch(`${API_BASE_URL}/api/profile/favourites?${params.toString()}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return await res.json();
  } catch (err) {
    console.error("[GET SENT FAVOURITES ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Failed to load favourites.",
    };
  }
}

/**
 * Retrieves profiles that have liked the current user (Received Likes).
 * GET /api/profile/likes/received
 */
export async function getReceivedLikes(
  page = 1,
  pageSize = 20
): Promise<ApiResponse<ReceivedLikesListResponseData>> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Please log in to view received likes.",
    };
  }

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });
    const res = await fetch(`${API_BASE_URL}/api/profile/likes/received?${params.toString()}`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return await res.json();
  } catch (err) {
    console.error("[GET RECEIVED LIKES ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Failed to load received likes.",
    };
  }
}

/**
 * Retrieves count of incoming likes (people who liked the current user).
 * GET /api/profile/likes/received/count
 */
export async function getReceivedLikesCount(): Promise<ApiResponse<ReceivedLikesCountData>> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Please log in to view likes count.",
    };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/likes/received/count`, {
      headers: authHeaders(),
      cache: "no-store",
    });
    return await res.json();
  } catch (err) {
    console.error("[GET RECEIVED LIKES COUNT ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Failed to fetch likes count.",
    };
  }
}
