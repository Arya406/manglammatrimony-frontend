/**
 * Manglam Matrimony — Help & Support FAQ Dataset
 *
 * Defines the 7 help categories and all comprehensive FAQ articles.
 * Content strictly matches the actual platform behavior:
 * - Email-based OTP authentication (Resend)
 * - Profile lifecycle (INCOMPLETE -> IN_REVIEW -> ACTIVE)
 * - Accurate IN_REVIEW permissions & restrictions
 * - Photo upload capabilities (JPEG, PNG, WebP, HEIC up to 20MB, auto EXIF rotation)
 * - Matches, Favourites, and Request-based 1-on-1 Messaging
 * - Membership plans (1m ₹499, 3m ₹1,199, 6m ₹11,000) & online payment status
 * - Privacy protection and photo metadata stripping
 */

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface FaqItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "account-login",
    title: "Account & Login",
    description: "Email registration, secure OTP verification codes, and sign-in help.",
    iconName: "key",
  },
  {
    id: "profile-photos",
    title: "Profile & Photos",
    description: "Profile setup, personal details, photo uploads, and managing your gallery.",
    iconName: "user",
  },
  {
    id: "profile-review",
    title: "Profile Review",
    description: "Application status, review process, editing permissions, and approvals.",
    iconName: "shield-check",
  },
  {
    id: "matches-interests",
    title: "Matches & Interests",
    description: "Discovering compatible profiles, preferences, and sending favourites.",
    iconName: "heart",
  },
  {
    id: "messages-requests",
    title: "Messages & Requests",
    description: "Message requests, 1-on-1 conversations, unread badges, and chat guidelines.",
    iconName: "message-square",
  },
  {
    id: "membership",
    title: "Membership",
    description: "Plans, pricing, advisor offerings, contacts, and payment status.",
    iconName: "award",
  },
  {
    id: "privacy-safety",
    title: "Privacy & Safety",
    description: "Profile privacy, photo protection, reporting misconduct, and support contact.",
    iconName: "lock",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  // --------------------------------------------------------------------------
  // 1. ACCOUNT & LOGIN
  // --------------------------------------------------------------------------
  {
    id: "faq-acc-1",
    categoryId: "account-login",
    question: "How do I create an account?",
    answer:
      "To create an account, go to the Register page, select who you are creating the profile for (Myself, My Son, My Daughter, My Brother, My Sister, or Relative/Friend), enter your valid email address, and accept the Terms & Privacy Policy. We will send a secure 6-digit verification code to your email. Once entered, your account is created and you begin onboarding.",
    keywords: ["register", "create account", "signup", "email", "get started"],
  },
  {
    id: "faq-acc-2",
    categoryId: "account-login",
    question: "How do I log in?",
    answer:
      "Visit the Login page and enter your registered email address. A 6-digit one-time password (OTP) is instantly sent to your inbox. Enter the code on the verification screen to securely sign in without needing to remember complex passwords.",
    keywords: ["login", "sign in", "otp", "code", "enter account"],
  },
  {
    id: "faq-acc-3",
    categoryId: "account-login",
    question: "What happens if I enter an email that does not have an account?",
    answer:
      "If you enter an unregistered email on the Login screen, the system will inform you: 'No account found with this email. Please register first.' A direct link to the registration page is provided so you can set up your account in seconds.",
    keywords: ["unregistered", "not found", "wrong email", "new account"],
  },
  {
    id: "faq-acc-4",
    categoryId: "account-login",
    question: "How does the email verification code work?",
    answer:
      "Our verification codes are 6-digit numbers generated on-demand and delivered directly to your email inbox via our secure email delivery service. Codes are valid for 5 minutes and can be used once. For your security, there is a 45-second cooldown before requesting a new code, and attempts are limited to 5 tries.",
    keywords: ["otp", "code", "email verification", "cooldown", "expiry"],
  },
  {
    id: "faq-acc-5",
    categoryId: "account-login",
    question: "What happens if my verification code expires?",
    answer:
      "If 5 minutes pass before you enter the code, it expires automatically for your security. Simply click the 'Resend Code' button once the 45-second cooldown timer ends to receive a fresh verification code.",
    keywords: ["expired code", "resend", "timeout", "new code"],
  },

  // --------------------------------------------------------------------------
  // 2. PROFILE & PHOTOS
  // --------------------------------------------------------------------------
  {
    id: "faq-prof-1",
    categoryId: "profile-photos",
    question: "How do I complete my profile?",
    answer:
      "Our guided onboarding walks you through 5 key sections: 1) Personal Details (name, date of birth, marital status, height, location), 2) Religion & Community (religion, caste, gotra, manglik status), 3) Education & Career (highest degree, occupation, annual income), 4) Photos (upload at least 1 clear photo), and 5) Partner Preferences (desired age, height, community, education, and location). Once complete, you can review and submit your profile.",
    keywords: ["complete profile", "onboarding", "steps", "details", "personal"],
  },
  {
    id: "faq-prof-2",
    categoryId: "profile-photos",
    question: "Can I edit my profile after submitting it?",
    answer:
      "Yes. You can edit your personal details, religion & community, education & career, photos, and partner preferences at any time by navigating to your profile summary or selecting 'Edit Profile' from the user menu. Changes are saved immediately.",
    keywords: ["edit profile", "update details", "change information", "modify"],
  },
  {
    id: "faq-prof-3",
    categoryId: "profile-photos",
    question: "What image formats can I upload?",
    answer:
      "You can upload all common photo formats: JPEG (.jpg, .jpeg), PNG (.png), WebP (.webp), and Apple HEIC/HEIF (.heic, .heif) directly from your phone camera, gallery, or computer. Photos can be up to 20 MB each. Our system automatically corrects orientation (so phone photos never appear sideways) and safely strips sensitive camera/GPS metadata.",
    keywords: ["photo formats", "jpeg", "png", "webp", "heic", "size limit", "file size", "mb"],
  },
  {
    id: "faq-prof-4",
    categoryId: "profile-photos",
    question: "Can I add or remove photos?",
    answer:
      "Yes. You can upload up to 6 photos to your profile gallery. To remove a photo, click the trash can icon on the photo card. You can also reorder photos using the left and right arrow buttons.",
    keywords: ["add photo", "delete photo", "remove", "reorder", "max photos", "6 photos"],
  },
  {
    id: "faq-prof-5",
    categoryId: "profile-photos",
    question: "How do I change my primary photo?",
    answer:
      "Your primary photo is marked with a gold '★ Main Photo' badge and appears as the cover image on your matrimonial card. To make a different uploaded photo your primary photo, simply click the 'Set Main' button on that photo's card.",
    keywords: ["primary photo", "main photo", "set main", "cover picture", "avatar"],
  },

  // --------------------------------------------------------------------------
  // 3. PROFILE REVIEW
  // --------------------------------------------------------------------------
  {
    id: "faq-rev-1",
    categoryId: "profile-review",
    question: "What does \"Application Under Review\" mean?",
    answer:
      "When you submit your completed profile, its status transitions to 'IN_REVIEW'. This indicates that your details have been submitted and are being checked for platform trust, safety, and authenticity before your profile becomes active and visible to other members across discovery.",
    keywords: ["under review", "application under review", "in_review", "status", "submission"],
  },
  {
    id: "faq-rev-2",
    categoryId: "profile-review",
    question: "Can I edit my profile while it is under review?",
    answer:
      "Yes. While your profile is in the 'IN_REVIEW' state, you have full access to view your complete profile summary, update your personal details, manage your photos (upload, reorder, set primary, delete), and modify your partner preferences. Changes are saved automatically without restarting your review.",
    keywords: ["edit under review", "modify while review", "update photo under review"],
  },
  {
    id: "faq-rev-3",
    categoryId: "profile-review",
    question: "Can I browse matches while my profile is under review?",
    answer:
      "No. To ensure mutual safety, trust, and verified community standards, browsing matches, searching profiles, sending favourites, and messaging are reserved for approved, active profiles. While under review, your navigation is dedicated to reviewing and refining your profile.",
    keywords: ["browse matches under review", "restrictions", "view profiles", "in review access"],
  },
  {
    id: "faq-rev-4",
    categoryId: "profile-review",
    question: "What happens after my profile is approved?",
    answer:
      "Once your profile is reviewed and approved, your status transitions to 'ACTIVE'. You will gain complete access to the Matches discovery feed, daily recommendations, favourites, interests, and 1-on-1 message requests, and your profile will be eligible to appear to compatible matches.",
    keywords: ["approved", "active profile", "activation", "unlock matches"],
  },

  // --------------------------------------------------------------------------
  // 4. MATCHES & INTERESTS
  // --------------------------------------------------------------------------
  {
    id: "faq-match-1",
    categoryId: "matches-interests",
    question: "How do matches work currently?",
    answer:
      "Our matching engine evaluates mutual compatibility based on key criteria: preferred age range, minimum and maximum height, religion, community, education levels, and location preferences. Profiles that meet your criteria and whose criteria you meet are displayed in your Matches feed with compatibility highlights.",
    keywords: ["matches", "compatibility", "algorithm", "partner preferences", "recommendations"],
  },
  {
    id: "faq-match-2",
    categoryId: "matches-interests",
    question: "What are favourites?",
    answer:
      "Favouriting a profile (by clicking the heart icon on any profile card) lets you bookmark someone you are genuinely interested in. Your saved profiles are organized in your 'Interests' tab under 'My Favourites' for easy reference.",
    keywords: ["favourites", "bookmark", "heart", "save profile", "likes"],
  },
  {
    id: "faq-match-3",
    categoryId: "matches-interests",
    question: "What happens when someone favourites my profile?",
    answer:
      "When another verified member favourites your profile, it is registered in your 'Interests' section under 'Received Likes'. You can view their profile details and, if interested, initiate a message request.",
    keywords: ["received likes", "someone liked me", "interests tab", "notifications"],
  },

  // --------------------------------------------------------------------------
  // 5. MESSAGES & REQUESTS
  // --------------------------------------------------------------------------
  {
    id: "faq-msg-1",
    categoryId: "messages-requests",
    question: "How do message requests work?",
    answer:
      "To protect members from unsolicited spam and preserve a respectful matrimonial environment, communication starts with a message request. Click 'Connect' or 'Send Request' on a candidate's profile to express your interest. The candidate receives an instant notification and can review your profile before deciding.",
    keywords: ["message requests", "send request", "connect", "permission", "invitation"],
  },
  {
    id: "faq-msg-2",
    categoryId: "messages-requests",
    question: "When can I start chatting?",
    answer:
      "You can begin chatting directly once the recipient reviews and accepts your message request. At that moment, a private 1-on-1 conversation is created in your 'Messages' tab.",
    keywords: ["chat", "start chatting", "when can i message", "conversation"],
  },
  {
    id: "faq-msg-3",
    categoryId: "messages-requests",
    question: "What happens when a request is accepted?",
    answer:
      "When a message request is accepted, both members receive an acceptance notification and the connection is unlocked in the Messages section. You can then exchange messages, discuss family backgrounds, and share contact details respectfully.",
    keywords: ["request accepted", "unlocked", "start conversation", "chat"],
  },
  {
    id: "faq-msg-4",
    categoryId: "messages-requests",
    question: "Can I message someone before the request is accepted?",
    answer:
      "No. Direct messaging is disabled until the recipient accepts the connection request. This ensures that every conversation begins with mutual consent and interest.",
    keywords: ["message before accept", "direct message", "spam prevention", "consent"],
  },

  // --------------------------------------------------------------------------
  // 6. MEMBERSHIP
  // --------------------------------------------------------------------------
  {
    id: "faq-mem-1",
    categoryId: "membership",
    question: "What membership plans are currently available?",
    answer:
      "Manglam Matrimony offers three straightforward plans: 1 Month (₹499), 3 Months (₹1,199), and 6 Months Complete Guidance (₹11,000). Each plan is designed to match different family timelines and support requirements.",
    keywords: ["membership plans", "pricing", "cost", "how much", "subscription"],
  },
  {
    id: "faq-mem-2",
    categoryId: "membership",
    question: "What is included in the 1-month plan?",
    answer:
      "The 1-Month plan is ₹499 and includes access to 20 verified candidate contacts, direct 1-on-1 text chat, and video call capabilities with accepted connections.",
    keywords: ["1 month", "499", "contacts", "chat", "video call"],
  },
  {
    id: "faq-mem-3",
    categoryId: "membership",
    question: "What is included in the 3-month plan?",
    answer:
      "The 3-Month plan is ₹1,199 and includes 75 verified candidate contacts, direct text chat, and video calling across the 3-month duration.",
    keywords: ["3 months", "1199", "75 contacts", "features"],
  },
  {
    id: "faq-mem-4",
    categoryId: "membership",
    question: "What is included in the 6-month advisor offering?",
    answer:
      "The 6-Month Complete Guidance tier is ₹11,000. It includes a dedicated Personal Matrimonial Advisor, unlimited verified profiles provided to you every month, facilitated family meetings, a verified profile badge, a full guarantee/refund condition if no compatible introductions are arranged within 6 months, and a transparent ₹2,000 manager/verification fee allocated for in-depth background checks.",
    keywords: ["6 months", "11000", "advisor", "complete guidance", "guarantee", "family meeting", "verification fee"],
  },
  {
    id: "faq-mem-5",
    categoryId: "membership",
    question: "Are payments currently available?",
    answer:
      "Online payment integration is currently being prepared for production. At this moment, all standard discovery, matching, and connection features are complimentary for verified members. You can review all plans on the /membership page.",
    keywords: ["payment gateway", "online payment", "complimentary", "free", "checkout"],
  },

  // --------------------------------------------------------------------------
  // 7. PRIVACY & SAFETY
  // --------------------------------------------------------------------------
  {
    id: "faq-safe-1",
    categoryId: "privacy-safety",
    question: "Who can view my profile?",
    answer:
      "Only verified, registered members of Manglam Matrimony can view profile details. Search engines and non-registered visitors cannot view your personal information, family details, or contact coordinates.",
    keywords: ["who can view", "privacy", "search engines", "visible", "public"],
  },
  {
    id: "faq-safe-2",
    categoryId: "privacy-safety",
    question: "How are profile photos handled?",
    answer:
      "Uploaded photos are processed through our secure server pipeline. All EXIF, GPS location coordinates, and camera device serial numbers are automatically stripped for user privacy. Images are normalized to high-quality canonical WebP derivatives.",
    keywords: ["photos safety", "privacy", "gps metadata", "exif", "security"],
  },
  {
    id: "faq-safe-3",
    categoryId: "privacy-safety",
    question: "What should I do if I encounter suspicious behaviour?",
    answer:
      "We take member safety with utmost seriousness. If anyone asks for money, behaves inappropriately, or falsifies information, do not share financial details and report them immediately by contacting our support team with the member's profile details.",
    keywords: ["suspicious", "safety", "report user", "fraud", "misconduct"],
  },
  {
    id: "faq-safe-4",
    categoryId: "privacy-safety",
    question: "How can I contact support?",
    answer:
      "You can reach our team by clicking the 'Contact Support' button at the bottom of this page or emailing us directly at support@manglammatrimony.com. Our support desk operates during regular business hours to assist with account, verification, and platform inquiries.",
    keywords: ["contact support", "help desk", "email support", "reach out", "customer care"],
  },
];
