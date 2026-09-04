import { NavLinkItem, FooterLinkGroup } from "@/types/landing";

export const NAV_LINKS: NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Success Stories", href: "/#success-stories" },
  { label: "Membership", href: "/membership" },
  { label: "Help", href: "/help" },
];

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Explore",
    links: [
      { label: "Search Profiles", isSearchModal: true },
      { label: "Premium Plans", href: "/membership" },
      { label: "Success Stories", href: "/#success-stories" },
      { label: "Matchmaking Approach", href: "/about#approach" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Manglam", href: "/about" },
      { label: "Our Philosophy", href: "/about#philosophy" },
      { label: "Careers", isComingSoon: true },
      { label: "Press & Media", isComingSoon: true },
    ],
  },
  {
    title: "Help & Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Safety Guidelines", href: "/safety" },
      { label: "Contact Support", href: "/help#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/privacy#cookies" },
      { label: "Data Security", href: "/privacy#security" },
    ],
  },
];
