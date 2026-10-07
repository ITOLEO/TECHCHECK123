import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { ViewRoute, ProductCategory } from '../types';

interface FooterProps {
  onNavigate: (route: ViewRoute) => void;
  onOpenInfoModal: (type: 'about' | 'disclosure' | 'contact') => void;
  onReplaySplash?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenInfoModal, onReplaySplash }) => {
  const handleCategoryClick = (category: ProductCategory) => {
    onNavigate({ page: 'recommendations', categoryFilter: category });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (route: ViewRoute) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-900">
      {/* Top Editorial Banner */}
      <div className="border-b border-zinc-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-[#FF6B00]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Independent Curation</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Every accessory is selected strictly for spatial utility, build tolerance, and compact desk compatibility.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-[#FF6B00]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Zero Hard Selling</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  We focus entirely on product education and practical dimensions before you ever view live partner listings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-[#FF6B00]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Smart Space Philosophy</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  You don't need a massive commercial office desk to build an organized, distraction-free gaming environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" fill="#FF6B00" />
                  <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                TechCheck
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed">
              Small space. Serious setup.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 text-zinc-300 border border-zinc-800">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                Curated for desks 80cm – 140cm
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                Singapore & Regional Edition
              </span>
            </div>
          </div>

          {/* Navigation Col */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => handleNavClick({ page: 'home' })}
                  className="text-zinc-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick({ page: 'recommendations' })}
                  className="text-zinc-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Recommendations
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick({ page: 'categories' })}
                  className="text-zinc-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick({ page: 'guides' })}
                  className="text-zinc-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Col */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Categories
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {(['Desk Setup', 'Cable Management', 'Audio', 'Storage', 'Lighting', 'Ergonomics'] as ProductCategory[]).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className="text-zinc-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Col */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Company
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => onOpenInfoModal('about')}
                  className="text-zinc-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  About TechCheck
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('disclosure')}
                  className="text-zinc-400 hover:text-[#FF6B00] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Affiliate Disclosure</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#FF6B00]/20 text-[#FF6B00] rounded-md font-bold">FTC</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('contact')}
                  className="text-zinc-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Contact & Editorial
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div className="mt-12 pt-8 border-t border-zinc-900">
          <div className="bg-zinc-900/90 rounded-3xl p-6 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
              <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] block sm:inline mr-2">
                Affiliate Disclosure:
              </span>
              Some links on this website are affiliate links. We may earn a commission when you purchase through them, at no additional cost to you. TechCheck independently evaluates all products strictly based on physical dimensions, build quality, and spatial utility.
            </div>
            <button
              onClick={() => onOpenInfoModal('disclosure')}
              className="text-xs font-bold text-[#FF6B00] hover:underline whitespace-nowrap cursor-pointer shrink-0"
            >
              Read full policy →
            </button>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
            <div className="flex items-center gap-2">
              <p
                onDoubleClick={() => onNavigate({ page: 'superadmin' })}
                title="Double-click to access admintechcheck"
                className="select-none cursor-default"
              >
                © {new Date().getFullYear()} TechCheck Media. All rights reserved. English edition.
              </p>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'superadmin' })}
                title="Portal admintechcheck"
                aria-label="Portal admintechcheck"
                className="text-zinc-600 hover:text-zinc-300 p-0.5 rounded transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 opacity-30 hover:opacity-90" />
              </button>
            </div>
            <p className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms of Service</span>
              <span>·</span>
              <span>Editorial Guidelines</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
