import React from 'react';
import { ArrowUpRight, ShieldCheck, Sparkles, CheckCircle2, Lock } from 'lucide-react';
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
    <footer className="bg-[#111111] text-white border-t border-neutral-800">
      {/* Top Editorial Banner */}
      <div className="border-b border-neutral-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-[#FF6B00]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Independent Curation</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Every accessory is selected strictly for spatial utility, build tolerance, and compact desk compatibility.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-[#FF6B00]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Zero Hard Selling</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  We focus entirely on product education and practical dimensions before you ever view live partner listings.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 text-[#FF6B00]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Smart Space Philosophy</h4>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
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
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" fill="#FF6B00"/>
                  <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                TechCheck
              </span>
            </div>
            <p className="text-sm text-neutral-400 max-w-sm leading-relaxed">
              Small space. Serious setup.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 text-neutral-300 border border-neutral-800">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                Curated for desks 80cm – 140cm
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-neutral-900 text-neutral-400 border border-neutral-800">
                Singapore & Regional Edition
              </span>
            </div>
          </div>

          {/* Navigation Col */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => handleNavClick({ page: 'home' })}
                  className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick({ page: 'recommendations' })}
                  className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Recommendations
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick({ page: 'categories' })}
                  className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavClick({ page: 'guides' })}
                  className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Guides
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Col */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              {(['Desk Setup', 'Cable Management', 'Audio', 'Storage', 'Lighting', 'Ergonomics'] as ProductCategory[]).map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Col */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onOpenInfoModal('about')}
                  className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  About TechCheck
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('disclosure')}
                  className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Affiliate Disclosure</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#FF6B00]/20 text-[#FF6B00] rounded">FTC</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoModal('contact')}
                  className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  Contact & Editorial
                </button>
              </li>
              {onReplaySplash && (
                <li>
                  <button
                    onClick={onReplaySplash}
                    className="text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer text-xs flex items-center gap-1 mt-1"
                  >
                    <span>▶ Putar Ulang Splash Screen</span>
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Box */}
        <div className="mt-12 pt-8 border-t border-neutral-800">
          <div className="bg-neutral-900/90 rounded-xl p-5 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-neutral-400 leading-relaxed max-w-4xl">
              <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px] block sm:inline mr-2">
                Affiliate Disclosure:
              </span>
              Some links on this website are affiliate links. We may earn a commission when you purchase through them, at no additional cost to you. TechCheck independently evaluates all products strictly based on physical dimensions, build quality, and spatial utility.
            </div>
            <button
              onClick={() => onOpenInfoModal('disclosure')}
              className="text-xs font-semibold text-[#FF6B00] hover:underline whitespace-nowrap cursor-pointer shrink-0"
            >
              Read full policy →
            </button>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
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
                className="text-neutral-700 hover:text-neutral-400 p-0.5 rounded transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 opacity-25 hover:opacity-90" />
              </button>
            </div>
            <p className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>Editorial Guidelines</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
