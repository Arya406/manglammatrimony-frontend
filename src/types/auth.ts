export type AuthMethod = "phone" | "email";

export interface RequestOtpPayload {
  method: AuthMethod;
  identifier: string;
}

export interface VerifyOtpPayload {
  verificationId: string;
  otp: string;
}

export interface ResendOtpPayload {
  verificationId: string;
}

export interface RequestOtpData {
  verificationId: string;
  method: AuthMethod;
  maskedIdentifier: string;
  resendCooldownSeconds: number;
  expiresInSeconds: number;
}

export interface AuthUserData {
  id: string;
  phone?: string;
  email?: string;
  status: string;
}

export interface VerifyOtpData {
  user: AuthUserData;
  token: string;
  redirectTo: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: {
    missingSections?: string[];
    [key: string]: unknown;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface VerificationState {
  verificationId: string;
  method: AuthMethod;
  maskedIdentifier: string;
  rawIdentifier: string;
  resendCooldownSeconds: number;
  expiresInSeconds: number;
  requestedAt: number;
}
