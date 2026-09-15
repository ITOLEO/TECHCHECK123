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
  supportEmail: string;
  defaultAffiliateSubId: string;
  adminPasscode: string;
}

export type ViewRoute = 
  | { page: 'home' }
  | { page: 'recommendations'; categoryFilter?: ProductCategory | 'All'; searchQuery?: string }
  | { page: 'product-detail'; slug: string }
  | { page: 'categories' }
  | { page: 'guides' }
  | { page: 'guide-detail'; slug: string }
  | { page: 'superadmin'; tab?: 'products' | 'categories' | 'guides' | 'settings' };
