const fs = require('fs');
let content = fs.readFileSync('src/services/dataStorage.ts', 'utf8');

// Replace syncAllToSupabase body
content = content.replace(/async syncAllToSupabase\(\): Promise<\{ success: boolean; message\?: string; results\?: any \}> \{[\s\S]*?getProducts\(\): Product\[\]/m, `async syncAllToSupabase(): Promise<{ success: boolean; message?: string; results?: any }> {
    return { success: false, message: 'Fungsi sync-seed telah dihapus. Harap gunakan API langsung.' };
  },

  getProducts(): Product[]`);

// Replace saveProducts
content = content.replace(/saveProducts\(products: Product\[\]\): void \{[\s\S]*?getCategories\(\): CategoryInfo\[\]/m, `saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  },

  getCategories(): CategoryInfo[]`);

// Replace saveCategories
content = content.replace(/saveCategories\(categories: CategoryInfo\[\]\): void \{[\s\S]*?getGuides\(\): Guide\[\]/m, `saveCategories(categories: CategoryInfo[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories', e);
    }
  },

  getGuides(): Guide[]`);

// Replace saveGuides
content = content.replace(/saveGuides\(guides: Guide\[\]\): void \{[\s\S]*?\/\/ Remote DELETE methods for Supabase/m, `saveGuides(guides: Guide[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides));
    } catch (e) {
      console.error('Failed to save guides', e);
    }
  },

  // Remote DELETE methods for Supabase`);

// Replace saveSiteSettings
content = content.replace(/saveSiteSettings\(settings: SiteSettings\): void \{[\s\S]*?resetAllData\(\): \{/m, `saveSiteSettings(settings: SiteSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save site settings', e);
    }
  },

  resetAllData(): {`);

fs.writeFileSync('src/services/dataStorage.ts', content, 'utf8');
