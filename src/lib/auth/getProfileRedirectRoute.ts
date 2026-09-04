import { CompleteProfileData } from "@/types/profile";

/**
 * Determines the target redirect route for a user based on their current profile completeness and status.
 *
 * Rules:
 * - NO PROFILE -> /onboarding
 * - INCOMPLETE -> Appropriate unfinished onboarding step (personal-details, religion, education-career, photos, partner-preferences, or review)
 * - ALL SECTIONS COMPLETE / READY FOR REVIEW -> /onboarding/review
 * - IN_REVIEW -> /onboarding/submitted
 * - ACTIVE -> /matches (Profile Discovery)
 */
export function getProfileRedirectRoute(
  profileData: CompleteProfileData | null | undefined
): string {
  if (!profileData) {
    return "/onboarding";
  }

  // 1. Profile status checks
  const status = profileData.profile?.profileStatus || profileData.profileStatus;

  if (status === "ACTIVE") {
    return "/matches";
  }

  if (status === "IN_REVIEW") {
    return "/onboarding/review";
  }

  // 2. Check onboarding progression stage
  // Screen 1: Profile Created For
  const createdFor = profileData.profile?.profileCreatedFor || profileData.profileCreatedFor;
  if (!createdFor) {
    return "/onboarding";
  }

  // Screen 2: Personal Details
  const pd = profileData.personalDetails;
  if (
    !pd ||
    !pd.firstName ||
    !pd.lastName ||
    !pd.gender ||
    !pd.dateOfBirth ||
    !pd.maritalStatus ||
    !pd.heightCm ||
    !pd.motherTongueId
  ) {
    return "/onboarding/personal-details";
  }

  // Screen 3: Religion & Community
  const rel = profileData.religion;
  if (!rel || !rel.religionId || !rel.manglik) {
    return "/onboarding/religion";
  }

  // Screen 4: Education & Career
  const edu = profileData.education;
  const car = profileData.career;
  if (!edu || !edu.educationId || !car || !car.employmentStatusId) {
    return "/onboarding/education-career";
  }

  // Screen 5: Photos
  const photos = profileData.photos || [];
  if (photos.length === 0) {
    return "/onboarding/photos";
  }

  // Screen 6: Partner Preferences
  const pref = profileData.partnerPreferences || profileData.partnerPreference;
  if (!pref || !pref.id) {
    return "/onboarding/partner-preferences";
  }

  // Screen 7: Profile Review & Submission
  return "/onboarding/review";
}
