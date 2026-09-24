import React, { useState, useMemo, useEffect } from 'react';
import { Filter, X, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { analytics } from '../services/analytics';
import { updateSEO, buildBreadcrumbSchema } from '../services/seo';

interface RecommendationsPageProps {
  products: Product[];
  initialCategory?: ProductCategory | 'All';
  onSelectProduct: (slug: string) => void;
}

// Setup upgrade goals as requested: Small Space, Gaming, Productivity, Lighting, Monitor, Accessories
type UpgradeGoal = 'All' | 'Small Space' | 'Gaming' | 'Productivity' | 'Lighting' | 'Monitor' | 'Accessories';

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  products,
  initialCategory = 'All',
  onSelectProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>(initialCategory);
  const [selectedGoal, setSelectedGoal] = useState<UpgradeGoal>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedBadge, setSelectedBadge] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'reviews'>('recommended');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync when initialCategory changes via navigation
  useEffect(() => {
    setSelectedCategory(initialCategory);
    if (initialCategory !== 'All') {
      setSelectedGoal('All');
    }
  }, [initialCategory]);

  useEffect(() => {
    const pageTitle =
      selectedCategory === 'All'
        ? 'Curated Space-Saving Recommendations | TechCheck'
        : `${selectedCategory} Hardware Recommendations | TechCheck`;

    const breadcrumbs = [
      { name: 'Home', path: '' },
      { name: 'Recommendations', path: 'recommendations' },
    ];
    if (selectedCategory !== 'All') {
      breadcrumbs.push({
        name: selectedCategory,
        path: `recommendations?category=${encodeURIComponent(selectedCategory)}`,
      });
    }

    updateSEO({
      title: pageTitle,
      description: `Explore curated ${selectedCategory === 'All' ? 'compact setup gear' : selectedCategory} tested for desk footprints between 80cm and 140cm.`,
      canonicalPath: `recommendations${selectedCategory !== 'All' ? `?category=${encodeURIComponent(selectedCategory)}` : ''}`,
      ogType: 'website',
      jsonLd: buildBreadcrumbSchema(breadcrumbs),
    });

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

  // Handle upgrade goal selection
  const handleSelectGoal = (goal: UpgradeGoal) => {
    setSelectedGoal(goal);
    // Map upgrade goal to category or badge filter
    if (goal === 'All') {
      setSelectedCategory('All');
    } else if (goal === 'Small Space') {
      setSelectedCategory('All');
      // Filter products that emphasize space saving
    } else if (goal === 'Gaming') {
      // Focus on gaming monitors or audio
      setSelectedCategory('All');
    } else if (goal === 'Productivity') {
      setSelectedCategory('Desk Setup');
    } else if (goal === 'Lighting') {
      setSelectedCategory('Lighting');
    } else if (goal === 'Monitor') {
      setSelectedCategory('Desk Setup');
    } else if (goal === 'Accessories') {
      setSelectedCategory('Storage');
    }
  };

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Goal specific mapping
        if (selectedGoal === 'Small Space') {
          const isSpaceSaver =
            product.badge === 'BEST SPACE SAVER' ||
            product.badge === 'BEST FOR SMALL DESKS' ||
            product.shortBenefit?.toLowerCase().includes('space') ||
            product.description?.toLowerCase().includes('compact');
          if (!isSpaceSaver && selectedCategory === 'All') return false;
        } else if (selectedGoal === 'Gaming') {
          const isGaming =
            product.badge === 'BEST GAMING MONITOR' ||
            product.category === 'Audio' ||
            product.name.toLowerCase().includes('gaming') ||
            product.bestFor?.toLowerCase().includes('gaming');
          if (!isGaming && selectedCategory === 'All') return false;
        } else if (selectedGoal === 'Monitor') {
          const isMonitorItem =
            product.category === 'Desk Setup' ||
            product.name.toLowerCase().includes('monitor') ||
            product.name.toLowerCase().includes('arm');
          if (!isMonitorItem) return false;
        }

        if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
        if (minRating > 0 && product.rating < minRating) return false;
        if (selectedBadge !== 'All' && product.badge !== selectedBadge) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchBenefit = product.shortBenefit?.toLowerCase().includes(q);
          const matchCategory = product.category.toLowerCase().includes(q);
          if (!matchName && !matchBenefit && !matchCategory) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.rating - a.rating;
      });
  }, [products, selectedCategory, selectedGoal, minRating, selectedBadge, sortBy, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedGoal('All');
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
        <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300 leading-relaxed transition-colors">
          Practical gaming accessories that save space without making your setup feel crowded. Every product is audited for spatial clearance and build tolerance.
        </p>
      </div>

      {/* "What Should I Upgrade?" Goal Selector */}
      <div className="bg-white dark:bg-[#16171D] p-5 sm:p-6 rounded-2xl border border-[#E9E9E6] dark:border-[#272932] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
              What Should I Upgrade?
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 hidden sm:inline">
            Choose a priority goal to view recommendations
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {(['All', 'Small Space', 'Gaming', 'Productivity', 'Lighting', 'Monitor', 'Accessories'] as UpgradeGoal[]).map(
            (goal) => (
              <button
                key={goal}
                onClick={() => handleSelectGoal(goal)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedGoal === goal
                    ? 'bg-[#111111] dark:bg-[#252832] text-white shadow-xs'
                    : 'bg-neutral-50 dark:bg-[#1E2028] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#272A35] border border-neutral-200/80 dark:border-[#2C2F3A]'
                }`}
              >
                {selectedGoal === goal && <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6B00]" />}
                <span>{goal === 'All' ? 'All Goals' : goal}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-[#E9E9E6] dark:border-[#242630] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => {
                setSelectedCategory(cat as any);
                setSelectedGoal('All');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#111111] dark:bg-[#252832] text-white shadow-xs'
                  : 'bg-white dark:bg-[#16171D] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#20222B] border border-[#E9E9E6] dark:border-[#272932]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#16171D] p-4 sm:p-5 rounded-2xl border border-[#E9E9E6] dark:border-[#272932] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 transition-colors">
        {/* Search within recommendations */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search within curated items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 text-xs bg-[#F7F6F2] dark:bg-[#1F2128] border border-[#E9E9E6] dark:border-[#2C2E38] rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
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
              className="bg-[#F7F6F2] dark:bg-[#1F2128] border border-[#E9E9E6] dark:border-[#2C2E38] text-neutral-800 dark:text-neutral-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none"
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
              className="bg-[#F7F6F2] dark:bg-[#1F2128] border border-[#E9E9E6] dark:border-[#2C2E38] text-neutral-800 dark:text-neutral-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none"
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
              className="bg-[#F7F6F2] dark:bg-[#1F2128] border border-[#E9E9E6] dark:border-[#2C2E38] text-neutral-800 dark:text-neutral-200 text-xs rounded-xl px-2.5 py-2 font-medium focus:outline-none"
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
          {selectedGoal !== 'All' && (
            <span>
              {' '}
              for <strong>{selectedGoal}</strong>
            </span>
          )}
        </div>
        {(selectedCategory !== 'All' ||
          selectedGoal !== 'All' ||
          minRating > 0 ||
          selectedBadge !== 'All' ||
          searchQuery) && (
          <button
            onClick={handleResetFilters}
            className="font-semibold text-[#FF6B00] hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onSelectProduct={onSelectProduct} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-orange-50 dark:bg-[#251E19] rounded-full flex items-center justify-center mx-auto text-[#FF6B00] mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
            No matching accessories found
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Try resetting your category or rating filters to see the full collection.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 px-5 py-2.5 bg-[#111111] dark:bg-[#252832] text-white text-xs font-bold rounded-xl hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
