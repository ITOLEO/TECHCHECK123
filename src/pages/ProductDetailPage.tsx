import React, { useState, useEffect } from 'react';
import { ChevronRight, ExternalLink, ArrowLeft, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, ViewRoute } from '../types';
import { SafeImage } from '../components/SafeImage';
import { analytics } from '../services/analytics';
import { updateSEO, buildProductSchema, buildBreadcrumbSchema } from '../services/seo';

interface ProductDetailPageProps {
  product?: Product | null;
  allProducts?: Product[];
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct?: (slug: string) => void;
  onOpenAffiliateModal: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onNavigate,
  onOpenAffiliateModal,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);

      updateSEO({
        title: `${product.name} Review & Spatial Specs | TechCheck`,
        description: product.verdict || product.shortBenefit,
        canonicalPath: `recommendations/${product.slug}`,
        ogImage: product.image,
        ogType: 'product',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            buildProductSchema(product),
            buildBreadcrumbSchema([
              { name: 'Home', path: '' },
              { name: 'Recommendations', path: 'recommendations' },
              { name: product.category, path: `recommendations?category=${encodeURIComponent(product.category)}` },
              { name: product.name, path: `recommendations/${product.slug}` },
            ]),
          ],
        },
      });

      analytics.track('product_view', {
        productId: product.id,
        productName: product.name,
        category: product.category,
      });
    }

    return () => {
      document.title = 'TechCheck — Small Space. Serious Setup.';
    };
  }, [product]);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center mx-auto text-[#FF6B00]">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#111111] dark:text-white mt-6">Product Not Found</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          The requested hardware item may have been moved, renamed, or unlisted.
        </p>
        <button
          onClick={() => onNavigate({ page: 'recommendations' })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] dark:bg-white hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] text-white dark:text-[#111111] dark:hover:text-white text-xs font-semibold rounded-2xl transition-all shadow-xs cursor-pointer mt-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </button>
      </div>
    );
  }

  const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const pros = product.greatFor || product.benefits || [];
  const cons = product.setupConsiderations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <button
          onClick={() => onNavigate({ page: 'home' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <button
          onClick={() => onNavigate({ page: 'recommendations' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Recommendations
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <button
          onClick={() => onNavigate({ page: 'recommendations', categoryFilter: product.category })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-[#111111] dark:text-neutral-200 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main Two-Column Product Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Visual Gallery Stage */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-8 aspect-4/3 flex items-center justify-center shadow-xs overflow-hidden">
            <SafeImage
              src={selectedImage || product.image}
              alt={product.name}
              fallbackText={product.name}
              className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300"
              loading="eager"
            />
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
              {galleryImages.map((img, idx) => {
                const isSelected = (selectedImage || product.image) === img;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl bg-white dark:bg-[#16171C] border p-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/20'
                        : 'border-[#E9E9E6] dark:border-[#272932] hover:border-neutral-300'
                    }`}
                  >
                    <SafeImage
                      src={img}
                      alt={`${product.name} view ${idx + 1}`}
                      fallbackText={`Thumb ${idx + 1}`}
                      className="max-h-full max-w-full w-auto h-auto object-contain"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Key Spatial Highlights Box */}
          {product.benefits && product.benefits.length > 0 && (
            <div className="p-6 rounded-3xl bg-neutral-100/70 dark:bg-[#16171C] border border-[#E9E9E6] dark:border-[#272932] space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                Why It Fits Small Workspaces
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
                {product.benefits.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-2 shrink-0" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Specifications & Verdict */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                {product.category}
              </span>
              {product.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black">
                  {product.badge}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="mt-3 text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {product.shortBenefit}
            </p>
          </div>

          {/* Primary Action Button Bar */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#16171C] border border-[#E9E9E6] dark:border-[#272932] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block">
                  Verified Partner Listing
                </span>
                <span className="text-sm font-bold text-[#111111] dark:text-white">
                  Direct Merchant Clearance
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenAffiliateModal(product)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <span>Check Live Price</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span>Independent review. We may earn an affiliate commission at no extra cost to you.</span>
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-6 sm:p-7 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Technical & Spatial Specifications
              </h3>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs sm:text-sm">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="py-2.5 flex items-center justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">{key}</span>
                    <span className="text-[#111111] dark:text-white font-semibold text-right">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compact Setup Fit Analysis */}
          {product.deskSizeCompatibility && (
            <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-6 sm:p-7 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Desk Clearance Verdict
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {product.deskSizeCompatibility}
              </p>
            </div>
          )}

          {/* Pros & Cons in High-Contrast Cards */}
          {(pros.length > 0 || cons.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pros.length > 0 && (
                <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-white block">
                    Pros & Spatial Advantages
                  </span>
                  <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                    {pros.map((p, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-2 shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cons.length > 0 && (
                <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 block">
                    Drawbacks & Clearances
                  </span>
                  <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
                    {cons.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-2 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Deep Pitch-Black Verdict Card */}
          {product.verdict && (
            <div className="p-7 rounded-3xl bg-[#111111] dark:bg-[#16171E] text-white space-y-3 shadow-md border border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                  TechCheck Final Editorial Verdict
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {product.verdict}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="pt-8 border-t border-[#E9E9E6] dark:border-[#272932] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
            Browse More Hardware
          </span>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Explore related categories or return to the recommendations catalog.
          </p>
        </div>
        <button
          onClick={() => onNavigate({ page: 'recommendations' })}
          className="text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          ← Return to All Recommendations
        </button>
      </div>
    </div>
  );
};
