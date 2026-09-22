import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Product, ViewRoute } from '../types';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct: (slug: string) => void;
  onOpenAffiliateModal: (product: Product) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onNavigate,
}) => {
  const [activeImage, setActiveImage] = useState<string>(product.image);

  React.useEffect(() => {
    setActiveImage(product.image);
  }, [product.image]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500 overflow-x-auto whitespace-nowrap pb-1">
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
          <div className="relative aspect-4/3 sm:aspect-16/11 bg-white rounded-2xl border border-[#E9E9E6] overflow-hidden shadow-xs">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
          </div>

          {/* Thumbnail Gallery */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    activeImage === img
                      ? 'border-[#FF6B00] ring-2 ring-orange-200'
                      : 'border-[#E9E9E6] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} angle ${idx + 1}`} className="w-full h-full object-cover" />
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
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: All Details */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#111111] text-white">
                {product.badge}
              </span>
            </div>
            
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

            {product.affiliateUrl && (
              <button
                onClick={() => window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer')}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                View live product
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </button>
            )}
          </div>

          <hr className="border-neutral-200" />

          {/* Why We Recommend It */}
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Why we recommend it</h2>
            <ul className="space-y-3">
              {product.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-neutral-200" />

          {/* Specifications */}
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

          <hr className="border-neutral-200" />

          {/* Best For */}
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Best For</h2>
            <ul className="space-y-3">
              {product.greatFor.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-neutral-200" />

          {/* Setup Considerations */}
          <div>
            <h2 className="text-xl font-bold text-[#111111] mb-4">Setup Considerations</h2>
            <ul className="space-y-3">
              {product.setupConsiderations.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mt-1.5 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <hr className="border-neutral-200" />

          {/* Our Take */}
          <div className="bg-[#111111] text-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-3">Our Take</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {product.verdict}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
