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
  FileText,
  ListOrdered,
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

/**
 * Format inline text (bold, italic, code)
 */
function renderInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-neutral-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-xs font-mono text-[#FF6B00]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/**
 * Render free-form document text (paragraphs, headings, lists, quotes, dividers)
 */
function renderDocumentProse(text: string) {
  const blocks = text.split(/\n\n+/);
  return (
    <div className="space-y-6 text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Markdown Image: ![Alt Text](https://image.url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          const [, alt, src] = imgMatch;
          return (
            <div
              key={idx}
              className="rounded-2xl overflow-hidden aspect-16/9 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 my-6 shadow-xs"
            >
              <SafeImage
                src={src}
                alt={alt || 'Foto Artikel'}
                fallbackText={alt || 'Foto Artikel'}
                className="w-full h-full object-cover"
              />
            </div>
          );
        }

        if (trimmed === '---' || trimmed === '***') {
          return (
            <hr key={idx} className="border-t border-neutral-200 dark:border-neutral-800 my-8" />
          );
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-base sm:text-lg font-bold text-[#111111] dark:text-white pt-4">
              {renderInlineText(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3
              key={idx}
              className="text-lg sm:text-xl font-bold text-[#111111] dark:text-white pt-6 pb-1.5 border-b border-neutral-100 dark:border-neutral-800"
            >
              {renderInlineText(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="text-xl sm:text-2xl font-extrabold text-[#111111] dark:text-white pt-8">
              {renderInlineText(trimmed.replace(/^#\s+/, ''))}
            </h2>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="pl-4 border-l-4 border-[#FF6B00] italic text-neutral-600 dark:text-neutral-300 my-4 bg-orange-50/50 dark:bg-orange-950/20 py-3 pr-4 rounded-r-2xl"
            >
              {renderInlineText(trimmed.replace(/^>\s+/, ''))}
            </blockquote>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').filter(Boolean);
          return (
            <ul key={idx} className="space-y-2 pl-5 list-disc marker:text-[#FF6B00]">
              {items.map((it, iIdx) => (
                <li key={iIdx} className="text-neutral-700 dark:text-neutral-300">
                  {renderInlineText(it.replace(/^[-*]\s+/, ''))}
                </li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const items = trimmed.split('\n').filter(Boolean);
          return (
            <ol key={idx} className="space-y-2 pl-5 list-decimal marker:text-[#FF6B00] marker:font-bold">
              {items.map((it, iIdx) => (
                <li key={iIdx} className="text-neutral-700 dark:text-neutral-300">
                  {renderInlineText(it.replace(/^\d+\.\s+/, ''))}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={idx} className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {renderInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
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

  // Referenced products across the guide
  const referencedProducts = React.useMemo(() => {
    const list: Product[] = [];
    const seen = new Set<string>();
    guide?.steps?.forEach((st) => {
      if (st.recommendedProductSlug && !seen.has(st.recommendedProductSlug)) {
        const prod = allProducts.find((p) => p.slug === st.recommendedProductSlug);
        if (prod) {
          seen.add(st.recommendedProductSlug);
          list.push(prod);
        }
      }
    });
    return list;
  }, [guide, allProducts]);

  // Format checks
  const isDocumentFormat = guide.layoutFormat === 'document';
  // Allow images inside the article content unless explicitly disabled (showContentImages === false)
  const canShowContentImages = guide.showContentImages !== false;

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

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 dark:bg-[#1D1F27] text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800">
              {isDocumentFormat ? (
                <>
                  <FileText className="w-3 h-3 text-[#FF6B00]" />
                  <span>Document Format</span>
                </>
              ) : (
                <>
                  <ListOrdered className="w-3 h-3 text-[#FF6B00]" />
                  <span>Step-by-Step Guide</span>
                </>
              )}
            </span>
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

      {/* Hero Featured Image in Rounded-3xl Frame (Always clean, only in header) */}
      {guide.image && (
        <div className="rounded-3xl overflow-hidden bg-neutral-100 dark:bg-[#1C1E25] aspect-16/9 border border-[#E9E9E6] dark:border-[#272932] shadow-sm">
          <SafeImage
            src={guide.image}
            alt={guide.title}
            fallbackText={guide.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
      )}

      {/* Main Guide Content */}
      <div className="space-y-12">
        {/* Intro */}
        {guide.intro && (
          <p className="text-sm sm:text-base text-neutral-800 dark:text-neutral-200 leading-relaxed font-normal">
            {guide.intro}
          </p>
        )}

        {/* Editorial Callout Card */}
        {guide.callout && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111111] text-white border-l-4 border-[#FF6B00] shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00] block mb-1.5">
              Spatial Engineering Rule
            </span>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {guide.callout}
            </p>
          </div>
        )}

        {/* ========================================================
            LAYOUT 1: LEMBAR DOKUMEN BIASA (DOCUMENT / PROSE FORMAT)
            ======================================================== */}
        {isDocumentFormat ? (
          <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-6 sm:p-12 shadow-xs space-y-10">
            {/* Free-form Continuous Document Content (Lembar Dokumen Biasa) */}
            {guide.content?.trim() ? (
              renderDocumentProse(guide.content)
            ) : (
              /* If no freeform text written, render steps seamlessly as document prose sections (NOT as card boxes) */
              <div className="space-y-8 text-neutral-800 dark:text-neutral-200 text-sm sm:text-base leading-relaxed">
                {guide.steps?.map((step, idx) => {
                  const hasStepImage = canShowContentImages && Boolean(step.image?.trim());
                  return (
                    <div key={idx} className="space-y-3">
                      <h3 className="text-lg sm:text-xl font-bold text-[#111111] dark:text-white pt-4 pb-1 border-b border-neutral-100 dark:border-neutral-800">
                        {step.title}
                      </h3>
                      <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {step.text}
                      </p>
                      {hasStepImage && (
                        <div className="rounded-2xl overflow-hidden aspect-16/9 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 my-4">
                          <SafeImage
                            src={step.image}
                            alt={step.title}
                            fallbackText={step.title}
                            hideOnFallback={true}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Referenced Hardware / Gear cards at the end of the document */}
            {referencedProducts.length > 0 && (
              <div className="pt-8 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FF6B00]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Audited Hardware Mentioned in this Blueprint
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {referencedProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-neutral-50 dark:bg-[#1D1F27] rounded-2xl border border-neutral-200/70 dark:border-neutral-800 p-4 flex items-center justify-between gap-3 hover:border-[#FF6B00] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#16171C] border border-[#E9E9E6] dark:border-[#272932] p-1.5 flex items-center justify-center shrink-0">
                          <SafeImage
                            src={prod.image}
                            alt={prod.name}
                            fallbackText={prod.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-[#111111] dark:text-white truncate">
                            {prod.name}
                          </h5>
                          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
                            {prod.shortBenefit}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectProduct(prod.slug)}
                        className="shrink-0 px-3 py-1.5 bg-[#111111] dark:bg-white hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] text-white dark:text-[#111111] dark:hover:text-white text-[11px] font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================
             LAYOUT 2: PANDUAN LANGKAH (STEP-BY-STEP FORMAT)
             ======================================================== */
          <div className="space-y-8">
            {/* If content is also provided, render it before the steps */}
            {guide.content && (
              <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-6 sm:p-8 shadow-xs">
                {renderDocumentProse(guide.content)}
              </div>
            )}

            {guide.steps && guide.steps.length > 0 && (
              <div className="space-y-8 pt-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                    {guide.hideStepNumbers ? 'Blueprint Sections' : 'Blueprint Walkthrough'}
                  </span>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-800 flex-1" />
                </div>

                <div className="space-y-8">
                  {guide.steps.map((step, idx) => {
                    const recProduct = getRecommendedProduct(step.recommendedProductSlug);
                    const hasStepImage = canShowContentImages && Boolean(step.image?.trim());
                    return (
                      <div
                        key={step.number || idx}
                        className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-6 sm:p-8 shadow-xs space-y-5"
                      >
                        <div className="flex items-start gap-4">
                          {!guide.hideStepNumbers && (
                            <span className="text-3xl sm:text-4xl font-extrabold text-[#FF6B00] font-mono shrink-0">
                              {String(step.number || idx + 1).padStart(2, '0')}
                            </span>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-[#111111] dark:text-white leading-tight">
                              {step.title}
                            </h3>
                            <p className="mt-2 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                              {step.text}
                            </p>
                          </div>
                        </div>

                        {/* Optional Step Photo: ONLY rendered if showContentImages is true AND image is present */}
                        {hasStepImage && (
                          <div className="rounded-2xl overflow-hidden aspect-16/9 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
                            <SafeImage
                              src={step.image}
                              alt={step.title}
                              fallbackText={step.title}
                              hideOnFallback={true}
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
