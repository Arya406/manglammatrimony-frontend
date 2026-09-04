import {
  AuthMethod,
  ApiResponse,
  RequestOtpData,
  VerifyOtpData,
} from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function requestRegistrationOtp(
  method: AuthMethod,
  identifier: string
): Promise<ApiResponse<RequestOtpData>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/register/request-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method, identifier }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - requestRegistrationOtp]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

export async function verifyRegistrationOtp(
  verificationId: string,
  otp: string
): Promise<ApiResponse<VerifyOtpData>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/register/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verificationId, otp }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - verifyRegistrationOtp]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

export async function resendRegistrationOtp(
  verificationId: string
): Promise<ApiResponse<RequestOtpData>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/register/resend-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verificationId }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - resendRegistrationOtp]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

export async function requestLoginOtp(
  method: AuthMethod,
  identifier: string
): Promise<ApiResponse<RequestOtpData>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/login/request-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method, identifier }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - requestLoginOtp]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

export async function verifyLoginOtp(
  verificationId: string,
  otp: string
): Promise<ApiResponse<VerifyOtpData>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/login/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verificationId, otp }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - verifyLoginOtp]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

export async function resendLoginOtp(
  verificationId: string
): Promise<ApiResponse<RequestOtpData>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/login/resend-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ verificationId }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[API ERROR - resendLoginOtp]:", error);
    return {
      success: false,
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to the server. Please check your internet connection and try again.",
    };
  }
}

// Re-export session storage and token management utilities
export {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  VERIFICATION_STORAGE_KEY,
  saveVerificationState,
  getVerificationState,
  clearVerificationState,
  saveAuthSession,
  getAuthToken,
  getAuthUser,
  clearAuthSession,
  isAuthenticated,
  logout,
} from "@/lib/auth/authSession";
