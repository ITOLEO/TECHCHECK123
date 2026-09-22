import React from 'react';
import { ExternalLink, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface AffiliateModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AffiliateModal: React.FC<AffiliateModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;

  const handleProceed = () => {
    // Open partner affiliate store in new tab cleanly
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#16171D] rounded-2xl shadow-2xl border border-[#E9E9E6] dark:border-[#272932] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-[#252832]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Partner Store Redirect
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#20222B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="p-6 text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-neutral-100 dark:bg-[#1F2128] border border-neutral-200 dark:border-[#2C2E38]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
              {product.category}
            </span>
            <h3 className="text-lg font-bold text-[#111111] dark:text-white leading-tight">
              {product.name}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
              You are about to view the live product listing, detailed dimensions, and current stock availability through our verified merchant partner.
            </p>
          </div>

          <div className="bg-neutral-50 dark:bg-[#1C1E26] rounded-xl p-3 text-left border border-neutral-200 dark:border-[#2A2C37] space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
            <div className="flex items-center gap-2 text-neutral-800 dark:text-neutral-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>TechCheck Direct Affiliate Referral</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal pl-6">
              TechCheck may earn a small referral commission if you choose to make a purchase, at no extra cost to you.
            </p>
          </div>

          {/* Action Button - STRICTLY "View Live Product" */}
          <div className="pt-2 space-y-2">
            <button
              id="modal-view-live-product-btn"
              onClick={handleProceed}
              className="w-full py-3.5 px-5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Live Product</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            >
              Return to Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
