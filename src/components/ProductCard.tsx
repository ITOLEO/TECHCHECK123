import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Product, ProductBadge } from '../types';
import { SafeImage } from './SafeImage';
import { analytics } from '../services/analytics';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (slug: string) => void;
}

const BADGE_STYLES: Record<ProductBadge, { bg: string; text: string; border: string }> = {
  'BEST GAMING MONITOR': { bg: 'bg-[#111111]', text: 'text-white', border: 'border-[#111111]' },
  'CREATOR FAVORITE': { bg: 'bg-[#111111]', text: 'text-white', border: 'border-[#111111]' },
  'TRAVEL ESSENTIAL': { bg: 'bg-[#111111]', text: 'text-white', border: 'border-[#111111]' },
  'PORTABLE & VERSATILE': { bg: 'bg-[#111111]', text: 'text-white', border: 'border-[#111111]' },
  'BEST SPACE SAVER': { bg: 'bg-[#111111]', text: 'text-white', border: 'border-[#111111]' },
  'BEST VALUE': { bg: 'bg-[#111111]', text: 'text-white', border: 'border-[#111111]' },
  "EDITOR'S PICK": { bg: 'bg-[#111111]', text: 'text-white', border: 'border-[#111111]' },
  'BEST FOR SMALL DESKS': { bg: 'bg-[#111111]', text: 'text-white', border: 'border-[#111111]' },
};

function formatAffiliateUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const badgeStyle = BADGE_STYLES[product.badge] || BADGE_STYLES['BEST SPACE SAVER'];
  const safeAffiliateUrl = formatAffiliateUrl(product.affiliateUrl);

  const handleCardClick = () => {
    analytics.track('product_view', {
      productId: product.id,
      productName: product.name,
      category: product.category,
    });
    onSelectProduct(product.slug);
  };

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!safeAffiliateUrl) return;

    analytics.track('affiliate_click', {
      productId: product.id,
      productName: product.name,
      category: product.category,
      affiliateUrl: safeAffiliateUrl,
    });

    window.open(safeAffiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <article
      id={`product-card-${product.slug}`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View review for ${product.name}`}
      className="group flex flex-col bg-white rounded-2xl border border-[#E9E9E6] hover:border-[#FF6B00] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/3 sm:aspect-16/10 bg-neutral-100 overflow-hidden">
        <SafeImage
          src={product.image}
          alt={product.name}
          fallbackText={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
        {/* Floating Badge */}
        {product.badge && (
          <div className="absolute top-4 left-4 z-10">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs ${badgeStyle.bg} ${badgeStyle.text}`}
            >
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              {product.category}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-xl font-bold text-[#111111] leading-snug group-hover:text-[#FF6B00] transition-colors mb-3">
            {product.name}
          </h3>

          {/* Short Benefit Statement */}
          <p className="text-sm text-neutral-600 leading-relaxed mb-6 line-clamp-3">
            {product.shortBenefit}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-row items-center justify-start gap-2.5 pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="flex-1 px-3 py-2.5 text-[13px] whitespace-nowrap font-semibold text-[#111111] bg-white border border-[#E9E9E6] group-hover:border-[#FF6B00] group-hover:text-[#FF6B00] rounded-lg transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
          >
            <span>Read Review</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 transform group-hover:translate-x-1 transition-transform" />
          </button>
          {safeAffiliateUrl && (
            <button
              type="button"
              onClick={handleAffiliateClick}
              title={`View ${product.name} on partner retailer`}
              aria-label={`View ${product.name} live on merchant store (opens new window)`}
              className="flex-1 px-3 py-2.5 text-[13px] whitespace-nowrap font-semibold text-white bg-[#111111] hover:bg-black rounded-lg transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
            >
              <span>View Live</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
