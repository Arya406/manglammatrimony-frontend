import { ProfileCardData } from "@/types/profile-card";

export const SAMPLE_PROFILE_PRIYA: ProfileCardData = {
  id: "profile-sample-priya-01",
  name: "Priya",
  age: 28,
  gender: "Female",
  maritalStatus: "Never Married",
  religion: "Hindu",
  community: "Brahmin",
  location: "Jaipur, Rajasthan",
  education: "MBA",
  occupation: "Software Professional",
  incomeRange: "₹10–15 Lakh",
  isVerified: true,
  isOnline: true,
  photos: [
    { url: "/images/sample-profiles/priya/priya_1.jpg", alt: "Priya portrait in traditional attire" },
    { url: "/images/sample-profiles/priya/priya_2.jpg", alt: "Priya in heritage courtyard" },
    { url: "/images/sample-profiles/priya/priya_3.jpg", alt: "Priya professional portrait" },
    { url: "/images/sample-profiles/priya/priya_4.jpg", alt: "Priya in red silk saree" },
    { url: "/images/sample-profiles/priya/priya_5.jpg", alt: "Priya celebration portrait" },
  ],
};

export const SAMPLE_PROFILE_ANANYA: ProfileCardData = {
  id: "profile-sample-ananya-02",
  name: "Ananya",
  age: 27,
  gender: "Female",
  maritalStatus: "Never Married",
  religion: "Hindu",
  community: "Agarwal",
  location: "Delhi NCR",
  education: "B.Tech",
  occupation: "Product Manager",
  incomeRange: "₹15–20 Lakh",
  isVerified: true,
  isOnline: true,
  photos: [
    { url: "/images/sample-profiles/ananya/ananya_1.jpg", alt: "Ananya portrait in teal silk kurta" },
    { url: "/images/sample-profiles/ananya/ananya_2.jpg", alt: "Ananya in office atrium" },
  ],
};

export const SAMPLE_PROFILE_NEHA: ProfileCardData = {
  id: "profile-sample-neha-03",
  name: "Neha",
  age: 29,
  gender: "Female",
  maritalStatus: "Never Married",
  religion: "Hindu",
  community: "Rajput",
  location: "Udaipur, Rajasthan",
  education: "MD",
  occupation: "Doctor (Physician)",
  incomeRange: "₹20–25 Lakh",
  isVerified: true,
  isOnline: false,
  photos: [
    { url: "/images/sample-profiles/neha/neha_1.jpg", alt: "Neha portrait in chanderi saree" },
    { url: "/images/sample-profiles/priya/priya_2.jpg", alt: "Neha outdoors" },
  ],
};

export const SAMPLE_PROFILE_RIYA: ProfileCardData = {
  id: "profile-sample-riya-04",
  name: "Riya",
  age: 26,
  gender: "Female",
  maritalStatus: "Never Married",
  religion: "Hindu",
  community: "Kayastha",
  location: "Mumbai, Maharashtra",
  education: "B.Des",
  occupation: "UI/UX Designer",
  incomeRange: "₹12–18 Lakh",
  isVerified: true,
  isOnline: true,
  photos: [
    { url: "/images/sample-profiles/riya/riya_1.jpg", alt: "Riya portrait in creative art studio" },
    { url: "/images/sample-profiles/priya/priya_4.jpg", alt: "Riya in silk saree" },
  ],
};

export const SAMPLE_PROFILE_KAVYA: ProfileCardData = {
  id: "profile-sample-kavya-05",
  name: "Kavya",
  age: 30,
  gender: "Female",
  maritalStatus: "Never Married",
  religion: "Hindu",
  community: "Maheshwari",
  location: "Ahmedabad, Gujarat",
  education: "Chartered Accountant",
  occupation: "Financial Consultant",
  incomeRange: "₹18–24 Lakh",
  isVerified: true,
  isOnline: true,
  photos: [
    { url: "/images/sample-profiles/kavya/kavya_1.jpg", alt: "Kavya portrait in library" },
    { url: "/images/sample-profiles/priya/priya_5.jpg", alt: "Kavya in festive attire" },
  ],
};

export const SAMPLE_PROFILE_MEERA: ProfileCardData = {
  id: "profile-sample-meera-06",
  name: "Meera",
  age: 28,
  gender: "Female",
  maritalStatus: "Never Married",
  religion: "Hindu",
  community: "Sharma",
  location: "Bengaluru, Karnataka",
  education: "MS in Computer Science",
  occupation: "AI Research Engineer",
  incomeRange: "₹25–30 Lakh",
  isVerified: true,
  isOnline: true,
  photos: [
    { url: "/images/sample-profiles/meera/meera_1.jpg", alt: "Meera portrait in sunset balcony" },
    { url: "/images/sample-profiles/priya/priya_3.jpg", alt: "Meera professional portrait" },
  ],
};

export const MOCK_PROFILE_LIST: ProfileCardData[] = [
  SAMPLE_PROFILE_PRIYA,
  SAMPLE_PROFILE_ANANYA,
  SAMPLE_PROFILE_NEHA,
  SAMPLE_PROFILE_RIYA,
  SAMPLE_PROFILE_KAVYA,
  SAMPLE_PROFILE_MEERA,
];

/** Category 1: Made for Each Other (Top compatibility recommendations) */
export const PROFILES_MADE_FOR_EACH_OTHER: ProfileCardData[] = [
  SAMPLE_PROFILE_PRIYA,
  SAMPLE_PROFILE_ANANYA,
  SAMPLE_PROFILE_MEERA,
];

/** Category 2: Recommended for You (Broad tailored discovery pool) */
export const PROFILES_RECOMMENDED: ProfileCardData[] = [
  SAMPLE_PROFILE_PRIYA,
  SAMPLE_PROFILE_ANANYA,
  SAMPLE_PROFILE_NEHA,
  SAMPLE_PROFILE_RIYA,
  SAMPLE_PROFILE_KAVYA,
  SAMPLE_PROFILE_MEERA,
];

/** Category 3: Your Preferences (Strict filter match profiles) */
export const PROFILES_YOUR_PREFERENCES: ProfileCardData[] = [
  SAMPLE_PROFILE_NEHA,
  SAMPLE_PROFILE_KAVYA,
  SAMPLE_PROFILE_RIYA,
  SAMPLE_PROFILE_ANANYA,
];
