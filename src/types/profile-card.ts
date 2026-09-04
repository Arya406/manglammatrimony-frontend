export interface ProfilePhoto {
  url: string;
  alt?: string;
}

export interface ProfileCardData {
  id: string;
  name: string;
  age: number;
  gender: string;
  maritalStatus: string;
  religion: string;
  community?: string;
  location: string;
  education: string;
  occupation: string;
  incomeRange: string;
  isVerified?: boolean;
  isOnline?: boolean;
  photos: Array<string | ProfilePhoto>;
  isFavourited?: boolean;
}

export interface ProfileCardProps {
  profile?: ProfileCardData;
  className?: string;
  onViewProfile?: (profile: ProfileCardData) => void;
  onSendInterest?: (profile: ProfileCardData) => void;
  onToggleFavourite?: (profile: ProfileCardData, isFav: boolean) => void;
}
