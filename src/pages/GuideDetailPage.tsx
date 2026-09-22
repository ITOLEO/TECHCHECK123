import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  Clock,
  Calendar,
  ArrowRight,
  Share2,
  Sparkles,
  Star,
  Check,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { Guide, Product, ViewRoute } from '../types';
import { SafeImage } from '../components/SafeImage';
import { analytics } from '../services/analytics';

interface GuideDetailPageProps {
  guide?: Guide;
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
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (guide) {
      document.title = `${guide.title} | TechCheck Setup Guides`;
      analytics.track('guide_view', {
        guideId: guide.id,
        guideTitle: guide.title,
        category: guide.category,
      });
    }
    return () => {
      document.title = 'TechCheck — Small Space. Serious Setup.';
    };
  }, [guide]);

  // Missing guide fallback
  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-[#251E19] border border-orange-200 dark:border-orange-900/50 flex items-center justify-center mx-auto text-[#FF6B00]">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#111111] dark:text-white">Guide Not Found</h1>
        <p className="text-neutral-600 dark:text-neutral-300 max-w-md mx-auto text-sm leading-relaxed">
          The guide you are looking for might have been updated or moved in our editorial archive.
        </p>
        <button
          onClick={() => onNavigate({ page: 'guides' })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] dark:bg-[#252832] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] text-white text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse All Guides</span>
        </button>
      </div>
    );
  }

  const relatedGuides = allGuides.filter((g) => g.id !== guide.id).slice(0, 3);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: guide.title,
          text: guide.excerpt,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* 1. Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => onNavigate({ page: 'home' })}
          className="hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <button
          onClick={() => onNavigate({ page: 'guides' })}
          className="hover:text-[#FF6B00] dark:hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Guides
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="text-neutral-900 dark:text-neutral-200 font-semibold truncate max-w-xs">{guide.title}</span>
      </nav>

      {/* 2. Article Header */}
      <header className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 dark:bg-[#251E19] text-[#FF6B00] border border-orange-200 dark:border-orange-900/50">
            {guide.category}
          </div>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#16171D] border border-[#E9E9E6] dark:border-[#272932] hover:border-neutral-300 dark:hover:border-neutral-500 shadow-2xs transition-colors cursor-pointer"
            aria-label="Share article"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 dark:text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Guide</span>
              </>
            )}
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#111111] dark:text-white tracking-tight leading-[1.12]">
          {guide.title}
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
          {guide.intro}
        </p>

        {/* Metadata & Author Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[#E9E9E6] dark:border-[#272932]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700 shrink-0">
              <SafeImage
                src={guide.author.avatar}
                alt={guide.author.name}
                fallbackText={guide.author.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 block">
                {guide.author.name}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                {guide.author.role}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>{guide.readTime}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>{guide.publishDate}</span>
            </span>
          </div>
        </div>
      </header>

      {/* 3. Hero Image */}
      <div className="aspect-16/9 rounded-3xl overflow-hidden shadow-sm border border-[#E9E9E6] dark:border-[#272932] bg-neutral-100 dark:bg-[#1D1F27]">
        <SafeImage
          src={guide.image}
          alt={guide.title}
          fallbackText={guide.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* 4. Editorial Callout Box */}
      {guide.callout && (
        <div className="p-6 rounded-2xl bg-[#111111] dark:bg-[#16171E] text-white border-l-4 border-[#FF6B00] shadow-sm">
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
                <h2 className="text-xl sm:text-2xl font-bold text-[#111111] dark:text-white leading-tight">
                  {step.title}
                </h2>
              </div>

              <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed pl-12 sm:pl-16">
                {step.text}
              </p>

              {step.image && (
                <div className="pl-12 sm:pl-16">
                  <div className="aspect-16/9 rounded-2xl overflow-hidden border border-[#E9E9E6] dark:border-[#272932] bg-neutral-100 dark:bg-[#1D1F27]">
                    <SafeImage
                      src={step.image}
                      alt={step.title}
                      fallbackText={step.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* IN-ARTICLE PRODUCT RECOMMENDATION */}
              {recProduct && (
                <div className="pl-12 sm:pl-16 pt-2">
                  <div className="bg-white dark:bg-[#16171D] rounded-2xl border border-orange-200/90 dark:border-orange-900/40 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-[#1F2128]">
                        <SafeImage
                          src={recProduct.image}
                          alt={recProduct.name}
                          fallbackText={recProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                            Recommended for this step
                          </span>
                          {recProduct.badge && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-[#23252E] text-neutral-700 dark:text-neutral-300 font-medium">
                              {recProduct.badge}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[#111111] dark:text-white mt-0.5">
                          {recProduct.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{recProduct.rating.toFixed(1)}</span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{recProduct.shortBenefit}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProduct(recProduct.slug)}
                      className="shrink-0 px-5 py-2.5 bg-[#111111] dark:bg-[#252832] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-stretch sm:self-auto justify-center focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
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
      {guide.summary && (
        <div className="p-8 rounded-2xl bg-white dark:bg-[#16171D] border border-[#E9E9E6] dark:border-[#272932] shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF6B00]" />
            <h3 className="text-lg font-bold text-[#111111] dark:text-white">
              Editorial Takeaway
            </h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {guide.summary}
          </p>
        </div>
      )}

      {/* 7. Related Articles */}
      {relatedGuides.length > 0 && (
        <div className="pt-10 border-t border-[#E9E9E6] dark:border-[#272932] space-y-6">
          <h3 className="text-xl font-bold text-[#111111] dark:text-white">
            Related Setup Guides
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedGuides.map((relGuide) => (
              <div
                key={relGuide.id}
                onClick={() => onSelectGuide(relGuide.slug)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectGuide(relGuide.slug);
                }}
                role="button"
                tabIndex={0}
                className="group bg-white dark:bg-[#16171D] rounded-xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] p-4 transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
                    {relGuide.category}
                  </span>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-[#FF6B00] transition-colors line-clamp-2">
                    {relGuide.title}
                  </h4>
                </div>
                <span className="mt-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-[#FF6B00] flex items-center gap-1">
                  Read Guide <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
