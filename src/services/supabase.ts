import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultClient, SUPABASE_BASE_URL, SUPABASE_PUBLIC_KEY } from '../subabaseClient.js';
import { Product, CategoryInfo, Guide, SiteSettings, GuideStep } from '../types';

/**
 * Modern Supabase Client & Repository Service
 * Provides typed methods for interacting with Supabase tables:
 * - categories
 * - products
 * - guides
 * - article_blocks
 * - site_settings
 */

// Supabase Table Row Interfaces
export interface SupabaseCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count: number;
  image: string | null;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  rating: number;
  review_count: number;
  image: string;
  gallery: string[] | any;
  badge: string;
  short_benefit: string;
  description: string;
  benefits: string[] | any;
  highlights: string[] | any;
  specifications: Record<string, string> | any;
  best_for: string;
  great_for: string[] | any;
  setup_considerations: string[] | any;
  verdict: string;
  affiliate_url: string;
  featured: boolean;
  product_type: string;
  desk_size_compatibility: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseGuideRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  read_time: string;
  publish_date: string | null;
  excerpt: string | null;
  image: string | null;
  featured: boolean;
  author_name: string;
  author_role: string;
  author_avatar: string | null;
  intro: string | null;
  steps: any;
  callout: string | null;
  summary: string | null;
  layout_format?: string;
  show_content_images?: boolean;
  content?: string;
  hide_step_numbers?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseArticleBlockRow {
  id: string;
  guide_id: string;
  step_number: string;
  title: string;
  text: string;
  image: string | null;
  image_url: string | null;
  caption: string | null;
  alt_text: string | null;
  recommended_product_slug: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseSiteSettingsRow {
  id: number;
  announcement_text?: string;
  announcement_enabled?: boolean;
  announcement_link?: string;
  hero_eyebrow?: string;
  hero_headline1?: string;
  hero_headline2?: string;
  hero_subtext?: string;
  hero_image?: string;
  hero_image_alt?: string;
  hero_badge_eyebrow?: string;
  hero_badge_title?: string;
  hero_badge_stat?: string;
  hero_cta_primary_text?: string;
  hero_cta_primary_url?: string;
  hero_cta_secondary_text?: string;
  hero_cta_secondary_url?: string;
  og_image?: string;
  favicon?: string;
  support_email?: string;
  default_affiliate_sub_id?: string;
  admin_passcode?: string;
  updated_at?: string;
}

// Client Singleton
let clientInstance: SupabaseClient | null = null;
let currentConfig = { url: '', key: '' };

/**
 * Get or initialize the Supabase client
 */
export function getSupabaseClient(configOverride?: { url: string; key: string }): SupabaseClient | null {
  if (configOverride && configOverride.url && configOverride.key) {
    if (
      !clientInstance ||
      currentConfig.url !== configOverride.url ||
      currentConfig.key !== configOverride.key
    ) {
      currentConfig = { url: configOverride.url, key: configOverride.key };
      clientInstance = createClient(configOverride.url, configOverride.key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return clientInstance;
  }

  if (clientInstance) return clientInstance;

  // Check Vite environment variables or fallback to subabaseClient.js
  const metaEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
  const viteUrl = (metaEnv?.VITE_SUPABASE_URL as string) || SUPABASE_BASE_URL || '';
  const viteKey = (metaEnv?.VITE_SUPABASE_ANON_KEY as string) || SUPABASE_PUBLIC_KEY || '';

  if (viteUrl && viteKey) {
    currentConfig = { url: viteUrl, key: viteKey };
    clientInstance = createClient(viteUrl, viteKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return clientInstance;
  }

  return defaultClient || null;
}

/**
 * Data Transformers between Frontend Types and Supabase Rows
 */
export const supabaseMappers = {
  // Category
  categoryToRow(cat: CategoryInfo): SupabaseCategoryRow {
    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: cat.description || '',
      product_count: cat.productCount || 0,
      image: cat.image || '',
    };
  },
  rowToCategory(row: SupabaseCategoryRow): CategoryInfo {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      productCount: Number(row.product_count) || 0,
      image: row.image || '',
    };
  },

  // Product
  productToRow(prod: Product): SupabaseProductRow {
    return {
      id: prod.id,
      slug: prod.slug,
      name: prod.name,
      category: prod.category,
      rating: prod.rating || 5.0,
      review_count: prod.reviewCount || 0,
      image: prod.image || '',
      gallery: Array.isArray(prod.gallery) ? prod.gallery : (prod.image ? [prod.image] : []),
      badge: prod.badge || '',
      short_benefit: prod.shortBenefit || '',
      description: prod.description || '',
      benefits: Array.isArray(prod.benefits) ? prod.benefits : [],
      highlights: Array.isArray(prod.highlights) ? prod.highlights : [],
      specifications: prod.specifications || {},
      best_for: prod.bestFor || '',
      great_for: Array.isArray(prod.greatFor) ? prod.greatFor : [],
      setup_considerations: Array.isArray(prod.setupConsiderations) ? prod.setupConsiderations : [],
      verdict: prod.verdict || '',
      affiliate_url: prod.affiliateUrl || '',
      featured: Boolean(prod.featured),
      product_type: prod.productType || prod.category,
      desk_size_compatibility: prod.deskSizeCompatibility || 'Universal',
    };
  },
  rowToProduct(row: SupabaseProductRow): Product {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      rating: Number(row.rating) || 5.0,
      reviewCount: Number(row.review_count) || 0,
      image: row.image || '',
      gallery: Array.isArray(row.gallery) ? row.gallery : (row.image ? [row.image] : []),
      badge: row.badge || '',
      shortBenefit: row.short_benefit || '',
      description: row.description || '',
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      highlights: Array.isArray(row.highlights) ? row.highlights : [],
      specifications: typeof row.specifications === 'object' && row.specifications !== null ? row.specifications : {},
      bestFor: row.best_for || '',
      greatFor: Array.isArray(row.great_for) ? row.great_for : [],
      setupConsiderations: Array.isArray(row.setup_considerations) ? row.setup_considerations : [],
      verdict: row.verdict || '',
      affiliateUrl: row.affiliate_url || '',
      featured: Boolean(row.featured),
      productType: row.product_type || row.category,
      deskSizeCompatibility: row.desk_size_compatibility || 'Universal',
    };
  },

  // Guide
  guideToRow(guide: Guide): SupabaseGuideRow {
    return {
      id: guide.id,
      slug: guide.slug,
      title: guide.title,
      category: guide.category || 'Setup Advice',
      read_time: guide.readTime || '5 min read',
      publish_date: guide.publishDate || '',
      excerpt: guide.excerpt || '',
      image: guide.image || '',
      featured: Boolean(guide.featured),
      author_name: guide.author?.name || 'TechCheck Editorial',
      author_role: guide.author?.role || 'Setup Specialist',
      author_avatar: guide.author?.avatar || '',
      intro: guide.intro || '',
      steps: Array.isArray(guide.steps) ? guide.steps : [],
      callout: guide.callout || '',
      summary: guide.summary || '',
      layout_format: guide.layoutFormat || 'document',
      show_content_images: guide.showContentImages !== false,
      content: guide.content || '',
      hide_step_numbers: Boolean(guide.hideStepNumbers),
    };
  },
  rowToGuide(row: SupabaseGuideRow): Guide {
    const rawSteps = Array.isArray(row.steps) ? row.steps : [];
    const formattedSteps: GuideStep[] = rawSteps.map((st: any, idx: number) => {
      const stepNumber = st.number || String(idx + 1).padStart(2, '0');
      const stepId = st.id || `${row.id}-step-${stepNumber}`;
      const img = st.image?.trim() || st.image_url?.trim() || '';
      return {
        ...st,
        id: stepId,
        number: stepNumber,
        image: img,
        image_url: img,
      };
    });

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category || 'Setup Advice',
      readTime: row.read_time || '5 min read',
      publishDate: row.publish_date || '',
      excerpt: row.excerpt || '',
      image: row.image || '',
      featured: Boolean(row.featured),
      author: {
        name: row.author_name || 'TechCheck Editorial',
        role: row.author_role || 'Setup Specialist',
        avatar: row.author_avatar || '',
      },
      intro: row.intro || '',
      steps: formattedSteps,
      callout: row.callout || '',
      summary: row.summary || '',
      layoutFormat: (row.layout_format as 'document' | 'steps') || 'document',
      showContentImages: row.show_content_images !== false,
      content: row.content || '',
      hideStepNumbers: Boolean(row.hide_step_numbers),
    };
  },

  // Site Settings
  settingsToRow(settings: SiteSettings): SupabaseSiteSettingsRow {
    return {
      id: 1,
      announcement_text: settings.announcementText || '',
      announcement_enabled: Boolean(settings.announcementEnabled),
      announcement_link: settings.announcementLink || '',
      hero_eyebrow: settings.heroEyebrow || '',
      hero_headline1: settings.heroHeadline1 || '',
      hero_headline2: settings.heroHeadline2 || '',
      hero_subtext: settings.heroSubtext || '',
      hero_image: settings.heroImage || '/hero-setup.jpg',
      hero_image_alt: settings.heroImageAlt || 'Compact Gaming Setup',
      hero_badge_eyebrow: settings.heroBadgeEyebrow || 'SETUP ARCHITECTURE 2026',
      hero_badge_title: settings.heroBadgeTitle || '100cm Compact Studio Desk',
      hero_badge_stat: settings.heroBadgeStat || '45% Surface Cleared',
      hero_cta_primary_text: settings.heroCtaPrimaryText || 'Explore Products',
      hero_cta_primary_url: settings.heroCtaPrimaryUrl || 'recommendations',
      hero_cta_secondary_text: settings.heroCtaSecondaryText || 'Read Our Guides',
      hero_cta_secondary_url: settings.heroCtaSecondaryUrl || 'guides',
      og_image: settings.ogImage || '/og-image.jpg',
      favicon: settings.favicon || '/favicon.png',
      support_email: settings.supportEmail || 'itleo4444@gmail.com',
      default_affiliate_sub_id: settings.defaultAffiliateSubId || '14139310000',
      admin_passcode: settings.adminPasscode || '654321',
    };
  },
  rowToSettings(row: SupabaseSiteSettingsRow, fallback: SiteSettings): SiteSettings {
    return {
      ...fallback,
      announcementText: row.announcement_text ?? fallback.announcementText,
      announcementEnabled: Boolean(row.announcement_enabled),
      announcementLink: row.announcement_link ?? fallback.announcementLink,
      heroEyebrow: row.hero_eyebrow ?? fallback.heroEyebrow,
      heroHeadline1: row.hero_headline1 ?? fallback.heroHeadline1,
      heroHeadline2: row.hero_headline2 ?? fallback.heroHeadline2,
      heroSubtext: row.hero_subtext ?? fallback.heroSubtext,
      heroImage: row.hero_image || fallback.heroImage,
      heroImageAlt: row.hero_image_alt || fallback.heroImageAlt,
      heroBadgeEyebrow: row.hero_badge_eyebrow || fallback.heroBadgeEyebrow,
      heroBadgeTitle: row.hero_badge_title || fallback.heroBadgeTitle,
      heroBadgeStat: row.hero_badge_stat || fallback.heroBadgeStat,
      heroCtaPrimaryText: row.hero_cta_primary_text || fallback.heroCtaPrimaryText,
      heroCtaPrimaryUrl: row.hero_cta_primary_url || fallback.heroCtaPrimaryUrl,
      heroCtaSecondaryText: row.hero_cta_secondary_text || fallback.heroCtaSecondaryText,
      heroCtaSecondaryUrl: row.hero_cta_secondary_url || fallback.heroCtaSecondaryUrl,
      ogImage: row.og_image || fallback.ogImage || '/og-image.jpg',
      favicon: row.favicon || fallback.favicon || '/favicon.png',
      supportEmail: row.support_email ?? fallback.supportEmail,
      defaultAffiliateSubId: row.default_affiliate_sub_id ?? fallback.defaultAffiliateSubId,
      adminPasscode: row.admin_passcode ?? fallback.adminPasscode,
    };
  },
};

/**
 * Modern Supabase Repository Service
 */
export const supabaseService = {
  /**
   * Test Supabase connection
   */
  async checkConnection(): Promise<{ connected: boolean; message: string; error?: string }> {
    try {
      const res = await fetch('/api/status', { cache: 'no-store' });
      if (!res.ok) {
        return { connected: false, message: `Server status error (${res.status})` };
      }
      const data = await res.json();
      return {
        connected: Boolean(data.connected),
        message: data.message || 'Status retrieved',
        error: data.error,
      };
    } catch (err: any) {
      return { connected: false, message: 'Could not connect to API server', error: err.message };
    }
  },

  /**
   * Fetch all products from Supabase via backend API
   */
  async getProducts(): Promise<Product[] | null> {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    } catch {
      return null;
    }
  },

  /**
   * Save a single product to Supabase
   */
  async saveProduct(product: Product): Promise<boolean> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Delete a product from Supabase
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch all categories from Supabase
   */
  async getCategories(): Promise<CategoryInfo[] | null> {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    } catch {
      return null;
    }
  },

  /**
   * Save a single category to Supabase
   */
  async saveCategory(cat: CategoryInfo): Promise<boolean> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Delete a category from Supabase
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch all guides from Supabase
   */
  async getGuides(): Promise<Guide[] | null> {
    try {
      const res = await fetch('/api/guides', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data) ? data : null;
    } catch {
      return null;
    }
  },

  /**
   * Save a guide to Supabase
   */
  async saveGuide(guide: Guide): Promise<boolean> {
    try {
      const res = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guide),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Delete a guide from Supabase
   */
  async deleteGuide(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/guides/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch site settings from Supabase
   */
  async getSiteSettings(): Promise<SiteSettings | null> {
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return data && typeof data === 'object' ? data : null;
    } catch {
      return null;
    }
  },

  /**
   * Save site settings to Supabase
   */
  async saveSiteSettings(settings: SiteSettings): Promise<boolean> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Targeted PATCH update for article blocks (step images/captions)
   */
  async patchArticleBlock(
    blockId: string,
    data: {
      image_url?: string;
      image?: string;
      title?: string;
      text?: string;
      caption?: string;
      alt_text?: string;
      recommendedProductSlug?: string;
      step_number?: string;
      guide_id?: string;
    }
  ): Promise<{ success: boolean; block?: any; error?: string }> {
    try {
      const res = await fetch(`/api/article-blocks/${encodeURIComponent(blockId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, error: errJson.error || `HTTP ${res.status}` };
      }
      const json = await res.json();
      return { success: true, block: json.block };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network request failed' };
    }
  },

  /**
   * Full push sync of all models to Supabase
   */
  async syncAll(payload: {
    categories: CategoryInfo[];
    products: Product[];
    guides: Guide[];
    settings: SiteSettings;
  }): Promise<{ success: boolean; results?: any; error?: string }> {
    try {
      const res = await fetch('/api/sync-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        return { success: false, error: errJson.error || 'Failed to sync with Supabase' };
      }
      const data = await res.json();
      return { success: true, results: data.results };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database synchronization failed' };
    }
  },
};
