import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, ArrowUpRight, Sun, Moon, ChevronDown, FolderTree, ArrowRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewRoute, CategoryInfo } from '../types';
import { useTheme } from '../services/theme';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/products';

interface NavbarProps {
  currentRoute: ViewRoute;
  categories?: CategoryInfo[];
  onNavigate: (route: ViewRoute) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  categories = DEFAULT_CATEGORIES,
  onNavigate,
  onOpenSearch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const categoriesDropdownRef = useRef<HTMLDivElement>(null);
  const { toggleTheme, isDark } = useTheme();

  // Close menus on ESC key or clicking outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setCategoriesDropdownOpen(false);
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

      if (
        categoriesDropdownRef.current &&
        !categoriesDropdownRef.current.contains(e.target as Node)
      ) {
        setCategoriesDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setCategoriesDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (categoryName: string) => {
    onNavigate({ page: 'recommendations', categoryFilter: categoryName });
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center transition-transform"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" fill="#FF6B00" />
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-[#111111] dark:text-white flex items-center transition-colors">
                TechCheck
              </span>
            </div>
          </button>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium" aria-label="Main Navigation">
            {/* Home Link */}
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
              <span>Home</span>
              {isCurrent('home') && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Recommendations Link */}
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
              <span>Recommendations</span>
              {isCurrent('recommendations') && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* CATEGORIES DROPDOWN MENU */}
            <div
              className="relative"
              ref={categoriesDropdownRef}
              onMouseEnter={() => setCategoriesDropdownOpen(true)}
              onMouseLeave={() => setCategoriesDropdownOpen(false)}
            >
              <button
                id="nav-link-categories-dropdown"
                onClick={() => setCategoriesDropdownOpen((prev) => !prev)}
                aria-expanded={categoriesDropdownOpen}
                aria-haspopup="true"
                className={`transition-colors cursor-pointer py-1 relative flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] rounded-md ${
                  isCurrent('categories') || categoriesDropdownOpen
                    ? 'text-[#FF6B00] font-semibold'
                    : 'text-neutral-700 dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    categoriesDropdownOpen ? 'rotate-180 text-[#FF6B00]' : 'opacity-60'
                  }`}
                />
                {isCurrent('categories') && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Animated Floating Dropdown Card */}
              <AnimatePresence>
                {categoriesDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[520px] bg-white dark:bg-[#16171C] rounded-2xl border border-[#E9E9E6] dark:border-[#272932] shadow-2xl p-4 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-2 pb-2.5 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>Hardware Categories</span>
                      </span>
                      <button
                        onClick={() => handleNavClick({ page: 'categories' })}
                        className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>View Taxonomy</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <button
                          key={cat.id || cat.name}
                          onClick={() => handleCategorySelect(cat.name)}
                          className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-[#1D1F27] border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-all text-left group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/80 flex items-center justify-center shrink-0 text-[#FF6B00] mt-0.5">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#111111] dark:text-neutral-100 group-hover:text-[#FF6B00] transition-colors truncate">
                              {cat.name}
                            </h4>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 leading-normal">
                              {cat.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Bottom CTA Bar in Dropdown */}
                    <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between px-2 text-xs">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Curated for desks 80cm - 140cm
                      </span>
                      <button
                        onClick={() => handleNavClick({ page: 'categories' })}
                        className="px-3 py-1.5 rounded-lg bg-[#111111] dark:bg-white text-white dark:text-[#111111] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] dark:hover:text-white font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        All Categories →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Guides Link */}
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
              <span>Guides</span>
              {isCurrent('guides') && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B00] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Search Input Bar */}
            <motion.button
              whileTap={{ scale: 0.98 }}
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
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-[#E9E9E6] dark:border-[#272933] bg-white dark:bg-[#181920] text-neutral-700 dark:text-neutral-200 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] hover:border-neutral-300 dark:hover:border-neutral-600 transition-all shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-600" />
              )}
            </motion.button>

            {/* Explore Products Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              id="nav-explore-btn"
              onClick={() => handleNavClick({ page: 'recommendations' })}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#111111] dark:bg-[#23252E] hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] rounded-xl transition-colors shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
            >
              <span>Explore</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            ref={mobileMenuRef}
            id="mobile-nav-menu"
            role="region"
            aria-label="Mobile Navigation"
            className="md:hidden border-t border-[#E9E9E6] dark:border-[#23252E] bg-[#F7F6F2] dark:bg-[#101115] px-4 pt-3 pb-6 space-y-2 overflow-hidden transition-colors"
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

            {/* Mobile Expandable Categories Accordion */}
            <div className="space-y-1">
              <button
                id="mobile-nav-categories"
                onClick={() => {
                  setMobileCategoriesOpen(!mobileCategoriesOpen);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center justify-between cursor-pointer ${
                  isCurrent('categories')
                    ? 'bg-white dark:bg-[#1C1E26] text-[#FF6B00] font-semibold shadow-xs'
                    : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#181920]'
                }`}
              >
                <span>Categories</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileCategoriesOpen ? 'rotate-180 text-[#FF6B00]' : 'opacity-60'
                  }`}
                />
              </button>

              {mobileCategoriesOpen && (
                <div className="pl-4 pr-2 py-1 space-y-1 bg-white/50 dark:bg-black/20 rounded-xl">
                  {categories.map((cat) => (
                    <button
                      key={cat.id || cat.name}
                      onClick={() => handleCategorySelect(cat.name)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-[#FF6B00] flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="w-3 h-3 text-neutral-400" />
                    </button>
                  ))}
                  <button
                    onClick={() => handleNavClick({ page: 'categories' })}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[#FF6B00] hover:underline flex items-center justify-between cursor-pointer pt-1"
                  >
                    <span>View All Categories</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

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
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
