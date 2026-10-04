import React, { useState, useMemo, useEffect } from 'react';
import { BookOpen, ArrowRight, Clock, Search, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Guide } from '../types';
import { SafeImage } from '../components/SafeImage';
import { analytics } from '../services/analytics';
import { updateSEO, buildBreadcrumbSchema } from '../services/seo';
import { useVisualEditor } from '../contexts/VisualEditorContext';
import { EditableElement } from '../components/visual-editor/EditableElement';

interface GuidesPageProps {
  guides: Guide[];
  onSelectGuide: (slug: string) => void;
}

export const GuidesPage: React.FC<GuidesPageProps> = ({ guides, onSelectGuide }) => {
  const visualEditor = useVisualEditor();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    updateSEO({
      title: 'Setup & Ergonomics Guides | TechCheck Spatial Blueprint',
      description: 'Step-by-step guides on compact desk optimization: monitor arm clearance, under-desk cable routing, and screenbar ergonomics.',
      canonicalPath: 'guides',
      ogType: 'website',
      jsonLd: buildBreadcrumbSchema([
        { name: 'Home', path: '' },
        { name: 'Guides', path: 'guides' },
      ]),
    });
    analytics.track('page_view', { page: 'guides' });
    return () => {
      document.title = 'TechCheck — Small Space. Serious Setup.';
    };
  }, []);

  const guideCategories = useMemo(() => {
    const set = new Set<string>();
    guides.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return ['All', ...Array.from(set)];
  }, [guides]);

  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      if (selectedCategory !== 'All' && g.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = g.title.toLowerCase().includes(q);
        const matchExcerpt = g.excerpt.toLowerCase().includes(q);
        const matchCategory = g.category.toLowerCase().includes(q);
        if (!matchTitle && !matchExcerpt && !matchCategory) return false;
      }
      return true;
    });
  }, [guides, selectedCategory, searchQuery]);

  const featuredGuide = filteredGuides[0];
  const regularGuides = filteredGuides.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
          Setup Engineering & Blueprints
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] dark:text-white tracking-tight transition-colors">
          Guides & Blueprints
        </h1>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed transition-colors">
          Step-by-step spatial blueprints to eliminate clutter, optimize monitor float ergonomics, and organize cables on desks from 80 cm to 140 cm.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#E9E9E6] dark:border-[#272932] pb-6">
        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {guideCategories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#111111] dark:bg-white text-white dark:text-[#111111] shadow-xs'
                    : 'bg-white dark:bg-[#16171C] text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1D1F27] border border-neutral-200/80 dark:border-neutral-800'
                }`}
              >
                {cat === 'All' ? 'All Guides' : cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-[#1D1F27] border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:outline-none focus:border-[#FF6B00] text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Guide Banner (Large Rounded-3xl Card) */}
      {featuredGuide && (
        <EditableElement
          isEditMode={visualEditor.isVisualEditMode}
          label={`Featured Guide: ${featuredGuide.title}`}
          onEdit={() =>
            visualEditor.openEditor({
              type: 'guide',
              title: `Edit Guide: ${featuredGuide.title}`,
              data: featuredGuide,
            })
          }
        >
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => onSelectGuide(featuredGuide.slug)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSelectGuide(featuredGuide.slug);
            }}
            tabIndex={0}
            role="button"
            aria-label={`Read featured guide: ${featuredGuide.title}`}
            className="group bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-md overflow-hidden cursor-pointer grid grid-cols-1 lg:grid-cols-12 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
          >
            <div className="lg:col-span-7 aspect-16/10 lg:aspect-auto overflow-hidden bg-neutral-100 dark:bg-[#1C1E25] relative">
              <SafeImage
                src={featuredGuide.image}
                alt={featuredGuide.title}
                fallbackText={featuredGuide.title}
                className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
                loading="eager"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-xl text-xs font-bold tracking-wider uppercase bg-[#FF6B00] text-white shadow-xs">
                  Featured Blueprint
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 p-7 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold mb-3">
                  <span className="uppercase tracking-wider text-[#FF6B00]">
                    {featuredGuide.category}
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {featuredGuide.readTime}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-tight">
                  {featuredGuide.title}
                </h2>

                <p className="mt-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  {featuredGuide.excerpt}
                </p>

                {featuredGuide.steps && featuredGuide.steps.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Inside this blueprint:
                    </span>
                    <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1">
                      {featuredGuide.steps.slice(0, 3).map((st, i) => (
                        <li key={st.number || i} className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                          <span className="truncate">{st.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  Published {featuredGuide.publishDate}
                </span>
                <span className="text-sm font-bold text-[#111111] dark:text-white group-hover:text-[#FF6B00] transition-colors flex items-center gap-1.5">
                  <span>Read Blueprint</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </motion.div>
        </EditableElement>
      )}

      {/* Grid of Other Guides in Rounded-3xl Cards */}
      {regularGuides.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularGuides.map((guide) => (
            <EditableElement
              key={guide.id}
              isEditMode={visualEditor.isVisualEditMode}
              label={`Guide: ${guide.title}`}
              onEdit={() =>
                visualEditor.openEditor({
                  type: 'guide',
                  title: `Edit Guide: ${guide.title}`,
                  data: guide,
                })
              }
            >
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectGuide(guide.slug)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onSelectGuide(guide.slug);
                }}
                tabIndex={0}
                role="button"
                aria-label={`Read guide: ${guide.title}`}
                className="group bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] hover:border-[#FF6B00] dark:hover:border-[#FF6B00] shadow-xs hover:shadow-xl transition-all overflow-hidden cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] h-full"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-neutral-100 dark:bg-[#1C1E25]">
                  <SafeImage
                    src={guide.image}
                    alt={guide.title}
                    fallbackText={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white">
                      {guide.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 dark:text-neutral-500 mb-2.5">
                      <span>{guide.readTime}</span>
                      <span>•</span>
                      <span>{guide.publishDate}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#111111] dark:text-white group-hover:text-[#FF6B00] transition-colors leading-snug line-clamp-2">
                      {guide.title}
                    </h3>

                    <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-[#FF6B00]">
                    <span>Read Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </EditableElement>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredGuides.length === 0 && (
        <div className="bg-white dark:bg-[#16171C] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center mx-auto text-[#FF6B00]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#111111] dark:text-white mt-4">
            No guides match your search
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="mt-6 px-5 py-2.5 text-xs font-semibold text-white bg-[#111111] dark:bg-white dark:text-[#111111] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] dark:hover:text-white rounded-2xl transition-all cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
