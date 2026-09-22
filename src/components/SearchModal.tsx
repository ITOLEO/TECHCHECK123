import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Product, Guide, ViewRoute } from '../types';
import { PRODUCTS } from '../data/products';
import { GUIDES } from '../data/guides';
import { SafeImage } from './SafeImage';
import { analytics } from '../services/analytics';

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
          (p.shortBenefit && p.shortBenefit.toLowerCase().includes(normalizedQuery)) ||
          (p.bestFor && p.bestFor.toLowerCase().includes(normalizedQuery)) ||
          (p.description && p.description.toLowerCase().includes(normalizedQuery))
      )
    : products.slice(0, 4);

  const filteredGuides = normalizedQuery
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(normalizedQuery) ||
          g.category.toLowerCase().includes(normalizedQuery) ||
          (g.excerpt && g.excerpt.toLowerCase().includes(normalizedQuery))
      )
    : guides.slice(0, 3);

  // Track search on enter or when user types
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalizedQuery) {
      analytics.track('search', {
        query: normalizedQuery,
        resultsCount: filteredProducts.length + filteredGuides.length,
      });
    }
  };

  const handleSelectProduct = (slug: string) => {
    onClose();
    onNavigate({ page: 'product-detail', slug });
  };

  const handleSelectGuide = (slug: string) => {
    onClose();
    onNavigate({ page: 'guide-detail', slug });
  };

  const hasAnyResults = filteredProducts.length > 0 || filteredGuides.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E9E9E6] overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search site products and guides"
      >
        {/* Search Header Form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center px-4 py-3.5 border-b border-neutral-200">
          <Search className="w-5 h-5 text-neutral-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search space-saving accessories, monitor arms, cable guides..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-base text-neutral-900 placeholder-neutral-400 bg-transparent border-none focus:outline-none"
            aria-label="Search query"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 mr-2 cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
          >
            ESC
          </button>
        </form>

        {/* Results Body */}
        <div className="overflow-y-auto p-4 space-y-6 flex-1">
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
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectProduct(product.slug);
                    }}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-neutral-100">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        fallbackText={product.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6B00]">
                          {product.category}
                        </span>
                        {product.badge && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 font-medium">
                            {product.badge}
                          </span>
                        )}
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
            ) : null}
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
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectGuide(guide.slug);
                    }}
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
            ) : null}
          </div>

          {/* Empty State when no items found */}
          {normalizedQuery && !hasAnyResults && (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto text-[#FF6B00]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                No matching results found
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                We couldn't find any products or guides matching &ldquo;{query}&rdquo;. Try checking for typos or searching for category keywords like &ldquo;monitor&rdquo;, &ldquo;cable&rdquo;, or &ldquo;audio&rdquo;.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  Clear search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate({ page: 'categories' });
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#111111] hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                >
                  Browse categories
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>TechCheck Editorial Search</span>
          </span>
          <span className="text-neutral-400">Click outside or press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};

