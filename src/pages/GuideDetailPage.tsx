import React from 'react';
import {
  ChevronRight,
  Clock,
  Calendar,
  User,
  ArrowRight,
  Share2,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { Guide, Product, ViewRoute } from '../types';

interface GuideDetailPageProps {
  guide: Guide;
  allGuides: Guide[];
  allProducts: Product[];
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct: (slug: string) => void;
  onSelectGuide: (slug: string) => void;
}

export const GuideDetailPage: React.FC<GuideDetailPageProps> = ({
  guide,
  allGuides,
  allProducts,
  onNavigate,
  onSelectProduct,
  onSelectGuide,
}) => {
  const relatedGuides = allGuides.filter((g) => g.id !== guide.id).slice(0, 3);

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => onNavigate({ page: 'home' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <button
          onClick={() => onNavigate({ page: 'guides' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Guides
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{guide.title}</span>
      </nav>

      {/* 2. Article Header */}
      <header className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#FF6B00] border border-orange-200">
          {guide.category}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] tracking-tight leading-[1.12]">
          {guide.title}
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
          {guide.intro}
        </p>

        {/* Metadata & Author Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#E9E9E6]">
          <div className="flex items-center gap-3">
            <img
              src={guide.author.avatar}
              alt={guide.author.name}
              className="w-10 h-10 rounded-full object-cover border border-neutral-200"
            />
            <div>
              <span className="text-xs font-bold text-neutral-900 block">
                {guide.author.name}
              </span>
              <span className="text-[11px] text-neutral-500 block">
                {guide.author.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              {guide.readTime}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-400" />
              {guide.publishDate}
            </span>
          </div>
        </div>
      </header>

      {/* 3. Hero Image */}
      <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-sm border border-[#E9E9E6] bg-neutral-100">
        <img
          src={guide.image}
          alt={guide.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 4. Editorial Callout Box */}
      {guide.callout && (
        <div className="p-6 rounded-2xl bg-[#111111] text-white border-l-4 border-[#FF6B00] shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
            Core Spatial Principle
          </span>
          <p className="text-sm sm:text-base font-medium leading-relaxed text-neutral-200">
            {guide.callout}
          </p>
        </div>
      )}

      {/* 5. Numbered Steps / Guide Body */}
      <div className="space-y-12 pt-4">
        {guide.steps.map((step, idx) => {
          const recProduct = step.recommendedProductSlug
            ? allProducts.find((p) => p.slug === step.recommendedProductSlug)
            : null;

          return (
            <section key={idx} className="space-y-5">
              <div className="flex items-baseline gap-4">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#FF6B00] font-mono shrink-0">
                  {step.number}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111111] leading-tight">
                  {step.title}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed pl-12 sm:pl-16">
                {step.text}
              </p>

              {step.image && (
                <div className="pl-12 sm:pl-16">
                  <div className="aspect-16/9 rounded-2xl overflow-hidden border border-[#E9E9E6]">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* IN-ARTICLE PRODUCT RECOMMENDATION (NO PRICE, "View Details →") */}
              {recProduct && (
                <div className="pl-12 sm:pl-16 pt-2">
                  <div className="bg-white rounded-2xl border border-orange-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-[#FF6B00] transition-colors">
                    <div className="flex items-center gap-4">
                      <img
                        src={recProduct.image}
                        alt={recProduct.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl shrink-0 bg-neutral-100"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                            Recommended for this step
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 font-medium">
                            {recProduct.badge}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[#111111] mt-0.5">
                          {recProduct.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <span className="font-semibold text-neutral-800">{recProduct.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{recProduct.shortBenefit}</span>
                        </div>
                      </div>
                    </div>

                    {/* Button MUST go to TechCheck Product Detail, NEVER directly to affiliate store */}
                    <button
                      onClick={() => onSelectProduct(recProduct.slug)}
                      className="shrink-0 px-5 py-2.5 bg-[#111111] hover:bg-[#FF6B00] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-stretch sm:self-auto justify-center"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* 6. Summary / Conclusion */}
      <div className="p-8 rounded-2xl bg-white border border-[#E9E9E6] shadow-xs space-y-3">
        <h3 className="text-lg font-bold text-[#111111]">
          Editorial Takeaway
        </h3>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {guide.summary}
        </p>
      </div>

      {/* 7. Related Articles */}
      <div className="pt-10 border-t border-[#E9E9E6] space-y-6">
        <h3 className="text-xl font-bold text-[#111111]">
          Related Setup Guides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedGuides.map((relGuide) => (
            <div
              key={relGuide.id}
              onClick={() => onSelectGuide(relGuide.slug)}
              className="group bg-white rounded-xl border border-[#E9E9E6] hover:border-neutral-300 p-4 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
                  {relGuide.category}
                </span>
                <h4 className="text-sm font-bold text-neutral-900 group-hover:text-[#FF6B00] transition-colors line-clamp-2">
                  {relGuide.title}
                </h4>
              </div>
              <span className="mt-4 text-xs font-bold text-neutral-500 group-hover:text-[#FF6B00] flex items-center gap-1">
                Read Guide <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};
