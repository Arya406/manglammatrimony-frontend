import {
  EducationItem,
  EmploymentStatusItem,
  EmploymentType,
  AnnualIncomeRange,
} from "@/types/profile";

export const DEFAULT_EDUCATIONS: EducationItem[] = [
  { id: "edu-10th", name: "10th", slug: "10th", sortOrder: 1 },
  { id: "edu-12th", name: "12th", slug: "12th", sortOrder: 2 },
  { id: "edu-diploma", name: "Diploma", slug: "diploma", sortOrder: 3 },
  { id: "edu-ba", name: "B.A.", slug: "ba", sortOrder: 4 },
  { id: "edu-bsc", name: "B.Sc.", slug: "bsc", sortOrder: 5 },
  { id: "edu-bcom", name: "B.Com.", slug: "bcom", sortOrder: 6 },
  { id: "edu-bba", name: "BBA", slug: "bba", sortOrder: 7 },
  { id: "edu-bca", name: "BCA", slug: "bca", sortOrder: 8 },
  { id: "edu-be", name: "B.E.", slug: "be", sortOrder: 9 },
  { id: "edu-btech", name: "B.Tech.", slug: "btech", sortOrder: 10 },
  { id: "edu-ma", name: "M.A.", slug: "ma", sortOrder: 11 },
  { id: "edu-msc", name: "M.Sc.", slug: "msc", sortOrder: 12 },
  { id: "edu-mcom", name: "M.Com.", slug: "mcom", sortOrder: 13 },
  { id: "edu-mba", name: "MBA", slug: "mba", sortOrder: 14 },
  { id: "edu-mca", name: "MCA", slug: "mca", sortOrder: 15 },
  { id: "edu-me", name: "M.E.", slug: "me", sortOrder: 16 },
  { id: "edu-mtech", name: "M.Tech.", slug: "mtech", sortOrder: 17 },
  { id: "edu-mbbs", name: "MBBS", slug: "mbbs", sortOrder: 18 },
  { id: "edu-bds", name: "BDS", slug: "bds", sortOrder: 19 },
  { id: "edu-llb", name: "LLB", slug: "llb", sortOrder: 20 },
  { id: "edu-llm", name: "LLM", slug: "llm", sortOrder: 21 },
  { id: "edu-ca", name: "CA", slug: "ca", sortOrder: 22 },
  { id: "edu-cs", name: "CS", slug: "cs", sortOrder: 23 },
  { id: "edu-phd", name: "PhD", slug: "phd", sortOrder: 24 },
  { id: "edu-other", name: "Other", slug: "other", sortOrder: 25 },
];

export const DEFAULT_EMPLOYMENT_STATUSES: EmploymentStatusItem[] = [
  { id: "emp-employed", name: "Employed", slug: "employed", sortOrder: 1 },
  { id: "emp-self-employed", name: "Self Employed", slug: "self-employed", sortOrder: 2 },
  { id: "emp-business-owner", name: "Business Owner", slug: "business-owner", sortOrder: 3 },
  { id: "emp-entrepreneur", name: "Entrepreneur", slug: "entrepreneur", sortOrder: 4 },
  { id: "emp-government-employee", name: "Government Employee", slug: "government-employee", sortOrder: 5 },
  { id: "emp-defence", name: "Defence", slug: "defence", sortOrder: 6 },
  { id: "emp-student", name: "Student", slug: "student", sortOrder: 7 },
  { id: "emp-not-working", name: "Not Working", slug: "not-working", sortOrder: 8 },
  { id: "emp-retired", name: "Retired", slug: "retired", sortOrder: 9 },
  { id: "emp-other", name: "Other", slug: "other", sortOrder: 10 },
];

export const EMPLOYMENT_TYPE_OPTIONS: Array<{ value: EmploymentType; label: string }> = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "FREELANCE", label: "Freelance" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "OTHER", label: "Other" },
];

export const ANNUAL_INCOME_OPTIONS: Array<{ value: AnnualIncomeRange; label: string }> = [
  { value: "BELOW_2_LAKH", label: "Below ₹2 Lakh" },
  { value: "TWO_TO_FIVE_LAKH", label: "₹2–5 Lakh" },
  { value: "FIVE_TO_TEN_LAKH", label: "₹5–10 Lakh" },
  { value: "TEN_TO_FIFTEEN_LAKH", label: "₹10–15 Lakh" },
  { value: "FIFTEEN_TO_TWENTY_LAKH", label: "₹15–20 Lakh" },
  { value: "TWENTY_TO_THIRTY_LAKH", label: "₹20–30 Lakh" },
  { value: "THIRTY_TO_FIFTY_LAKH", label: "₹30–50 Lakh" },
  { value: "FIFTY_LAKH_TO_ONE_CRORE", label: "₹50 Lakh–1 Crore" },
  { value: "ABOVE_ONE_CRORE", label: "Above ₹1 Crore" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];
