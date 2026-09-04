export interface StatItem {
  id: string;
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface HowItWorksStep {
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  badge?: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  tag?: string;
}

export interface SuccessStory {
  id: string;
  coupleNames: string;
  quote: string;
  marriageMeta: string;
  location: string;
  imageUrl?: string;
  imageAlt?: string;
  initials: string;
}

export interface NavLinkItem {
  label: string;
  href: string;
  badge?: string;
}

export interface FooterLinkItem {
  label: string;
  href?: string;
  isExternal?: boolean;
  isComingSoon?: boolean;
  isSearchModal?: boolean;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLinkItem[];
}
