import React from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { SafeImage } from './SafeImage';
import { analytics } from '../services/analytics';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (slug: string) => void;
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

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
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
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      id={`product-card-${product.slug}`}
      className="group flex flex-col h-full bg-white dark:bg-[#16171C] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* Product Image Stage - Fixed uniform container */}
      <div
        onClick={handleCardClick}
        className="relative h-48 sm:h-52 w-full bg-neutral-100 dark:bg-[#1C1E25] overflow-hidden cursor-pointer flex items-center justify-center p-4 shrink-0"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleCardClick();
        }}
        aria-label={`View specs and review for ${product.name}`}
      >
        <SafeImage
          src={product.image}
          alt={product.name}
          fallbackText={product.name}
          className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
      </div>

      {/* Card Content - Uniform vertical alignment */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="flex-1 flex flex-col">
          {/* Category & Badge */}
          <div className="flex items-center justify-between gap-2 mb-2 min-h-[1.25rem]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B00]">
              {product.category}
            </span>
            {product.badge ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-[#252832] text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
                {product.badge}
              </span>
            ) : null}
          </div>

          {/* Product Name */}
          <h3 className="text-base sm:text-lg font-bold text-[#111111] dark:text-neutral-100 leading-snug group-hover:text-[#FF6B00] transition-colors mb-2 line-clamp-2 min-h-[2.8rem] flex items-center">
            <a
              href={`#/recommendations/${product.slug}`}
              onClick={(e) => {
                e.preventDefault();
                handleCardClick();
              }}
              className="focus-visible:outline-none focus-visible:underline hover:underline text-inherit"
            >
              {product.name}
            </a>
          </h3>

          {/* Short Benefit Statement */}
          <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4 line-clamp-2 min-h-[2.5rem]">
            {product.shortBenefit}
          </p>
        </div>

        {/* Action Buttons - Centered button group with synchronized dimensions */}
        <div className="mt-auto flex flex-row items-center justify-center gap-2.5 pt-3.5 border-t border-neutral-100 dark:border-[#23252E] w-full">
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleCardClick}
            className="flex-1 max-w-[150px] sm:max-w-[160px] h-10 px-3 text-xs sm:text-[13px] font-semibold text-[#111111] dark:text-neutral-200 bg-neutral-50 dark:bg-[#1D1F27] hover:bg-neutral-100 dark:hover:bg-[#262833] border border-[#E9E9E6] dark:border-[#2C2F3A] rounded-xl transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer whitespace-nowrap"
          >
            <span>Review & Specs</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0 transform group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
          {safeAffiliateUrl && (
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={safeAffiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleAffiliateClick}
              title={`View ${product.name} on partner store`}
              aria-label={`View ${product.name} live on merchant store (opens new window)`}
              className="flex-1 max-w-[150px] sm:max-w-[160px] h-10 px-3 text-xs sm:text-[13px] font-semibold text-white bg-[#111111] dark:bg-[#272A35] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] border border-transparent rounded-xl transition-all flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer whitespace-nowrap"
            >
              <span>View Live</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.article>
  );
};
