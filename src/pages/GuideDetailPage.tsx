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
import { updateSEO, buildGuideSchema, buildBreadcrumbSchema } from '../services/seo';

interface GuideDetailPageProps {
  guide?: Guide | null;
  allGuides?: Guide[];
  allProducts?: Product[];
  onNavigate: (route: ViewRoute) => void;
  onSelectProduct: (slug: string) => void;
  onSelectGuide: (slug: string) => void;
}

export const GuideDetailPage: React.FC<GuideDetailPageProps> = ({
  guide,
  allGuides = [],
  allProducts = [],
  onNavigate,
  onSelectProduct,
  onSelectGuide,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (guide) {
      updateSEO({
        title: `${guide.title} | TechCheck Workspace Guide`,
        description: guide.excerpt,
        canonicalPath: `guides/${guide.slug}`,
        ogImage: guide.image,
        ogType: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@graph': [
            buildGuideSchema(guide),
            buildBreadcrumbSchema([
              { name: 'Home', path: '' },
              { name: 'Guides', path: 'guides' },
              { name: guide.title, path: `guides/${guide.slug}` },
            ]),
          ],
        },
      });

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

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center mx-auto text-[#FF6B00]">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-[#111111] dark:text-white mt-6">Blueprint Not Found</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
          The requested guide article may have been moved or unpublished.
        </p>
        <button
          onClick={() => onNavigate({ page: 'guides' })}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] dark:bg-white hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] text-white dark:text-[#111111] dark:hover:text-white text-xs font-semibold rounded-2xl transition-all shadow-xs cursor-pointer mt-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Guides</span>
        </button>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getRecommendedProduct = (productSlug?: string) => {
    if (!productSlug) return null;
    return allProducts.find((p) => p.slug === productSlug);
  };

  const relatedGuides = allGuides.filter((g) => g.id !== guide.id).slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400" aria-label="Breadcrumb">
        <button
          onClick={() => onNavigate({ page: 'home' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <button
          onClick={() => onNavigate({ page: 'guides' })}
          className="hover:text-[#FF6B00] transition-colors cursor-pointer"
        >
          Guides
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
        <span className="text-[#111111] dark:text-neutral-200 font-semibold truncate max-w-[220px] sm:max-w-md">
          {guide.title}
        </span>
      </nav>

      {/* Guide Header Block */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] border border-orange-200/80 dark:border-orange-800/80">
              {guide.category}
            </div>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#16171C] border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] shadow-xs transition-colors cursor-pointer"
            title="Copy blueprint link to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span className="text-[#FF6B00] font-bold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Share Blueprint</span>
              </>
            )}
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] dark:text-white tracking-tight leading-[1.12]">
          {guide.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-500 dark:text-neutral-400 pt-1 pb-4 border-b border-[#E9E9E6] dark:border-[#272932]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <span>Updated {guide.publishDate}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span>{guide.readTime} reading time</span>
          </div>
          <span>•</span>
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            By {guide.author?.name || 'TechCheck Spatial Engineering'}
          </span>
        </div>

        <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-200 leading-relaxed font-normal">
          {guide.excerpt}
        </p>
      </div>

      {/* Featured Image in Rounded-3xl Frame */}
      <div className="rounded-3xl overflow-hidden bg-neutral-100 dark:bg-[#1C1E25] aspect-16/9 border border-[#E9E9E6] dark:border-[#272932] shadow-sm">
        <SafeImage
          src={guide.image}
          alt={guide.title}
          fallbackText={guide.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
      </div>

      {/* Main Guide Content */}
      <div className="space-y-12">
        {/* Intro */}
        {guide.intro && (
          <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
            {guide.intro}
          </p>
        )}

        {/* Editorial Callout Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#111111] text-white border-l-4 border-[#FF6B00] shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block mb-1.5">
            Spatial Engineering Rule
          </span>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {guide.callout || 'On desks 80cm to 140cm wide, vertical and under-desk planes are free real estate. Moving monitor stands and power bricks off the desk pad instantly reclaims 40% of usable surface space.'}
          </p>
        </div>

        {/* Structured Step-by-Step Blueprint Walkthrough */}
        {guide.steps && guide.steps.length > 0 && (
          <div className="space-y-8 pt-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                Blueprint Walkthrough
              </span>
              <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
            </div>

            <div className="space-y-10">
              {guide.steps.map((step, idx) => {
                const recProduct = getRecommendedProduct(step.recommendedProductSlug);
                return (
                  <div
                    key={step.number || idx}
                    className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-6 sm:p-8 shadow-xs space-y-5"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#FF6B00] font-mono shrink-0">
                        {String(step.number || idx + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-[#111111] dark:text-white leading-tight">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                          {step.text}
                        </p>
                      </div>
                    </div>

                    {step.image && (
                      <div className="rounded-2xl overflow-hidden aspect-16/9 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
                        <SafeImage
                          src={step.image}
                          alt={step.title}
                          fallbackText={step.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Integrated Recommended Gear Card */}
                    {recProduct && (
                      <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="bg-neutral-50 dark:bg-[#1D1F27] rounded-3xl border border-[#FF6B00]/30 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-[#FF6B00] transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#16171C] border border-[#E9E9E6] dark:border-[#272932] p-2 flex items-center justify-center shrink-0">
                              <SafeImage
                                src={recProduct.image}
                                alt={recProduct.name}
                                fallbackText={recProduct.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                                  Audited Hardware
                                </span>
                                {recProduct.badge && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black">
                                    {recProduct.badge}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-sm font-bold text-[#111111] dark:text-white line-clamp-1">
                                {recProduct.name}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500">
                                <div className="flex items-center text-amber-400">
                                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                                </div>
                                <span>{recProduct.rating.toFixed(1)}</span>
                                <span>•</span>
                                <span className="line-clamp-1">{recProduct.shortBenefit}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => onSelectProduct(recProduct.slug)}
                            className="shrink-0 px-5 py-2.5 bg-[#111111] dark:bg-white hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] text-white dark:text-[#111111] dark:hover:text-white text-xs font-bold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-stretch sm:self-auto justify-center focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                          >
                            <span>Specs & Review</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {guide.summary && (
          <div className="bg-neutral-50 dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-6 sm:p-8">
            <h4 className="text-sm font-bold text-[#111111] dark:text-white mb-2">Summary</h4>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {guide.summary}
            </p>
          </div>
        )}

        {/* Blueprint Call to Action */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[#111111] dark:bg-[#16171E] text-white space-y-4 shadow-xl border border-neutral-800">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
            Complete Your Compact Setup
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Need hardware to execute this blueprint?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
            Browse our full curated catalog of monitor arms, screenbars, cable trays, and modular drawers tailored for desks 80cm - 140cm.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate({ page: 'recommendations' })}
              className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Verified Hardware</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Related Guides Section */}
        {relatedGuides.length > 0 && (
          <div className="pt-8 border-t border-[#E9E9E6] dark:border-[#272932] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] dark:text-neutral-200">
                  More Setup Blueprints
                </h3>
              </div>
              <button
                onClick={() => onNavigate({ page: 'guides' })}
                className="text-xs font-semibold text-neutral-500 hover:text-[#FF6B00] transition-colors cursor-pointer"
              >
                View all guides →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedGuides.map((rg) => (
                <div
                  key={rg.id}
                  onClick={() => onSelectGuide(rg.slug)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSelectGuide(rg.slug);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Read guide: ${rg.title}`}
                  className="group bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] p-5 transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block mb-1">
                      {rg.category}
                    </span>
                    <h4 className="text-sm font-bold text-[#111111] dark:text-neutral-100 group-hover:text-[#FF6B00] transition-colors line-clamp-2">
                      {rg.title}
                    </h4>
                  </div>
                  <span className="mt-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-[#FF6B00] flex items-center gap-1">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
