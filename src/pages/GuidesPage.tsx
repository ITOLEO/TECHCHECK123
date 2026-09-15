import React, { useState, useMemo } from 'react';
import { BookOpen, ArrowRight, Clock, Calendar, User, Search, X } from 'lucide-react';
import { Guide } from '../types';

interface GuidesPageProps {
  guides: Guide[];
  onSelectGuide: (slug: string) => void;
}

export const GuidesPage: React.FC<GuidesPageProps> = ({ guides, onSelectGuide }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All',
    'Setup',
    'Buying Guides',
    'Cable Management',
    'Desk Organization',
  ];

  const featuredGuide = guides.find((g) => g.featured) || guides[0];

  const filteredGuides = useMemo(() => {
    return guides.filter((guide) => {
      if (selectedCategory !== 'All' && guide.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          guide.title.toLowerCase().includes(q) ||
          guide.excerpt.toLowerCase().includes(q) ||
          guide.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [guides, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
          Setup Architecture & Tutorials
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
          Guides for Better Setups.
        </h1>
        <p className="mt-3 text-base text-neutral-600 leading-relaxed">
          Practical ideas, mathematical spatial breakdowns, and blueprints for building a cleaner, smarter gaming setup with less space.
        </p>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#E9E9E6] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-[#E9E9E6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides & tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-[#E9E9E6] rounded-xl focus:outline-none focus:border-neutral-400 text-neutral-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Guide Banner (Large) */}
      {selectedCategory === 'All' && !searchQuery && featuredGuide && (
        <div
          onClick={() => onSelectGuide(featuredGuide.slug)}
          className="group bg-white rounded-3xl border border-[#E9E9E6] hover:border-neutral-300 shadow-md overflow-hidden cursor-pointer grid grid-cols-1 lg:grid-cols-12 transition-all"
        >
          <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-[420px] overflow-hidden bg-neutral-900">
            <img
              src={featuredGuide.image}
              alt={featuredGuide.title}
              className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase bg-[#FF6B00] text-white">
                Featured Cover Story
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3 font-medium">
                <span className="font-bold uppercase tracking-wider text-[#FF6B00]">
                  {featuredGuide.category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredGuide.readTime}
                </span>
                <span>•</span>
                <span>{featuredGuide.publishDate}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] group-hover:text-[#FF6B00] transition-colors leading-tight">
                {featuredGuide.title}
              </h2>

              <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                {featuredGuide.excerpt}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={featuredGuide.author.avatar}
                  alt={featuredGuide.author.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">
                    {featuredGuide.author.name}
                  </span>
                  <span className="text-[10px] text-neutral-500 block">
                    {featuredGuide.author.role}
                  </span>
                </div>
              </div>

              <span className="text-sm font-bold text-[#111111] group-hover:text-[#FF6B00] transition-colors flex items-center gap-1.5">
                <span>Read Guide</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Article Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#111111]">
            {selectedCategory === 'All' ? 'All Editorial Articles' : `${selectedCategory} Articles`}
          </h2>
          <span className="text-xs text-neutral-500">
            {filteredGuides.length} articles available
          </span>
        </div>

        {filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                onClick={() => onSelectGuide(guide.slug)}
                className="group bg-white rounded-2xl border border-[#E9E9E6] hover:border-neutral-300 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-16/10 overflow-hidden bg-neutral-100 relative">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs">
                      {guide.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-2 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {guide.readTime}
                      </span>
                      <span>•</span>
                      <span>{guide.publishDate}</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#111111] group-hover:text-[#FF6B00] transition-colors leading-snug">
                      {guide.title}
                    </h3>

                    <p className="mt-2.5 text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {guide.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-[#111111] group-hover:text-[#FF6B00]">
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E9E9E6] p-12 text-center text-neutral-500 text-sm">
            {searchQuery
              ? `Tidak ada panduan yang cocok dengan pencarian "${searchQuery}".`
              : 'Belum ada artikel panduan yang ditambahkan.'}
          </div>
        )}
      </div>
    </div>
  );
};
