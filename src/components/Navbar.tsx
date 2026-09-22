import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ArrowUpRight, Sun, Moon } from 'lucide-react';
import { ViewRoute } from '../types';
import { useTheme } from '../services/theme';

interface NavbarProps {
  currentRoute: ViewRoute;
  onNavigate: (route: ViewRoute) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const { theme, toggleTheme, isDark } = useTheme();

  // Close mobile menu on ESC key or clicking outside
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        toggleBtnRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target as Node) &&
        toggleBtnRef.current &&
        !toggleBtnRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

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
    <header className="sticky top-0 z-40 bg-[#F7F6F2]/95 dark:bg-[#101115]/95 backdrop-blur-md border-b border-[#E9E9E6] dark:border-[#23252E] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => handleNavClick({ page: 'home' })}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-xl p-1 shrink-0"
            aria-label="TechCheck Home"
          >
            <div className="flex items-center justify-center transition-transform group-hover:scale-105">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" fill="#FF6B00"/>
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#111111] dark:text-white flex items-center transition-colors">
                TechCheck
              </span>
            </div>
          </button>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium" aria-label="Main Navigation">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick({ page: 'home' })}
              aria-current={isCurrent('home') ? 'page' : undefined}
              className={`transition-colors cursor-pointer py-1 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-md ${
                isCurrent('home')
                  ? 'text-[#FF6B00] font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white'
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
              aria-current={isCurrent('recommendations') ? 'page' : undefined}
              className={`transition-colors cursor-pointer py-1 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-md ${
                isCurrent('recommendations')
                  ? 'text-[#FF6B00] font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white'
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
              aria-current={isCurrent('categories') ? 'page' : undefined}
              className={`transition-colors cursor-pointer py-1 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-md ${
                isCurrent('categories')
                  ? 'text-[#FF6B00] font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white'
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
              aria-current={isCurrent('guides') ? 'page' : undefined}
              className={`transition-colors cursor-pointer py-1 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-md ${
                isCurrent('guides')
                  ? 'text-[#FF6B00] font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white'
              }`}
            >
              Guides
              {isCurrent('guides') && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Search Input Bar (No ⌘K badge, normal search look) */}
            <button
              id="nav-search-btn"
              onClick={onOpenSearch}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-600 dark:text-neutral-300 bg-white dark:bg-[#181920] border border-[#E9E9E6] dark:border-[#272933] hover:border-neutral-300 dark:hover:border-neutral-600 rounded-xl transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] w-56 lg:w-64"
              title="Search products, categories, or guides..."
              aria-label="Search products, categories, or guides"
            >
              <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
              <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate select-none font-normal">
                Search products, categories, or guides...
              </span>
            </button>

            {/* Theme Toggle (Day / Night Mode: ☀ / ☾) */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E9E9E6] dark:border-[#272933] bg-white dark:bg-[#181920] text-neutral-700 dark:text-neutral-200 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Explore Products Button */}
            <button
              id="nav-explore-btn"
              onClick={() => handleNavClick({ page: 'recommendations' })}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#111111] dark:bg-[#23252E] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] rounded-xl transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              id="mobile-theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 text-neutral-700 dark:text-neutral-200 hover:text-[#FF6B00] rounded-xl border border-[#E9E9E6] dark:border-[#282A33] bg-white dark:bg-[#181920] focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Mobile Search Button */}
            <button
              id="nav-mobile-search-btn"
              onClick={onOpenSearch}
              className="p-2 text-neutral-700 dark:text-neutral-200 hover:text-[#FF6B00] rounded-xl border border-[#E9E9E6] dark:border-[#282A33] bg-white dark:bg-[#181920] focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
              aria-label="Search products, categories, or guides"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              ref={toggleBtnRef}
              id="nav-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-700 dark:text-neutral-200 hover:text-[#FF6B00] rounded-xl border border-[#E9E9E6] dark:border-[#282A33] bg-white dark:bg-[#181920] focus-visible:ring-2 focus-visible:ring-[#FF6B00] cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          id="mobile-nav-menu"
          role="region"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[#E9E9E6] dark:border-[#23252E] bg-[#F7F6F2] dark:bg-[#101115] px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150 transition-colors"
        >
          <button
            id="mobile-nav-home"
            onClick={() => handleNavClick({ page: 'home' })}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between cursor-pointer ${
              isCurrent('home')
                ? 'bg-white dark:bg-[#1C1E26] text-[#FF6B00] font-semibold shadow-xs'
                : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#181920]'
            }`}
          >
            <span>Home</span>
          </button>

          <button
            id="mobile-nav-recommendations"
            onClick={() => handleNavClick({ page: 'recommendations' })}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between cursor-pointer ${
              isCurrent('recommendations')
                ? 'bg-white dark:bg-[#1C1E26] text-[#FF6B00] font-semibold shadow-xs'
                : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#181920]'
            }`}
          >
            <span>Recommendations</span>
          </button>

          <button
            id="mobile-nav-categories"
            onClick={() => handleNavClick({ page: 'categories' })}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between cursor-pointer ${
              isCurrent('categories')
                ? 'bg-white dark:bg-[#1C1E26] text-[#FF6B00] font-semibold shadow-xs'
                : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#181920]'
            }`}
          >
            <span>Categories</span>
          </button>

          <button
            id="mobile-nav-guides"
            onClick={() => handleNavClick({ page: 'guides' })}
            className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between cursor-pointer ${
              isCurrent('guides')
                ? 'bg-white dark:bg-[#1C1E26] text-[#FF6B00] font-semibold shadow-xs'
                : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#181920]'
            }`}
          >
            <span>Guides</span>
          </button>

          <div className="pt-2">
            <button
              id="mobile-nav-cta"
              onClick={() => handleNavClick({ page: 'recommendations' })}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
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
