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

import { VisualEditorProvider, useVisualEditor } from './contexts/VisualEditorContext';
import { VisualEditorToolbar } from './components/visual-editor/VisualEditorToolbar';
import { ContextualEditorModal } from './components/visual-editor/ContextualEditorModal';
import { PublishConfirmationModal } from './components/visual-editor/PublishConfirmationModal';
import { UnsavedChangesModal } from './components/visual-editor/UnsavedChangesModal';

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
  const visualEditor = useVisualEditor();

  const effectiveProducts = visualEditor.isVisualEditMode && visualEditor.activeProducts.length > 0
    ? visualEditor.activeProducts
    : products;
  const effectiveCategories = visualEditor.isVisualEditMode && visualEditor.activeCategories.length > 0
    ? visualEditor.activeCategories
    : categories;
  const effectiveGuides = visualEditor.isVisualEditMode && visualEditor.activeGuides.length > 0
    ? visualEditor.activeGuides
    : guides;
  const effectiveSettings = visualEditor.isVisualEditMode
    ? visualEditor.activeSettings
    : siteSettings;

  const handleSelectProduct = (slug: string) => {
    navigate({ page: 'product-detail', slug });
  };

  const handleSelectGuide = (slug: string) => {
    navigate({ page: 'guide-detail', slug });
  };

  const isSuperadminView = currentRoute.page === 'superadmin';

  const viewportContainerClass =
    visualEditor.isVisualEditMode && !isSuperadminView
      ? visualEditor.deviceViewport === 'mobile'
        ? 'max-w-[420px] mx-auto min-h-screen my-4 rounded-3xl shadow-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden bg-[#F7F6F2] dark:bg-[#0E0F12]'
        : visualEditor.deviceViewport === 'tablet'
        ? 'max-w-[768px] mx-auto min-h-screen my-4 rounded-3xl shadow-2xl border border-neutral-300 dark:border-neutral-800 overflow-hidden bg-[#F7F6F2] dark:bg-[#0E0F12]'
        : 'w-full'
      : 'w-full';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] dark:bg-[#0E0F12] text-[#111111] dark:text-[#EDEDED] antialiased transition-colors duration-150">
      {/* Visual Editor Toolbar when active */}
      {visualEditor.isVisualEditMode && !isSuperadminView && (
        <VisualEditorToolbar
          deviceViewport={visualEditor.deviceViewport}
          onSelectViewport={visualEditor.setDeviceViewport}
          hasUnsavedChanges={visualEditor.hasUnsavedChanges}
          changesCount={visualEditor.changesCount}
          canUndo={visualEditor.canUndo}
          canRedo={visualEditor.canRedo}
          onUndo={visualEditor.undo}
          onRedo={visualEditor.redo}
          onSaveDraft={visualEditor.saveDraftLocally}
          onOpenPublishModal={() => visualEditor.setIsPublishModalOpen(true)}
          onDiscardChanges={() => visualEditor.setIsUnsavedWarningOpen(true)}
          onGoToDashboard={() => navigate({ page: 'superadmin' })}
          onExitEditor={visualEditor.exitVisualEditMode}
        />
      )}

      <div className={viewportContainerClass}>
        {/* Optional Top Announcement Bar */}
        {effectiveSettings.announcementEnabled && effectiveSettings.announcementText && !isSuperadminView && (
          <div className="bg-[#111111] text-white text-xs font-semibold py-2.5 px-4 text-center flex items-center justify-center gap-2 border-b border-neutral-800">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse shrink-0" />
            <span>{effectiveSettings.announcementText}</span>
            {effectiveSettings.announcementLink && (
              <a
                href={effectiveSettings.announcementLink}
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
              products={effectiveProducts}
              categories={effectiveCategories}
              guides={effectiveGuides}
              siteSettings={effectiveSettings}
              onNavigate={navigate}
              onSelectProduct={handleSelectProduct}
              onSelectGuide={handleSelectGuide}
            />
          )}

          {currentRoute.page === 'recommendations' && (
            <RecommendationsPage
              products={effectiveProducts}
              initialCategory={currentRoute.categoryFilter || 'All'}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {currentRoute.page === 'product-detail' && (() => {
            const product = effectiveProducts.find((p) => p.slug === currentRoute.slug);
            return (
              <ProductDetailPage
                product={product}
                allProducts={effectiveProducts}
                onNavigate={navigate}
                onSelectProduct={handleSelectProduct}
                onOpenAffiliateModal={(prod) => setAffiliateProduct(prod)}
              />
            );
          })()}

          {currentRoute.page === 'categories' && (
            <CategoriesPage
              categories={effectiveCategories}
              products={effectiveProducts}
              onNavigate={navigate}
            />
          )}

          {currentRoute.page === 'guides' && (
            <GuidesPage
              guides={effectiveGuides}
              onSelectGuide={handleSelectGuide}
            />
          )}

          {currentRoute.page === 'guide-detail' && (() => {
            const guide = effectiveGuides.find((g) => g.slug === currentRoute.slug);
            return (
              <GuideDetailPage
                guide={guide}
                allGuides={effectiveGuides}
                allProducts={effectiveProducts}
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
        products={effectiveProducts}
        categories={effectiveCategories}
        guides={effectiveGuides}
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

      {/* Visual Editor Modals */}
      {visualEditor.isVisualEditMode && (
        <>
          <ContextualEditorModal
            target={visualEditor.activeTarget}
            isOpen={!!visualEditor.activeTarget}
            categoriesList={effectiveCategories}
            allProductsList={effectiveProducts}
            onClose={visualEditor.closeEditor}
            onApply={visualEditor.applyEdit}
          />

          <PublishConfirmationModal
            isOpen={visualEditor.isPublishModalOpen}
            changesSummary={visualEditor.changesSummary}
            isPublishing={visualEditor.isPublishing}
            onCancel={() => visualEditor.setIsPublishModalOpen(false)}
            onConfirm={visualEditor.publishToLive}
          />

          <UnsavedChangesModal
            isOpen={visualEditor.isUnsavedWarningOpen}
            onContinueEditing={() => visualEditor.setIsUnsavedWarningOpen(false)}
            onDiscardChanges={visualEditor.discardDraft}
          />
        </>
      )}

      {/* Visual Editor Toast */}
      {visualEditor.toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-neutral-700 animate-in slide-in-from-bottom-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
          {visualEditor.toastMessage}
        </div>
      )}

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

    // Global keyboard shortcut to access admin (Ctrl+Shift+A or typing "admin")
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
      // If currently on admin URLs, reset path to root
      const currentPath = window.location.pathname.toLowerCase();
      if (
        currentPath.includes('admintechcheck') ||
        currentPath.includes('techcheckadmin') ||
        currentPath.includes('admindtechcheck') ||
        currentPath.includes('superadmind') ||
        currentPath.includes('superadmin') ||
        currentPath.includes('admin')
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

  return (
    <VisualEditorProvider
      publishedSettings={siteSettings}
      publishedProducts={products}
      publishedCategories={categories}
      publishedGuides={guides}
      onCommitSettings={setSiteSettings}
      onCommitProducts={setProducts}
      onCommitCategories={setCategories}
      onCommitGuides={setGuides}
    >
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
    </VisualEditorProvider>
  );
}
