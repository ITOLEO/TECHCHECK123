import React, { useState, useEffect } from 'react';
import { ViewRoute, Product, CategoryInfo, Guide, SiteSettings } from './types';
import { dataStorage } from './services/dataStorage';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AffiliateModal } from './components/AffiliateModal';
import { InfoModal } from './components/InfoModals';
import { SplashScreen } from './components/SplashScreen';

import { HomePage } from './pages/HomePage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { GuidesPage } from './pages/GuidesPage';
import { GuideDetailPage } from './pages/GuideDetailPage';
import { SuperAdminPage } from './pages/SuperAdminPage';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>({ page: 'home' });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    // If opening directly on admin route, let the admin security splash screen handle it
    const path = (window.location.pathname || '').toLowerCase();
    const hash = (window.location.hash || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();
    return !(
      path.includes('admintechcheck') ||
      path.includes('admindtechcheck') ||
      hash.includes('admintechcheck') ||
      hash.includes('admindtechcheck') ||
      search.includes('admintechcheck') ||
      search.includes('admindtechcheck')
    );
  });
  const [affiliateProduct, setAffiliateProduct] = useState<Product | null>(null);
  const [infoModalType, setInfoModalType] = useState<'about' | 'disclosure' | 'contact' | null>(null);

  // Dynamic state loaded and managed via dataStorage (localStorage with defaults)
  const [products, setProducts] = useState<Product[]>(() => dataStorage.getProducts());
  const [categories, setCategories] = useState<CategoryInfo[]>(() => dataStorage.getCategories());
  const [guides, setGuides] = useState<Guide[]>(() => dataStorage.getGuides());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => dataStorage.getSiteSettings());

  // Connect to remote Supabase sync on mount
  useEffect(() => {
    const unsubscribe = dataStorage.subscribeRemoteUpdates((data) => {
      if (data.products && data.products.length > 0) setProducts(data.products);
      if (data.categories && data.categories.length > 0) setCategories(data.categories);
      if (data.guides && data.guides.length > 0) setGuides(data.guides);
      if (data.settings) setSiteSettings(data.settings);
    });

    // Attempt initial remote fetch from Supabase
    dataStorage.fetchRemoteData();

    return () => {
      unsubscribe();
    };
  }, []);

  // Parse URL pathname, hash, & query on mount and listen to navigation changes
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      const href = (window.location.href || '').toLowerCase();

      // Check if accessing dedicated admin URL (/admintechcheck, /admindtechcheck, /superadmind, /superadmin, /admin, etc.)
      const isAdminTarget =
        pathname.includes('admintechcheck') ||
        pathname.includes('admindtechcheck') ||
        pathname.includes('superadmind') ||
        pathname.includes('superadmin') ||
        hash.includes('admintechcheck') ||
        hash.includes('admindtechcheck') ||
        hash.includes('superadmind') ||
        hash.includes('superadmin') ||
        search.includes('admintechcheck') ||
        search.includes('admindtechcheck') ||
        search.includes('superadmind') ||
        search.includes('superadmin') ||
        href.includes('admintechcheck') ||
        href.includes('admindtechcheck') ||
        href.includes('superadmind');

      if (isAdminTarget) {
        setCurrentRoute({ page: 'superadmin' });
        return;
      }

      // Check other routes based on hash (or fallback to pathname)
      const cleanHash = hash.replace(/^#\/?/, '');
      const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
      const hashParts = cleanHash.split('/').filter(Boolean);
      const pathParts = cleanPath.split('/').filter(Boolean);
      const parts = hashParts.length > 0 ? hashParts : pathParts;

      if (parts.length === 0) {
        setCurrentRoute({ page: 'home' });
      } else if (parts[0] === 'recommendations') {
        if (parts[1]) {
          setCurrentRoute({ page: 'product-detail', slug: parts[1] });
        } else {
          setCurrentRoute({ page: 'recommendations' });
        }
      } else if (parts[0] === 'categories') {
        if (parts[1]) {
          const matched = categories.find((c) => c.slug === parts[1]);
          setCurrentRoute({
            page: 'recommendations',
            categoryFilter: matched ? matched.name : 'All',
          });
        } else {
          setCurrentRoute({ page: 'categories' });
        }
      } else if (parts[0] === 'guides') {
        if (parts[1]) {
          setCurrentRoute({ page: 'guide-detail', slug: parts[1] });
        } else {
          setCurrentRoute({ page: 'guides' });
        }
      } else {
        setCurrentRoute({ page: 'home' });
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    // Global keyboard shortcut to access admintechcheck (Ctrl+Shift+A or typing "admin")
    let keyBuffer = '';
    let bufferTimer: any;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Shortcut: Ctrl + Shift + A or Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate({ page: 'superadmin' });
        return;
      }

      // Sequence buffer when not typing in form inputs
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) {
        return;
      }

      if (e.key && e.key.length === 1) {
        keyBuffer += e.key.toLowerCase();
        clearTimeout(bufferTimer);
        bufferTimer = setTimeout(() => {
          keyBuffer = '';
        }, 1500);

        if (
          keyBuffer.includes('admintechcheck') ||
          keyBuffer.includes('admindtechcheck') ||
          keyBuffer.endsWith('admin') ||
          keyBuffer.endsWith('superadmin')
        ) {
          keyBuffer = '';
          navigate({ page: 'superadmin' });
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('keydown', handleGlobalKeyDown);
      clearTimeout(bufferTimer);
    };
  }, [categories]);

  // Update URL when navigating
  const navigate = (route: ViewRoute) => {
    setCurrentRoute(route);

    if (route.page === 'superadmin') {
      try {
        window.history.pushState(null, '', '/admintechcheck');
      } catch {
        // Fallback for sandboxed iframe environments
      }
      window.location.hash = '#/admintechcheck';
    } else {
      // If currently on /admintechcheck or legacy admin URLs, reset path to root
      const currentPath = window.location.pathname.toLowerCase();
      if (
        currentPath.includes('admintechcheck') ||
        currentPath.includes('admindtechcheck') ||
        currentPath.includes('superadmind') ||
        currentPath.includes('superadmin')
      ) {
        try {
          window.history.pushState(null, '', '/');
        } catch {
          // ignore
        }
      }

      let hash = '';
      if (route.page === 'home') {
        hash = '';
      } else if (route.page === 'recommendations') {
        hash =
          route.categoryFilter && route.categoryFilter !== 'All'
            ? `recommendations?category=${encodeURIComponent(route.categoryFilter)}`
            : 'recommendations';
      } else if (route.page === 'product-detail') {
        hash = `recommendations/${route.slug}`;
      } else if (route.page === 'categories') {
        hash = 'categories';
      } else if (route.page === 'guides') {
        hash = 'guides';
      } else if (route.page === 'guide-detail') {
        hash = `guides/${route.slug}`;
      }
      window.location.hash = hash ? `#/${hash}` : '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (slug: string) => {
    navigate({ page: 'product-detail', slug });
  };

  const handleSelectGuide = (slug: string) => {
    navigate({ page: 'guide-detail', slug });
  };

  const isSuperadminView = currentRoute.page === 'superadmin';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#111111] antialiased">
      {/* Optional Top Announcement Bar */}
      {siteSettings.announcementEnabled && siteSettings.announcementText && !isSuperadminView && (
        <div className="bg-[#111111] text-white text-xs font-semibold py-2.5 px-4 text-center flex items-center justify-center gap-2 border-b border-neutral-800">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse shrink-0" />
          <span>{siteSettings.announcementText}</span>
          {siteSettings.announcementLink && (
            <a
              href={siteSettings.announcementLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF6B00] hover:underline font-bold ml-1"
            >
              Lihat →
            </a>
          )}
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentRoute.page === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            guides={guides}
            siteSettings={siteSettings}
            onNavigate={navigate}
            onSelectProduct={handleSelectProduct}
            onSelectGuide={handleSelectGuide}
          />
        )}

        {currentRoute.page === 'recommendations' && (
          <RecommendationsPage
            products={products}
            initialCategory={currentRoute.categoryFilter || 'All'}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {currentRoute.page === 'product-detail' && (() => {
          const product = products.find((p) => p.slug === currentRoute.slug) || products[0];
          return (
            <ProductDetailPage
              product={product}
              allProducts={products}
              onNavigate={navigate}
              onSelectProduct={handleSelectProduct}
              onOpenAffiliateModal={(prod) => setAffiliateProduct(prod)}
            />
          );
        })()}

        {currentRoute.page === 'categories' && (
          <CategoriesPage
            categories={categories}
            onNavigate={navigate}
          />
        )}

        {currentRoute.page === 'guides' && (
          <GuidesPage
            guides={guides}
            onSelectGuide={handleSelectGuide}
          />
        )}

        {currentRoute.page === 'guide-detail' && (() => {
          const guide = guides.find((g) => g.slug === currentRoute.slug) || guides[0];
          return (
            <GuideDetailPage
              guide={guide}
              allGuides={guides}
              allProducts={products}
              onNavigate={navigate}
              onSelectProduct={handleSelectProduct}
              onSelectGuide={handleSelectGuide}
            />
          );
        })()}

        {currentRoute.page === 'superadmin' && (
          <SuperAdminPage
            products={products}
            categories={categories}
            guides={guides}
            siteSettings={siteSettings}
            onUpdateProducts={(prods) => setProducts(prods)}
            onUpdateCategories={(cats) => setCategories(cats)}
            onUpdateGuides={(g) => setGuides(g)}
            onUpdateSettings={(s) => setSiteSettings(s)}
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigate}
        onOpenInfoModal={(type) => setInfoModalType(type)}
        onReplaySplash={() => setShowSplash(true)}
      />

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
        products={products}
        guides={guides}
      />

      <AffiliateModal
        product={affiliateProduct}
        isOpen={!!affiliateProduct}
        onClose={() => setAffiliateProduct(null)}
      />

      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />

      {/* Brand Splash Screen on Initial Load */}
      {showSplash && (
        <SplashScreen
          durationMs={2200}
          onComplete={() => setShowSplash(false)}
        />
      )}
    </div>
  );
}
