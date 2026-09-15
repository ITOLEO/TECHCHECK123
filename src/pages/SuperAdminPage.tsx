import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  FolderTree,
  BookOpen,
  Settings,
  Plus,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Check,
  Search,
  ArrowLeft,
  LogOut,
  Shield,
  KeyRound,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Lock,
  Sliders,
  Image as ImageIcon,
  Sparkles,
  Link2,
  Database,
  FileCode,
  CheckCircle2,
  XCircle,
  Table,
  Eye
} from 'lucide-react';
import { Product, CategoryInfo, Guide, SiteSettings, ViewRoute } from '../types';
import { dataStorage, DEFAULT_SITE_SETTINGS } from '../services/dataStorage';

interface SuperAdminPageProps {
  products: Product[];
  categories: CategoryInfo[];
  guides: Guide[];
  siteSettings: SiteSettings;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateCategories: (categories: CategoryInfo[]) => void;
  onUpdateGuides: (guides: Guide[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onNavigate: (route: ViewRoute) => void;
}

export const SuperAdminPage: React.FC<SuperAdminPageProps> = ({
  products,
  categories,
  guides,
  siteSettings,
  onUpdateProducts,
  onUpdateCategories,
  onUpdateGuides,
  onUpdateSettings,
  onNavigate,
}) => {
  // Authentication state
  const initialAuth = dataStorage.isAdminAuthenticated();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuth);

  // Splash & Loading state before reaching password verification
  const [showSplashLoading, setShowSplashLoading] = useState<boolean>(!initialAuth);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [splashStatusText, setSplashStatusText] = useState<string>('Menginisialisasi gateway superadmin...');

  const [loginPasscode, setLoginPasscode] = useState('');
  const [loginError, setLoginError] = useState('');

  // Run the splash screen / loading screen sequence
  useEffect(() => {
    if (!showSplashLoading) return;

    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds smooth transition

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / duration) * 100));
      setSplashProgress(progress);

      if (progress < 30) {
        setSplashStatusText('Menginisialisasi gateway superadmin...');
      } else if (progress < 65) {
        setSplashStatusText('Memverifikasi modul keamanan & enkripsi sesi...');
      } else if (progress < 90) {
        setSplashStatusText('Mempersiapkan gerbang verifikasi password...');
      } else {
        setSplashStatusText('Selesai. Mengalihkan ke verifikasi password...');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(() => {
          setShowSplashLoading(false);
        }, 150);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [showSplashLoading]);

  // Active tab
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'guides' | 'settings'>('products');

  // Search and filter in products
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Modal states for Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({});
  const [productFormError, setProductFormError] = useState<string | null>(null);

  // Raw text buffers for multiline fields to allow natural typing without losing newlines
  const [highlightsText, setHighlightsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [specsText, setSpecsText] = useState('');
  const [greatForText, setGreatForText] = useState('');
  const [setupConsiderationsText, setSetupConsiderationsText] = useState('');

  // Modal states for Category
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<CategoryInfo>>({});
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);

  // Modal states for Guide
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [guideFormData, setGuideFormData] = useState<Partial<Guide>>({});
  const [guideFormError, setGuideFormError] = useState<string | null>(null);

  // In-app Confirmation Modal state (Replaces window.confirm to function in iframe sandbox)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category' | 'guide' | 'factoryReset';
    id?: string;
    name: string;
  } | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase connection status & schema viewer
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [isPullingSupabase, setIsPullingSupabase] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [schemaSql, setSchemaSql] = useState<string>('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      dataStorage.checkSupabaseStatus().then(setSupabaseStatus);
    }
  }, [isAuthenticated]);

  const handleCheckSupabase = async () => {
    setIsCheckingSupabase(true);
    const status = await dataStorage.checkSupabaseStatus();
    setSupabaseStatus(status);
    setIsCheckingSupabase(false);
    showToast(status.connected ? 'Supabase terhubung dengan baik! Seluruh tabel siap.' : (status.message || 'Status diperbarui.'));
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    const res = await dataStorage.syncAllToSupabase();
    setIsSyncingSupabase(false);
    if (res.success) {
      showToast('Seluruh data web berhasil disinkronkan ke tabel Supabase!');
      dataStorage.checkSupabaseStatus().then(setSupabaseStatus);
    } else {
      showToast(`Gagal sinkronisasi: ${res.message}`);
    }
  };

  const handlePullFromSupabase = async () => {
    setIsPullingSupabase(true);
    const remote = await dataStorage.fetchRemoteData();
    setIsPullingSupabase(false);
    if (remote) {
      if (remote.products) onUpdateProducts(remote.products);
      if (remote.categories) onUpdateCategories(remote.categories);
      if (remote.guides) onUpdateGuides(remote.guides);
      if (remote.settings) onUpdateSettings(remote.settings);
      showToast('Data terbaru dari tabel Supabase berhasil dimuat ke web!');
      dataStorage.checkSupabaseStatus().then(setSupabaseStatus);
    } else {
      showToast('Gagal memuat data dari Supabase atau Supabase belum terhubung.');
    }
  };

  const handleOpenSchemaModal = async () => {
    setShowSchemaModal(true);
    if (!schemaSql) {
      const sql = await dataStorage.getSchemaSQL();
      setSchemaSql(sql);
    }
  };

  const handleCopySchemaSql = () => {
    if (schemaSql) {
      navigator.clipboard.writeText(schemaSql);
      setCopiedSchema(true);
      showToast('SQL Schema (schema.sql) berhasil disalin ke clipboard!');
      setTimeout(() => setCopiedSchema(false), 2500);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = loginPasscode.trim();
    if (cleanInput === '654321' || dataStorage.verifyPasscode(cleanInput)) {
      dataStorage.setAdminAuthenticated(true);
      setIsAuthenticated(true);
      setLoginError('');
      showToast('Berhasil masuk ke Dashboard admintechcheck');
    } else {
      setLoginError('Password tidak valid. Silakan gunakan password: 654321');
    }
  };

  const handleLogout = () => {
    dataStorage.setAdminAuthenticated(false);
    setIsAuthenticated(false);
    setLoginPasscode('');
    setShowSplashLoading(false);
    showToast('Berhasil keluar dari mode superadmin');
  };

  // --- PRODUCT ACTIONS ---
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductFormError(null);
    setProductFormData({
      id: `prod-${Date.now()}`,
      slug: '',
      name: '',
      category: categories[0]?.name || 'Monitors',
      rating: 4.8,
      reviewCount: 1,
      image: '/acer-nitro.png',
      gallery: ['/acer-nitro.png'],
      badge: 'BEST GAMING MONITOR',
      shortBenefit: '',
      description: 'View the current product listing, details, and availability through our partner store.',
      bestFor: 'Compact setup enthusiasts',
      verdict: 'A great choice for modern minimalist gaming and workstation setups.',
      affiliateUrl: '',
      featured: true,
      productType: categories[0]?.name || 'Monitors',
      deskSizeCompatibility: 'Desks 100cm to 140cm',
    });
    setHighlightsText("27' WQHD IPS display\n275Hz refresh rate\n0.5ms response time");
    setBenefitsText("High quality build and materials\nCompact footprint perfect for small desks");
    setSpecsText("Screen Size: 27'\nResolution: 2560 x 1440 (WQHD)\nRefresh Rate: 275Hz\nPanel Type: IPS");
    setGreatForText("Small desks\nClean setups");
    setSetupConsiderationsText("Check available desk clearance before mounting.");
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductFormError(null);
    setProductFormData({ ...prod });
    setHighlightsText((prod.highlights || []).join('\n'));
    setBenefitsText((prod.benefits || []).join('\n'));
    setSpecsText(
      Object.entries(prod.specifications || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    );
    setGreatForText((prod.greatFor || []).join('\n'));
    setSetupConsiderationsText((prod.setupConsiderations || []).join('\n'));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name?.trim()) {
      setProductFormError('Nama produk wajib diisi!');
      return;
    }
    const chosenCategory = productFormData.category?.trim() || categories[0]?.name || 'Accessories';

    const slug = productFormData.slug?.trim()
      ? productFormData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : productFormData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Parse specs safely
    const parsedSpecs: Record<string, string> = {};
    specsText.split('\n').forEach((line) => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (key) parsedSpecs[key] = val;
      }
    });

    const parsedHighlights = highlightsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedBenefits = benefitsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedGreatFor = greatForText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const parsedSetupConsiderations = setupConsiderationsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      slug,
      name: productFormData.name.trim(),
      category: chosenCategory,
      rating: Number(productFormData.rating) || 4.8,
      reviewCount: Number(productFormData.reviewCount) || 10,
      image: productFormData.image || '/acer-nitro.png',
      gallery:
        productFormData.gallery && productFormData.gallery.length > 0
          ? productFormData.gallery
          : [productFormData.image || '/acer-nitro.png'],
      badge: productFormData.badge || 'BEST VALUE',
      shortBenefit: productFormData.shortBenefit || '',
      description: productFormData.description || '',
      benefits: parsedBenefits.length > 0 ? parsedBenefits : ['Quality construction'],
      highlights: parsedHighlights.length > 0 ? parsedHighlights : ['Space-saving design'],
      specifications: Object.keys(parsedSpecs).length > 0 ? parsedSpecs : { Build: 'Premium' },
      bestFor: productFormData.bestFor || '',
      greatFor: parsedGreatFor,
      setupConsiderations: parsedSetupConsiderations,
      verdict: productFormData.verdict || '',
      affiliateUrl: productFormData.affiliateUrl || '',
      featured: !!productFormData.featured,
      productType: productFormData.productType || chosenCategory,
      deskSizeCompatibility: productFormData.deskSizeCompatibility || 'Universal',
    };

    let updatedList: Product[];
    if (editingProduct) {
      updatedList = products.map((p) => (p.id === editingProduct.id ? newProduct : p));
    } else {
      updatedList = [newProduct, ...products];
    }

    onUpdateProducts(updatedList);
    dataStorage.saveProducts(updatedList);

    if (supabaseStatus?.connected) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct),
        });
        if (!res.ok) throw new Error('Network error');
        showToast(editingProduct ? `Produk "${newProduct.name}" berhasil diperbarui di Supabase!` : `Produk "${newProduct.name}" berhasil ditambahkan ke Supabase!`);
      } catch (err: any) {
        showToast(`Tersimpan lokal, tapi gagal dikirim ke Supabase.`);
      }
    } else {
      showToast(editingProduct ? `Produk "${newProduct.name}" berhasil diperbarui lokal!` : `Produk "${newProduct.name}" berhasil ditambahkan lokal!`);
    }

    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    setDeleteTarget({
      type: 'product',
      id: productId,
      name: productName,
    });
  };

  const handleDuplicateProduct = (prod: Product) => {
    const duplicated: Product = {
      ...prod,
      id: `prod-${Date.now()}`,
      slug: `${prod.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      name: `${prod.name} (Copy)`,
      featured: false,
    };
    const updated = [duplicated, ...products];
    onUpdateProducts(updated);
    dataStorage.saveProducts(updated);
    showToast(`Produk "${prod.name}" berhasil diduplikasi!`);
  };

  const handleToggleFeatured = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, featured: !p.featured } : p
    );
    onUpdateProducts(updated);
    dataStorage.saveProducts(updated);
  };

  // Filtered products for table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
      const matchSearch =
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.shortBenefit.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, productSearch, productCategoryFilter]);

  // --- CATEGORY ACTIONS ---
  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormError(null);
    setCategoryFormData({
      id: `cat-${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      productCount: 0,
      image: '/acer-nitro.png',
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryInfo) => {
    setEditingCategory(cat);
    setCategoryFormError(null);
    setCategoryFormData({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name?.trim()) {
      setCategoryFormError('Nama kategori wajib diisi!');
      return;
    }

    const slug = categoryFormData.slug?.trim()
      ? categoryFormData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : categoryFormData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const catName = categoryFormData.name.trim();
    const count = products.filter((p) => p.category.toLowerCase() === catName.toLowerCase()).length;

    const newCat: CategoryInfo = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: catName,
      slug,
      description: categoryFormData.description || '',
      productCount: count,
      image: categoryFormData.image || '/acer-nitro.png',
    };

    let updatedList: CategoryInfo[];
    if (editingCategory) {
      // If category name was renamed, update products that had the old category name!
      if (editingCategory.name !== newCat.name) {
        const updatedProducts = products.map((p) =>
          p.category === editingCategory.name ? { ...p, category: newCat.name } : p
        );
        onUpdateProducts(updatedProducts);
        dataStorage.saveProducts(updatedProducts);
      }
      updatedList = categories.map((c) => (c.id === editingCategory.id ? newCat : c));
    } else {
      updatedList = [...categories, newCat];
    }

    onUpdateCategories(updatedList);
    dataStorage.saveCategories(updatedList);

    if (supabaseStatus?.connected) {
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCat),
        });
        if (!res.ok) throw new Error('Network error');
        showToast(editingCategory ? `Kategori "${newCat.name}" diperbarui di Supabase!` : `Kategori "${newCat.name}" ditambahkan ke Supabase!`);
      } catch (err: any) {
        showToast(`Tersimpan lokal, tapi gagal dikirim ke Supabase.`);
      }
    } else {
      showToast(editingCategory ? `Kategori "${newCat.name}" diperbarui lokal!` : `Kategori "${newCat.name}" ditambahkan lokal!`);
    }

    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    setDeleteTarget({
      type: 'category',
      id: catId,
      name: catName,
    });
  };

  // --- GUIDE ACTIONS ---
  const handleOpenCreateGuide = () => {
    setEditingGuide(null);
    setGuideFormError(null);
    setGuideFormData({
      id: `guide-${Date.now()}`,
      slug: '',
      title: '',
      category: 'Setup Advice',
      readTime: '4 min read',
      publishDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      excerpt: '',
      image: '/acer-nitro.png',
      featured: false,
      author: {
        name: 'TechCheck Editorial',
        role: 'Setup Specialist',
        avatar: '/acer-nitro.png',
      },
      intro: '',
      steps: [
        { number: '01', title: 'Preparation', text: 'Plan and measure your desktop area.' },
        { number: '02', title: 'Execution', text: 'Mount display accessories and route cables neatly.' },
      ],
      summary: 'A clean and efficient space leads to better focus and comfort.',
    });
    setIsGuideModalOpen(true);
  };

  const handleOpenEditGuide = (g: Guide) => {
    setEditingGuide(g);
    setGuideFormError(null);
    setGuideFormData({ ...g });
    setIsGuideModalOpen(true);
  };

  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideFormData.title?.trim()) {
      setGuideFormError('Judul panduan wajib diisi!');
      return;
    }

    const slug = guideFormData.slug?.trim()
      ? guideFormData.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : guideFormData.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const newGuide: Guide = {
      id: editingGuide ? editingGuide.id : `guide-${Date.now()}`,
      slug,
      title: guideFormData.title.trim(),
      category: guideFormData.category || 'Setup Advice',
      readTime: guideFormData.readTime || '4 min read',
      publishDate: guideFormData.publishDate || 'Recent',
      excerpt: guideFormData.excerpt || '',
      image: guideFormData.image || '/acer-nitro.png',
      featured: !!guideFormData.featured,
      author: guideFormData.author || {
        name: 'TechCheck Editorial',
        role: 'Setup Specialist',
        avatar: '/acer-nitro.png',
      },
      intro: guideFormData.intro || '',
      steps: guideFormData.steps || [],
      summary: guideFormData.summary || '',
    };

    let updatedList: Guide[];
    if (editingGuide) {
      updatedList = guides.map((g) => (g.id === editingGuide.id ? newGuide : g));
    } else {
      updatedList = [newGuide, ...guides];
    }

    onUpdateGuides(updatedList);
    dataStorage.saveGuides(updatedList);

    if (supabaseStatus?.connected) {
      try {
        const res = await fetch('/api/guides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newGuide),
        });
        if (!res.ok) throw new Error('Network error');
        showToast(editingGuide ? `Panduan "${newGuide.title}" diperbarui di Supabase!` : `Panduan "${newGuide.title}" ditambahkan ke Supabase!`);
      } catch (err: any) {
        showToast(`Tersimpan lokal, tapi gagal dikirim ke Supabase.`);
      }
    } else {
      showToast(editingGuide ? `Panduan "${newGuide.title}" diperbarui lokal!` : `Panduan "${newGuide.title}" ditambahkan lokal!`);
    }

    setIsGuideModalOpen(false);
  };

  const handleDeleteGuide = (guideId: string, title: string) => {
    setDeleteTarget({
      type: 'guide',
      id: guideId,
      name: title,
    });
  };

  // --- SETTINGS ACTIONS ---
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    onUpdateSettings(newSettings);
    dataStorage.saveSiteSettings(newSettings);
    
    if (supabaseStatus?.connected) {
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings),
        });
        if (!res.ok) throw new Error('Network error');
        showToast('Pengaturan website berhasil disimpan ke Supabase!');
      } catch (err: any) {
        showToast(`Tersimpan lokal, tapi gagal dikirim ke Supabase.`);
      }
    } else {
      showToast('Pengaturan website berhasil disimpan lokal!');
    }
  };

  const handleExportBackup = () => {
    const jsonStr = dataStorage.exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `techcheck-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('File backup JSON berhasil diunduh!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = dataStorage.importDataJSON(content);
      if (res.success) {
        onUpdateProducts(dataStorage.getProducts());
        onUpdateCategories(dataStorage.getCategories());
        onUpdateGuides(dataStorage.getGuides());
        onUpdateSettings(dataStorage.getSiteSettings());
        showToast('Data backup berhasil diimport & dimuat!');
      } else {
        showToast(res.message || 'Gagal import file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetFactoryData = () => {
    setDeleteTarget({
      type: 'factoryReset',
      name: 'Reset Seluruh Data Website ke Pengaturan Awal (Factory Reset)',
    });
  };

  // Confirmation executor for in-app confirmation modal
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'product' && deleteTarget.id) {
      const updated = products.filter((p) => p.id !== deleteTarget.id);
      onUpdateProducts(updated);
      dataStorage.saveProducts(updated);
      dataStorage.deleteProductRemote(deleteTarget.id);
      showToast(`Produk "${deleteTarget.name}" berhasil dihapus.`);
    } else if (deleteTarget.type === 'category' && deleteTarget.id) {
      const updated = categories.filter((c) => c.id !== deleteTarget.id);
      onUpdateCategories(updated);
      dataStorage.saveCategories(updated);
      dataStorage.deleteCategoryRemote(deleteTarget.id);
      showToast(`Kategori "${deleteTarget.name}" berhasil dihapus.`);
    } else if (deleteTarget.type === 'guide' && deleteTarget.id) {
      const updated = guides.filter((g) => g.id !== deleteTarget.id);
      onUpdateGuides(updated);
      dataStorage.saveGuides(updated);
      dataStorage.deleteGuideRemote(deleteTarget.id);
      showToast(`Panduan "${deleteTarget.name}" berhasil dihapus.`);
    } else if (deleteTarget.type === 'factoryReset') {
      const def = dataStorage.resetAllData();
      onUpdateProducts(def.products);
      onUpdateCategories(def.categories);
      onUpdateGuides(def.guides);
      onUpdateSettings(def.settings);
      showToast('Data berhasil di-reset ke pengaturan awal!');
    }

    setDeleteTarget(null);
  };

  // ----------------------------------------------------
  // 1. SPLASH SCREEN / LOADING SCREEN (Before password)
  // ----------------------------------------------------
  if (showSplashLoading) {
    return (
      <div
        onClick={() => setShowSplashLoading(false)}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111111] text-white px-4 cursor-pointer select-none"
        title="Klik untuk melewati langsung ke verifikasi password"
      >
        {/* Ambient Tech Glow */}
        <div className="absolute w-96 h-96 rounded-full bg-[#FF6B00]/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
          {/* Hexagon Shield with pulsing aura */}
          <div className="relative mb-6">
            <div className="absolute -inset-3 rounded-2xl border border-[#FF6B00]/40 animate-ping pointer-events-none" />
            <div className="w-20 h-20 bg-[#1A1A1A] border-2 border-[#FF6B00] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,107,0,0.35)]">
              <svg width="44" height="44" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" fill="#FF6B00" />
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 mb-3">
            <Shield className="w-3.5 h-3.5" />
            ADMINTECHCHECK SECURITY GATEWAY
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Memuat Super Admin Mode
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {splashStatusText}
          </p>

          {/* Animated Progress Bar */}
          <div className="w-full h-2 bg-neutral-800 rounded-full mt-6 overflow-hidden relative border border-neutral-700/60">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B00] to-amber-400 transition-all duration-100 ease-out rounded-full shadow-[0_0_12px_#FF6B00]"
              style={{ width: `${splashProgress}%` }}
            />
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-neutral-500 font-mono mt-2.5">
            <span>Enkripsi Sesi Admin</span>
            <span className="text-[#FF6B00] font-bold">{splashProgress}%</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowSplashLoading(false);
            }}
            className="mt-8 text-xs font-semibold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer underline underline-offset-4"
          >
            Lewati & Masuk Verifikasi Password →
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. PASSWORD SCREEN (After splash screen finishes)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F7F6F2]">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#E9E9E6] shadow-xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-[#111111] rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" fill="#FF6B00" />
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 text-[#FF6B00] border border-orange-200/80 mb-2">
              <Shield className="w-3.5 h-3.5" />
              PORTAL ADMINTECHCHECK
            </div>
            <h1 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Verifikasi Password Superadmin
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Masukkan password keamanan untuk mengakses mode super admin TechCheck
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Password Super Admin *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={loginPasscode}
                  onChange={(e) => {
                    setLoginPasscode(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-4 py-3 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-sm focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all text-[#111111] font-medium"
                  autoFocus
                />
              </div>
              {loginError && (
                <p className="text-xs text-rose-600 mt-2 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Masuk ke Dashboard admintechcheck</span>
              <Check className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate({ page: 'home' })}
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-500 hover:text-[#111111] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Halaman Depan Web</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SUPERADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F7F6F2] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-neutral-800 animate-in fade-in slide-in-from-bottom-3">
          <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Subheader Bar */}
      <div className="bg-white border-b border-[#E9E9E6] sticky top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#111111]">
                <Shield className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-[#111111]">
                    admintechcheck Dashboard
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B00] text-white">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  TechCheck Media Content & Affiliate Management System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate({ page: 'home' })}
                className="px-3.5 py-2 rounded-lg text-xs font-bold text-neutral-700 bg-[#F7F6F2] hover:bg-neutral-200/80 border border-[#E9E9E6] flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Lihat Website</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-100">
            <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E9E9E6] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Total Produk</span>
              <span className="text-base font-black text-[#111111]">{products.length}</span>
            </div>
            <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E9E9E6] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Featured</span>
              <span className="text-base font-black text-[#FF6B00]">
                {products.filter((p) => p.featured).length}
              </span>
            </div>
            <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E9E9E6] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Kategori</span>
              <span className="text-base font-black text-[#111111]">{categories.length}</span>
            </div>
            <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E9E9E6] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Panduan</span>
              <span className="text-base font-black text-[#111111]">{guides.length}</span>
            </div>
          </div>
        </div>

          {/* Tab Navigation */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pt-2">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'products'
                  ? 'border-[#FF6B00] text-[#FF6B00]'
                  : 'border-transparent text-neutral-600 hover:text-[#111111]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Katalog Produk ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'categories'
                  ? 'border-[#FF6B00] text-[#FF6B00]'
                  : 'border-transparent text-neutral-600 hover:text-[#111111]'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              <span>Kategori ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('guides')}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'guides'
                  ? 'border-[#FF6B00] text-[#FF6B00]'
                  : 'border-transparent text-neutral-600 hover:text-[#111111]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Panduan & Artikel ({guides.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-[#FF6B00] text-[#FF6B00]'
                  : 'border-transparent text-neutral-600 hover:text-[#111111]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Pengaturan Web & Afiliasi</span>
            </button>
          </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* ==================================================== */}
        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white p-5 rounded-2xl border border-[#E9E9E6] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-1 w-full flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Cari produk berdasarkan nama..."
                    className="w-full pl-9 pr-4 py-2 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="w-full sm:w-48 py-2 px-3 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF6B00] transition-all"
                >
                  <option value="All">Semua Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenCreateProduct}
                className="w-full md:w-auto px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk Baru</span>
              </button>
            </div>

            {/* Products Table / List */}
            <div className="bg-white rounded-2xl border border-[#E9E9E6] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F6F2] border-b border-[#E9E9E6] text-neutral-500 uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Produk</th>
                      <th className="py-3.5 px-4">Kategori</th>
                      <th className="py-3.5 px-4">Badge</th>
                      <th className="py-3.5 px-4 text-center">Featured (Beranda)</th>
                      <th className="py-3.5 px-4">Link Afiliasi</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E9E6]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                          Tidak ada produk yang sesuai dengan kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h4 className="font-bold text-[#111111] text-sm hover:text-[#FF6B00] transition-colors">
                                  {prod.name}
                                </h4>
                                <p className="text-neutral-500 text-[11px] line-clamp-1 max-w-xs">
                                  {prod.shortBenefit || prod.slug}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold text-[#FF6B00] bg-orange-50 border border-orange-200/80">
                              {prod.category}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-[#111111]">
                              {prod.badge}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleFeatured(prod.id)}
                              className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                                prod.featured
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                              }`}
                            >
                              {prod.featured ? '✓ Tampil di Home' : 'Tidak Tampil'}
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            {prod.affiliateUrl ? (
                              <a
                                href={prod.affiliateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[#FF6B00] hover:underline max-w-[180px] truncate"
                                title={prod.affiliateUrl}
                              >
                                <span className="truncate">Shopee / Partner</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-neutral-400 italic">Belum diset</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onNavigate({ page: 'product-detail', slug: prod.slug })}
                                className="p-1.5 text-neutral-500 hover:text-[#111111] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                title="Lihat di Web"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDuplicateProduct(prod)}
                                className="p-1.5 text-neutral-500 hover:text-[#FF6B00] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                title="Duplikasi Produk"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Produk"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: CATEGORIES MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#E9E9E6] flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#111111]">Kelola Kategori Produk</h2>
                <p className="text-xs text-neutral-500">Atur pengelompokan produk dan deskripsi kategori</p>
              </div>

              <button
                onClick={handleOpenCreateCategory}
                className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>

            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white rounded-2xl border border-[#E9E9E6] p-6 flex flex-col justify-between shadow-xs hover:border-[#FF6B00] transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden">
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F7F6F2] text-neutral-700 border border-neutral-200">
                            {count} Produk
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#111111] mb-1">{cat.name}</h3>
                        <p className="text-xs font-mono text-neutral-400 mb-3">slug: /{cat.slug}</p>
                        <p className="text-xs text-neutral-600 leading-relaxed line-clamp-3">
                          {cat.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#E9E9E6] flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E9E9E6] p-12 text-center text-neutral-500 text-xs">
                Belum ada kategori produk. Klik "Tambah Kategori Baru" di atas untuk membuat kategori.
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: GUIDES MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#E9E9E6] flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#111111]">Panduan & Artikel Editorial</h2>
                <p className="text-xs text-neutral-500">
                  Kelola konten edukasi, tips setup meja, dan artikel rekomendasi
                </p>
              </div>

              <button
                onClick={handleOpenCreateGuide}
                className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Panduan Baru</span>
              </button>
            </div>

            {guides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {guides.map((guide) => (
                  <div
                    key={guide.id}
                    className="bg-white rounded-2xl border border-[#E9E9E6] p-6 flex flex-col justify-between shadow-xs hover:border-[#FF6B00] transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                          <img src={guide.image} alt={guide.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                            {guide.category} • {guide.readTime}
                          </span>
                          <h3 className="text-base font-bold text-[#111111] line-clamp-1">{guide.title}</h3>
                          <p className="text-xs text-neutral-400 mt-0.5">Penulis: {guide.author?.name}</p>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-3">
                        {guide.excerpt}
                      </p>

                      <div className="text-[11px] text-neutral-400">
                        Total langkah langkah panduan: <span className="font-bold text-neutral-700">{guide.steps.length} langkah</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E9E9E6] flex items-center justify-between">
                      <button
                        onClick={() => onNavigate({ page: 'guide-detail', slug: guide.slug })}
                        className="text-xs font-semibold text-neutral-600 hover:text-[#FF6B00] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Artikel</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditGuide(guide)}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteGuide(guide.id, guide.title)}
                          className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E9E9E6] p-12 text-center text-neutral-500 text-xs">
                Belum ada artikel panduan. Klik "Tambah Panduan Baru" di atas untuk membuat panduan pertama.
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: SETTINGS & BACKUP */}
        {/* ==================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Top Announcement Bar Settings */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs">
              <h2 className="text-base font-bold text-[#111111] mb-1">
                Pengumuman Atas (Announcement Bar)
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Tampilkan banner teks promo atau update penting di paling atas situs web.
              </p>

              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="announcementToggle"
                    checked={siteSettings.announcementEnabled}
                    onChange={(e) =>
                      handleSaveSettings({
                        ...siteSettings,
                        announcementEnabled: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <label htmlFor="announcementToggle" className="text-xs font-bold text-neutral-800 cursor-pointer">
                    Aktifkan Announcement Bar di Website
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Teks Pengumuman
                  </label>
                  <input
                    type="text"
                    value={siteSettings.announcementText}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...siteSettings,
                        announcementText: e.target.value,
                      })
                    }
                    onBlur={() => handleSaveSettings(siteSettings)}
                    placeholder="Contoh: 🔥 Promo Diskon Shopee Monitor Acer Terbatas..."
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs focus:outline-none focus:border-[#FF6B00] text-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Hero Copy Editor */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs">
              <h2 className="text-base font-bold text-[#111111] mb-1">
                Kustomisasi Hero Beranda (Homepage Banner)
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Ubah judul besar, teks eyebrow, dan sub-deskripsi pada bagian depan website.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Eyebrow (Label Kecil Atas)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroEyebrow}
                    onChange={(e) =>
                      onUpdateSettings({ ...siteSettings, heroEyebrow: e.target.value })
                    }
                    onBlur={() => handleSaveSettings(siteSettings)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Headline Baris 1
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroHeadline1}
                    onChange={(e) =>
                      onUpdateSettings({ ...siteSettings, heroHeadline1: e.target.value })
                    }
                    onBlur={() => handleSaveSettings(siteSettings)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Headline Baris 2 (Warna Oranye)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroHeadline2}
                    onChange={(e) =>
                      onUpdateSettings({ ...siteSettings, heroHeadline2: e.target.value })
                    }
                    onBlur={() => handleSaveSettings(siteSettings)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Subtext Deskripsi Hero
                  </label>
                  <textarea
                    rows={2}
                    value={siteSettings.heroSubtext}
                    onChange={(e) =>
                      onUpdateSettings({ ...siteSettings, heroSubtext: e.target.value })
                    }
                    onBlur={() => handleSaveSettings(siteSettings)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Admin Security Settings */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs">
              <h2 className="text-base font-bold text-[#111111] mb-1">
                Keamanan & Password Superadmin
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Ubah kode akses login untuk proteksi dashboard superadmin ini.
              </p>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Kode Akses Baru (Passcode)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.adminPasscode}
                    onChange={(e) =>
                      onUpdateSettings({ ...siteSettings, adminPasscode: e.target.value })
                    }
                    onBlur={() => handleSaveSettings(siteSettings)}
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs font-mono font-bold text-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Supabase Cloud Database Status & Sync */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-5 border-b border-[#E9E9E6]">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-bold text-[#111111]">
                        Sinkronisasi Database & Tabel Supabase
                      </h2>
                      {supabaseStatus?.connected ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          4 TABEL TERHUBUNG (LIVE)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          {supabaseStatus?.configured ? 'TABEL PERLU SCHEMA' : 'STORAGE LOKAL (OFFLINE)'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Memastikan kesesuaian data website secara real-time dengan 4 tabel Supabase: <code className="font-mono text-neutral-800 font-bold">categories</code>, <code className="font-mono text-neutral-800 font-bold">products</code>, <code className="font-mono text-neutral-800 font-bold">guides</code>, <code className="font-mono text-neutral-800 font-bold">site_settings</code>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCheckSupabase}
                    disabled={isCheckingSupabase}
                    className="px-3 py-2 bg-[#F7F6F2] hover:bg-neutral-200/80 border border-[#E9E9E6] text-neutral-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Periksa ulang kesiapan koneksi dan tabel di Supabase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isCheckingSupabase ? 'Memeriksa...' : 'Cek Status'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenSchemaModal}
                    className="px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Lihat atau salin kode DDL SQL untuk Supabase SQL Editor"
                  >
                    <FileCode className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Lihat / Salin SQL Schema</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullFromSupabase}
                    disabled={isPullingSupabase}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Tarik data terbaru dari Supabase ke tampilan web"
                  >
                    <Download className={`w-3.5 h-3.5 ${isPullingSupabase ? 'animate-bounce' : ''}`} />
                    <span>{isPullingSupabase ? 'Memuat...' : 'Tarik dari Supabase (Pull)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingSupabase}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    title="Kirim dan sinkronkan semua katalog produk, kategori, dan artikel dari web ke Supabase"
                  >
                    <Upload className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingSupabase ? 'Menyinkronkan...' : 'Kirim ke Supabase (Push)'}</span>
                  </button>
                </div>
              </div>

              {/* Status Notice */}
              <div className={`p-4 rounded-xl border text-xs mb-5 flex items-start gap-2.5 ${supabaseStatus?.connected ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' : 'bg-amber-50/70 border-amber-200 text-amber-950'}`}>
                {supabaseStatus?.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {supabaseStatus?.connected ? 'Status Database: Terhubung & Sinkron' : 'Status Database: Perhatian Konfigurasi'}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                    {supabaseStatus?.message || 'Memeriksa status koneksi ke Supabase...'}
                  </p>
                </div>
              </div>

              {/* 4 Table Verification Grid */}
              <div className="mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Kesesuaian 4 Tabel Supabase & Web:</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Table 1: categories */}
                  <div className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#E9E9E6] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <FolderTree className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span className="font-mono text-xs font-bold text-neutral-900">categories</span>
                        </div>
                        {supabaseStatus?.connected ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">SIAP</span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">Lokal</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-700">Kategori Produk</p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        id, name, slug, product_count, image, sort_order
                      </p>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t border-[#E9E9E6] flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Jumlah di Web:</span>
                      <span className="font-bold text-[#111111]">{categories.length} data</span>
                    </div>
                  </div>

                  {/* Table 2: products */}
                  <div className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#E9E9E6] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span className="font-mono text-xs font-bold text-neutral-900">products</span>
                        </div>
                        {supabaseStatus?.connected ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">SIAP</span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">Lokal</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-700">Katalog Produk & Afiliasi</p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        id, slug, name, category, rating, specifications, gallery, affiliate_url
                      </p>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t border-[#E9E9E6] flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Jumlah di Web:</span>
                      <span className="font-bold text-[#111111]">{products.length} data</span>
                    </div>
                  </div>

                  {/* Table 3: guides */}
                  <div className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#E9E9E6] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span className="font-mono text-xs font-bold text-neutral-900">guides</span>
                        </div>
                        {supabaseStatus?.connected ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">SIAP</span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">Lokal</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-700">Panduan & Artikel Setup</p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        id, slug, title, category, author_name, steps (JSONB), featured
                      </p>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t border-[#E9E9E6] flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Jumlah di Web:</span>
                      <span className="font-bold text-[#111111]">{guides.length} artikel</span>
                    </div>
                  </div>

                  {/* Table 4: site_settings */}
                  <div className="p-3.5 bg-[#F7F6F2] rounded-xl border border-[#E9E9E6] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-[#FF6B00]" />
                          <span className="font-mono text-xs font-bold text-neutral-900">site_settings</span>
                        </div>
                        {supabaseStatus?.connected ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">SIAP</span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">Lokal</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-700">Pengaturan Website</p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        id (1), announcement_text, hero_copy, admin_passcode
                      </p>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t border-[#E9E9E6] flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Format:</span>
                      <span className="font-bold text-[#111111]">Singleton (Row 1)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions on connecting */}
              <div className="p-4 rounded-xl bg-[#F7F6F2] border border-[#E9E9E6] text-xs text-neutral-600">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-neutral-800">Langkah Memastikan Tabel Supabase Sinkron dengan Web:</p>
                  <button
                    type="button"
                    onClick={handleOpenSchemaModal}
                    className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <FileCode className="w-3 h-3" />
                    <span>Buka File schema.sql</span>
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-neutral-600">
                  <li>Buka proyek Supabase Anda (<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#FF6B00] font-semibold hover:underline">supabase.com/dashboard</a>) dan masuk ke menu <strong>SQL Editor</strong>.</li>
                  <li>Jalankan seluruh isi kode dari file <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono font-bold text-neutral-800">schema.sql</code> untuk membuat 4 tabel (<code className="font-mono text-neutral-800">categories</code>, <code className="font-mono text-neutral-800">products</code>, <code className="font-mono text-neutral-800">guides</code>, <code className="font-mono text-neutral-800">site_settings</code>) serta aturan RLS.</li>
                  <li>Masukkan <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono font-bold text-neutral-800">SUPABASE_URL</code> dan <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono font-bold text-neutral-800">SUPABASE_KEY</code> ke dalam Secrets / Environment aplikasi.</li>
                  <li>Klik tombol <strong>"Kirim ke Supabase (Push)"</strong> di atas untuk menyinkronkan seluruh katalog dan pengaturan web Anda ke tabel Supabase secara otomatis!</li>
                </ol>
              </div>
            </div>

            {/* Data Backup & Recovery */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs">
              <h2 className="text-base font-bold text-[#111111] mb-1">
                Backup, Restore & Reset Data
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Amankan data website Anda secara berkala atau pulihkan dari file JSON cadangan.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4 text-[#FF6B00]" />
                  <span>Download Backup Data (JSON)</span>
                </button>

                <label className="px-4 py-2.5 bg-[#F7F6F2] hover:bg-neutral-200 border border-[#E9E9E6] text-neutral-800 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Import Data dari JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleResetFactoryData}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ml-auto"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset ke Pengaturan Awal (Factory Reset)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* PRODUCT FORM MODAL (CREATE / EDIT) */}
      {/* ==================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E9E9E6] shadow-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E9E9E6] flex items-center justify-between bg-[#F7F6F2]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  {editingProduct ? 'EDIT PRODUK' : 'PRODUK BARU'}
                </span>
                <h3 className="text-xl font-extrabold text-[#111111]">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Tambah Produk Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-[#111111] rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Error Banner */}
              {productFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{productFormError}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Nama Produk *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name || ''}
                    onChange={(e) => {
                      setProductFormData({ ...productFormData, name: e.target.value });
                      if (productFormError) setProductFormError(null);
                    }}
                    placeholder="Contoh: Acer Nitro KG271U Z2"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-2">Kategori *</label>
                  {categories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(
                        new Set([
                          ...categories.map((c) => c.name),
                          productFormData.category || '',
                        ].filter(Boolean))
                      ).map((catName) => (
                        <div
                          key={catName}
                          onClick={() => setProductFormData({ ...productFormData, category: catName })}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                            (productFormData.category || categories[0]?.name || '') === catName
                              ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-sm'
                              : 'bg-white text-neutral-600 border-[#E9E9E6] hover:bg-neutral-100 hover:border-neutral-300'
                          }`}
                        >
                          {catName}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-500 italic p-3 bg-neutral-100 rounded-xl border border-neutral-200">
                      Belum ada kategori yang ditambahkan. Silakan ke tab "Kelola Kategori" untuk menambah kategori terlebih dahulu.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Badge Produk</label>
                  <input
                    type="text"
                    value={productFormData.badge || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value })}
                    placeholder="Contoh: BEST GAMING MONITOR, CREATOR FAVORITE"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Tampilkan di Beranda (Featured)</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="modalFeaturedToggle"
                      checked={!!productFormData.featured}
                      onChange={(e) => setProductFormData({ ...productFormData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <label htmlFor="modalFeaturedToggle" className="font-semibold text-neutral-700 cursor-pointer">
                      Ya, tampilkan di bagian Top Picks beranda
                    </label>
                  </div>
                </div>
              </div>

              {/* Short Benefit & Description */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Short Benefit (Teks ringkas di bawah judul card)
                </label>
                <input
                  type="text"
                  value={productFormData.shortBenefit || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, shortBenefit: e.target.value })}
                  placeholder="Contoh: 27' WQHD IPS gaming monitor with 275Hz refresh rate..."
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                />
              </div>

              {/* Affiliate URL */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Link Afiliasi Shopee / Mitra (Affiliate URL) *</span>
                </label>
                <input
                  type="text"
                  value={productFormData.affiliateUrl || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, affiliateUrl: e.target.value })}
                  placeholder="https://shopee.sg/... atau https://atid.me/..."
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono text-neutral-800"
                />
              </div>

              {/* Image URL with Presets */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">URL Gambar Utama</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={productFormData.image || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                    placeholder="/acer-nitro.png atau URL gambar web"
                    className="flex-1 p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono"
                  />
                  {productFormData.image && (
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0">
                      <img src={productFormData.image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-neutral-400">Pilihan cepat:</span>
                  {['/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png'].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setProductFormData({ ...productFormData, image: preset })}
                      className="px-2 py-1 text-[10px] font-mono bg-neutral-100 hover:bg-orange-100 text-neutral-700 rounded border border-neutral-200 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Highlights (Line by line) */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Product Highlights (1 baris per poin)
                </label>
                <textarea
                  rows={3}
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder="27' WQHD IPS display&#10;275Hz refresh rate&#10;0.5ms response time"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                />
              </div>

              {/* Why We Recommend It (Line by line) */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Why We Recommend It / Benefits (1 baris per poin)
                </label>
                <textarea
                  rows={3}
                  value={benefitsText}
                  onChange={(e) => setBenefitsText(e.target.value)}
                  placeholder="Smooth and responsive gameplay&#10;Sharp and vibrant visual quality"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                />
              </div>

              {/* Specifications JSON / Key Values */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Spesifikasi Teknis (Format: Nama: Nilai, 1 baris per spesifikasi)
                </label>
                <textarea
                  rows={4}
                  value={specsText}
                  onChange={(e) => setSpecsText(e.target.value)}
                  placeholder="Screen Size: 27'&#10;Resolution: 2560 x 1440 (WQHD)&#10;Refresh Rate: 275Hz"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono"
                />
              </div>

              {/* Best For & Verdict */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Best For (Target Pengguna)</label>
                  <input
                    type="text"
                    value={productFormData.bestFor || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, bestFor: e.target.value })}
                    placeholder="Gamers who want high refresh rates"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Our Take (Verdict Review)</label>
                  <input
                    type="text"
                    value={productFormData.verdict || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, verdict: e.target.value })}
                    placeholder="The Acer Nitro KG271U Z2 offers a great balance..."
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Great For & Setup Considerations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Cocok Untuk / Great For (1 baris per poin)</label>
                  <textarea
                    rows={2}
                    value={greatForText}
                    onChange={(e) => setGreatForText(e.target.value)}
                    placeholder="Small desks&#10;Clean setups"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Pertimbangan Setup / Considerations (1 baris per poin)</label>
                  <textarea
                    rows={2}
                    value={setupConsiderationsText}
                    onChange={(e) => setSetupConsiderationsText(e.target.value)}
                    placeholder="Check available desk clearance before mounting."
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#E9E9E6] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-[#F7F6F2] hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Produk</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* CATEGORY FORM MODAL (CREATE / EDIT) */}
      {/* ==================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E9E9E6] shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-[#E9E9E6] flex items-center justify-between bg-[#F7F6F2]">
              <h3 className="text-lg font-extrabold text-[#111111]">
                {editingCategory ? `Edit Kategori: ${editingCategory.name}` : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-[#111111] rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              {categoryFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{categoryFormError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name || ''}
                  onChange={(e) => {
                    setCategoryFormData({ ...categoryFormData, name: e.target.value });
                    if (categoryFormError) setCategoryFormError(null);
                  }}
                  placeholder="Contoh: Audio, Lighting, Monitors"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Slug URL (Opsional)</label>
                <input
                  type="text"
                  value={categoryFormData.slug || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                  placeholder="monitors, accessories (otomatis jika kosong)"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Deskripsi Kategori</label>
                <textarea
                  rows={3}
                  value={categoryFormData.description || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Deskripsi ringkas kategori..."
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">URL Gambar Cover</label>
                <input
                  type="text"
                  value={categoryFormData.image || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, image: e.target.value })}
                  placeholder="/acer-nitro.png"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono"
                />
              </div>

              <div className="pt-4 border-t border-[#E9E9E6] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2 bg-[#F7F6F2] hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* GUIDE FORM MODAL (CREATE / EDIT) */}
      {/* ==================================================== */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#E9E9E6] shadow-2xl w-full max-w-2xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E9E9E6] flex items-center justify-between bg-[#F7F6F2]">
              <h3 className="text-lg font-extrabold text-[#111111]">
                {editingGuide ? `Edit Panduan: ${editingGuide.title}` : 'Tambah Panduan Baru'}
              </h3>
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-[#111111] rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGuide} className="p-6 overflow-y-auto space-y-4 text-xs">
              {guideFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{guideFormError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Judul Panduan *</label>
                <input
                  type="text"
                  required
                  value={guideFormData.title || ''}
                  onChange={(e) => {
                    setGuideFormData({ ...guideFormData, title: e.target.value });
                    if (guideFormError) setGuideFormError(null);
                  }}
                  placeholder="Contoh: The Ultimate Dual Monitor Desk Mount Guide"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Kategori Panduan</label>
                  <input
                    type="text"
                    value={guideFormData.category || ''}
                    onChange={(e) => setGuideFormData({ ...guideFormData, category: e.target.value })}
                    placeholder="Setup Advice, Cable Management"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Waktu Baca (Read Time)</label>
                  <input
                    type="text"
                    value={guideFormData.readTime || ''}
                    onChange={(e) => setGuideFormData({ ...guideFormData, readTime: e.target.value })}
                    placeholder="4 min read"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Ringkasan / Excerpt</label>
                <textarea
                  rows={2}
                  value={guideFormData.excerpt || ''}
                  onChange={(e) => setGuideFormData({ ...guideFormData, excerpt: e.target.value })}
                  placeholder="Ringkasan singkat tentang panduan ini..."
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">URL Gambar Header</label>
                <input
                  type="text"
                  value={guideFormData.image || ''}
                  onChange={(e) => setGuideFormData({ ...guideFormData, image: e.target.value })}
                  placeholder="/acer-nitro.png"
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono"
                />
              </div>

              <div className="pt-4 border-t border-[#E9E9E6] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGuideModalOpen(false)}
                  className="px-5 py-2 bg-[#F7F6F2] hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Simpan Panduan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* IN-APP CONFIRMATION MODAL (SAFE IN IFRAMES) */}
      {/* ==================================================== */}
      {deleteTarget && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E9E9E6] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-extrabold text-[#111111] mb-2">
                {deleteTarget.type === 'factoryReset'
                  ? 'Konfirmasi Factory Reset'
                  : 'Konfirmasi Penghapusan'}
              </h3>

              <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                {deleteTarget.type === 'factoryReset' ? (
                  <>
                    Apakah Anda yakin ingin me-reset seluruh data website ke pengaturan awal? Semua produk baru,
                    kategori baru, dan pengaturan kustom akan dikembalikan ke data default.
                  </>
                ) : (
                  <>
                    Apakah Anda yakin ingin menghapus {deleteTarget.type === 'product' ? 'produk' : deleteTarget.type === 'category' ? 'kategori' : 'panduan'}{' '}
                    <strong className="text-neutral-900 font-bold">"{deleteTarget.name}"</strong>? Tindakan ini
                    akan langsung menghapusnya dari website dan tidak dapat dibatalkan.
                  </>
                )}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2.5 bg-[#F7F6F2] hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {deleteTarget.type === 'factoryReset' ? 'Ya, Reset Sekarang' : 'Ya, Hapus Sekarang'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ==================================================== */}
      {/* SUPABASE SQL SCHEMA VIEWER & COPIER MODAL */}
      {/* ==================================================== */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-neutral-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-[#1f1f1f]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/30 text-[#FF6B00] flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Skema Database Supabase (schema.sql)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Jalankan skrip ini sekali di Supabase Dashboard &gt; SQL Editor untuk membuat 4 tabel & RLS.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySchemaSql}
                  className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchema ? 'Tersalin!' : 'Salin Semua SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSchemaModal(false)}
                  className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center text-sm font-bold cursor-pointer transition-all"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* SQL Code Body */}
            <div className="p-4 overflow-y-auto font-mono text-xs text-emerald-400 bg-[#121212] flex-1 select-text leading-relaxed whitespace-pre">
              {schemaSql || 'Memuat skema SQL...'}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800 bg-[#1a1a1a] flex items-center justify-between text-xs text-neutral-400">
              <span>Mencakup: <code className="text-neutral-200">categories</code>, <code className="text-neutral-200">products</code>, <code className="text-neutral-200">guides</code>, <code className="text-neutral-200">site_settings</code> + RLS</span>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
