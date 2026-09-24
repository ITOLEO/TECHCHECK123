import React, { useEffect } from 'react';
import { ArrowUpRight, FolderTree } from 'lucide-react';
import { CategoryInfo, ViewRoute, ProductCategory, Product } from '../types';
import { SafeImage } from '../components/SafeImage';
import { analytics } from '../services/analytics';
import { updateSEO, buildBreadcrumbSchema } from '../services/seo';

interface CategoriesPageProps {
  categories: CategoryInfo[];
  products?: Product[];
  onNavigate: (route: ViewRoute) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, products = [], onNavigate }) => {
  useEffect(() => {
    updateSEO({
      title: 'Hardware Categories | TechCheck Space-Saving Taxonomy',
      description: 'Explore curated workspace categories organized by functional challenge: Monitor Arms, Cable Trays, Screenbars, and Vertical Storage.',
      canonicalPath: 'categories',
      ogType: 'website',
      jsonLd: buildBreadcrumbSchema([
        { name: 'Home', path: '' },
        { name: 'Categories', path: 'categories' },
      ]),
    });
    analytics.track('category_view', { route: 'categories' });
    return () => {
      document.title = 'TechCheck — Small Space. Serious Setup.';
    };
  }, []);

  const handleSelectCategory = (name: ProductCategory) => {
    analytics.track('category_view', { category: name });
    onNavigate({ page: 'recommendations', categoryFilter: name });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to get real product count
  const getCategoryCount = (cat: CategoryInfo) => {
    if (products && products.length > 0) {
      const realCount = products.filter((p) => p.category === cat.name).length;
      if (realCount > 0) return realCount;
    }
    return cat.productCount || 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
          Setup Taxonomy
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] dark:text-white tracking-tight transition-colors">
          Product Categories
        </h1>
        <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300 leading-relaxed transition-colors">
          Browse space-saving hardware organized by functional workspace challenge. Every category is curated for compact setups between 80 cm and 140 cm.
        </p>
      </div>

      {/* Grid of Categories */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat.name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectCategory(cat.name);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Browse ${cat.name} category with ${count} accessories`}
                className="group bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-neutral-100 dark:bg-[#1D1F27]">
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    fallbackText={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">
                      {count} Curated {count === 1 ? 'Accessory' : 'Accessories'}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                      Reclaims Space
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-[#111111] dark:text-neutral-100 group-hover:text-[#FF6B00] transition-colors">
                      {cat.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-[#23252E] flex items-center justify-center text-neutral-700 dark:text-neutral-300 group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] p-12 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-[#251E19] border border-orange-200 dark:border-orange-900/50 flex items-center justify-center mx-auto text-[#FF6B00]">
            <FolderTree className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">No categories found</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Categories will appear here once configured in the TechCheck editorial admin.
          </p>
          <button
            onClick={() => onNavigate({ page: 'recommendations' })}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#111111] dark:bg-[#252832] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] rounded-xl transition-all cursor-pointer"
          >
            Explore all products
          </button>
        </div>
      )}
    </div>
  );
};
