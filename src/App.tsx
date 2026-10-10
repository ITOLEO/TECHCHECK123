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



interface AppContentProps {
  currentRoute: ViewRoute;
  setCurrentRoute: React.Dispatch<React.SetStateAction<ViewRoute>>;
  navigate: (route: ViewRoute) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: CategoryInfo[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryInfo[]>>;
  guides: Guide[];
  setGuides: React.Dispatch<React.SetStateAction<Guide[]>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  showSplash: boolean;
  setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
  affiliateProduct: Product | null;
  setAffiliateProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  infoModalType: 'about' | 'disclosure' | 'contact' | null;
  setInfoModalType: React.Dispatch<React.SetStateAction<'about' | 'disclosure' | 'contact' | null>>;
}

const AppContent: React.FC<AppContentProps> = ({
  currentRoute,
  navigate,
  products,
  setProducts,
  categories,
  setCategories,
  guides,
  setGuides,
  siteSettings,
  setSiteSettings,
  isSearchOpen,
  setIsSearchOpen,
  showSplash,
  setShowSplash,
  affiliateProduct,
  setAffiliateProduct,
  infoModalType,
  setInfoModalType,
}) => {
  const isSuperadminView = currentRoute.page === 'superadmin';

  const handleSelectProduct = (slug: string) => {
    navigate({ page: 'product-detail', slug });
  };

  const handleSelectGuide = (slug: string) => {
    navigate({ page: 'guide-detail', slug });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] dark:bg-[#0E0F12] text-[#111111] dark:text-[#EDEDED] antialiased transition-colors duration-150">
      <div className="w-full">
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
                View →
              </a>
            )}
          </div>
        )}

        {/* Top Navigation */}
        {!isSuperadminView && (
          <Navbar
            currentRoute={currentRoute}
            categories={categories}
            onNavigate={navigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

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
            const product = products.find((p) => p.slug === currentRoute.slug);
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
              products={products}
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
            const guide = guides.find((g) => g.slug === currentRoute.slug);
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
      </div>

      {/* Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
        products={products}
        categories={categories}
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
};

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
      path.includes('techcheckadmin') ||
      path.includes('admindtechcheck') ||
      path.includes('superadmin') ||
      path.includes('superadmind') ||
      path.includes('/admin') ||
      hash.includes('admintechcheck') ||
      hash.includes('techcheckadmin') ||
      hash.includes('admindtechcheck') ||
      hash.includes('superadmin') ||
      hash.includes('superadmind') ||
      hash.includes('admin') ||
      search.includes('admintechcheck') ||
      search.includes('techcheckadmin') ||
      search.includes('admindtechcheck') ||
      search.includes('superadmin') ||
      search.includes('admin')
    );
  });
  const [affiliateProduct, setAffiliateProduct] = useState<Product | null>(null);
  const [infoModalType, setInfoModalType] = useState<'about' | 'disclosure' | 'contact' | null>(null);

  // Dynamic state loaded and managed via dataStorage (localStorage with defaults)
  const [products, setProducts] = useState<Product[]>(() => dataStorage.getProducts());
  const [categories, setCategories] = useState<CategoryInfo[]>(() => dataStorage.getCategories());
  const [guides, setGuides] = useState<Guide[]>(() => dataStorage.getGuides());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => dataStorage.getSiteSettings());
  const categoriesRef = React.useRef(categories);
  categoriesRef.current = categories;
  const productsRef = React.useRef(products);
  productsRef.current = products;

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

  // Synchronize dedicated Favicon & OG Image to document head whenever site settings change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const fav = siteSettings.favicon || '/favicon.png';
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (link) {
        link.href = fav;
      }
      const appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
      if (appleLink) {
        appleLink.href = fav;
      }

      if (siteSettings.ogImage) {
        const fullOg = siteSettings.ogImage.startsWith('http')
          ? siteSettings.ogImage
          : `https://techcheck.homes${siteSettings.ogImage.startsWith('/') ? '' : '/'}${siteSettings.ogImage}`;
        const ogMeta = document.querySelector('meta[property="og:image"]');
        if (ogMeta) ogMeta.setAttribute('content', fullOg);
        const twitterMeta = document.querySelector('meta[name="twitter:image"]');
        if (twitterMeta) twitterMeta.setAttribute('content', fullOg);
      }
    }
  }, [siteSettings.favicon, siteSettings.ogImage]);

  // Parse URL pathname, hash, & query on mount and listen to navigation changes
  useEffect(() => {
    const handleLocationChange = () => {
      const pathname = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase();
      const search = (window.location.search || '').toLowerCase();
      const href = (window.location.href || '').toLowerCase();

      // Check if accessing dedicated admin URL (/admintechcheck, /techcheckadmin, /admindtechcheck, /superadmind, /superadmin, /admin, etc.)
      const isAdminTarget =
        pathname.includes('admintechcheck') ||
        pathname.includes('techcheckadmin') ||
        pathname.includes('admindtechcheck') ||
        pathname.includes('superadmind') ||
        pathname.includes('superadmin') ||
        pathname.includes('/admin') ||
        pathname.endsWith('/admin') ||
        hash.includes('admintechcheck') ||
        hash.includes('techcheckadmin') ||
        hash.includes('admindtechcheck') ||
        hash.includes('superadmind') ||
        hash.includes('superadmin') ||
        hash.includes('admin') ||
        search.includes('admintechcheck') ||
        search.includes('techcheckadmin') ||
        search.includes('admindtechcheck') ||
        search.includes('superadmind') ||
        search.includes('superadmin') ||
        search.includes('admin') ||
        href.includes('admintechcheck') ||
        href.includes('techcheckadmin') ||
        href.includes('admindtechcheck') ||
        href.includes('superadmind');

      if (isAdminTarget) {
        setCurrentRoute({ page: 'superadmin' });
        return;
      }

      // Check other routes based on raw (cased) hash or pathname
      const rawHash = window.location.hash || '';
      const rawPathname = window.location.pathname || '';
      const cleanHash = rawHash.replace(/^#\/?/, '');
      const cleanPath = rawPathname.replace(/^\/+|\/+$/g, '');
      const rawPath = cleanHash.length > 0 ? cleanHash : cleanPath;

      // Extract query string from path if present (e.g. recommendations?category=Desk%20Setup)
      let routePath = rawPath;
      let queryStr = '';
      if (rawPath.includes('?')) {
        const qIdx = rawPath.indexOf('?');
        routePath = rawPath.substring(0, qIdx);
        queryStr = rawPath.substring(qIdx + 1);
      }

      const parts = routePath.split('/').filter(Boolean);
      const searchParams = new URLSearchParams(queryStr || (window.location.search || '').replace(/^\?/, ''));
      const rawCategoryParam = searchParams.get('category') || searchParams.get('cat') || searchParams.get('kategori');

      const findCategoryMatch = (paramVal: string | null) => {
        if (!paramVal) return null;
        const decoded = decodeURIComponent(paramVal).trim();
        const cats = categoriesRef.current || [];
        const match = cats.find(
          (c) =>
            c.name.toLowerCase() === decoded.toLowerCase() ||
            c.slug.toLowerCase() === decoded.toLowerCase() ||
            c.name.toLowerCase().replace(/[\s_]+/g, '-') === decoded.toLowerCase().replace(/[\s_]+/g, '-')
        );
        return match ? match.name : decoded;
      };

      const routeSegment = (parts[0] || '').toLowerCase();

      if (parts.length === 0) {
        setCurrentRoute({ page: 'home' });
      } else if (
        routeSegment === 'recommendations' ||
        routeSegment === 'products' ||
        routeSegment === 'catalog'
      ) {
        if (parts[1]) {
          // Check if parts[1] is an actual product slug first!
          const isProduct = (productsRef.current || []).some(
            (p) => p.slug.toLowerCase() === parts[1].toLowerCase()
          );
          if (isProduct) {
            setCurrentRoute({ page: 'product-detail', slug: parts[1] });
          } else {
            // Treat as category filter!
            const catMatch = findCategoryMatch(parts[1]);
            setCurrentRoute({
              page: 'recommendations',
              categoryFilter: catMatch || parts[1],
            });
          }
        } else if (rawCategoryParam) {
          const matchedName = findCategoryMatch(rawCategoryParam);
          setCurrentRoute({
            page: 'recommendations',
            categoryFilter: matchedName || decodeURIComponent(rawCategoryParam),
          });
        } else {
          setCurrentRoute({ page: 'recommendations' });
        }
      } else if (
        routeSegment === 'categories' ||
        routeSegment === 'category' ||
        routeSegment === 'kategori'
      ) {
        if (parts[1]) {
          const matchedName = findCategoryMatch(parts[1]);
          setCurrentRoute({
            page: 'recommendations',
            categoryFilter: matchedName || parts[1],
          });
        } else if (rawCategoryParam) {
          const matchedName = findCategoryMatch(rawCategoryParam);
          setCurrentRoute({
            page: 'recommendations',
            categoryFilter: matchedName || decodeURIComponent(rawCategoryParam),
          });
        } else {
          setCurrentRoute({ page: 'categories' });
        }
      } else if (routeSegment === 'guides') {
        if (parts[1]) {
          setCurrentRoute({ page: 'guide-detail', slug: parts[1] });
        } else {
          setCurrentRoute({ page: 'guides' });
        }
      } else {
        // Fallback check if parts[0] is directly a category slug/name or product slug!
        const isProduct = (productsRef.current || []).some(
          (p) => p.slug.toLowerCase() === parts[0].toLowerCase()
        );
        if (isProduct) {
          setCurrentRoute({ page: 'product-detail', slug: parts[0] });
        } else {
          const directCatMatch = findCategoryMatch(parts[0]);
          if (directCatMatch) {
            setCurrentRoute({ page: 'recommendations', categoryFilter: directCatMatch });
          } else {
            setCurrentRoute({ page: 'home' });
          }
        }
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    // Global keyboard shortcut to access admin (Ctrl+Shift+A or typing "admin")
    let keyBuffer = '';
    let bufferTimer: any;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Shortcut: Ctrl + Shift + A or Cmd + Shift + A -> Admin
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
          keyBuffer.includes('techcheckadmin') ||
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
  }, []);

  // Update URL when navigating
  const navigate = (route: ViewRoute) => {
    setCurrentRoute(route);

    let cleanPath = '/';
    if (route.page === 'superadmin') {
      cleanPath = '/admintechcheck';
    } else if (route.page === 'home') {
      cleanPath = '/';
    } else if (route.page === 'recommendations') {
      cleanPath =
        route.categoryFilter && route.categoryFilter !== 'All'
          ? `/recommendations?category=${encodeURIComponent(route.categoryFilter)}`
          : '/recommendations';
    } else if (route.page === 'product-detail') {
      cleanPath = `/recommendations/${route.slug}`;
    } else if (route.page === 'categories') {
      cleanPath = '/categories';
    } else if (route.page === 'guides') {
      cleanPath = '/guides';
    } else if (route.page === 'guide-detail') {
      cleanPath = `/guides/${route.slug}`;
    }

    try {
      if (window.location.hash) {
        // Clear any lingering hash fragment when navigating cleanly
        window.history.pushState(null, '', cleanPath);
      } else if (window.location.pathname + window.location.search !== cleanPath) {
        window.history.pushState(null, '', cleanPath);
      }
    } catch {
      // Fallback for sandboxed iframe environments where pushState is restricted
      if (route.page === 'superadmin') {
        window.location.hash = '#/admintechcheck';
      } else {
        window.location.hash = cleanPath === '/' ? '' : `#${cleanPath}`;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContent
      currentRoute={currentRoute}
      setCurrentRoute={setCurrentRoute}
      navigate={navigate}
      products={products}
      setProducts={setProducts}
      categories={categories}
      setCategories={setCategories}
      guides={guides}
      setGuides={setGuides}
      siteSettings={siteSettings}
      setSiteSettings={setSiteSettings}
      isSearchOpen={isSearchOpen}
      setIsSearchOpen={setIsSearchOpen}
      showSplash={showSplash}
      setShowSplash={setShowSplash}
      affiliateProduct={affiliateProduct}
      setAffiliateProduct={setAffiliateProduct}
      infoModalType={infoModalType}
      setInfoModalType={setInfoModalType}
    />
  );
}
