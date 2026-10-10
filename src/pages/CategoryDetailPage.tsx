import React, { useEffect } from 'react';
import { ArrowLeft, FolderTree, ArrowRight, Grid, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { CategoryInfo, Product, ViewRoute } from '../types';
import { findCategoryBySlug, categoryToSlug } from '../utils/slug';
import { updateSEO, buildBreadcrumbSchema } from '../services/seo';
import { analytics } from '../services/analytics';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

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

  // Filter products matching this category
  const matchingProducts = category
    ? products.filter((p) => {
        const pCatSlug = categoryToSlug(p.category);
        const targetCatSlug = categoryToSlug(category.slug || category.name);
        return pCatSlug === targetCatSlug || p.category.toLowerCase() === category.name.toLowerCase();
      })
    : [];

  useEffect(() => {
    if (category) {
      const cleanSlug = categoryToSlug(category.slug || category.name);
      const titleStr = `${category.name} - Space-Saving Desk Upgrades | TechCheck`;
      const descStr = category.description
        ? `${category.description} Explore curated ${category.name} gear tested for compact 80cm–140cm desks.`
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
        productCount: matchingProducts.length,
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
  }, [category, slug, matchingProducts.length]);

  // Handle 404 Category Not Found State
  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-10 shadow-sm space-y-6">
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
              className="px-5 py-2.5 rounded-xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
            >
              <FolderTree className="w-4 h-4" />
              All Categories
            </button>
            <button
              onClick={() => onNavigate({ page: 'recommendations' })}
              className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-[#111111] dark:text-neutral-200 text-xs font-bold hover:border-[#FF6B00] transition-colors flex items-center justify-center gap-2"
            >
              All Products
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryCleanSlug = categoryToSlug(category.slug || category.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center text-xs text-neutral-500 dark:text-neutral-400">
        <button
          onClick={() => onNavigate({ page: 'home' })}
          className="hover:text-[#FF6B00] transition-colors focus-visible:outline-none"
        >
          Home
        </button>
        <span className="mx-2 text-neutral-400 dark:text-neutral-600">/</span>
        <button
          onClick={() => onNavigate({ page: 'categories' })}
          className="hover:text-[#FF6B00] transition-colors focus-visible:outline-none"
        >
          Categories
        </button>
        <span className="mx-2 text-neutral-400 dark:text-neutral-600">/</span>
        <span className="text-[#111111] dark:text-neutral-200 font-bold truncate max-w-[200px]">
          {category.name}
        </span>
      </nav>

      {/* Hero Header Banner */}
      <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 p-8 sm:p-12 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full border border-orange-200/60 dark:border-orange-900/50">
                Setup Category
              </span>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {matchingProducts.length} {matchingProducts.length === 1 ? 'Item' : 'Items'} Available
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] dark:text-white tracking-tight leading-tight">
              {category.name}
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
              {category.description || `Browse space-saving ${category.name.toLowerCase()} hardware and accessories optimized for compact gaming desks.`}
            </p>

            <div className="pt-2 flex flex-wrap gap-3 items-center">
              <button
                onClick={() => onNavigate({ page: 'categories' })}
                className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to All Categories
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 h-full min-h-[220px] relative bg-neutral-100 dark:bg-[#1C1E25] overflow-hidden">
            <SafeImage
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold backdrop-blur-md bg-black/40 px-4 py-2 rounded-xl border border-white/10 flex items-center justify-between">
              <span>Curated Space-Saving Gear</span>
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid / Listings */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9E9E6] dark:border-[#272932] pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
              <Grid className="w-5 h-5 text-[#FF6B00]" />
              Curated {category.name} Gear
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Verified for compact desk footprints (80cm - 140cm)
            </p>
          </div>

          <button
            onClick={() => onNavigate({ page: 'recommendations', categoryFilter: category.name })}
            className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Filter on Recommendations Page
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingProducts.map((product) => (
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
              No products currently in {category.name}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              We are actively testing and reviewing new space-saving {category.name.toLowerCase()} accessories. Explore our full recommendations catalog in the meantime.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate({ page: 'recommendations' })}
                className="px-6 py-3 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                Browse All Recommendations
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Explore Other Categories Footer Banner */}
      <div className="bg-neutral-100 dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            Explore Taxonomy
          </span>
          <h3 className="text-xl font-bold text-[#111111] dark:text-white mt-1">
            Looking for other workspace upgrades?
          </h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-xl">
            Browse our full range of functional categories from monitor arms and cable management to audio and ergonomics.
          </p>
        </div>
        <button
          onClick={() => onNavigate({ page: 'categories' })}
          className="px-6 py-3 rounded-2xl bg-[#111111] dark:bg-white text-white dark:text-[#111111] text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 flex items-center gap-2"
        >
          <FolderTree className="w-4 h-4" />
          View All Categories
        </button>
      </div>
    </div>
  );
};
