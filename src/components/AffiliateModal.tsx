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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E9E9E6] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Partner Store Redirect
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Snapshot */}
        <div className="p-6 text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
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
            <h3 className="text-lg font-bold text-[#111111] leading-tight">
              {product.name}
            </h3>
            <p className="text-xs text-neutral-600 mt-2 max-w-sm mx-auto leading-relaxed">
              You are about to view the live product listing, detailed dimensions, and current stock availability through our verified merchant partner.
            </p>
          </div>

          <div className="bg-neutral-50 rounded-xl p-3 text-left border border-neutral-200 space-y-2 text-xs text-neutral-600">
            <div className="flex items-center gap-2 text-neutral-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>TechCheck Direct Affiliate Referral</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-normal pl-6">
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
              className="w-full py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              Return to Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
