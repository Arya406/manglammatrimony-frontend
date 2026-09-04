import { ReligionItem, CommunityItem } from "@/types/profile";

export const DEFAULT_RELIGIONS: ReligionItem[] = [
  { id: "rel-hindu", name: "Hindu", slug: "hindu", sortOrder: 1 },
  { id: "rel-muslim", name: "Muslim", slug: "muslim", sortOrder: 2 },
  { id: "rel-christian", name: "Christian", slug: "christian", sortOrder: 3 },
  { id: "rel-sikh", name: "Sikh", slug: "sikh", sortOrder: 4 },
  { id: "rel-jain", name: "Jain", slug: "jain", sortOrder: 5 },
  { id: "rel-buddhist", name: "Buddhist", slug: "buddhist", sortOrder: 6 },
  { id: "rel-parsi", name: "Parsi", slug: "parsi", sortOrder: 7 },
  { id: "rel-jewish", name: "Jewish", slug: "jewish", sortOrder: 8 },
  { id: "rel-other", name: "Other", slug: "other", sortOrder: 9 },
  { id: "rel-prefer-not-to-say", name: "Prefer not to say", slug: "prefer-not-to-say", sortOrder: 10 },
];

export const DEFAULT_COMMUNITIES: CommunityItem[] = [
  { id: "com-brahmin", name: "Brahmin", slug: "brahmin", sortOrder: 1 },
  { id: "com-rajput", name: "Rajput", slug: "rajput", sortOrder: 2 },
  { id: "com-jat", name: "Jat", slug: "jat", sortOrder: 3 },
  { id: "com-gujjar", name: "Gujjar", slug: "gujjar", sortOrder: 4 },
  { id: "com-kayastha", name: "Kayastha", slug: "kayastha", sortOrder: 5 },
  { id: "com-baniya-vaishya", name: "Baniya / Vaishya", slug: "baniya-vaishya", sortOrder: 6 },
  { id: "com-kshatriya", name: "Kshatriya", slug: "kshatriya", sortOrder: 7 },
  { id: "com-yadav", name: "Yadav", slug: "yadav", sortOrder: 8 },
  { id: "com-kurmi", name: "Kurmi", slug: "kurmi", sortOrder: 9 },
  { id: "com-maratha", name: "Maratha", slug: "maratha", sortOrder: 10 },
  { id: "com-patel", name: "Patel", slug: "patel", sortOrder: 11 },
  { id: "com-reddy", name: "Reddy", slug: "reddy", sortOrder: 12 },
  { id: "com-kamma", name: "Kamma", slug: "kamma", sortOrder: 13 },
  { id: "com-nair", name: "Nair", slug: "nair", sortOrder: 14 },
  { id: "com-ezhava", name: "Ezhava", slug: "ezhava", sortOrder: 15 },
  { id: "com-lingayat", name: "Lingayat", slug: "lingayat", sortOrder: 16 },
  { id: "com-vokkaliga", name: "Vokkaliga", slug: "vokkaliga", sortOrder: 17 },
  { id: "com-agarwal", name: "Agarwal", slug: "agarwal", sortOrder: 18 },
  { id: "com-other", name: "Other", slug: "other", sortOrder: 19 },
  { id: "com-prefer-not-to-say", name: "Prefer not to say", slug: "prefer-not-to-say", sortOrder: 20 },
];
