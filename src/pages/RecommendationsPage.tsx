import React, { useState, useMemo, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { analytics } from '../services/analytics';
import { updateSEO, buildBreadcrumbSchema } from '../services/seo';
import { useVisualEditor } from '../contexts/VisualEditorContext';
import { EditableElement } from '../components/visual-editor/EditableElement';

interface RecommendationsPageProps {
  products: Product[];
  initialCategory?: ProductCategory | 'All';
  onSelectProduct: (slug: string) => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  products,
  initialCategory = 'All',
  onSelectProduct,
}) => {
  const visualEditor = useVisualEditor();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>(initialCategory);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'reviews'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setMinRating(0);
      setSelectedBadge('All');
      setSearchQuery('');
    }
  }, [initialCategory]);

  useEffect(() => {
    const isCategoryFiltered = selectedCategory !== 'All';
    const title = isCategoryFiltered
      ? `${selectedCategory} Recommendations | TechCheck Space-Saving Hardware`
      : 'Hardware Recommendations | Curated Compact Setup Catalog';
    const description = isCategoryFiltered
      ? `Verified compact ${selectedCategory} for desks 80cm - 140cm. Audited for cable footprint, physical dimensions, and clearance.`
      : 'Browse space-saving gaming and productivity accessories. Audited for compact workspaces.';

    updateSEO({
      title,
      description,
      canonicalPath: isCategoryFiltered ? `recommendations?category=${encodeURIComponent(selectedCategory)}` : 'recommendations',
      ogType: 'website',
      jsonLd: buildBreadcrumbSchema([
        { name: 'Home', path: '' },
        { name: 'Recommendations', path: 'recommendations' },
        ...(isCategoryFiltered ? [{ name: selectedCategory, path: `recommendations?category=${encodeURIComponent(selectedCategory)}` }] : []),
      ]),
    });

    analytics.track('page_view', { page: 'recommendations', category: selectedCategory });

    return () => {
      document.title = 'TechCheck — Small Space. Serious Setup.';
    };
  }, [selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    // Default categories
    [
      'Desk Setup',
      'Cable Management',
      'Audio',
      'Storage',
      'Lighting',
      'Ergonomics',
      'Monitors',
      'Gadgets',
      'Adapter',
      'Mouse',
      'Network',
      'Accessories',
    ].forEach((c) => set.add(c));

    products.forEach((p) => {
      if (p.category && p.category.trim()) set.add(p.category.trim());
    });
    if (initialCategory && initialCategory !== 'All' && !set.has(initialCategory)) {
      set.add(initialCategory);
    }
    return ['All', ...Array.from(set)];
  }, [products, initialCategory]);

  const badges = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.badge) set.add(p.badge);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'All') {
          const normSel = selectedCategory.toLowerCase().replace(/[\s_]+/g, '-');
          const normCat = (p.category || '').toLowerCase().replace(/[\s_]+/g, '-');
          const exactMatch = p.category && p.category.toLowerCase() === selectedCategory.toLowerCase();
          if (!exactMatch && normCat !== normSel) {
            return false;
          }
        }

        if (minRating > 0 && p.rating < minRating) {
          return false;
        }

        if (selectedBadge !== 'All' && p.badge !== selectedBadge) {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchBenefit = p.shortBenefit.toLowerCase().includes(q);
          const matchSpec = p.specifications
            ? Object.values(p.specifications).some((v) => typeof v === 'string' && v.toLowerCase().includes(q))
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
  }, [products, selectedCategory, minRating, selectedBadge, sortBy, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setMinRating(0);
    setSelectedBadge('All');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
          Curated Product Discovery
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] dark:text-white tracking-tight transition-colors">
          Upgrade Your Setup.
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed transition-colors">
          Practical gaming accessories that save space without making your setup feel crowded. Every product is audited for spatial clearance and build tolerance.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-[#E9E9E6] dark:border-[#272932] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const active =
              selectedCategory.toLowerCase() === cat.toLowerCase() ||
              selectedCategory.toLowerCase().replace(/[\s_]+/g, '-') === cat.toLowerCase().replace(/[\s_]+/g, '-');
            return (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  setSelectedCategory(cat as any);
                  const hash = cat !== 'All' ? `#/recommendations?category=${encodeURIComponent(cat)}` : '#/recommendations';
                  try {
                    window.history.replaceState(null, '', hash);
                  } catch {
                    // ignore
                  }
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-xs'
                    : 'bg-white dark:bg-[#16171C] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1D1F27] border border-neutral-200/80 dark:border-neutral-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar in Rounded-3xl Container */}
      <div className="bg-white dark:bg-[#16171C] p-5 rounded-3xl border border-[#E9E9E6] dark:border-[#272932] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors">
        {/* Search within recommendations */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within curated items..."
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

        {/* Filters & Sorting */}
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
              <option value={4.8}>★ 4.8 & Above</option>
              <option value={4.7}>★ 4.7 & Above</option>
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
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <div>
          Showing <strong>{filteredProducts.length}</strong> space-saving accessories
          {selectedCategory !== 'All' && (
            <span>
              {' '}
              in <strong>{selectedCategory}</strong>
            </span>
          )}
        </div>
        {(selectedCategory !== 'All' ||
          minRating > 0 ||
          selectedBadge !== 'All' ||
          searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="font-bold text-[#FF6B00] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Product Grid with Rounded-3xl ProductCard */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <EditableElement
              key={product.id}
              isEditMode={visualEditor.isVisualEditMode}
              label={`Edit: ${product.name}`}
              onEdit={() =>
                visualEditor.openEditor({
                  type: 'product',
                  title: `Edit: ${product.name}`,
                  data: product,
                })
              }
            >
              <ProductCard
                product={product}
                onSelectProduct={onSelectProduct}
                onSelectCategory={(cat) => setSelectedCategory(cat)}
              />
            </EditableElement>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-950/40 rounded-2xl flex items-center justify-center mx-auto text-[#FF6B00] mb-4 border border-orange-200/80 dark:border-orange-800">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] dark:text-neutral-100">
            No matching accessories found
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Try resetting your category or rating filters to see the full collection.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 px-6 py-3 bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-bold rounded-2xl hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] dark:hover:text-white transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
