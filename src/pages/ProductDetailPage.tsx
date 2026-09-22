import React, { useState, useEffect } from 'react';
import { ChevronRight, ExternalLink, ArrowLeft, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import { Product, ViewRoute } from '../types';
import { SafeImage } from '../components/SafeImage';
import { ProductCard } from '../components/ProductCard';
import { analytics } from '../services/analytics';

interface ProductDetailPageProps {
  product?: Product;
  allProducts: Product[];
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct: (slug: string) => void;
  onOpenAffiliateModal?: (product: Product) => void;
}

function formatAffiliateUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigate,
  onSelectProduct,
}) => {
  // If product is missing or invalid slug
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#FF6B00]">
          <Layers className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#111111]">Product Not Found</h1>
        <p className="text-neutral-600 max-w-md mx-auto text-sm leading-relaxed">
          The accessory or monitor you are looking for might have been moved or updated in our catalog.
        </p>
        <button
          onClick={() => onNavigate({ page: 'recommendations' })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] hover:bg-[#FF6B00] text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Recommendations</span>
        </button>
      </div>
    );
  }

  const [activeImage, setActiveImage] = useState<string>(product.image);

  // Sync document title and active image
  useEffect(() => {
    setActiveImage(product.image);
    document.title = `${product.name} | TechCheck Review & Setup Compatibility`;
    analytics.track('product_view', {
      productId: product.id,
      productName: product.name,
      category: product.category,
    });
    return () => {
      document.title = 'TechCheck — Small Space. Serious Setup.';
    };
  }, [product]);

  const safeAffiliateUrl = formatAffiliateUrl(product.affiliateUrl);

  const handleAffiliateClick = () => {
    if (!safeAffiliateUrl) return;
    analytics.track('affiliate_click', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      affiliateUrl: safeAffiliateUrl,
    });
    window.open(safeAffiliateUrl, '_blank', 'noopener,noreferrer');
  };

  // Related products (same category or others, excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      if (a.category === product.category && b.category !== product.category) return -1;
      if (b.category === product.category && a.category !== product.category) return 1;
      return 0;
    })
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-medium text-neutral-500 overflow-x-auto whitespace-nowrap pb-1">
        <button
          onClick={() => onNavigate({ page: 'home' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <button
          onClick={() => onNavigate({ page: 'recommendations' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Recommendations
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <button
          onClick={() => onNavigate({ page: 'recommendations', categoryFilter: product.category })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          {product.category}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Product Image & Highlights */}
        <div className="lg:col-span-6 space-y-8">
          <div className="relative aspect-4/3 sm:aspect-16/11 bg-neutral-100 rounded-2xl border border-[#E9E9E6] overflow-hidden shadow-xs">
            <SafeImage
              src={activeImage}
              alt={product.name}
              fallbackText={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
              loading="eager"
            />
          </div>

          {/* Thumbnail Gallery */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  aria-label={`View photo angle ${idx + 1}`}
                  className={`w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeImage === img
                      ? 'border-[#FF6B00] ring-2 ring-orange-200'
                      : 'border-[#E9E9E6] opacity-70 hover:opacity-100'
                  }`}
                >
                  <SafeImage
                    src={img}
                    alt={`${product.name} angle ${idx + 1}`}
                    fallbackText={`Angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Product Highlights */}
          {product.highlights && product.highlights.length > 0 && (
            <div className="mt-8 pt-4">
              <h3 className="text-xl font-bold text-[#111111] mb-4">Product Highlights</h3>
              <ul className="space-y-3">
                {product.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: All Details */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            {product.badge && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#111111] text-white">
                  {product.badge}
                </span>
              </div>
            )}

            <div className="mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-[#FF6B00]">
                {product.category}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            <p className="text-base text-neutral-600 leading-relaxed mb-6">
              {product.shortBenefit}
            </p>

            {/* Affiliate CTA button + FTC Disclosure */}
            {safeAffiliateUrl && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleAffiliateClick}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B00]"
                >
                  <span>View live product</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </button>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                  <span>Opens merchant partner in a new tab. Reader-supported commissions help keep our editorial independent.</span>
                </div>
              </div>
            )}
          </div>

          <hr className="border-neutral-200" />

          {/* Why We Recommend It */}
          {product.benefits && product.benefits.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#111111] mb-4">Why we recommend it</h2>
              <ul className="space-y-3">
                {product.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <>
              <hr className="border-neutral-200" />
              <div>
                <h2 className="text-xl font-bold text-[#111111] mb-4">Specifications</h2>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center py-2 border-b border-neutral-100 last:border-0">
                      <span className="text-sm font-semibold text-neutral-500 sm:w-1/3">{key}</span>
                      <span className="text-sm font-medium text-[#111111] sm:w-2/3">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Best For */}
          {product.greatFor && product.greatFor.length > 0 && (
            <>
              <hr className="border-neutral-200" />
              <div>
                <h2 className="text-xl font-bold text-[#111111] mb-4">Best For</h2>
                <ul className="space-y-3">
                  {product.greatFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Setup Considerations */}
          {product.setupConsiderations && product.setupConsiderations.length > 0 && (
            <>
              <hr className="border-neutral-200" />
              <div>
                <h2 className="text-xl font-bold text-[#111111] mb-4">Setup Considerations</h2>
                <ul className="space-y-3">
                  {product.setupConsiderations.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Our Take */}
          {product.verdict && (
            <>
              <hr className="border-neutral-200" />
              <div className="bg-[#111111] text-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                  <h2 className="text-lg font-bold">Our Take</h2>
                </div>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  {product.verdict}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 3. Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-[#E9E9E6]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
                Complementary Gear
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111]">
                Related Setup Accessories
              </h2>
            </div>
            <button
              onClick={() => onNavigate({ page: 'recommendations' })}
              className="text-xs font-semibold text-[#111111] hover:text-[#FF6B00] transition-colors cursor-pointer"
            >
              View all gear →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((relProduct) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

