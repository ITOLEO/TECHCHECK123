import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, FolderTree, ArrowRight, Grid, AlertCircle, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { CategoryInfo, Product, ViewRoute } from '../types';
import { findCategoryBySlug, categoryToSlug } from '../utils/slug';
import { updateSEO, buildBreadcrumbSchema } from '../services/seo';
import { analytics } from '../services/analytics';
import { ProductCard } from '../components/ProductCard';

interface CategoryDetailPageProps {
  slug: string;
  categories: CategoryInfo[];
  products: Product[];
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct: (slug: string) => void;
}

export const CategoryDetailPage: React.FC<CategoryDetailPageProps> = ({
  slug,
  categories,
  products = [],
  onNavigate,
  onSelectProduct,
}) => {
  const category = findCategoryBySlug(categories, slug);

  const [minRating, setMinRating] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'reviews'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');

  // Reset internal sub-filters when category slug changes
  useEffect(() => {
    setMinRating(0);
    setSelectedBadge('All');
    setSearchQuery('');
  }, [slug]);

  // Handle SEO & Analytics
  useEffect(() => {
    if (category) {
      const cleanSlug = categoryToSlug(category.slug || category.name);
      const titleStr = `${category.name} Recommendations | TechCheck Space-Saving Hardware`;
      const descStr = category.description
        ? `${category.description} Verified compact ${category.name} gear tested for desks 80cm–140cm.`
        : `Discover top-rated ${category.name} accessories, ergonomic elevation, and compact setup gear on TechCheck.`;

      updateSEO({
        title: titleStr,
        description: descStr,
        canonicalPath: `categories/${cleanSlug}`,
        ogType: 'website',
        robots: 'index, follow, max-image-preview:large',
        jsonLd: buildBreadcrumbSchema([
          { name: 'Home', path: '' },
          { name: 'Categories', path: 'categories' },
          { name: category.name, path: `categories/${cleanSlug}` },
        ]),
      });

      analytics.track('category_view', {
        categoryName: category.name,
        categorySlug: cleanSlug,
      });
    } else {
      updateSEO({
        title: 'Category Not Found - TechCheck',
        description: 'The requested category could not be found on TechCheck.',
        canonicalPath: `categories/${slug}`,
        ogType: 'website',
        robots: 'noindex, follow',
      });
    }

    window.scrollTo(0, 0);

    return () => {
      document.title = 'TechCheck — Small Space. Serious Setup.';
    };
  }, [category, slug]);

  // Compute category list for tabs
  const allCategoryTabs = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (c.name && c.name.trim()) set.add(c.name.trim());
    });
    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    return ['All', ...Array.from(set)];
  }, [categories, products]);

  // Compute unique badges for filter dropdown
  const badges = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.badge) set.add(p.badge);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter products matching this category and active sub-filters
  const filteredProducts = useMemo(() => {
    if (!category) return [];

    const targetCatSlug = categoryToSlug(category.slug || category.name);

    return products
      .filter((p) => {
        const pCatSlug = categoryToSlug(p.category);
        const matchesCategory =
          pCatSlug === targetCatSlug || p.category.toLowerCase() === category.name.toLowerCase();

        if (!matchesCategory) return false;

        if (minRating > 0 && p.rating < minRating) return false;

        if (selectedBadge !== 'All' && p.badge !== selectedBadge) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBenefit = p.shortBenefit.toLowerCase().includes(q);
          const matchSpec = p.specifications
            ? Object.values(p.specifications).some(
                (v) => typeof v === 'string' && v.toLowerCase().includes(q)
              )
            : false;
          if (!matchName && !matchBenefit && !matchSpec) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        return b.rating - a.rating;
      });
  }, [category, products, minRating, selectedBadge, searchQuery, sortBy]);

  // 404 State
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-10 shadow-xs space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center mx-auto text-[#FF6B00]">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">404 Not Found</span>
            <h1 className="text-2xl font-extrabold text-[#111111] dark:text-white">
              Category Not Found
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              We couldn&apos;t find a category matching <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-xs text-[#FF6B00] font-mono">{slug}</code>. Explore our taxonomy or view all recommendations.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => onNavigate({ page: 'categories' })}
              className="px-5 py-2.5 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FolderTree className="w-4 h-4" />
              All Categories
            </button>
            <button
              onClick={() => onNavigate({ page: 'recommendations' })}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[#111111] dark:text-neutral-200 text-xs font-bold hover:border-[#FF6B00] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              All Products
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cleanCategorySlug = categoryToSlug(category.slug || category.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
        <button
          onClick={() => onNavigate({ page: 'home' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Home
        </button>
        <span className="mx-2 text-neutral-400 dark:text-neutral-600">/</span>
        <button
          onClick={() => onNavigate({ page: 'categories' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Categories
        </button>
        <span className="mx-2 text-neutral-400 dark:text-neutral-600">/</span>
        <span className="text-[#111111] dark:text-neutral-200 font-bold truncate max-w-[200px]">
          {category.name}
        </span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            Setup Category
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">•</span>
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'Curated Item' : 'Curated Items'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] dark:text-white tracking-tight">
          {category.name} Recommendations
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed pt-1">
          {category.description ||
            `Curated space-saving ${category.name.toLowerCase()} hardware and accessories audited for compact desk footprints (80cm – 140cm).`}
        </p>
      </div>

      {/* Category Pills Navigation Bar */}
      <div className="border-b border-[#E9E9E6] dark:border-[#272932] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {allCategoryTabs.map((cat) => {
            const isAll = cat === 'All';
            const catSlug = isAll ? '' : categoryToSlug(cat);
            const active = !isAll && catSlug === cleanCategorySlug;

            return (
              <button
                key={cat}
                onClick={() => {
                  if (isAll) {
                    onNavigate({ page: 'recommendations' });
                  } else {
                    onNavigate({ page: 'category-detail', slug: catSlug });
                  }
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-xs ring-2 ring-[#FF6B00]/50'
                    : 'bg-white dark:bg-[#16171C] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1D1F27] border border-neutral-200/80 dark:border-neutral-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#16171C] p-5 rounded-3xl border border-[#E9E9E6] dark:border-[#272932] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search within ${category.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-xs bg-neutral-100/90 dark:bg-[#1D1F27] border border-neutral-200/90 dark:border-neutral-800 rounded-2xl focus:outline-none focus:border-[#FF6B00] text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sub-Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-500 dark:text-neutral-400">Badge:</span>
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="bg-neutral-100 dark:bg-[#1D1F27] border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs rounded-2xl px-3 py-2 font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              {badges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-500 dark:text-neutral-400">Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-neutral-100 dark:bg-[#1D1F27] border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs rounded-2xl px-3 py-2 font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>4.5+ ★</option>
              <option value={4.8}>4.8+ ★</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
            <span className="font-semibold text-neutral-500 dark:text-neutral-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-neutral-100 dark:bg-[#1D1F27] border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs rounded-2xl px-3 py-2 font-medium focus:outline-none focus:border-[#FF6B00]"
            >
              <option value="recommended">Most Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center mx-auto text-[#FF6B00]">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] dark:text-neutral-100">
            No items matched your filter in {category.name}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Try resetting your search query or rating filter to view all curated {category.name.toLowerCase()} accessories.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setMinRating(0);
                setSelectedBadge('All');
              }}
              className="px-5 py-2.5 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={() => onNavigate({ page: 'recommendations' })}
              className="px-5 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              All Recommendations
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

