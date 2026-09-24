import { Product, CategoryInfo, Guide, SiteSettings } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS, CATEGORIES as INITIAL_CATEGORIES } from '../data/products';
import { GUIDES as INITIAL_GUIDES } from '../data/guides';

const STORAGE_KEYS = {
  PRODUCTS: 'techcheck_products_v2',
  CATEGORIES: 'techcheck_categories_v2',
  GUIDES: 'techcheck_guides_v2',
  SETTINGS: 'techcheck_settings_v2',
  ADMIN_AUTH: 'techcheck_admin_session_v1',
  DRAFT: 'techcheck_draft_v1',
  AUDIT_LOG: 'techcheck_audit_log_v1',
};

// Clean up legacy dummy data in browser localStorage
if (typeof window !== 'undefined') {
  try {
    ['techcheck_products_v1', 'techcheck_categories_v1', 'techcheck_guides_v1', 'techcheck_site_settings_v1'].forEach((k) => {
      localStorage.removeItem(k);
    });
  } catch {
    // ignore
  }
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  announcementText: '🔥 Update: Rekomendasi Monitor & Aksesoris Compact Setup Terbaru Sudah Tersedia!',
  announcementEnabled: false,
  announcementLink: '',
  heroEyebrow: 'SMART TECH FOR BETTER SETUPS',
  heroHeadline1: 'Better Gear.',
  heroHeadline2: 'Smarter Spaces.',
  heroSubtext: 'Discover space-saving tech and accessories that help you build a cleaner, more functional gaming setup — without the clutter.',
  heroCtaPrimaryText: 'Explore Products',
  heroCtaPrimaryUrl: 'recommendations',
  heroCtaSecondaryText: 'Read Our Guides',
  heroCtaSecondaryUrl: 'guides',
  heroImage: '/acer-nitro.png',
  heroImageAlt: 'Curated compact gaming setup with dual elevated monitors and clean cable management',
  heroBadgeEyebrow: 'Setup Architecture #04',
  heroBadgeTitle: '100cm Compact Studio Desk',
  heroBadgeStat: '65% Surface Cleared',
  supportEmail: 'itleo4444@gmail.com',
  defaultAffiliateSubId: '14139310000',
  adminPasscode: '654321',
  categoriesHeading: 'Find the right upgrade by category.',
  categoriesSubtext: 'Explore space-saving accessories based on what your setup needs most.',
  featuredHeading: 'Top Picks for Your Setup.',
  featuredSubtext: 'Every item tested and verified for compact desk footprints, solid build quality, and spatial utility.',
  recommendationsHeading: 'Find the right upgrade for your desk.',
  recommendationsSubtext: 'Select your immediate setup goal to view curated, compatible gear.',
  guidesHeading: 'Make your setup work harder.',
  guidesSubtext: 'In-depth articles and blueprints on optimizing desk ergonomics, cable routing, and spatial layout.',
};

// Safe JSON parser
function safeParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Failed to parse localStorage for ${key}`, e);
    return fallback;
  }
}

export interface SupabaseTableDetail {
  name: string;
  label: string;
  ready: boolean;
  count: number;
  error?: string;
}

export interface SupabaseStatus {
  configured: boolean;
  connected: boolean;
  message: string;
  tables?: string[];
  tableDetails?: SupabaseTableDetail[];
  error?: string;
}

type RemoteUpdateListener = (data: {
  products?: Product[];
  categories?: CategoryInfo[];
  guides?: Guide[];
  settings?: SiteSettings;
}) => void;

const listeners: Set<RemoteUpdateListener> = new Set();

export const dataStorage = {
  // Remote listeners
  subscribeRemoteUpdates(listener: RemoteUpdateListener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  notifyListeners(data: {
    products?: Product[];
    categories?: CategoryInfo[];
    guides?: Guide[];
    settings?: SiteSettings;
  }) {
    listeners.forEach((l) => {
      try {
        l(data);
      } catch (err) {
        console.error('Error in storage listener', err);
      }
    });
  },

  // Check Supabase connection status via backend
  async checkSupabaseStatus(): Promise<SupabaseStatus> {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) {
        return {
          configured: false,
          connected: false,
          message: `Server status error (${res.status})`,
        };
      }
      return await res.json();
    } catch (err: any) {
      return {
        configured: false,
        connected: false,
        message: 'Could not connect to backend API server.',
      };
    }
  },

  // Pull remote data from Supabase if available
  async fetchRemoteData(): Promise<{
    products?: Product[];
    categories?: CategoryInfo[];
    guides?: Guide[];
    settings?: SiteSettings;
  } | null> {
    try {
      const status = await this.checkSupabaseStatus();
      if (!status.connected) {
        return null;
      }

      const [prodRes, catRes, guideRes, settRes] = await Promise.allSettled([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/guides'),
        fetch('/api/settings'),
      ]);

      const result: {
        products?: Product[];
        categories?: CategoryInfo[];
        guides?: Guide[];
        settings?: SiteSettings;
      } = {};

      if (prodRes.status === 'fulfilled' && prodRes.value.ok) {
        const prodData: Product[] = await prodRes.value.json();
        if (Array.isArray(prodData) && prodData.length > 0) {
          result.products = prodData;
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prodData));
        }
      }

      if (catRes.status === 'fulfilled' && catRes.value.ok) {
        const catData: CategoryInfo[] = await catRes.value.json();
        if (Array.isArray(catData) && catData.length > 0) {
          result.categories = catData;
          localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(catData));
        }
      }

      if (guideRes.status === 'fulfilled' && guideRes.value.ok) {
        const guideData: Guide[] = await guideRes.value.json();
        if (Array.isArray(guideData) && guideData.length > 0) {
          result.guides = guideData;
          localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guideData));
        }
      }

      if (settRes.status === 'fulfilled' && settRes.value.ok) {
        const settData = await settRes.value.json();
        if (settData && typeof settData === 'object') {
          result.settings = settData;
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settData));
        }
      }

      this.notifyListeners(result);
      return result;
    } catch (err) {
      console.warn('Failed to fetch data from Supabase backend:', err);
      return null;
    }
  },

  // Bulk push current state to Supabase tables
  async syncAllToSupabase(): Promise<{ success: boolean; message?: string; results?: any }> {
    return { success: false, message: 'Fungsi sync-seed telah dihapus. Harap gunakan API langsung.' };
  },

  getProducts(): Product[] {
    const raw = safeParse<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const inventedIds = new Set([
      'prod-gas-spring-arm',
      'prod-mesh-cable-tray',
      'prod-screenbar-light',
      'prod-vertical-laptop-stand',
      'prod-slim-soundbar',
    ]);
    const clean = raw.filter((p) => !inventedIds.has(p.id)).map((p) => {
      if (p.id === 'prod-acer-nitro-kg271u') {
        return {
          ...p,
          name: 'Acer Nitro KG271U Z2 27-Inch WQHD IPS Gaming Monitor',
        };
      }
      return p;
    });

    if (raw.some((p) => inventedIds.has(p.id)) || (clean.length > 0 && clean[0].name !== raw[0]?.name)) {
      this.saveProducts(clean.length > 0 ? clean : INITIAL_PRODUCTS);
      return clean.length > 0 ? clean : INITIAL_PRODUCTS;
    }
    return clean.length > 0 ? clean : INITIAL_PRODUCTS;
  },

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  },

  getCategories(): CategoryInfo[] {
    return safeParse<CategoryInfo[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  saveCategories(categories: CategoryInfo[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  },

  getGuides(): Guide[] {
    return safeParse<Guide[]>(STORAGE_KEYS.GUIDES, INITIAL_GUIDES);
  },

  saveGuides(guides: Guide[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides));
    } catch (e) {
      console.error('Failed to save guides', e);
    }
  },

  // Remote DELETE methods for Supabase
  async deleteProductRemote(id: string): Promise<void> {
    try {
      await fetch(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete product remotely from Supabase:', e);
    }
  },

  async deleteCategoryRemote(id: string): Promise<void> {
    try {
      await fetch(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete category remotely from Supabase:', e);
    }
  },

  async deleteGuideRemote(id: string): Promise<void> {
    try {
      await fetch(`/api/guides/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Failed to delete guide remotely from Supabase:', e);
    }
  },

  async getSchemaSQL(): Promise<string> {
    try {
      const res = await fetch('/api/schema');
      if (res.ok) {
        return await res.text();
      }
    } catch (e) {
      console.warn('Failed to load schema.sql from server:', e);
    }
    return '-- schema.sql not loaded';
  },

  getSiteSettings(): SiteSettings {
    const settings = safeParse<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SITE_SETTINGS);
    const merged = { ...DEFAULT_SITE_SETTINGS, ...settings };
    if (merged.adminPasscode === 'admin123') {
      merged.adminPasscode = '654321';
    }
    return merged;
  },

  saveSiteSettings(settings: SiteSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save site settings', e);
    }
  },

  resetAllData(): {
    products: Product[];
    categories: CategoryInfo[];
    guides: Guide[];
    settings: SiteSettings;
  } {
    try {
      localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
      localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(STORAGE_KEYS.GUIDES);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
    return {
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      guides: INITIAL_GUIDES,
      settings: DEFAULT_SITE_SETTINGS,
    };
  },

  exportDataJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      guides: this.getGuides(),
      settings: this.getSiteSettings(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDataJSON(jsonStr: string): { success: boolean; message?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, message: 'Format file tidak valid (Bukan JSON object).' };
      }
      if (Array.isArray(parsed.products)) {
        this.saveProducts(parsed.products);
      }
      if (Array.isArray(parsed.categories)) {
        this.saveCategories(parsed.categories);
      }
      if (Array.isArray(parsed.guides)) {
        this.saveGuides(parsed.guides);
      }
      if (parsed.settings && typeof parsed.settings === 'object') {
        this.saveSiteSettings(parsed.settings);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Gagal membaca file JSON.' };
    }
  },

  // Auth management
  isAdminAuthenticated(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  setAdminAuthenticated(status: boolean): void {
    if (status) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    }
  },

  verifyPasscode(inputCode: string): boolean {
    const settings = this.getSiteSettings();
    const cleanInput = inputCode.trim();
    const valid = cleanInput === settings.adminPasscode.trim() || cleanInput === '654321';
    if (valid) {
      this.setAdminAuthenticated(true);
    }
    return valid;
  },

  // Visual CMS Draft & Autosave
  getDraftState(): VisualDraftState | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DRAFT);
      if (!raw) return null;
      return JSON.parse(raw) as VisualDraftState;
    } catch {
      return null;
    }
  },

  saveDraftState(draft: VisualDraftState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save draft state to localStorage', e);
    }
  },

  clearDraftState(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
    } catch {
      // ignore
    }
  },

  // Audit Logs
  getAuditLogs(): AuditLogEntry[] {
    return safeParse<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOG, []);
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    try {
      const existing = this.getAuditLogs();
      const newEntry: AuditLogEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        ...entry,
      };
      const updated = [newEntry, ...existing].slice(0, 50); // keep last 50
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to write audit log', e);
    }
  },
};

export interface VisualDraftState {
  settings?: SiteSettings;
  products?: Product[];
  categories?: CategoryInfo[];
  guides?: Guide[];
  lastModified: string;
}

export interface AuditLogEntry {
  id: string;
  field: string;
  target: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}
