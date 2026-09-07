export interface ProfilePhoto {
  url: string;
  alt?: string;
}

export interface ProfilePartnerPreferences {
  minAge?: number | null;
  maxAge?: number | null;
  minHeightCm?: number | null;
  maxHeightCm?: number | null;
  religions?: string[];
  communities?: string[];
  castes?: string[];
  gotras?: string[];
  educations?: string[];
  occupations?: string[];
  maritalStatuses?: string[];
  manglik?: string[];
}

export interface ProfileCardData {
  id: string;
  name: string;
  age: number;
  gender: string;
  maritalStatus: string;
  profileCreatedFor?: string;
  heightCm?: number | null;
  heightFormatted?: string;
  motherTongue?: string;
  religion: string;
  community?: string;
  subCommunity?: string;
  caste?: string;
  subCaste?: string;
  gotra?: string;
  manglik?: string;
  location: string;
  city?: string | null;
  state?: string | null;
  education: string;
  specialization?: string;
  institution?: string;
  occupation: string;
  employmentStatus?: string;
  employmentType?: string;
  incomeRange: string;
  isVerified?: boolean;
  isOnline?: boolean;
  photos: Array<string | ProfilePhoto>;
  isFavourited?: boolean;
  partnerPreference?: ProfilePartnerPreferences;
}

export interface ProfileCardProps {
  profile?: ProfileCardData;
  className?: string;
  onViewProfile?: (profile: ProfileCardData) => void;
  onSendInterest?: (profile: ProfileCardData) => void;
  onToggleFavourite?: (profile: ProfileCardData, isFav: boolean) => void;
}
