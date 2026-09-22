import React from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  Gamepad2,
  Sparkles,
  Tv,
  Cable,
  SunMedium,
  Laptop,
} from 'lucide-react';
import { Product, CategoryInfo, Guide, ViewRoute, SiteSettings, ProductCategory } from '../types';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

interface HomePageProps {
  products: Product[];
  categories: CategoryInfo[];
  guides: Guide[];
  siteSettings?: SiteSettings;
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct: (slug: string) => void;
  onSelectGuide: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  guides,
  siteSettings,
  onNavigate,
  onSelectProduct,
  onSelectGuide,
}) => {
  const featuredProducts = products.filter((p) => p.featured).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);
  const featuredGuide = guides.find((g) => g.featured) || guides[0];
  const secondaryGuides = featuredGuide ? guides.filter((g) => g.id !== featuredGuide.id).slice(0, 3) : [];

  const heroEyebrow = siteSettings?.heroEyebrow || 'SMART TECH FOR BETTER SETUPS';
  const heroLine1 = siteSettings?.heroHeadline1 || 'Better Gear.';
  const heroLine2 = siteSettings?.heroHeadline2 || 'Smarter Spaces.';
  const heroSubtext =
    siteSettings?.heroSubtext ||
    'Discover space-saving tech and accessories that help you build a cleaner, more functional gaming setup — without the clutter.';

  const getCategoryCount = (cat: CategoryInfo) => {
    const realCount = products.filter((p) => p.category === cat.name).length;
    return realCount > 0 ? realCount : cat.productCount || 0;
  };

  // Recommendation entry points specified in UX guidelines
  const recommendationEntryPoints: Array<{
    title: string;
    description: string;
    category?: ProductCategory;
    icon: React.ComponentType<{ className?: string }>;
    tag: string;
  }> = [
    {
      title: 'Save Space',
      description: 'Reclaim up to 60% of desk surface with modular mounts & vertical stands.',
      category: 'Desk Setup',
      icon: Maximize2,
      tag: 'Desk Real Estate',
    },
    {
      title: 'Better Gaming',
      description: 'High refresh displays, low-latency audio, and mouse clearance.',
      category: 'Audio',
      icon: Gamepad2,
      tag: 'Performance & Flow',
    },
    {
      title: 'Better Lighting',
      description: 'Screenbars and eye-care bias lights that take zero desk footprint.',
      category: 'Lighting',
      icon: SunMedium,
      tag: 'Zero Footprint',
    },
    {
      title: 'Cleaner Desk',
      description: 'Concealed power strips, under-desk trays, and magnetic cord organizers.',
      category: 'Cable Management',
      icon: Sparkles,
      tag: 'Zero Visual Clutter',
    },
    {
      title: 'Monitor Upgrade',
      description: 'Gas-spring single & dual arms to eliminate bulky stock plastic monitor stands.',
      category: 'Desk Setup',
      icon: Tv,
      tag: 'Ergonomic Float',
    },
    {
      title: 'Cable Management',
      description: 'Under-desk wire channels, clips, and braided sleeves for clean drops.',
      category: 'Cable Management',
      icon: Cable,
      tag: 'Clean Drops',
    },
    {
      title: 'Laptop Setup',
      description: 'Vertical holders, minimal docks, and riser arms for dual-display workstations.',
      category: 'Storage',
      icon: Laptop,
      tag: 'Docked Precision',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* ========================================================
          HERO SECTION
          ======================================================== */}
      <section className="pt-8 sm:pt-14 lg:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                {heroEyebrow}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] dark:text-white leading-[1.08] transition-colors">
                {heroLine1}
                <br />
                <span className="text-[#FF6B00]">{heroLine2}</span>
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-xl transition-colors">
                {heroSubtext}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  id="hero-explore-products-btn"
                  onClick={() => onNavigate({ page: 'recommendations' })}
                  className="px-7 py-4 text-base font-bold text-white bg-[#FF6B00] hover:bg-[#e05e00] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-read-guides-btn"
                  onClick={() => onNavigate({ page: 'guides' })}
                  className="px-7 py-4 text-base font-semibold text-neutral-800 dark:text-neutral-200 hover:text-[#111111] dark:hover:text-white bg-white dark:bg-[#1A1C23] border border-[#E9E9E6] dark:border-[#2C2F3A] hover:border-neutral-300 dark:hover:border-neutral-500 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <span>Read Our Guides</span>
                </button>
              </div>

              {/* Small Supporting Statement */}
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="#FF6B00" strokeWidth="2" />
                  <circle cx="8" cy="8" r="3" fill="#FF6B00" />
                </svg>
                <span>Curated for compact gaming setups (80cm – 140cm).</span>
              </div>
            </div>

            {/* Right Column: Hero Visual */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#E9E9E6] dark:border-[#272932] bg-neutral-900 group">
                <SafeImage
                  src="/acer-nitro.png"
                  alt="Curated compact gaming setup with dual elevated monitors and clean cable management"
                  fallbackText="Compact Gaming Setup"
                  className="w-full h-80 sm:h-[480px] object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                {/* Visual Label Tag */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF6B00] block">
                      Setup Architecture #04
                    </span>
                    <h3 className="text-sm font-semibold">100cm Compact Studio Desk</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-white/20 text-white font-medium">
                    65% Surface Cleared
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION 1 — BROWSE BY CATEGORY
          Primary discovery path directly below Hero
          ======================================================== */}
      <section id="homepage-section-categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
              BROWSE BY CATEGORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight">
              Find the right upgrade by category.
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              Explore space-saving accessories based on what your setup needs most.
            </p>
          </div>

          <button
            onClick={() => onNavigate({ page: 'categories' })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111111] dark:text-neutral-200 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const count = getCategoryCount(cat);
              return (
                <div
                  key={cat.id}
                  onClick={() => onNavigate({ page: 'recommendations', categoryFilter: cat.name })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onNavigate({ page: 'recommendations', categoryFilter: cat.name });
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Browse ${cat.name} category with ${count} accessories`}
                  className="group bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <div className="relative aspect-16/9 overflow-hidden bg-neutral-100 dark:bg-[#1D1F27]">
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      fallbackText={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <span className="text-xs font-semibold bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded">
                        {count} Curated Products
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-[#111111] dark:text-neutral-100 group-hover:text-[#FF6B00] transition-colors">
                        {cat.name}
                      </h3>
                      <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-[#23252E] flex items-center justify-center text-neutral-600 dark:text-neutral-300 group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] p-10 text-center text-neutral-500 text-xs">
            No categories available.
          </div>
        )}
      </section>

      {/* ========================================================
          SECTION 2 — FEATURED / EXPLORE PRODUCTS
          Where users browse actual verified hardware
          ======================================================== */}
      <section id="homepage-section-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-2">
              FEATURED PRODUCTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight">
              Top Picks for Your Setup.
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              Handpicked accessories that save space, boost productivity, and improve your gaming experience.
            </p>
          </div>

          <button
            onClick={() => onNavigate({ page: 'recommendations' })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111111] dark:text-neutral-200 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Product Cards Grid */}
        {displayProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] p-10 text-center text-neutral-500 text-xs">
            No products available.
          </div>
        )}
      </section>

      {/* ========================================================
          SECTION 3 — RECOMMENDATIONS (FIND THE RIGHT UPGRADE)
          Dedicated path for users who want targeted setup upgrades
          ======================================================== */}
      <section id="homepage-section-recommendations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
              RECOMMENDED FOR YOUR SETUP
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight">
              Find the Right Upgrade.
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              Not sure where to begin? Choose your current setup goal to quickly discover verified solutions.
            </p>
          </div>

          <button
            onClick={() => onNavigate({ page: 'recommendations' })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111111] dark:text-neutral-200 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Browse Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Recommendation Entry Points Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {recommendationEntryPoints.map((entry, idx) => {
            const Icon = entry.icon;
            return (
              <div
                key={entry.title}
                onClick={() =>
                  onNavigate({
                    page: 'recommendations',
                    categoryFilter: entry.category,
                  })
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    onNavigate({
                      page: 'recommendations',
                      categoryFilter: entry.category,
                    });
                }}
                role="button"
                tabIndex={0}
                aria-label={`Find recommendations for ${entry.title}`}
                className={`group p-6 rounded-2xl bg-white dark:bg-[#16171D] border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
                  idx === 0 ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-[#251E19] text-[#FF6B00] flex items-center justify-center transition-transform group-hover:scale-110">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#22242D]">
                      {entry.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#111111] dark:text-white group-hover:text-[#FF6B00] transition-colors mb-2">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {entry.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-[#252832] flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300 group-hover:text-[#FF6B00]">
                  <span>Explore Solutions</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION 4 — GUIDES & ARTICLES
          Educational blueprints separate from product listings
          ======================================================== */}
      <section id="homepage-section-guides" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
              GUIDES & ARTICLES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] dark:text-white tracking-tight">
              Make your setup work harder.
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              In-depth articles and blueprints on optimizing desk ergonomics, cable routing, and spatial layout.
            </p>
          </div>

          <button
            onClick={() => onNavigate({ page: 'guides' })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111111] dark:text-neutral-200 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All Guides</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Guide Card (Large) */}
        {featuredGuide ? (
          <div
            onClick={() => onSelectGuide(featuredGuide.slug)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectGuide(featuredGuide.slug);
            }}
            tabIndex={0}
            role="button"
            aria-label={`Read featured guide: ${featuredGuide.title}`}
            className="group bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-sm overflow-hidden cursor-pointer grid grid-cols-1 lg:grid-cols-12 mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          >
            <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-[380px] overflow-hidden bg-neutral-900">
              <SafeImage
                src={featuredGuide.image}
                alt={featuredGuide.title}
                fallbackText={featuredGuide.title}
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                loading="eager"
              />
            </div>
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  <span className="font-bold uppercase tracking-wider text-[#FF6B00]">
                    {featuredGuide.category}
                  </span>
                  <span>•</span>
                  <span>{featuredGuide.readTime}</span>
                  <span>•</span>
                  <span>{featuredGuide.publishDate}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#111111] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">
                  {featuredGuide.title}
                </h3>

                <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {featuredGuide.excerpt}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-[#252832] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700">
                    <SafeImage
                      src={featuredGuide.author.avatar}
                      alt={featuredGuide.author.name}
                      fallbackText={featuredGuide.author.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 block">
                      {featuredGuide.author.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block">
                      {featuredGuide.author.role}
                    </span>
                  </div>
                </div>

                <span className="text-sm font-bold text-[#111111] dark:text-white group-hover:text-[#FF6B00] transition-colors flex items-center gap-1">
                  Read Guide →
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#16171D] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] p-10 text-center text-neutral-500 text-xs mb-8">
            No guide articles published yet.
          </div>
        )}

        {/* Secondary 3 Guides Grid */}
        {secondaryGuides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryGuides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => onSelectGuide(guide.slug)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectGuide(guide.slug);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Read guide: ${guide.title}`}
                className="group bg-white dark:bg-[#16171D] rounded-xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <div className="aspect-16/10 overflow-hidden bg-neutral-100 dark:bg-[#1D1F27] relative">
                  <SafeImage
                    src={guide.image}
                    alt={guide.title}
                    fallbackText={guide.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white">
                      {guide.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500 mb-2">
                      <span>{guide.readTime}</span>
                      <span>•</span>
                      <span>{guide.publishDate}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#111111] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-snug line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-[#252832] flex items-center justify-between text-xs font-semibold text-[#111111] dark:text-neutral-300 group-hover:text-[#FF6B00]">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          DARK CTA SECTION (#111111)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111111] dark:bg-[#16171E] text-white rounded-3xl p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl border border-neutral-800 dark:border-[#2A2D38]">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
              Compact Setup Revolution
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Less clutter.{' '}
              <span className="text-[#FF6B00] block">More gaming.</span>
            </h2>
            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed">
              Build a cleaner setup without buying a bigger desk. Explore our full library of verified space-saving hardware.
            </p>
            <div className="pt-2">
              <button
                id="dark-cta-explore-collection-btn"
                onClick={() => onNavigate({ page: 'recommendations' })}
                className="px-8 py-4 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6B00]"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
