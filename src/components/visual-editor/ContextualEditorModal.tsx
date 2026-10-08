import React, { useState, useEffect } from 'react';
import { X, Check, Eye, AlertCircle, Sparkles, Trash2, FileText, ListOrdered } from 'lucide-react';
import { Product, CategoryInfo, Guide, SiteSettings, RecommendationGoal } from '../../types';
import { AdminImageUploader } from '../AdminImageUploader';

export type EditTargetType =
  | 'hero-copy'
  | 'hero-ctas'
  | 'hero-image'
  | 'section-heading'
  | 'product'
  | 'category'
  | 'guide'
  | 'guide-step'
  | 'recommendation';

export interface EditTarget {
  type: EditTargetType;
  title: string;
  data: any;
  sectionKey?: 'categories' | 'featured' | 'recommendations' | 'guides';
}

interface ContextualEditorModalProps {
  target: EditTarget | null;
  isOpen: boolean;
  categoriesList: CategoryInfo[];
  allProductsList: Product[];
  onClose: () => void;
  onApply: (updatedData: any) => void;
}

export const ContextualEditorModal: React.FC<ContextualEditorModalProps> = ({
  target,
  isOpen,
  categoriesList,
  allProductsList,
  onClose,
  onApply,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');

  useEffect(() => {
    if (target) {
      setFormData(JSON.parse(JSON.stringify(target.data || {})));
      setActiveTab('form');
    }
  }, [target]);

  if (!isOpen || !target) return null;

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#16171D] rounded-2xl shadow-2xl border border-[#E9E9E6] dark:border-[#272932] flex flex-col overflow-hidden text-[#111111] dark:text-[#EDEDED]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E9E9E6] dark:border-[#272932] flex items-center justify-between bg-[#F7F6F2]/50 dark:bg-[#1A1C23]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                Visual Editor
              </span>
              <h2 className="text-base font-extrabold text-[#111111] dark:text-white leading-tight">
                {target.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ========================================================
              TARGET: HERO COPY
              ======================================================== */}
          {target.type === 'hero-copy' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Eyebrow Text (Small Label Above Title)
                </label>
                <input
                  type="text"
                  value={formData.heroEyebrow || ''}
                  onChange={(e) => handleFieldChange('heroEyebrow', e.target.value)}
                  placeholder="SMART TECH FOR BETTER SETUPS"
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Main Headline — Line 1
                </label>
                <input
                  type="text"
                  value={formData.heroHeadline1 || ''}
                  onChange={(e) => handleFieldChange('heroHeadline1', e.target.value)}
                  placeholder="Better Gear."
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Highlighted Headline — Line 2 (Orange)
                </label>
                <input
                  type="text"
                  value={formData.heroHeadline2 || ''}
                  onChange={(e) => handleFieldChange('heroHeadline2', e.target.value)}
                  placeholder="Smarter Spaces."
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold text-[#FF6B00] focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Hero Subtext / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.heroSubtext || ''}
                  onChange={(e) => handleFieldChange('heroSubtext', e.target.value)}
                  placeholder="Discover space-saving tech and accessories..."
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================
              TARGET: HERO CTAS
              ======================================================== */}
          {target.type === 'hero-ctas' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-orange-50/50 dark:bg-[#251E19] border border-orange-200/50 dark:border-[#382619] text-xs text-neutral-700 dark:text-neutral-300">
                Ubah label tombol dan tujuan navigasi tombol aksi pada bagian Hero.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Primary CTA Label (Orange Button)
                  </label>
                  <input
                    type="text"
                    value={formData.heroCtaPrimaryText || 'Explore Products'}
                    onChange={(e) => handleFieldChange('heroCtaPrimaryText', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Primary CTA Target Page
                  </label>
                  <select
                    value={formData.heroCtaPrimaryUrl || 'recommendations'}
                    onChange={(e) => handleFieldChange('heroCtaPrimaryUrl', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  >
                    <option value="recommendations">Recommendations Page</option>
                    <option value="categories">Categories Page</option>
                    <option value="guides">Guides Page</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Secondary CTA Label (Outlined Button)
                  </label>
                  <input
                    type="text"
                    value={formData.heroCtaSecondaryText || 'Read Our Guides'}
                    onChange={(e) => handleFieldChange('heroCtaSecondaryText', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Secondary CTA Target Page
                  </label>
                  <select
                    value={formData.heroCtaSecondaryUrl || 'guides'}
                    onChange={(e) => handleFieldChange('heroCtaSecondaryUrl', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  >
                    <option value="guides">Guides Page</option>
                    <option value="recommendations">Recommendations Page</option>
                    <option value="categories">Categories Page</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TARGET: HERO IMAGE & BADGE
              ======================================================== */}
          {target.type === 'hero-image' && (
            <div className="space-y-4">
              <AdminImageUploader
                label="Hero Image (JPG, PNG, WEBP, GIF, SVG)"
                value={formData.heroImage || '/acer-nitro.png'}
                onChange={(newUrl) => handleFieldChange('heroImage', newUrl)}
                presets={['/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png']}
                placeholder="/acer-nitro.png atau upload file baru"
                helperText="Gambar akan otomatis disesuaikan secara proporsional ke dalam bingkai Hero yang sudah ada tanpa merusak layout."
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Hero Image Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  value={formData.heroImageAlt || ''}
                  onChange={(e) => handleFieldChange('heroImageAlt', e.target.value)}
                  placeholder="Curated compact gaming setup with dual elevated monitors"
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-[#E9E9E6] dark:border-[#272932]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-3">
                  Visual Badge Overlay
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Badge Eyebrow
                    </label>
                    <input
                      type="text"
                      value={formData.heroBadgeEyebrow || 'Setup Architecture #04'}
                      onChange={(e) => handleFieldChange('heroBadgeEyebrow', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-lg text-xs focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Badge Title
                    </label>
                    <input
                      type="text"
                      value={formData.heroBadgeTitle || '100cm Compact Studio Desk'}
                      onChange={(e) => handleFieldChange('heroBadgeTitle', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-lg text-xs focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                      Badge Stat
                    </label>
                    <input
                      type="text"
                      value={formData.heroBadgeStat || '65% Surface Cleared'}
                      onChange={(e) => handleFieldChange('heroBadgeStat', e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-lg text-xs focus:border-[#FF6B00] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TARGET: SECTION HEADING
              ======================================================== */}
          {target.type === 'section-heading' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Section Headline
                </label>
                <input
                  type="text"
                  value={formData.heading || ''}
                  onChange={(e) => handleFieldChange('heading', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Section Subtext / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.subtext || ''}
                  onChange={(e) => handleFieldChange('subtext', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================
              TARGET: PRODUCT
              ======================================================== */}
          {target.type === 'product' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Kategori *
                  </label>
                  <select
                    value={formData.category || (categoriesList[0]?.name ?? 'Desk Setup')}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={formData.badge || 'BEST VALUE'}
                    onChange={(e) => handleFieldChange('badge', e.target.value)}
                    placeholder="BEST VALUE, COMPACT CHOICE"
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Rating (1.0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating ?? 4.8}
                    onChange={(e) => handleFieldChange('rating', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!formData.featured}
                      onChange={(e) => handleFieldChange('featured', e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Tampilkan di Featured Homepage
                    </span>
                  </label>
                </div>
              </div>

              <AdminImageUploader
                label="Product Image"
                value={formData.image || ''}
                onChange={(img) => handleFieldChange('image', img)}
                placeholder="/acer-nitro.png atau upload gambar"
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Short Benefit (Headline Manfaat)
                </label>
                <input
                  type="text"
                  value={formData.shortBenefit || ''}
                  onChange={(e) => handleFieldChange('shortBenefit', e.target.value)}
                  placeholder="Menghemat 60% area meja dengan arm gas-spring"
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Shopee / Marketplace Affiliate Link
                </label>
                <input
                  type="text"
                  value={formData.affiliateUrl || ''}
                  onChange={(e) => handleFieldChange('affiliateUrl', e.target.value)}
                  placeholder="https://s.shopee.co.id/..."
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-mono focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ========================================================
              TARGET: CATEGORY
              ======================================================== */}
          {target.type === 'category' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => handleFieldChange('slug', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-mono focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Deskripsi Kategori
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <AdminImageUploader
                label="Cover Image Kategori"
                value={formData.image || ''}
                onChange={(img) => handleFieldChange('image', img)}
                placeholder="/acer-nitro.png atau upload gambar"
                helperText="Gambar cover kategori akan ditampilkan pada kartu kategori di beranda."
              />
            </div>
          )}

          {/* ========================================================
              TARGET: GUIDE / ARTICLE
              ======================================================== */}
          {target.type === 'guide' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Judul Artikel / Guide *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              {/* Format & Image Settings */}
              <div className="p-3.5 bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-2xl space-y-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    Format Tampilan Artikel
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('layoutFormat', 'steps')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer text-xs font-bold ${
                        formData.layoutFormat !== 'document'
                          ? 'bg-white dark:bg-[#1D1F27] border-[#FF6B00] text-[#FF6B00]'
                          : 'bg-white/60 dark:bg-black/20 border-neutral-200 dark:border-neutral-800 text-neutral-600'
                      }`}
                    >
                      <ListOrdered className="w-3.5 h-3.5 shrink-0" />
                      <span>Format Langkah</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFieldChange('layoutFormat', 'document')}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer text-xs font-bold ${
                        formData.layoutFormat === 'document'
                          ? 'bg-white dark:bg-[#1D1F27] border-[#FF6B00] text-[#FF6B00]'
                          : 'bg-white/60 dark:bg-black/20 border-neutral-200 dark:border-neutral-800 text-neutral-600'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>Lembar Dokumen</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-orange-200/60 dark:border-orange-900/40">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Foto di Dalam Artikel
                  </span>
                  <label className="inline-flex items-center gap-2 cursor-pointer bg-white dark:bg-[#1D1F27] px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-bold">
                    <input
                      type="checkbox"
                      checked={!!formData.showContentImages}
                      onChange={(e) => handleFieldChange('showContentImages', e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <span>{formData.showContentImages ? 'Tampilkan' : 'Tanpa Foto (Hero Saja)'}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Isi Dokumen Artikel Bebas (Multi-paragraf)
                </label>
                <textarea
                  rows={4}
                  value={formData.content || ''}
                  onChange={(e) => handleFieldChange('content', e.target.value)}
                  placeholder="Tuliskan teks dokumen secara bebas (mendukung ## Subjudul, - Poin, dsb.)..."
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-xs leading-relaxed focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Kategori Panduan
                  </label>
                  <input
                    type="text"
                    value={formData.category || 'Ergonomics'}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Waktu Baca (Estimasi)
                  </label>
                  <input
                    type="text"
                    value={formData.readTime || '6 min read'}
                    onChange={(e) => handleFieldChange('readTime', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Ringkasan / Excerpt
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt || ''}
                  onChange={(e) => handleFieldChange('excerpt', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Paragraf Pengantar (Intro)
                </label>
                <textarea
                  rows={3}
                  value={formData.intro || ''}
                  onChange={(e) => handleFieldChange('intro', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Prinsip Utama / Callout Box
                </label>
                <textarea
                  rows={2}
                  value={formData.callout || ''}
                  onChange={(e) => handleFieldChange('callout', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <AdminImageUploader
                label="Cover Image Artikel"
                value={formData.image || ''}
                onChange={(img) => handleFieldChange('image', img)}
                placeholder="/acer-nitro.png atau upload gambar"
              />
            </div>
          )}

          {/* ========================================================
              TARGET: GUIDE / ARTICLE STEP (INDIVIDUAL CONTENT BLOCK)
              ======================================================== */}
          {target.type === 'guide-step' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>Mengedit Konten Langkah Khusus #{formData.step?.number || (formData.stepIndex + 1)}</span>
                <span className="font-mono text-[10px] bg-amber-200/60 dark:bg-amber-900/60 px-2 py-0.5 rounded">
                  Artikel: {formData.guideTitle || formData.guideId}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Nomor Langkah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.step?.number || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step: { ...formData.step, number: e.target.value },
                      })
                    }
                    placeholder="01"
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-mono font-bold focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Judul / Heading Langkah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.step?.title || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        step: { ...formData.step, title: e.target.value },
                      })
                    }
                    placeholder="Contoh: Preparation & Spatial Planning"
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-bold focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Isi Paragraf / Instruksi Langkah *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.step?.text || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      step: { ...formData.step, text: e.target.value },
                    })
                  }
                  placeholder="Tuliskan instruksi langkah secara mendalam..."
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm leading-relaxed focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div>
                <AdminImageUploader
                  label="Gambar Langkah Ini (Step Image)"
                  value={formData.step?.image || ''}
                  onChange={(imgUrl) =>
                    setFormData({
                      ...formData,
                      step: { ...formData.step, image: imgUrl },
                    })
                  }
                  presets={['/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png']}
                  placeholder="/acer-nitro.png atau upload gambar langkah"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Produk Rekomendasi Tertaut (Opsional)
                </label>
                <select
                  value={formData.step?.recommendedProductSlug || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      step: { ...formData.step, recommendedProductSlug: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                >
                  <option value="">-- Tanpa Produk Tertaut --</option>
                  {allProductsList.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {!formData.isNew && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      onApply({ ...formData, isDelete: true });
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Langkah Ini</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TARGET: RECOMMENDATION GOAL
              ======================================================== */}
          {target.type === 'recommendation' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm font-semibold focus:border-[#FF6B00] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Target Kategori Filter
                  </label>
                  <select
                    value={formData.category || (categoriesList[0]?.name ?? 'Desk Setup')}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Benefit Tag Badge
                  </label>
                  <input
                    type="text"
                    value={formData.tag || ''}
                    onChange={(e) => handleFieldChange('tag', e.target.value)}
                    placeholder="Surface Zero, Ergonomic Float"
                    className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Deskripsi Goal
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7F6F2] dark:bg-[#1D1F27] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl text-sm focus:border-[#FF6B00] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E9E9E6] dark:border-[#272932] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#FF6B00] hover:bg-[#E05E00] rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan & Sync ke Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
