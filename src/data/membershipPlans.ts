/**
 * Manglam Matrimony — Membership Plans Data
 *
 * Defines the 3 platform membership tiers strictly adhering to business rules:
 * - 1 Month: ₹499 (20 contacts, Chat, Video call)
 * - 3 Months: ₹1,199 (75 contacts, Chat, Video call)
 * - 6 Months: ₹11,000 (Advisor, Unlimited verified profiles monthly, Family meeting, Verified profile, Guarantee/Refund condition, ₹2,000 manager/verification fee)
 */

export interface MembershipPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
  formattedPrice: string;
  periodText: string;
  tag?: string;
  isHighlighted?: boolean;
  description: string;
  features: string[];
  advisorDetails?: {
    guaranteeText: string;
    verificationFeeText: string;
  };
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "plan_1m",
    name: "Standard",
    duration: "1 Month",
    price: 499,
    formattedPrice: "₹499",
    periodText: "for 1 month",
    description: "Essential access to begin connecting directly with compatible matrimonial matches.",
    features: [
      "20 contacts",
      "Chat",
      "Video call",
    ],
  },
  {
    id: "plan_3m",
    name: "Classic",
    duration: "3 Months",
    price: 1199,
    formattedPrice: "₹1,199",
    periodText: "for 3 months",
    description: "Extended connection quota for families actively seeking meaningful proposals.",
    features: [
      "75 contacts",
      "Chat",
      "Video call",
    ],
  },
  {
    id: "plan_6m",
    name: "Elite Advisor",
    duration: "6 Months",
    price: 11000,
    formattedPrice: "₹11,000",
    periodText: "for 6 months",
    tag: "Complete Guidance",
    isHighlighted: true,
    description: "Full-service personalized matchmaking guided by an experienced personal matrimonial advisor.",
    features: [
      "Advisor",
      "Unlimited verified profiles provided to the user every month",
      "Family meeting",
      "Verified profile",
    ],
    advisorDetails: {
      guaranteeText: "Guarantee / refund condition: Full money-back guarantee if no compatible introductions are arranged within the 6-month period as defined by business terms.",
      verificationFeeText: "Includes a ₹2,000 manager / profile verification fee transparently allocated for in-depth background and family credential checks.",
    },
  },
];
