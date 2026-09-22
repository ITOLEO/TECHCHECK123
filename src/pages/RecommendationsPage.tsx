import React, { useState, useMemo, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { analytics } from '../services/analytics';

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
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>(initialCategory);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'reviews'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync when initialCategory changes via navigation
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    document.title = selectedCategory === 'All'
      ? 'Curated Space-Saving Recommendations | TechCheck'
      : `${selectedCategory} Hardware Recommendations | TechCheck`;
    analytics.track('category_view', { category: selectedCategory });
    return () => {
      document.title = 'TechCheck — Small Space. Serious Setup.';
    };
  }, [selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);


  const badges = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.badge) set.add(p.badge);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
        if (minRating > 0 && product.rating < minRating) return false;
        if (selectedBadge !== 'All' && product.badge !== selectedBadge) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchBenefit = product.shortBenefit.toLowerCase().includes(q);
          const matchCategory = product.category.toLowerCase().includes(q);
          if (!matchName && !matchBenefit && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        // Default recommended: featured first, then rating
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
  }, [products, selectedCategory, minRating, selectedBadge, sortBy, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
          Curated Product Discovery
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
          Upgrade Your Setup.
        </h1>
        <p className="mt-3 text-base text-neutral-600 leading-relaxed">
          Practical gaming accessories that save space without making your setup feel crowded. Every product is audited for spatial clearance and build tolerance.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-[#E9E9E6] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-[#E9E9E6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E9E9E6] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search within recommendations */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within curated items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-800 placeholder-neutral-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Badge Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span className="font-semibold text-neutral-500">Badge:</span>
            <select
              value={selectedBadge}
              onChange={(e) => setSelectedBadge(e.target.value)}
              className="bg-[#F7F6F2] border border-[#E9E9E6] text-neutral-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none"
            >
              {badges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span className="font-semibold text-neutral-500">Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="bg-[#F7F6F2] border border-[#E9E9E6] text-neutral-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value={0}>All Ratings</option>
              <option value={4.8}>★ 4.8 & Above</option>
              <option value={4.7}>★ 4.7 & Above</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span className="font-semibold text-neutral-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#F7F6F2] border border-[#E9E9E6] text-neutral-800 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count & Reset */}
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <div>
          Showing <strong>{filteredProducts.length}</strong> space-saving accessories
          {selectedCategory !== 'All' && <span> in <strong>{selectedCategory}</strong></span>}
        </div>
        {(selectedCategory !== 'All' || minRating > 0 || selectedBadge !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setMinRating(0);
              setSelectedBadge('All');
              setSearchQuery('');
            }}
            className="font-semibold text-[#FF6B00] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Product Grid - STRICTLY NO PRICES */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E9E9E6] p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#FF6B00] mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800">No matching accessories found</h3>
          <p className="text-xs text-neutral-500 mt-2">
            Try resetting your category or rating filters to see the full collection.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setMinRating(0);
              setSelectedBadge('All');
              setSearchQuery('');
            }}
            className="mt-6 px-5 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-xl hover:bg-[#FF6B00] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
