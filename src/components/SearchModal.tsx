import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, ArrowRight, Sparkles, Folder, Layers } from 'lucide-react';
import { Product, CategoryInfo, Guide, ViewRoute } from '../types';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { GUIDES } from '../data/guides';
import { SafeImage } from './SafeImage';
import { analytics } from '../services/analytics';
import { categoryToSlug } from '../utils/slug';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: ViewRoute) => void;
  products?: Product[];
  categories?: CategoryInfo[];
  guides?: Guide[];
  initialQuery?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  products = PRODUCTS,
  categories = CATEGORIES,
  guides = GUIDES,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // 1. PRODUCTS GROUP
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

  // 2. CATEGORIES GROUP
  const filteredCategories = normalizedQuery
    ? categories.filter(
        (c) =>
          c.name.toLowerCase().includes(normalizedQuery) ||
          (c.description && c.description.toLowerCase().includes(normalizedQuery)) ||
          (c.slug && c.slug.toLowerCase().includes(normalizedQuery))
      )
    : [];

  // 3. GUIDES / ARTICLES GROUP
  const filteredGuides = normalizedQuery
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(normalizedQuery) ||
          g.category.toLowerCase().includes(normalizedQuery) ||
          (g.excerpt && g.excerpt.toLowerCase().includes(normalizedQuery))
      )
    : guides.slice(0, 3);

  const hasAnyResults =
    filteredProducts.length > 0 || filteredCategories.length > 0 || filteredGuides.length > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (normalizedQuery) {
      analytics.track('search', {
        query: normalizedQuery,
        productsCount: filteredProducts.length,
        categoriesCount: filteredCategories.length,
        guidesCount: filteredGuides.length,
      });
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleSelectProduct = (slug: string) => {
    onClose();
    onNavigate({ page: 'product-detail', slug });
  };

  const handleSelectCategory = (name: string) => {
    onClose();
    onNavigate({ page: 'category-detail', slug: categoryToSlug(name) });
  };

  const handleSelectGuide = (slug: string) => {
    onClose();
    onNavigate({ page: 'guide-detail', slug });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Search products, categories, and guides"
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors"
        >
          <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, categories, or guides..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 bg-transparent border-none focus:outline-none"
            aria-label="Search products, categories, or guides"
          />

          {/* Clear button when query exists */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 mr-2 cursor-pointer transition-colors"
              aria-label="Clear search input"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            ESC
          </button>
        </form>

        {/* Results Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* GROUP 1: PRODUCTS */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>PRODUCTS ({filteredProducts.length})</span>
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Click for review & specs
                </span>
              </div>

              <div className="space-y-2">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectProduct(product.slug)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectProduct(product.slug);
                    }}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-900 p-1 flex items-center justify-center">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        fallbackText={product.name}
                        className="max-h-full max-w-full w-auto h-auto object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6B00]">
                          {product.category}
                        </span>
                        {product.badge && (
                          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider">
                            {product.badge}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#FF6B00] transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {product.shortBenefit}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 group-hover:text-[#FF6B00]">
                      <span className="hidden sm:inline">View</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GROUP 2: CATEGORIES */}
          {filteredCategories.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>CATEGORIES ({filteredCategories.length})</span>
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Browse category items
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.name)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 hover:border-[#FF6B00] transition-all cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectCategory(cat.name);
                    }}
                  >
                    <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800">
                      <SafeImage
                        src={cat.image}
                        alt={cat.name}
                        fallbackText={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#FF6B00] transition-colors truncate">
                        {cat.name}
                      </h4>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        {cat.productCount ? `${cat.productCount} products` : 'Curated gear'}
                      </p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FF6B00] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GROUP 3: GUIDES / ARTICLES */}
          {filteredGuides.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 pb-1 border-b border-zinc-100 dark:border-zinc-850">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>GUIDES / ARTICLES ({filteredGuides.length})</span>
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Read setup blueprints
                </span>
              </div>

              <div className="space-y-2">
                {filteredGuides.map((guide) => (
                  <div
                    key={guide.id}
                    onClick={() => handleSelectGuide(guide.slug)}
                    className="flex items-start gap-3.5 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSelectGuide(guide.slug);
                    }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0 text-zinc-600 dark:text-zinc-400 group-hover:text-[#FF6B00] group-hover:bg-orange-50 dark:group-hover:bg-orange-950/40 transition-colors">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 mb-0.5">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {guide.category}
                        </span>
                        <span>·</span>
                        <span>{guide.readTime}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-[#FF6B00] transition-colors">
                        {guide.title}
                      </h4>
                      {guide.excerpt && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {guide.excerpt}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center text-xs font-semibold text-zinc-400 dark:text-zinc-500 group-hover:text-[#FF6B00]">
                      <span className="hidden sm:inline">Read</span>
                      <ArrowRight className="w-3.5 h-3.5 sm:ml-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {normalizedQuery && !hasAnyResults && (
            <div className="text-center py-10 px-4 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center mx-auto text-[#FF6B00]">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  No results found
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Try another keyword or browse our categories.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate({ page: 'categories' });
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-zinc-950 dark:bg-white dark:text-zinc-950 hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] dark:hover:text-white rounded-2xl transition-colors cursor-pointer"
                >
                  Browse Categories
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate({ page: 'recommendations' });
                  }}
                  className="px-5 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-850 rounded-2xl transition-colors cursor-pointer"
                >
                  View Recommendations
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 transition-colors">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>TechCheck Quick Search</span>
          </span>
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Press ESC or click outside to dismiss
          </span>
        </div>
      </div>
    </div>
  );
};
