export type ProductCategory = string;
export type ProductBadge = string;

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  badge: ProductBadge;
  shortBenefit: string;
  description: string;
  benefits: string[];
  highlights?: string[];
  specifications: Record<string, string>;
  bestFor: string;
  greatFor: string[];
  setupConsiderations: string[];
  verdict: string;
  affiliateUrl: string;
  featured?: boolean;
  productType: string;
  deskSizeCompatibility: string;
}

export interface CategoryInfo {
  id: string;
  name: ProductCategory;
  slug: string;
  description: string;
  productCount: number;
  image: string;
}

export interface GuideStep {
  number: string;
  title: string;
  text: string;
  image?: string;
  recommendedProductSlug?: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  publishDate: string;
  excerpt: string;
  image: string;
  featured?: boolean;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  intro: string;
  steps: GuideStep[];
  callout?: string;
  summary: string;
}

export interface SiteSettings {
  announcementText: string;
  announcementEnabled: boolean;
  announcementLink?: string;
  heroEyebrow: string;
  heroHeadline1: string;
  heroHeadline2: string;
  heroSubtext: string;
  heroCtaPrimaryText?: string;
  heroCtaPrimaryUrl?: string;
  heroCtaSecondaryText?: string;
  heroCtaSecondaryUrl?: string;
  heroImage?: string;
  heroImageAlt?: string;
  heroBadgeEyebrow?: string;
  heroBadgeTitle?: string;
  heroBadgeStat?: string;
  supportEmail: string;
  defaultAffiliateSubId: string;
  adminPasscode: string;
  categoriesHeading?: string;
  categoriesSubtext?: string;
  featuredHeading?: string;
  featuredSubtext?: string;
  recommendationsHeading?: string;
  recommendationsSubtext?: string;
  guidesHeading?: string;
  guidesSubtext?: string;
}

export interface RecommendationGoal {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  tag: string;
}

export type ViewRoute = 
  | { page: 'home' }
  | { page: 'recommendations'; categoryFilter?: ProductCategory | 'All'; searchQuery?: string }
  | { page: 'product-detail'; slug: string }
  | { page: 'categories' }
  | { page: 'guides' }
  | { page: 'guide-detail'; slug: string }
  | { page: 'superadmin'; tab?: 'products' | 'categories' | 'guides' | 'settings' };
