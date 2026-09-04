import { ApiResponse } from "@/types/auth";
import { ProfileCardData } from "@/types/profile-card";
import { getAuthToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function authHeaders() {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface MatchesResponseData {
  profiles: ProfileCardData[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

/**
 * Fetches discovery candidate profiles for the authenticated user.
 * GET /api/matches?category=...&page=...&pageSize=...
 */
export async function getMatches(
  category?: string,
  page = 1,
  pageSize = 20
): Promise<ApiResponse<MatchesResponseData>> {
  const token = getAuthToken();
  if (!token) {
    return {
      success: false,
      code: "UNAUTHORIZED",
      message: "Please log in to view discovery profiles.",
    };
  }

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(category ? { category } : {}),
    });

    const res = await fetch(`${API_BASE_URL}/api/matches?${params.toString()}`, {
      headers: authHeaders(),
      cache: "no-store",
    });

    return await res.json();
  } catch (err) {
    console.error("[GET MATCHES API ERROR]:", err);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: "Unable to load discovery matches. Please check your connection.",
    };
  }
}
