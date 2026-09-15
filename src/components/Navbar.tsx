import React, { useState } from 'react';
import { Search, Menu, X, ArrowUpRight, Monitor, Layers } from 'lucide-react';
import { ViewRoute, ProductCategory } from '../types';

interface NavbarProps {
  currentRoute: ViewRoute;
  onNavigate: (route: ViewRoute) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCurrent = (page: string, category?: string) => {
    if (page === 'home' && currentRoute.page === 'home') return true;
    if (page === 'recommendations') {
      if (currentRoute.page === 'recommendations' && !category) return true;
      if (currentRoute.page === 'recommendations' && currentRoute.categoryFilter === category) return true;
    }
    if (page === 'categories' && currentRoute.page === 'categories') return true;
    if (page === 'guides' && (currentRoute.page === 'guides' || currentRoute.page === 'guide-detail')) return true;
    if (page === 'superadmin' && currentRoute.page === 'superadmin') return true;
    return false;
  };

  const handleNavClick = (route: ViewRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F6F2]/95 backdrop-blur-md border-b border-[#E9E9E6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick({ page: 'home' })}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" fill="#FF6B00"/>
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#111111] flex items-center">
                TechCheck
              </span>
            </div>
          </button>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick({ page: 'home' })}
              className={`transition-colors cursor-pointer py-1 relative ${
                isCurrent('home')
                  ? 'text-[#FF6B00] font-semibold'
                  : 'text-neutral-700 hover:text-[#111111]'
              }`}
            >
              Home
              {isCurrent('home') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
              )}
            </button>

            <button
              id="nav-link-recommendations"
              onClick={() => handleNavClick({ page: 'recommendations' })}
              className={`transition-colors cursor-pointer py-1 relative ${
                isCurrent('recommendations')
                  ? 'text-[#FF6B00] font-semibold'
                  : 'text-neutral-700 hover:text-[#111111]'
              }`}
            >
              Recommendations
              {isCurrent('recommendations') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
              )}
            </button>

            <button
              id="nav-link-categories"
              onClick={() => handleNavClick({ page: 'categories' })}
              className={`transition-colors cursor-pointer py-1 relative ${
                isCurrent('categories')
                  ? 'text-[#FF6B00] font-semibold'
                  : 'text-neutral-700 hover:text-[#111111]'
              }`}
            >
              Categories
              {isCurrent('categories') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
              )}
            </button>

            <button
              id="nav-link-guides"
              onClick={() => handleNavClick({ page: 'guides' })}
              className={`transition-colors cursor-pointer py-1 relative ${
                isCurrent('guides')
                  ? 'text-[#FF6B00] font-semibold'
                  : 'text-neutral-700 hover:text-[#111111]'
              }`}
            >
              Guides
              {isCurrent('guides') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              id="nav-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3.5 py-2 text-sm text-neutral-600 hover:text-[#111111] bg-white border border-[#E9E9E6] hover:border-neutral-300 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Search products and guides"
            >
              <Search className="w-4 h-4 text-neutral-500" />
              <span className="text-xs text-neutral-500 font-medium">Search gear...</span>
              <kbd className="hidden lg:inline-block text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200">
                ⌘K
              </kbd>
            </button>

            <button
              id="nav-explore-btn"
              onClick={() => handleNavClick({ page: 'recommendations' })}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#111111] hover:bg-[#FF6B00] rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <span>Explore Products</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="nav-mobile-search-btn"
              onClick={onOpenSearch}
              className="p-2 text-neutral-700 hover:text-[#111111] rounded-lg border border-[#E9E9E6] bg-white"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              id="nav-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 hover:text-[#111111] rounded-lg border border-[#E9E9E6] bg-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E9E9E6] bg-[#F7F6F2] px-4 pt-3 pb-6 space-y-2">
          <button
            id="mobile-nav-home"
            onClick={() => handleNavClick({ page: 'home' })}
            className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
              isCurrent('home')
                ? 'bg-white text-[#FF6B00] font-semibold shadow-xs'
                : 'text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <span>Home</span>
          </button>

          <button
            id="mobile-nav-recommendations"
            onClick={() => handleNavClick({ page: 'recommendations' })}
            className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
              isCurrent('recommendations')
                ? 'bg-white text-[#FF6B00] font-semibold shadow-xs'
                : 'text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <span>Recommendations</span>
          </button>

          <button
            id="mobile-nav-categories"
            onClick={() => handleNavClick({ page: 'categories' })}
            className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
              isCurrent('categories')
                ? 'bg-white text-[#FF6B00] font-semibold shadow-xs'
                : 'text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <span>Categories</span>
          </button>

          <button
            id="mobile-nav-guides"
            onClick={() => handleNavClick({ page: 'guides' })}
            className={`w-full text-left px-4 py-3 rounded-lg text-base font-medium flex items-center justify-between ${
              isCurrent('guides')
                ? 'bg-white text-[#FF6B00] font-semibold shadow-xs'
                : 'text-neutral-800 hover:bg-neutral-100'
            }`}
          >
            <span>Guides</span>
          </button>

          <div className="pt-2">
            <button
              id="mobile-nav-cta"
              onClick={() => handleNavClick({ page: 'recommendations' })}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FF6B00] text-white font-semibold rounded-lg shadow-sm"
            >
              <span>Explore Products</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
