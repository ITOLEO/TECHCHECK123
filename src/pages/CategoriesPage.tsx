import React from 'react';
import { ArrowUpRight, Layers, ShieldCheck } from 'lucide-react';
import { CategoryInfo, ViewRoute, ProductCategory } from '../types';

interface CategoriesPageProps {
  categories: CategoryInfo[];
  onNavigate: (route: ViewRoute) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ categories, onNavigate }) => {
  const handleSelectCategory = (name: ProductCategory) => {
    onNavigate({ page: 'recommendations', categoryFilter: name });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-2">
          Setup Taxonomy
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#111111] tracking-tight">
          Product Categories
        </h1>
        <p className="mt-3 text-base text-neutral-600 leading-relaxed">
          Browse space-saving hardware organized by functional workspace challenge. Every category is curated for compact setups between 80 cm and 140 cm.
        </p>
      </div>

      {/* Grid of Categories */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleSelectCategory(cat.name)}
              className="group bg-white rounded-2xl border border-[#E9E9E6] hover:border-neutral-300 shadow-xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-16/10 overflow-hidden bg-neutral-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                  <span className="text-xs font-semibold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">
                    {cat.productCount} Curated Accessories
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                    Reclaims Space
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-7">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#111111] group-hover:text-[#FF6B00] transition-colors">
                    {cat.name}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-700 group-hover:bg-[#FF6B00] group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E9E9E6] p-12 text-center text-neutral-500 text-sm">
          Belum ada kategori yang ditambahkan.
        </div>
      )}
    </div>
  );
};
