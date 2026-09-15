import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product, ProductBadge } from '../types';

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

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const badgeStyle = BADGE_STYLES[product.badge] || BADGE_STYLES['BEST SPACE SAVER'];

  return (
    <div
      id={`product-card-${product.slug}`}
      onClick={() => onSelectProduct(product.slug)}
      className="group flex flex-col bg-white rounded-2xl border border-[#E9E9E6] hover:border-[#FF6B00] shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-4/3 sm:aspect-16/10 bg-neutral-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
          loading="lazy"
        />
        {/* Floating Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs ${badgeStyle.bg} ${badgeStyle.text}`}
          >
            {product.badge}
          </span>
        </div>
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
          <p className="text-sm text-neutral-600 leading-relaxed mb-6">
            {product.shortBenefit}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-auto flex items-center justify-start">
          <button className="px-5 py-2.5 text-sm font-semibold text-[#111111] bg-white border border-[#E9E9E6] group-hover:border-[#FF6B00] group-hover:text-[#FF6B00] rounded-lg transition-all flex items-center gap-2">
            Read Our Review
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
