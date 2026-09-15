import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, BookOpen, ArrowRight, ExternalLink, Shield } from 'lucide-react';
import { Product, Guide, ViewRoute } from '../types';
import { PRODUCTS } from '../data/products';
import { GUIDES } from '../data/guides';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: ViewRoute) => void;
  products?: Product[];
  guides?: Guide[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  products = PRODUCTS,
  guides = GUIDES,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Trigger open via parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  const filteredProducts = normalizedQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.category.toLowerCase().includes(normalizedQuery) ||
          p.shortBenefit.toLowerCase().includes(normalizedQuery) ||
          p.bestFor.toLowerCase().includes(normalizedQuery)
      )
    : products.slice(0, 4);

  const filteredGuides = normalizedQuery
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(normalizedQuery) ||
          g.category.toLowerCase().includes(normalizedQuery) ||
          g.excerpt.toLowerCase().includes(normalizedQuery)
      )
    : guides.slice(0, 3);

  const handleSelectProduct = (slug: string) => {
    onClose();
    onNavigate({ page: 'product-detail', slug });
  };

  const handleSelectGuide = (slug: string) => {
    onClose();
    onNavigate({ page: 'guide-detail', slug });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E9E9E6] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200">
          <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search space-saving accessories, monitor arms, cable guides..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base text-neutral-900 placeholder-neutral-400 bg-transparent border-none focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-6">
          {/* Products Results */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {normalizedQuery ? `Matching Accessories (${filteredProducts.length})` : 'Popular Recommendations'}
              </span>
              <span className="text-[11px] text-neutral-400">Click to read full review</span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all cursor-pointer group"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg shrink-0 bg-neutral-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6B00]">
                          {product.category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 font-medium">
                          {product.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900 truncate group-hover:text-[#FF6B00] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate">{product.shortBenefit}</p>
                    </div>
                    <div className="shrink-0 flex items-center text-xs font-semibold text-neutral-500 group-hover:text-[#FF6B00]">
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-neutral-400">
                {normalizedQuery ? `No accessories found matching "${query}"` : 'Belum ada produk yang tersedia.'}
              </div>
            )}
          </div>

          {/* Guides Results */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                {normalizedQuery ? `Guides & Articles (${filteredGuides.length})` : 'Featured Setup Guides'}
              </span>
            </div>

            {filteredGuides.length > 0 ? (
              <div className="space-y-2">
                {filteredGuides.map((guide) => (
                  <div
                    key={guide.id}
                    onClick={() => handleSelectGuide(guide.slug)}
                    className="flex items-start gap-3.5 p-2.5 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 text-neutral-600 group-hover:text-[#FF6B00]">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                        <span className="font-semibold text-neutral-600">{guide.category}</span>
                        <span>•</span>
                        <span>{guide.readTime}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-900 truncate group-hover:text-[#FF6B00] transition-colors">
                        {guide.title}
                      </h4>
                    </div>
                    <div className="shrink-0 flex items-center text-xs font-semibold text-neutral-400 group-hover:text-[#FF6B00]">
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-neutral-400">
                {normalizedQuery ? `No guides found matching "${query}"` : 'Belum ada artikel panduan.'}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span>TechCheck Editorial Search</span>
          <span className="text-neutral-400">Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
