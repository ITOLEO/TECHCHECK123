import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CategoryInfo, Guide, SiteSettings } from '../types';
import { dataStorage, VisualDraftState } from '../services/dataStorage';
import { EditTarget } from '../components/visual-editor/ContextualEditorModal';
import { DeviceViewport } from '../components/visual-editor/VisualEditorToolbar';

interface VisualEditorContextType {
  isVisualEditMode: boolean;
  enterVisualEditMode: () => void;
  exitVisualEditMode: () => void;
  deviceViewport: DeviceViewport;
  setDeviceViewport: (viewport: DeviceViewport) => void;

  // Active Draft Content
  activeSettings: SiteSettings;
  activeProducts: Product[];
  activeCategories: CategoryInfo[];
  activeGuides: Guide[];

  // Change Tracking
  hasUnsavedChanges: boolean;
  changesSummary: string[];
  changesCount: number;

  // Contextual Modal
  activeTarget: EditTarget | null;
  openEditor: (target: EditTarget) => void;
  closeEditor: () => void;
  applyEdit: (updatedData: any) => void;

  // Save / Publish / Discard
  saveDraftLocally: () => void;
  publishToLive: () => Promise<void>;
  discardDraft: () => void;
  isPublishing: boolean;

  // Modals
  isPublishModalOpen: boolean;
  setIsPublishModalOpen: (open: boolean) => void;
  isUnsavedWarningOpen: boolean;
  setIsUnsavedWarningOpen: (open: boolean) => void;
  pendingExitAction: (() => void) | null;
  setPendingExitAction: (action: (() => void) | null) => void;

  // Undo / Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const VisualEditorContext = createContext<VisualEditorContextType | undefined>(undefined);

interface VisualEditorProviderProps {
  children: React.ReactNode;
  publishedSettings: SiteSettings;
  publishedProducts: Product[];
  publishedCategories: CategoryInfo[];
  publishedGuides: Guide[];
  onCommitSettings: (settings: SiteSettings) => void;
  onCommitProducts: (products: Product[]) => void;
  onCommitCategories: (categories: CategoryInfo[]) => void;
  onCommitGuides: (guides: Guide[]) => void;
}

interface HistorySnapshot {
  settings: SiteSettings;
  products: Product[];
  categories: CategoryInfo[];
  guides: Guide[];
  summary: string[];
}

export const VisualEditorProvider: React.FC<VisualEditorProviderProps> = ({
  children,
  publishedSettings,
  publishedProducts,
  publishedCategories,
  publishedGuides,
  onCommitSettings,
  onCommitProducts,
  onCommitCategories,
  onCommitGuides,
}) => {
  const [isVisualEditMode, setIsVisualEditMode] = useState<boolean>(() => {
    // Check if session storage requested visual edit mode
    if (typeof window !== 'undefined' && dataStorage.isAdminAuthenticated()) {
      return sessionStorage.getItem('techcheck_visual_mode') === 'true';
    }
    return false;
  });

  const [deviceViewport, setDeviceViewport] = useState<DeviceViewport>('desktop');

  // Draft Data States
  const [draftSettings, setDraftSettings] = useState<SiteSettings>(publishedSettings);
  const [draftProducts, setDraftProducts] = useState<Product[]>(publishedProducts);
  const [draftCategories, setDraftCategories] = useState<CategoryInfo[]>(publishedCategories);
  const [draftGuides, setDraftGuides] = useState<Guide[]>(publishedGuides);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [changesSummary, setChangesSummary] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  // History for Undo / Redo
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Contextual Modal State
  const [activeTarget, setActiveTarget] = useState<EditTarget | null>(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isUnsavedWarningOpen, setIsUnsavedWarningOpen] = useState(false);
  const [pendingExitAction, setPendingExitAction] = useState<(() => void) | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Sync draft states when published data updates from remote if no unsaved changes exist
  useEffect(() => {
    if (!hasUnsavedChanges) {
      setDraftSettings(publishedSettings);
      setDraftProducts(publishedProducts);
      setDraftCategories(publishedCategories);
      setDraftGuides(publishedGuides);
    }
  }, [publishedSettings, publishedProducts, publishedCategories, publishedGuides, hasUnsavedChanges]);

  // Load existing draft from localStorage on enter if available
  useEffect(() => {
    if (isVisualEditMode && dataStorage.isAdminAuthenticated()) {
      const savedDraft = dataStorage.getDraftState();
      if (savedDraft) {
        if (savedDraft.settings) setDraftSettings(savedDraft.settings);
        if (savedDraft.products) setDraftProducts(savedDraft.products);
        if (savedDraft.categories) setDraftCategories(savedDraft.categories);
        if (savedDraft.guides) setDraftGuides(savedDraft.guides);
        setHasUnsavedChanges(true);
        setChangesSummary(['Pulihkan draft tersimpan sebelumnya']);
      }
    }
  }, [isVisualEditMode]);

  const enterVisualEditMode = useCallback(() => {
    if (!dataStorage.isAdminAuthenticated()) return;
    setIsVisualEditMode(true);
    sessionStorage.setItem('techcheck_visual_mode', 'true');
    showToast('Visual Editor Aktif — Klik elemen untuk mengedit langsung');
  }, [showToast]);

  const exitVisualEditMode = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingExitAction(() => () => {
        setIsVisualEditMode(false);
        sessionStorage.removeItem('techcheck_visual_mode');
      });
      setIsUnsavedWarningOpen(true);
    } else {
      setIsVisualEditMode(false);
      sessionStorage.removeItem('techcheck_visual_mode');
    }
  }, [hasUnsavedChanges]);

  // Record a history snapshot before modifying
  const recordHistory = useCallback(
    (newSummaryItem: string, nextSettings: SiteSettings, nextProducts: Product[], nextCats: CategoryInfo[], nextGuides: Guide[]) => {
      const newSummary = Array.from(new Set([...changesSummary, newSummaryItem]));
      setChangesSummary(newSummary);
      setHasUnsavedChanges(true);

      const snapshot: HistorySnapshot = {
        settings: nextSettings,
        products: nextProducts,
        categories: nextCats,
        guides: nextGuides,
        summary: newSummary,
      };

      setHistory((prev) => [...prev.slice(0, historyIndex + 1), snapshot]);
      setHistoryIndex((prev) => prev + 1);

      // Autosave draft locally
      dataStorage.saveDraftState({
        settings: nextSettings,
        products: nextProducts,
        categories: nextCats,
        guides: nextGuides,
        lastModified: new Date().toISOString(),
      });
    },
    [changesSummary, historyIndex]
  );

  const openEditor = useCallback((target: EditTarget) => {
    setActiveTarget(target);
  }, []);

  const closeEditor = useCallback(() => {
    setActiveTarget(null);
  }, []);

  // Apply contextual edit
  const applyEdit = useCallback(
    (updatedData: any) => {
      if (!activeTarget) return;

      let nextSettings = { ...draftSettings };
      let nextProducts = [...draftProducts];
      let nextCats = [...draftCategories];
      let nextGuides = [...draftGuides];
      let summaryText = '';

      switch (activeTarget.type) {
        case 'hero-copy':
          nextSettings = {
            ...nextSettings,
            heroEyebrow: updatedData.heroEyebrow,
            heroHeadline1: updatedData.heroHeadline1,
            heroHeadline2: updatedData.heroHeadline2,
            heroSubtext: updatedData.heroSubtext,
          };
          summaryText = 'Hero Headline & Description';
          break;

        case 'hero-ctas':
          nextSettings = {
            ...nextSettings,
            heroCtaPrimaryText: updatedData.heroCtaPrimaryText,
            heroCtaPrimaryUrl: updatedData.heroCtaPrimaryUrl,
            heroCtaSecondaryText: updatedData.heroCtaSecondaryText,
            heroCtaSecondaryUrl: updatedData.heroCtaSecondaryUrl,
          };
          summaryText = 'Hero Action Buttons (CTAs)';
          break;

        case 'hero-image':
          nextSettings = {
            ...nextSettings,
            heroImage: updatedData.heroImage,
            heroImageAlt: updatedData.heroImageAlt,
            heroBadgeEyebrow: updatedData.heroBadgeEyebrow,
            heroBadgeTitle: updatedData.heroBadgeTitle,
            heroBadgeStat: updatedData.heroBadgeStat,
          };
          summaryText = 'Hero Image & Visual Label';
          break;

        case 'section-heading':
          if (activeTarget.sectionKey === 'categories') {
            nextSettings.categoriesHeading = updatedData.heading;
            nextSettings.categoriesSubtext = updatedData.subtext;
            summaryText = 'Section Categories Heading';
          } else if (activeTarget.sectionKey === 'featured') {
            nextSettings.featuredHeading = updatedData.heading;
            nextSettings.featuredSubtext = updatedData.subtext;
            summaryText = 'Section Featured Products Heading';
          } else if (activeTarget.sectionKey === 'recommendations') {
            nextSettings.recommendationsHeading = updatedData.heading;
            nextSettings.recommendationsSubtext = updatedData.subtext;
            summaryText = 'Section Recommendations Heading';
          } else if (activeTarget.sectionKey === 'guides') {
            nextSettings.guidesHeading = updatedData.heading;
            nextSettings.guidesSubtext = updatedData.subtext;
            summaryText = 'Section Guides & Articles Heading';
          }
          break;

        case 'product':
          nextProducts = nextProducts.map((p) => (p.id === updatedData.id ? { ...p, ...updatedData } : p));
          summaryText = `Produk: ${updatedData.name || updatedData.id}`;
          break;

        case 'category':
          nextCats = nextCats.map((c) => (c.id === updatedData.id ? { ...c, ...updatedData } : c));
          summaryText = `Kategori: ${updatedData.name || updatedData.id}`;
          break;

        case 'guide':
          nextGuides = nextGuides.map((g) => (g.id === updatedData.id ? { ...g, ...updatedData } : g));
          summaryText = `Guide/Artikel: ${updatedData.title || updatedData.id}`;
          break;

        case 'recommendation':
          summaryText = `Goal Rekomendasi: ${updatedData.title}`;
          break;
      }

      setDraftSettings(nextSettings);
      setDraftProducts(nextProducts);
      setDraftCategories(nextCats);
      setDraftGuides(nextGuides);

      recordHistory(summaryText, nextSettings, nextProducts, nextCats, nextGuides);
      setActiveTarget(null);
      showToast(`Perubahan "${summaryText}" diterapkan ke Live Preview`);
    },
    [activeTarget, draftSettings, draftProducts, draftCategories, draftGuides, recordHistory, showToast]
  );

  const saveDraftLocally = useCallback(() => {
    dataStorage.saveDraftState({
      settings: draftSettings,
      products: draftProducts,
      categories: draftCategories,
      guides: draftGuides,
      lastModified: new Date().toISOString(),
    });
    showToast('Draft berhasil disimpan lokal. Belum dipublikasikan ke publik.');
  }, [draftSettings, draftProducts, draftCategories, draftGuides, showToast]);

  const publishToLive = useCallback(async () => {
    setIsPublishing(true);
    try {
      // 1. Commit to parent/published app states
      onCommitSettings(draftSettings);
      onCommitProducts(draftProducts);
      onCommitCategories(draftCategories);
      onCommitGuides(draftGuides);

      // 2. Persist to dataStorage (localStorage)
      dataStorage.saveSiteSettings(draftSettings);
      dataStorage.saveProducts(draftProducts);
      dataStorage.saveCategories(draftCategories);
      dataStorage.saveGuides(draftGuides);

      // 3. Add to Audit Log
      dataStorage.addAuditLog({
        target: 'Live Website',
        field: 'Visual Editor Publish',
        newValue: changesSummary.join(', '),
      });

      // 4. Remote sync to backend/Supabase if configured
      try {
        await Promise.allSettled([
          fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(draftSettings),
          }),
        ]);
      } catch {
        // Local persistence already done
      }

      // 5. Clear draft state
      dataStorage.clearDraftState();
      setHasUnsavedChanges(false);
      setChangesSummary([]);
      setHistory([]);
      setHistoryIndex(-1);
      setIsPublishModalOpen(false);

      showToast('Berhasil dipublikasikan! Semua pengunjung kini melihat versi terbaru.');
    } catch (err: any) {
      showToast(`Gagal publikasi: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsPublishing(false);
    }
  }, [
    draftSettings,
    draftProducts,
    draftCategories,
    draftGuides,
    changesSummary,
    onCommitSettings,
    onCommitProducts,
    onCommitCategories,
    onCommitGuides,
    showToast,
  ]);

  const discardDraft = useCallback(() => {
    setDraftSettings(publishedSettings);
    setDraftProducts(publishedProducts);
    setDraftCategories(publishedCategories);
    setDraftGuides(publishedGuides);
    setHasUnsavedChanges(false);
    setChangesSummary([]);
    setHistory([]);
    setHistoryIndex(-1);
    dataStorage.clearDraftState();
    showToast('Semua draft perubahan dibatalkan.');
  }, [publishedSettings, publishedProducts, publishedCategories, publishedGuides, showToast]);

  // Undo / Redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = useCallback(() => {
    if (!canUndo) return;
    const prevIndex = historyIndex - 1;
    const snapshot = history[prevIndex];
    if (snapshot) {
      setDraftSettings(snapshot.settings);
      setDraftProducts(snapshot.products);
      setDraftCategories(snapshot.categories);
      setDraftGuides(snapshot.guides);
      setChangesSummary(snapshot.summary);
      setHistoryIndex(prevIndex);
      showToast('Undo berhasil');
    }
  }, [canUndo, historyIndex, history, showToast]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const nextIndex = historyIndex + 1;
    const snapshot = history[nextIndex];
    if (snapshot) {
      setDraftSettings(snapshot.settings);
      setDraftProducts(snapshot.products);
      setDraftCategories(snapshot.categories);
      setDraftGuides(snapshot.guides);
      setChangesSummary(snapshot.summary);
      setHistoryIndex(nextIndex);
      showToast('Redo berhasil');
    }
  }, [canRedo, historyIndex, history, showToast]);

  const activeSettings = isVisualEditMode ? draftSettings : publishedSettings;
  const activeProducts = isVisualEditMode ? draftProducts : publishedProducts;
  const activeCategories = isVisualEditMode ? draftCategories : publishedCategories;
  const activeGuides = isVisualEditMode ? draftGuides : publishedGuides;

  return (
    <VisualEditorContext.Provider
      value={{
        isVisualEditMode,
        enterVisualEditMode,
        exitVisualEditMode,
        deviceViewport,
        setDeviceViewport,
        activeSettings,
        activeProducts,
        activeCategories,
        activeGuides,
        hasUnsavedChanges,
        changesSummary,
        changesCount: changesSummary.length,
        activeTarget,
        openEditor,
        closeEditor,
        applyEdit,
        saveDraftLocally,
        publishToLive,
        discardDraft,
        isPublishing,
        isPublishModalOpen,
        setIsPublishModalOpen,
        isUnsavedWarningOpen,
        setIsUnsavedWarningOpen,
        pendingExitAction,
        setPendingExitAction,
        canUndo,
        canRedo,
        undo,
        redo,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </VisualEditorContext.Provider>
  );
};

export const useVisualEditor = () => {
  const context = useContext(VisualEditorContext);
  if (!context) {
    throw new Error('useVisualEditor must be used within a VisualEditorProvider');
  }
  return context;
};
