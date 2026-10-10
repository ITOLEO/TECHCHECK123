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

export interface ArticleBlock {
  id: string;
  guide_id?: string;
  step_number?: string;
  title?: string;
  text?: string;
  type?: 'heading' | 'subheading' | 'paragraph' | 'image' | 'quote' | 'bullet_list' | 'numbered_list' | 'divider' | 'callout' | 'step';
  content?: string;
  level?: 1 | 2 | 3;
  src?: string;
  image?: string;
  image_url?: string;
  caption?: string;
  alt?: string;
  alt_text?: string;
  items?: string[];
  recommendedProductSlug?: string;
  recommended_product_slug?: string;
  sort_order?: number;
}

export interface GuideStep {
  id?: string;
  number: string;
  title: string;
  text: string;
  image?: string;
  image_url?: string;
  caption?: string;
  recommendedProductSlug?: string;
}

export interface Guide {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  readTime: string;
  publishDate: string;
  excerpt: string;
  image: string;
  featured?: boolean;
  status?: 'draft' | 'published';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  intro: string;
  steps: GuideStep[];
  blocks?: ArticleBlock[];
  callout?: string;
  summary: string;
  layoutFormat?: 'document' | 'steps';
  showContentImages?: boolean;
  content?: string;
  hideStepNumbers?: boolean;
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
  ogImage?: string;
  favicon?: string;
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
  icon?: any;
}

export type ViewRoute = 
  | { page: 'home' }
  | { page: 'recommendations'; categoryFilter?: ProductCategory | 'All'; searchQuery?: string }
  | { page: 'product-detail'; slug: string }
  | { page: 'categories' }
  | { page: 'guides' }
  | { page: 'guide-detail'; slug: string }
  | { page: 'superadmin'; tab?: 'products' | 'categories' | 'guides' | 'settings' };
