import React from 'react';
import { ArrowRight, ArrowUpRight, Check, Sparkles, Layers, Box, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { Product, CategoryInfo, Guide, ViewRoute, ProductCategory, SiteSettings } from '../types';
import { ProductCard } from '../components/ProductCard';
import { DeskSpaceCalculator } from '../components/DeskSpaceCalculator';

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
  const featuredGuide = guides.find((g) => g.featured) || guides[0];
  const secondaryGuides = featuredGuide ? guides.filter((g) => g.id !== featuredGuide.id).slice(0, 3) : [];

  const heroEyebrow = siteSettings?.heroEyebrow || 'SMART TECH FOR BETTER SETUPS';
  const heroLine1 = siteSettings?.heroHeadline1 || 'Better Gear.';
  const heroLine2 = siteSettings?.heroHeadline2 || 'Smarter Spaces.';
  const heroSubtext = siteSettings?.heroSubtext || 'Discover space-saving tech and accessories that help you build a cleaner, more functional gaming setup — without the clutter.';

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="pt-8 sm:pt-14 lg:pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column: Copy & Actions */}
            <div className="lg:col-span-6 space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                {heroEyebrow}
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.08]">
                {heroLine1}<br />
                <span className="text-[#FF6B00]">{heroLine2}</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
                {heroSubtext}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  id="hero-explore-products-btn"
                  onClick={() => onNavigate({ page: 'recommendations' })}
                  className="px-7 py-4 text-base font-bold text-white bg-[#FF6B00] hover:bg-[#e05e00] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-read-guides-btn"
                  onClick={() => onNavigate({ page: 'guides' })}
                  className="px-7 py-4 text-base font-semibold text-neutral-800 hover:text-[#111111] bg-white border border-[#E9E9E6] hover:border-neutral-300 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Read Our Guides</span>
                </button>
              </div>

              {/* Small Supporting Statement */}
              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-neutral-500">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="7" stroke="#FF6B00" strokeWidth="2"/>
                  <circle cx="8" cy="8" r="3" fill="#FF6B00"/>
                </svg>
                <span>Curated for compact gaming setups.</span>
              </div>
            </div>

            {/* Right Column: Premium Gaming Desk Photography */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#E9E9E6] bg-neutral-900 group">
                <img
                  src="/acer-nitro.png"
                  alt="Curated compact gaming setup with dual elevated monitors and clean cable management"
                  className="w-full h-80 sm:h-[480px] object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                
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

      {/* 3. FEATURED RECOMMENDATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF6B00] mb-3">
              FEATURED PRODUCTS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mb-4">
              Top Picks for Your Setup.
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-xl">
              Handpicked accessories that save space, boost productivity, and improve your gaming experience.
            </p>
          </div>
        </div>

        {/* 4 Product Cards Grid (NO PRICES) */}
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E9E9E6] p-10 text-center text-neutral-500 text-xs">
            Belum ada produk unggulan yang ditampilkan. Anda dapat menambah dan menandai produk featured di dashboard <span className="font-bold text-[#FF6B00]">admintechcheck</span>.
          </div>
        )}
      </section>

      {/* 4. INTERACTIVE DESK SPACE CALCULATOR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DeskSpaceCalculator
          products={products}
          onSelectProduct={onSelectProduct}
        />
      </div>

      {/* 5. CATEGORIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
            Browse By Focus
          </span>
          <h2 className="text-3xl font-extrabold text-[#111111] tracking-tight">
            Find the right upgrade.
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Explore accessories based on what your setup needs most.
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate({ page: 'recommendations', categoryFilter: cat.name })}
                className="group bg-white rounded-2xl border border-[#E9E9E6] hover:border-neutral-300 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-16/9 overflow-hidden bg-neutral-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-xs font-semibold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                      {cat.productCount} Curated Products
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#FF6B00] transition-colors">
                      {cat.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E9E9E6] p-10 text-center text-neutral-500 text-xs">
            Belum ada kategori yang ditambahkan.
          </div>
        )}
      </section>

      {/* 6. FEATURED GUIDE & ARTICLES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
              Editorial Insights
            </span>
            <h2 className="text-3xl font-extrabold text-[#111111] tracking-tight">
              Make your setup work harder.
            </h2>
            <p className="mt-2 text-sm text-neutral-600 max-w-xl">
              In-depth articles and blueprints on optimizing desk ergonomics, cable routing, and spatial layout.
            </p>
          </div>

          <button
            onClick={() => onNavigate({ page: 'guides' })}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#111111] hover:text-[#FF6B00] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View All Guides</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Featured Guide Card (Large) */}
        {featuredGuide ? (
          <div
            onClick={() => onSelectGuide(featuredGuide.slug)}
            className="group bg-white rounded-2xl border border-[#E9E9E6] hover:border-neutral-300 shadow-sm overflow-hidden cursor-pointer grid grid-cols-1 lg:grid-cols-12 mb-8"
          >
            <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-[380px] overflow-hidden bg-neutral-900">
              <img
                src={featuredGuide.image}
                alt={featuredGuide.title}
                className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
              />
            </div>
            <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
                  <span className="font-bold uppercase tracking-wider text-[#FF6B00]">
                    {featuredGuide.category}
                  </span>
                  <span>•</span>
                  <span>{featuredGuide.readTime}</span>
                  <span>•</span>
                  <span>{featuredGuide.publishDate}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#111111] group-hover:text-[#FF6B00] transition-colors leading-tight">
                  {featuredGuide.title}
                </h3>

                <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                  {featuredGuide.excerpt}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={featuredGuide.author.avatar}
                    alt={featuredGuide.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-neutral-800 block">
                      {featuredGuide.author.name}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">
                      {featuredGuide.author.role}
                    </span>
                  </div>
                </div>

                <span className="text-sm font-bold text-[#111111] group-hover:text-[#FF6B00] transition-colors flex items-center gap-1">
                  Read Guide →
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E9E9E6] p-10 text-center text-neutral-500 text-xs mb-8">
            Belum ada artikel panduan yang ditambahkan.
          </div>
        )}

        {/* Secondary 3 Guides Grid */}
        {secondaryGuides.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryGuides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => onSelectGuide(guide.slug)}
                className="group bg-white rounded-xl border border-[#E9E9E6] hover:border-neutral-300 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-16/10 overflow-hidden bg-neutral-100 relative">
                  <img
                    src={guide.image}
                    alt={guide.title}
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
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-2">
                      <span>{guide.readTime}</span>
                      <span>•</span>
                      <span>{guide.publishDate}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#111111] group-hover:text-[#FF6B00] transition-colors leading-snug line-clamp-2">
                      {guide.title}
                    </h3>
                    <p className="mt-2 text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-[#111111] group-hover:text-[#FF6B00]">
                    <span>Read Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. DARK CTA SECTION (#111111) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-14 lg:p-16 relative overflow-hidden shadow-2xl">
          {/* Subtle Orange Graphic Glow */}
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
                className="px-8 py-4 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-xl shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer group"
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
