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
  Eye,
  FileText,
  ListOrdered,
  Globe
} from 'lucide-react';
import { Product, CategoryInfo, Guide, GuideStep, SiteSettings, ViewRoute } from '../types';
import { dataStorage, DEFAULT_SITE_SETTINGS } from '../services/dataStorage';
import { AdminImageUploader } from '../components/AdminImageUploader';

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

function renderAdminDocPreview(text: string) {
  if (!text?.trim()) {
    return (
      <div className="p-8 text-center text-neutral-400 bg-white rounded-xl border border-dashed border-[#E9E9E6]">
        No document content written yet. Compose article text in the &quot;Write Document&quot; tab.
      </div>
    );
  }
  const blocks = text.split(/\n\n+/);
  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E9E9E6] space-y-4 text-xs leading-relaxed text-neutral-800">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;
        if (trimmed === '---' || trimmed === '***') return <hr key={idx} className="border-t border-neutral-200 my-4" />;
        if (trimmed.startsWith('### ')) return <h5 key={idx} className="font-bold text-sm text-[#111111] pt-2">{trimmed.replace(/^###\s+/, '')}</h5>;
        if (trimmed.startsWith('## ')) return <h4 key={idx} className="font-extrabold text-base text-[#111111] pt-3 pb-1 border-b border-neutral-100">{trimmed.replace(/^##\s+/, '')}</h4>;
        if (trimmed.startsWith('# ')) return <h3 key={idx} className="font-black text-lg text-[#111111] pt-4">{trimmed.replace(/^#\s+/, '')}</h3>;
        if (trimmed.startsWith('> ')) return <blockquote key={idx} className="pl-3 border-l-4 border-[#FF6B00] italic bg-orange-50/60 py-2 pr-3 rounded-r-lg text-neutral-700">{trimmed.replace(/^>\s+/, '')}</blockquote>;
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              {trimmed.split('\n').filter(Boolean).map((it, i) => (
                <li key={i}>{it.replace(/^[-*]\s+/, '')}</li>
              ))}
            </ul>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1">
              {trimmed.split('\n').filter(Boolean).map((it, i) => (
                <li key={i}>{it.replace(/^\d+\.\s+/, '')}</li>
              ))}
            </ol>
          );
        }
        return <p key={idx} className="text-neutral-700 leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
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
  const [splashStatusText, setSplashStatusText] = useState<string>('Initializing superadmin gateway...');

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
        setSplashStatusText('Initializing superadmin gateway...');
      } else if (progress < 65) {
        setSplashStatusText('Verifying security modules & session encryption...');
      } else if (progress < 90) {
        setSplashStatusText('Preparing authentication gateway...');
      } else {
        setSplashStatusText('Ready. Redirecting to passcode verification...');
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
  const [initialGuideData, setInitialGuideData] = useState<string>('{}');
  const [guideFormError, setGuideFormError] = useState<string | null>(null);
  const [guideModalTab, setGuideModalTab] = useState<'basic' | 'editorial' | 'steps'>('basic');
  const [guideDocPreview, setGuideDocPreview] = useState(false);

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
  const [copiedDns, setCopiedDns] = useState<string | null>(null);

  // Supabase Configuration Management
  const [supabaseConfig, setSupabaseConfig] = useState<{ url: string; keyMasked: string; hasKey: boolean; isConfigured: boolean }>({
    url: '',
    keyMasked: '',
    hasKey: false,
    isConfigured: false,
  });
  const [inputSupabaseUrl, setInputSupabaseUrl] = useState('');
  const [inputSupabaseKey, setInputSupabaseKey] = useState('');
  const [isSavingSupabaseConfig, setIsSavingSupabaseConfig] = useState(false);
  const [showConfigForm, setShowConfigForm] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      dataStorage.checkSupabaseStatus().then(setSupabaseStatus);
      dataStorage.getSupabaseConfig().then((cfg) => {
        setSupabaseConfig(cfg);
        if (cfg.url) setInputSupabaseUrl(cfg.url);
      });
    }
  }, [isAuthenticated]);

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputSupabaseUrl.trim() || !inputSupabaseKey.trim()) {
      showToast('Please enter both Supabase Project URL and API Key.');
      return;
    }
    setIsSavingSupabaseConfig(true);
    const res = await dataStorage.saveSupabaseConfig(inputSupabaseUrl, inputSupabaseKey);
    setIsSavingSupabaseConfig(false);
    if (res.success) {
      showToast('Supabase configuration saved and connected successfully!');
      setShowConfigForm(false);
      handleCheckSupabase();
      dataStorage.getSupabaseConfig().then(setSupabaseConfig);
    } else {
      showToast(`Connection failed: ${res.error || 'Check Project URL & Key'}`);
    }
  };

  // Lock background body scrolling when any modal is open, and restore when closed
  const isAnyAdminModalOpen =
    isProductModalOpen ||
    isCategoryModalOpen ||
    isGuideModalOpen ||
    Boolean(deleteTarget) ||
    showSchemaModal;

  React.useEffect(() => {
    if (isAnyAdminModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyAdminModalOpen]);

  const handleCheckSupabase = async () => {
    setIsCheckingSupabase(true);
    const status = await dataStorage.checkSupabaseStatus();
    setSupabaseStatus(status);
    setIsCheckingSupabase(false);
    showToast(status.connected ? 'Supabase connected successfully! All tables ready.' : (status.message || 'Status updated.'));
  };

  const handleSyncToSupabase = async () => {
    setIsSyncingSupabase(true);
    const res = await dataStorage.syncAllToSupabase();
    setIsSyncingSupabase(false);
    if (res.success) {
      showToast('All website data successfully synced to Supabase tables!');
      dataStorage.checkSupabaseStatus().then(setSupabaseStatus);
    } else {
      showToast(`Sync failed: ${res.message}`);
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
      showToast('Latest data pulled from Supabase and applied to website!');
      dataStorage.checkSupabaseStatus().then(setSupabaseStatus);
    } else {
      showToast('Failed to load data from Supabase or Supabase is not connected.');
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
      showToast('SQL Schema (schema.sql) successfully copied to clipboard!');
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
      sessionStorage.setItem('techcheck_developer_mode', 'true');
      localStorage.setItem('techcheck_developer_mode', 'true');
      sessionStorage.removeItem('techcheck_visual_mode');
      localStorage.removeItem('techcheck_visual_mode');
      setIsAuthenticated(true);
      setLoginError('');
      showToast('Successfully logged in to Superadmin Dashboard');
    } else {
      setLoginError('Invalid passcode. Default passcode: 654321');
    }
  };

  const handleLogout = () => {
    dataStorage.setAdminAuthenticated(false);
    sessionStorage.removeItem('techcheck_developer_mode');
    sessionStorage.removeItem('techcheck_visual_mode');
    localStorage.removeItem('techcheck_developer_mode');
    localStorage.removeItem('techcheck_visual_mode');
    setIsAuthenticated(false);
    setLoginPasscode('');
    setShowSplashLoading(false);
    window.location.href = 'https://techcheck.homes/';
  };

  // --- PRODUCT ACTIONS ---
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductFormError(null);
    setProductFormData({
      id: `prod-${Date.now()}`,
      slug: '',
      name: '',
      category: categories[0]?.name || '',
      rating: 5.0,
      reviewCount: 0,
      image: '',
      gallery: [],
      badge: '',
      shortBenefit: '',
      description: '',
      bestFor: '',
      verdict: '',
      affiliateUrl: '',
      featured: false,
      productType: categories[0]?.name || '',
      deskSizeCompatibility: '',
    });
    setHighlightsText('');
    setBenefitsText('');
    setSpecsText('');
    setGreatForText('');
    setSetupConsiderationsText('');
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
      setProductFormError('Product name is required!');
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
      rating: Number(productFormData.rating) || 5.0,
      reviewCount: Number(productFormData.reviewCount) || 0,
      image: productFormData.image || '',
      gallery:
        productFormData.gallery && productFormData.gallery.length > 0
          ? productFormData.gallery
          : (productFormData.image ? [productFormData.image] : []),
      badge: productFormData.badge || '',
      shortBenefit: productFormData.shortBenefit || '',
      description: productFormData.description || '',
      benefits: parsedBenefits,
      highlights: parsedHighlights,
      specifications: parsedSpecs,
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

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error');
      }
      showToast(editingProduct ? `Product "${newProduct.name}" updated in Supabase!` : `Product "${newProduct.name}" added to Supabase!`);
    } catch (err: any) {
      showToast(`Saved locally, but failed to sync to Supabase: ${err.message}`);
      console.error(err);
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
    showToast(`Product "${prod.name}" successfully duplicated!`);
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
      image: '',
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
      setCategoryFormError('Category name is required!');
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
      image: categoryFormData.image || '',
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

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error');
      }
      showToast(editingCategory ? `Category "${newCat.name}" updated in Supabase!` : `Category "${newCat.name}" added to Supabase!`);
    } catch (err: any) {
      showToast(`Saved locally, but failed to sync to Supabase: ${err.message}`);
      console.error(err);
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
    setGuideModalTab('basic');
    setGuideDocPreview(false);
    const initialData: Partial<Guide> = {
      id: `guide-${Date.now()}`,
      slug: '',
      title: '',
      category: 'Setup Advice',
      readTime: '5 min read',
      publishDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      excerpt: '',
      image: '',
      featured: false,
      author: {
        name: 'TechCheck Editorial',
        role: 'Setup Specialist',
        avatar: '',
      },
      intro: '',
      steps: [],
      callout: '',
      summary: '',
      layoutFormat: 'document',
      showContentImages: true,
      content: '',
      hideStepNumbers: false,
    };
    setGuideFormData(initialData);
    setInitialGuideData(JSON.stringify(initialData));
    setIsGuideModalOpen(true);
  };

  const handleOpenEditGuide = (g: Guide) => {
    setEditingGuide(g);
    setGuideFormError(null);
    setGuideModalTab('basic');
    setGuideDocPreview(false);
    const copy = JSON.parse(JSON.stringify(g));
    if (!copy.layoutFormat) {
      copy.layoutFormat = copy.content && (!copy.steps || copy.steps.length === 0) ? 'document' : 'steps';
    }
    const hasAnyStepImage = Array.isArray(copy.steps) && copy.steps.some((s: any) => Boolean(s?.image?.trim()));
    if (copy.showContentImages === undefined) {
      copy.showContentImages = hasAnyStepImage ? true : true;
    }
    if (copy.content === undefined) {
      copy.content = '';
    }
    if (copy.hideStepNumbers === undefined) {
      copy.hideStepNumbers = false;
    }
    setGuideFormData(copy);
    setInitialGuideData(JSON.stringify(copy));
    setIsGuideModalOpen(true);
  };

  const handleConvertStepsToDocument = () => {
    if (!guideFormData.steps || guideFormData.steps.length === 0) return;
    const converted = guideFormData.steps
      .map((st, idx) => `## ${st.title || `Bagian ${idx + 1}`}\n\n${st.text || ''}`)
      .join('\n\n');
    const existing = guideFormData.content?.trim() ? guideFormData.content.trim() + '\n\n' : '';
    setGuideFormData((prev) => ({
      ...prev,
      content: existing + converted,
      layoutFormat: 'document',
    }));
  };

  const handleCloseGuideModal = () => {
    setIsGuideModalOpen(false);
    setGuideFormData({});
    setGuideFormError(null);
  };

  const handleAddGuideStep = () => {
    const currentSteps = Array.isArray(guideFormData.steps) ? [...guideFormData.steps] : [];
    const nextNumber = String(currentSteps.length + 1).padStart(2, '0');
    currentSteps.push({
      number: nextNumber,
      title: `Step ${nextNumber}`,
      text: '',
      image: '',
      recommendedProductSlug: '',
    });
    setGuideFormData((prev) => ({ ...prev, steps: currentSteps }));
  };

  const handleUpdateGuideStep = (index: number, updatedFields: Partial<GuideStep>) => {
    const currentSteps = Array.isArray(guideFormData.steps) ? [...guideFormData.steps] : [];
    if (currentSteps[index]) {
      currentSteps[index] = { ...currentSteps[index], ...updatedFields };
      setGuideFormData((prev) => ({ ...prev, steps: currentSteps }));
    }
  };

  const handleDeleteGuideStep = (index: number) => {
    const currentSteps = Array.isArray(guideFormData.steps) ? [...guideFormData.steps] : [];
    currentSteps.splice(index, 1);
    const renumbered = currentSteps.map((step, idx) => ({
      ...step,
      number: String(idx + 1).padStart(2, '0'),
    }));
    setGuideFormData((prev) => ({ ...prev, steps: renumbered }));
  };

  const handleMoveGuideStep = (index: number, direction: 'up' | 'down') => {
    const currentSteps = Array.isArray(guideFormData.steps) ? [...guideFormData.steps] : [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSteps.length) return;
    const temp = currentSteps[index];
    currentSteps[index] = currentSteps[targetIndex];
    currentSteps[targetIndex] = temp;
    const renumbered = currentSteps.map((step, idx) => ({
      ...step,
      number: String(idx + 1).padStart(2, '0'),
    }));
    setGuideFormData((prev) => ({ ...prev, steps: renumbered }));
  };

  const handleSaveGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideFormData.title?.trim()) {
      setGuideFormError('Guide title is required!');
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
      image: guideFormData.image || '',
      featured: !!guideFormData.featured,
      author: guideFormData.author || {
        name: 'TechCheck Editorial',
        role: 'Setup Specialist',
        avatar: '',
      },
      intro: guideFormData.intro || '',
      steps: Array.isArray(guideFormData.steps) ? guideFormData.steps : [],
      callout: guideFormData.callout || '',
      summary: guideFormData.summary || '',
      layoutFormat: (guideFormData.layoutFormat as 'document' | 'steps') || 'document',
      showContentImages: guideFormData.showContentImages !== false,
      content: guideFormData.content || '',
      hideStepNumbers: Boolean(guideFormData.hideStepNumbers),
    };

    let updatedList: Guide[];
    if (editingGuide) {
      updatedList = guides.map((g) => (g.id === editingGuide.id ? newGuide : g));
    } else {
      updatedList = [newGuide, ...guides];
    }

    onUpdateGuides(updatedList);
    dataStorage.saveGuides(updatedList);

    try {
      const res = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuide),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error');
      }

      // Sync step records to article_blocks table in Supabase
      if (Array.isArray(newGuide.steps) && newGuide.steps.length > 0) {
        newGuide.steps.forEach((st, idx) => {
          const stepNumber = st.number || String(idx + 1).padStart(2, '0');
          const blockId = st.id || `${newGuide.id}-step-${stepNumber}`;
          const imgUrl = st.image?.trim() || st.image_url?.trim() || '';
          dataStorage.saveArticleBlock(blockId, {
            guide_id: newGuide.id,
            step_number: stepNumber,
            title: st.title || '',
            text: st.text || '',
            image: imgUrl,
            image_url: imgUrl,
            caption: st.caption || st.title || '',
            alt_text: st.title || '',
            recommendedProductSlug: st.recommendedProductSlug || '',
          });
        });
      }

      showToast(editingGuide ? `Guide "${newGuide.title}" updated in Supabase!` : `Guide "${newGuide.title}" added to Supabase!`);
    } catch (err: any) {
      showToast(`Saved locally, but failed to sync to Supabase: ${err.message}`);
      console.error(err);
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
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error');
      }
      showToast('Website settings successfully saved to Supabase!');
    } catch (err: any) {
      showToast(`Saved locally: ${err.message}`);
      console.error(err);
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
    showToast('Backup JSON file downloaded successfully!');
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
        showToast('Backup data imported & loaded successfully!');
      } else {
        showToast(res.message || 'Failed to import JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetFactoryData = () => {
    setDeleteTarget({
      type: 'factoryReset',
      name: 'Reset All Website Data to Defaults (Factory Reset)',
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
      showToast(`Product "${deleteTarget.name}" deleted successfully.`);
    } else if (deleteTarget.type === 'category' && deleteTarget.id) {
      const updated = categories.filter((c) => c.id !== deleteTarget.id);
      onUpdateCategories(updated);
      dataStorage.saveCategories(updated);
      dataStorage.deleteCategoryRemote(deleteTarget.id);
      showToast(`Category "${deleteTarget.name}" deleted successfully.`);
    } else if (deleteTarget.type === 'guide' && deleteTarget.id) {
      const updated = guides.filter((g) => g.id !== deleteTarget.id);
      onUpdateGuides(updated);
      dataStorage.saveGuides(updated);
      dataStorage.deleteGuideRemote(deleteTarget.id);
      showToast(`Guide "${deleteTarget.name}" deleted successfully.`);
    } else if (deleteTarget.type === 'factoryReset') {
      const def = dataStorage.resetAllData();
      onUpdateProducts(def.products);
      onUpdateCategories(def.categories);
      onUpdateGuides(def.guides);
      onUpdateSettings(def.settings);
      showToast('All data reset to factory defaults successfully!');
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
        title="Click to skip directly to passcode verification"
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
            Loading Super Admin Mode
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
            <span>Admin Session Encryption</span>
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
            Skip & Enter Passcode Verification →
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
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F7F6F2] dark:bg-[#0E0F12] transition-colors">
        <div className="w-full max-w-md bg-white dark:bg-[#16171D] rounded-3xl border border-[#E9E9E6] dark:border-[#272932] shadow-xl p-8 sm:p-10 transition-colors">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-[#111111] rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <svg width="34" height="34" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 2L2 9V23L16 30L30 23V9L16 2Z" fill="#FF6B00" />
                <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/40 text-[#FF6B00] border border-orange-200/80 dark:border-orange-900/50 mb-2">
              <Shield className="w-3.5 h-3.5" />
              ADMINTECHCHECK PORTAL
            </div>
            <h1 className="text-2xl font-extrabold text-[#111111] dark:text-white tracking-tight">
              Superadmin Verification
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Enter passcode to access the TechCheck superadmin dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Superadmin Passcode *
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
                  placeholder="Enter passcode..."
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
              <span>Sign In to Dashboard</span>
              <Check className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate({ page: 'home' })}
              className="w-full py-2.5 px-4 text-xs font-semibold text-neutral-500 hover:text-[#111111] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Website</span>
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
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#0E0F12] text-[#111111] dark:text-[#EDEDED] pb-24 transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111111] text-white text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-neutral-800 animate-in fade-in slide-in-from-bottom-3">
          <div className="w-2 h-2 rounded-full bg-[#FF6B00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Subheader Bar */}
      <div className="bg-white dark:bg-[#16171D] border-b border-[#E9E9E6] dark:border-[#272932] sticky top-20 z-30 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#111111]">
                <Shield className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-extrabold text-[#111111] dark:text-white">
                    admintechcheck Dashboard
                  </h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B00] text-white">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  TechCheck Media Content & Affiliate Management System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="https://techcheck.homes/"
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-[#F7F6F2] dark:bg-[#23252E] hover:bg-neutral-200 dark:hover:bg-[#2C2F3A] border border-[#E9E9E6] dark:border-[#2C2F3A] flex items-center gap-1.5 transition-all cursor-pointer text-decoration-none"
                title="Exit Developer Mode and return to https://techcheck.homes/"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Exit Developer Mode</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-100">
            <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E9E9E6] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Total Products</span>
              <span className="text-base font-black text-[#111111]">{products.length}</span>
            </div>
            <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E9E9E6] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Featured</span>
              <span className="text-base font-black text-[#FF6B00]">
                {products.filter((p) => p.featured).length}
              </span>
            </div>
            <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E9E9E6] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Categories</span>
              <span className="text-base font-black text-[#111111]">{categories.length}</span>
            </div>
            <div className="bg-[#F7F6F2] p-2.5 rounded-xl border border-[#E9E9E6] flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">Guides</span>
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
              <span>Product Catalog ({products.length})</span>
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
              <span>Categories ({categories.length})</span>
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
              <span>Guides & Articles ({guides.length})</span>
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
              <span>Web & Affiliate Settings</span>
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
                    placeholder="Search products by name..."
                    className="w-full pl-9 pr-4 py-2 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs focus:outline-none focus:border-[#FF6B00] focus:bg-white transition-all"
                  />
                </div>

                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="w-full sm:w-48 py-2 px-3 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs font-medium focus:outline-none focus:border-[#FF6B00] transition-all"
                >
                  <option value="All">All Categories</option>
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
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table / List */}
            <div className="bg-white rounded-2xl border border-[#E9E9E6] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F7F6F2] border-b border-[#E9E9E6] text-neutral-500 uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Badge</th>
                      <th className="py-3.5 px-4 text-center">Featured (Home)</th>
                      <th className="py-3.5 px-4">Affiliate Link</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E9E6]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-neutral-500">
                          No products match your search criteria.
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
                              {prod.featured ? '✓ On Home' : 'Hidden'}
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
                              <span className="text-neutral-400 italic">Not set</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  onNavigate({ page: 'product-detail', slug: prod.slug });
                                }}
                                className="p-1.5 text-neutral-500 hover:text-[#111111] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                title="View on Site"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDuplicateProduct(prod)}
                                className="p-1.5 text-neutral-500 hover:text-[#FF6B00] hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                                title="Duplicate Product"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Product"
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
                <h2 className="text-base font-extrabold text-[#111111]">Manage Product Categories</h2>
                <p className="text-xs text-neutral-500">Organize product taxonomy and descriptions</p>
              </div>

              <button
                onClick={handleOpenCreateCategory}
                className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
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
                            {count} Products
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
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E9E9E6] p-12 text-center text-neutral-500 text-xs">
                No product categories yet. Click "Add New Category" above to create one.
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
                <h2 className="text-base font-extrabold text-[#111111]">Editorial Guides & Blueprints</h2>
                <p className="text-xs text-neutral-500">
                  Manage setup advice, desk blueprints, and curated editorial articles
                </p>
              </div>

              <button
                onClick={handleOpenCreateGuide}
                className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Guide</span>
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
                          <p className="text-xs text-neutral-400 mt-0.5">Author: {guide.author?.name}</p>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-3">
                        {guide.excerpt}
                      </p>

                      <div className="text-[11px] text-neutral-400">
                        Guide steps count: <span className="font-bold text-neutral-700">{guide.steps.length} steps</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#E9E9E6] flex items-center justify-between">
                      <button
                        onClick={() => {
                          onNavigate({ page: 'guide-detail', slug: guide.slug });
                        }}
                        className="text-xs font-semibold text-neutral-600 hover:text-[#FF6B00] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Guide</span>
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
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E9E9E6] p-12 text-center text-neutral-500 text-xs">
                No editorial guides yet. Click "Add New Guide" above to create your first guide.
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
                Top Announcement Bar
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Display a promotional text banner or announcement bar at the top of the website.
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
                    Enable Announcement Bar on Website
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Announcement Text
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
                    placeholder="e.g., 🔥 New Space-Saving Monitor & Compact Desk Accessories Guide is Live!"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs focus:outline-none focus:border-[#FF6B00] text-[#111111]"
                  />
                </div>
              </div>
            </div>

            {/* Hero Copy Editor */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs">
              <h2 className="text-base font-bold text-[#111111] mb-1">
                Homepage Hero Banner Customization
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Customize headlines, eyebrow text, and subtext on the homepage banner.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Eyebrow (Top Label)
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
                    Headline Line 1
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
                    Headline Line 2 (Accent Color)
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
                    Hero Description Subtext
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

            {/* Hero Image & Architectural Badge Editor */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs space-y-5">
              <div>
                <h2 className="text-base font-bold text-[#111111] mb-1">
                  Hero Banner Image & Architectural Badge
                </h2>
                <p className="text-xs text-neutral-500">
                  Upload a new image file (JPG, PNG, WEBP, GIF, SVG) or select a preset for the main homepage banner.
                </p>
              </div>

              <div className="max-w-2xl space-y-4">
                <AdminImageUploader
                  label="Main Hero Banner Image"
                  value={siteSettings.heroImage || '/hero-setup.jpg'}
                  onChange={(newUrl) => {
                    const updated = { ...siteSettings, heroImage: newUrl };
                    onUpdateSettings(updated);
                    handleSaveSettings(updated);
                  }}
                  presets={['/hero-setup.jpg', '/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png']}
                  placeholder="/hero-setup.jpg or upload new file"
                  helperText="Image is automatically scaled proportionally in the hero container."
                />

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Hero Image Alt Text (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={siteSettings.heroImageAlt || ''}
                    onChange={(e) => onUpdateSettings({ ...siteSettings, heroImageAlt: e.target.value })}
                    onBlur={() => handleSaveSettings(siteSettings)}
                    placeholder="Compact Gaming Setup with elevated monitors"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-[#E9E9E6]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00] block mb-3">
                    Visual Label Tag Overlay
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Badge Eyebrow</label>
                      <input
                        type="text"
                        value={siteSettings.heroBadgeEyebrow || 'SETUP ARCHITECTURE 2026'}
                        onChange={(e) => onUpdateSettings({ ...siteSettings, heroBadgeEyebrow: e.target.value })}
                        onBlur={() => handleSaveSettings(siteSettings)}
                        className="w-full p-2 bg-[#F7F6F2] border border-[#E9E9E6] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Badge Title</label>
                      <input
                        type="text"
                        value={siteSettings.heroBadgeTitle || '100cm Compact Studio Desk'}
                        onChange={(e) => onUpdateSettings({ ...siteSettings, heroBadgeTitle: e.target.value })}
                        onBlur={() => handleSaveSettings(siteSettings)}
                        className="w-full p-2 bg-[#F7F6F2] border border-[#E9E9E6] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Badge Stat</label>
                      <input
                        type="text"
                        value={siteSettings.heroBadgeStat || '45% Surface Cleared'}
                        onChange={(e) => onUpdateSettings({ ...siteSettings, heroBadgeStat: e.target.value })}
                        onBlur={() => handleSaveSettings(siteSettings)}
                        className="w-full p-2 bg-[#F7F6F2] border border-[#E9E9E6] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveSettings(siteSettings)}
                    className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Hero Settings to Supabase</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dedicated Open Graph (OG) Image & Favicon Settings Section */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs space-y-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6B00] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#111111]">
                    Social Share Card (OG Image) & Website Favicon
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Exclusively configure your OpenGraph social preview image and browser tab favicon.
                    These assets are strictly isolated to social meta tags and browser icon — they are
                    <strong className="text-neutral-800 font-bold"> NEVER </strong> used as images for products, articles, or categories.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#E9E9E6]">
                {/* 1. Open Graph (OG) Image */}
                <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#E9E9E6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B00]">
                      Social Share Preview
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 bg-white px-2 py-0.5 rounded border border-[#E9E9E6]">
                      1200 × 630 px
                    </span>
                  </div>

                  <AdminImageUploader
                    label="Open Graph (OG) Image"
                    value={siteSettings.ogImage || '/og-image.jpg'}
                    onChange={(newUrl) => {
                      const updated = { ...siteSettings, ogImage: newUrl || '/og-image.jpg' };
                      onUpdateSettings(updated);
                      handleSaveSettings(updated);
                    }}
                    presets={['/og-image.jpg']}
                    placeholder="/og-image.jpg or upload 1200x630 social card"
                    helperText="Strictly used for link sharing previews on Twitter/X, WhatsApp, Discord, Facebook, and LinkedIn."
                  />
                </div>

                {/* 2. Browser Tab Favicon */}
                <div className="p-4 bg-[#F7F6F2] rounded-2xl border border-[#E9E9E6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                      Browser Tab Icon
                    </span>
                    <span className="text-[10px] font-mono font-bold text-neutral-400 bg-white px-2 py-0.5 rounded border border-[#E9E9E6]">
                      32×32 to 512×512 px
                    </span>
                  </div>

                  <AdminImageUploader
                    label="Website Favicon"
                    value={siteSettings.favicon || '/favicon.png'}
                    onChange={(newUrl) => {
                      const updated = { ...siteSettings, favicon: newUrl || '/favicon.png' };
                      onUpdateSettings(updated);
                      handleSaveSettings(updated);
                    }}
                    presets={['/favicon.png']}
                    placeholder="/favicon.png or upload icon"
                    helperText="Strictly used for the browser tab icon (<link rel='icon'>). Supports PNG, ICO, and SVG."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveSettings(siteSettings)}
                  className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save OG Image & Favicon Settings</span>
                </button>
              </div>
            </div>

            {/* Admin Security Settings */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs">
              <h2 className="text-base font-bold text-[#111111] mb-1">
                Superadmin Security & Passcode
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Update the login passcode to protect this superadmin dashboard.
              </p>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    New Access Passcode
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
                          4 TABLES CONNECTED (LIVE)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          {supabaseStatus?.configured ? 'TABLES NEED SCHEMA' : 'LOCAL STORAGE (OFFLINE)'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Ensuring real-time data sync with 4 Supabase tables: <code className="font-mono text-neutral-800 font-bold">categories</code>, <code className="font-mono text-neutral-800 font-bold">products</code>, <code className="font-mono text-neutral-800 font-bold">guides</code>, <code className="font-mono text-neutral-800 font-bold">site_settings</code>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCheckSupabase}
                    disabled={isCheckingSupabase}
                    className="px-3 py-2 bg-[#F7F6F2] hover:bg-neutral-200/80 border border-[#E9E9E6] text-neutral-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Check connection and schema readiness on Supabase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isCheckingSupabase ? 'Checking...' : 'Check Status'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenSchemaModal}
                    className="px-3 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="View or copy DDL SQL schema for Supabase SQL Editor"
                  >
                    <FileCode className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>View / Copy SQL Schema</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePullFromSupabase}
                    disabled={isPullingSupabase}
                    className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Pull latest data from Supabase to website"
                  >
                    <Download className={`w-3.5 h-3.5 ${isPullingSupabase ? 'animate-bounce' : ''}`} />
                    <span>{isPullingSupabase ? 'Loading...' : 'Pull from Supabase'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncToSupabase}
                    disabled={isSyncingSupabase}
                    className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                    title="Sync all products, categories, guides, and settings to Supabase"
                  >
                    <Upload className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-bounce' : ''}`} />
                    <span>{isSyncingSupabase ? 'Syncing...' : 'Push to Supabase'}</span>
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
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">
                      {supabaseStatus?.connected ? 'Database Status: Connected & Synced' : 'Database Status: Configuration Required / Host Inactive'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowConfigForm(!showConfigForm)}
                      className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-[11px] font-bold text-neutral-800 transition-colors cursor-pointer"
                    >
                      {showConfigForm ? 'Close Settings' : '⚙️ Configure Supabase URL & Key'}
                    </button>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                    {supabaseStatus?.message || 'Checking connection status to Supabase...'}
                  </p>
                </div>
              </div>

              {/* Supabase URL & Key Configuration Form */}
              {(!supabaseStatus?.connected || showConfigForm) && (
                <div className="p-5 rounded-2xl bg-white border border-[#E9E9E6] shadow-xs mb-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E9E9E6] pb-3">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#FF6B00]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                        Supabase Project Configuration
                      </h4>
                    </div>
                    {supabaseConfig.url && (
                      <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[250px]">
                        URL: {supabaseConfig.url}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveSupabaseConfig} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Supabase Project URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://your-project-id.supabase.co"
                        value={inputSupabaseUrl}
                        onChange={(e) => setInputSupabaseUrl(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs font-mono text-neutral-800 focus:outline-none focus:border-[#FF6B00]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Found in Supabase Dashboard &gt; Project Settings &gt; Configuration &gt; API &gt; Project URL.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Supabase API Key (anon public key or service_role key)
                      </label>
                      <input
                        type="password"
                        placeholder="eyJh..."
                        value={inputSupabaseKey}
                        onChange={(e) => setInputSupabaseKey(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl text-xs font-mono text-neutral-800 focus:outline-none focus:border-[#FF6B00]"
                      />
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Found in Supabase Dashboard &gt; Project Settings &gt; Configuration &gt; API &gt; Project API Keys.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-[11px] text-neutral-500">
                        {supabaseConfig.hasKey ? 'Key Status: Stored in application settings' : 'Key not configured'}
                      </p>
                      <button
                        type="submit"
                        disabled={isSavingSupabaseConfig}
                        className="px-4 py-2 bg-[#111111] hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isSavingSupabaseConfig ? 'animate-spin' : ''}`} />
                        <span>{isSavingSupabaseConfig ? 'Saving & Connecting...' : 'Save & Connect Database'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 4 Table Verification Grid */}
              <div className="mb-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                  <Table className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Supabase & Web 4-Table Consistency:</span>
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
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">READY</span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">Local</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-700">Product Categories</p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        id, name, slug, product_count, image, sort_order
                      </p>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t border-[#E9E9E6] flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Items on Web:</span>
                      <span className="font-bold text-[#111111]">{categories.length} records</span>
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
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">READY</span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">Local</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-700">Products & Affiliates</p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        id, slug, name, category, rating, specifications, gallery, affiliate_url
                      </p>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t border-[#E9E9E6] flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Items on Web:</span>
                      <span className="font-bold text-[#111111]">{products.length} records</span>
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
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">READY</span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">Local</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-700">Setup Guides & Articles</p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        id, slug, title, category, author_name, steps (JSONB), featured
                      </p>
                    </div>
                    <div className="pt-2.5 mt-2.5 border-t border-[#E9E9E6] flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">Items on Web:</span>
                      <span className="font-bold text-[#111111]">{guides.length} articles</span>
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
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">READY</span>
                        ) : (
                          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">Local</span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-neutral-700">Site Settings & Assets</p>
                      <p className="text-[10px] text-neutral-500 mt-1 font-mono">
                        id (1), announcement_text, hero_copy, og_image, favicon, admin_passcode
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
                  <p className="font-bold text-neutral-800">Steps to Synchronize Supabase with Web:</p>
                  <button
                    type="button"
                    onClick={handleOpenSchemaModal}
                    className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <FileCode className="w-3 h-3" />
                    <span>Open schema.sql</span>
                  </button>
                </div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px] text-neutral-600">
                  <li>Open your Supabase project dashboard (<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-[#FF6B00] font-semibold hover:underline">supabase.com/dashboard</a>) and go to <strong>SQL Editor</strong>.</li>
                  <li>Run the SQL statements from <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono font-bold text-neutral-800">schema.sql</code> to create the 4 tables (<code className="font-mono text-neutral-800">categories</code>, <code className="font-mono text-neutral-800">products</code>, <code className="font-mono text-neutral-800">guides</code>, <code className="font-mono text-neutral-800">site_settings</code>) and RLS security policies.</li>
                  <li>Enter your <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono font-bold text-neutral-800">SUPABASE_URL</code> and <code className="bg-white px-1.5 py-0.5 rounded border border-neutral-300 font-mono font-bold text-neutral-800">SUPABASE_KEY</code> in the form above or project environment variables.</li>
                  <li>Click <strong>"Push to Supabase"</strong> above to synchronize all web products, categories, guides, and settings automatically!</li>
                </ol>
              </div>
            </div>

            {/* Google Search Console & DNS Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9E9E6]">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#111111]">
                        Google Search Console & DNS Configuration
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        META TAG ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      DNS TXT record verification & instant HTML meta tag verification for Google Search Console.
                    </p>
                  </div>
                </div>

                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Open Search Console</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>

              {/* DNS TXT Record Details Card */}
              <div className="p-4 bg-[#F7F6F2] rounded-xl border border-[#E9E9E6] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-[#FF6B00]" />
                    DNS TXT Record Configuration (Domain Registrar)
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 bg-white px-2 py-0.5 rounded border border-[#E9E9E6]">
                    Domain: techcheck.homes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* Record Type */}
                  <div className="bg-white p-3 rounded-lg border border-[#E9E9E6]">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Record Type</span>
                    <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">TXT</span>
                  </div>

                  {/* Host / Name */}
                  <div className="bg-white p-3 rounded-lg border border-[#E9E9E6] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">Host / Name</span>
                      <span className="font-mono text-xs font-bold text-neutral-900">@</span>
                      <span className="text-[10px] text-neutral-400 ml-1.5">(or techcheck.homes)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('@');
                        setCopiedDns('host');
                        setTimeout(() => setCopiedDns(null), 2000);
                      }}
                      className="px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      title="Copy Host"
                    >
                      {copiedDns === 'host' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDns === 'host' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* TTL */}
                  <div className="bg-white p-3 rounded-lg border border-[#E9E9E6]">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">TTL</span>
                    <span className="font-mono text-xs font-bold text-neutral-900">3600 <span className="text-neutral-400 font-normal">(1 Hour / Auto)</span></span>
                  </div>
                </div>

                {/* TXT Record Value */}
                <div className="bg-white p-3.5 rounded-lg border border-[#E9E9E6] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Record Value / Content</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('google-site-verification=ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg');
                        setCopiedDns('value');
                        setTimeout(() => setCopiedDns(null), 2000);
                      }}
                      className="px-2.5 py-1 bg-[#111111] hover:bg-black text-white rounded-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      {copiedDns === 'value' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedDns === 'value' ? 'Copied to Clipboard!' : 'Copy TXT Value'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-neutral-900 text-emerald-400 font-mono text-xs rounded select-all break-all">
                    google-site-verification=ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg
                  </div>
                </div>
              </div>

              {/* Instant Verification Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">HTML Meta Tag (Live in &lt;head&gt;)</h4>
                    <p className="text-[11px] text-emerald-800 mt-0.5 font-mono break-all">
                      &lt;meta name="google-site-verification" content="ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg" /&gt;
                    </p>
                    <span className="text-[10px] text-emerald-700 font-medium mt-1 block">
                      ⚡ Instant verification on Search Console without DNS delay.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">HTML Verification Endpoint (Live)</h4>
                    <p className="text-[11px] text-blue-800 mt-0.5 font-mono break-all">
                      /googleak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg.html
                    </p>
                    <span className="text-[10px] text-blue-700 font-medium mt-1 block">
                      📄 Serves official verification response to Google crawler.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Backup & Recovery */}
            <div className="bg-white p-6 rounded-2xl border border-[#E9E9E6] shadow-xs">
              <h2 className="text-base font-bold text-[#111111] mb-1">
                Backup, Restore & Reset Data
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Safeguard website data regularly or restore from a JSON backup file.
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
                  <span>Import Data from JSON</span>
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
                  <span>Reset to Factory Defaults</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-3xl border border-[#E9E9E6] shadow-2xl w-full max-w-3xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2.5rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header - Fixed at top */}
            <div className="shrink-0 p-5 sm:p-6 border-b border-[#E9E9E6] flex items-center justify-between bg-[#F7F6F2]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                  {editingProduct ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
                </span>
                <h3 className="text-xl font-extrabold text-[#111111]">
                  {editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Product'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-[#111111] rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form wrapper with single scrollable content and sticky footer */}
            <form onSubmit={handleSaveProduct} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Scrollable Form Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs overscroll-contain">
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
                  <label className="block font-bold text-neutral-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={productFormData.name || ''}
                    onChange={(e) => {
                      setProductFormData({ ...productFormData, name: e.target.value });
                      if (productFormError) setProductFormError(null);
                    }}
                    placeholder="Example: Acer Nitro KG271U Z2"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-2">Category *</label>
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
                      No categories added yet. Please navigate to the Categories tab to add a category first.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Product Badge</label>
                  <input
                    type="text"
                    value={productFormData.badge || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value })}
                    placeholder="Example: BEST GAMING MONITOR, CREATOR FAVORITE"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Feature on Homepage</label>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="modalFeaturedToggle"
                      checked={!!productFormData.featured}
                      onChange={(e) => setProductFormData({ ...productFormData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                    <label htmlFor="modalFeaturedToggle" className="font-semibold text-neutral-700 cursor-pointer">
                      Yes, feature in Homepage Top Picks section
                    </label>
                  </div>
                </div>
              </div>

              {/* Short Benefit & Description */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Short Benefit (Summary text beneath card title)
                </label>
                <input
                  type="text"
                  value={productFormData.shortBenefit || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, shortBenefit: e.target.value })}
                  placeholder="Example: 27' WQHD IPS gaming monitor with 275Hz refresh rate..."
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                />
              </div>

              {/* Affiliate URL */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Affiliate / Partner Link (URL) *</span>
                </label>
                <input
                  type="text"
                  value={productFormData.affiliateUrl || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, affiliateUrl: e.target.value })}
                  placeholder="https://shopee.sg/... or https://atid.me/..."
                  className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono text-neutral-800"
                />
              </div>

              {/* Product Main Image with Multi-format Upload & URL */}
              <AdminImageUploader
                label="Primary Product Image"
                value={productFormData.image || ''}
                onChange={(newUrl) => {
                  setProductFormData({
                    ...productFormData,
                    image: newUrl,
                    gallery: newUrl ? [newUrl] : [],
                  });
                }}
                presets={['/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png']}
                placeholder="https://example.com/product-image.jpg or upload file"
              />

              {/* Product Highlights (Line by line) */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Product Highlights (1 point per line)
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
                  Why We Recommend It / Benefits (1 point per line)
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
                  Technical Specifications (Format: Spec Name: Value, 1 per line)
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
                  <label className="block font-bold text-neutral-700 mb-1">Best For (Target User)</label>
                  <input
                    type="text"
                    value={productFormData.bestFor || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, bestFor: e.target.value })}
                    placeholder="Gamers who want high refresh rates"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Our Take (Editorial Verdict)</label>
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
                  <label className="block font-bold text-neutral-700 mb-1">Great For (1 point per line)</label>
                  <textarea
                    rows={2}
                    value={greatForText}
                    onChange={(e) => setGreatForText(e.target.value)}
                    placeholder="Small desks&#10;Clean setups"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Setup Considerations (1 point per line)</label>
                  <textarea
                    rows={2}
                    value={setupConsiderationsText}
                    onChange={(e) => setSetupConsiderationsText(e.target.value)}
                    placeholder="Check available desk clearance before mounting."
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                  />
                </div>
              </div>
              </div>

              {/* Sticky Modal Footer - Always visible and accessible */}
              <div className="shrink-0 sticky bottom-0 bg-[#F7F6F2] p-4 sm:p-5 border-t border-[#E9E9E6] flex items-center justify-end gap-3 z-10 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-[#E9E9E6] transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Product</span>
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-3xl border border-[#E9E9E6] shadow-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2.5rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="shrink-0 p-5 sm:p-6 border-b border-[#E9E9E6] flex items-center justify-between bg-[#F7F6F2]">
              <h3 className="text-lg font-extrabold text-[#111111]">
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-[#111111] rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs overscroll-contain">
                {categoryFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{categoryFormError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name || ''}
                    onChange={(e) => {
                      setCategoryFormData({ ...categoryFormData, name: e.target.value });
                      if (categoryFormError) setCategoryFormError(null);
                    }}
                    placeholder="Example: Audio, Lighting, Desk Setup, Storage"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium focus:outline-none focus:border-[#FF6B00]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">URL Slug (Optional)</label>
                  <input
                    type="text"
                    value={categoryFormData.slug || ''}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })}
                    placeholder="monitors, accessories (auto-generated if left blank)"
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category Description</label>
                  <textarea
                    rows={3}
                    value={categoryFormData.description || ''}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    placeholder="Brief category summary..."
                    className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                  />
                </div>

                <div>
                  <AdminImageUploader
                    label="Category Cover Image URL"
                    value={categoryFormData.image || ''}
                    onChange={(newUrl) => setCategoryFormData({ ...categoryFormData, image: newUrl })}
                    presets={['/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png']}
                    placeholder="https://example.com/category-cover.jpg or upload file"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 sticky bottom-0 bg-[#F7F6F2] p-4 sm:p-5 border-t border-[#E9E9E6] flex items-center justify-end gap-3 z-10 shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-5 py-2 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-[#E9E9E6] transition-all cursor-pointer shadow-2xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* GUIDE FORM MODAL (CREATE / EDIT) - COMPLETE ARTICLE EDITOR */}
      {/* ==================================================== */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-hidden">
          <div className="bg-white rounded-3xl border border-[#E9E9E6] shadow-2xl w-full max-w-3xl max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2.5rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="shrink-0 p-5 sm:p-6 border-b border-[#E9E9E6] bg-[#F7F6F2]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B00]">
                    Editorial Article Editor
                  </span>
                  <h3 className="text-lg font-extrabold text-[#111111]">
                    {editingGuide ? `Edit Guide: ${editingGuide.title}` : 'Add New Guide'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseGuideModal}
                  className="p-2 text-neutral-400 hover:text-[#111111] rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Editor Tabs */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setGuideModalTab('basic')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    guideModalTab === 'basic'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E9E9E6]'
                  }`}
                >
                  1. Basic Details
                </button>
                <button
                  type="button"
                  onClick={() => setGuideModalTab('editorial')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    guideModalTab === 'editorial'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E9E9E6]'
                  }`}
                >
                  2. Author & Editorial
                </button>
                <button
                  type="button"
                  onClick={() => setGuideModalTab('steps')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    guideModalTab === 'steps'
                      ? 'bg-[#111111] text-white shadow-xs'
                      : 'bg-white text-neutral-600 hover:text-neutral-900 border border-[#E9E9E6]'
                  }`}
                >
                  {guideFormData.layoutFormat === 'document' ? (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>3. Document Body</span>
                    </>
                  ) : (
                    <>
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>3. Steps & Points</span>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF6B00] text-white">
                        {guideFormData.steps?.length || 0}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveGuide} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Scrollable Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs overscroll-contain">
                {guideFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{guideFormError}</span>
                  </div>
                )}

                {/* TAB 1: BASIC INFORMATION */}
                {guideModalTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Guide Title *</label>
                      <input
                        type="text"
                        required
                        value={guideFormData.title || ''}
                        onChange={(e) => {
                          setGuideFormData({ ...guideFormData, title: e.target.value });
                          if (guideFormError) setGuideFormError(null);
                        }}
                        placeholder="Example: The Ultimate Dual Monitor Desk Mount Guide"
                        className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">URL Slug (Optional)</label>
                        <input
                          type="text"
                          value={guideFormData.slug || ''}
                          onChange={(e) => setGuideFormData({ ...guideFormData, slug: e.target.value })}
                          placeholder="dual-monitor-setup (auto-generated if empty)"
                          className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">Guide Category</label>
                        <input
                          type="text"
                          value={guideFormData.category || ''}
                          onChange={(e) => setGuideFormData({ ...guideFormData, category: e.target.value })}
                          placeholder="Setup Advice, Cable Management, Ergonomics"
                          className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">Read Time</label>
                        <input
                          type="text"
                          value={guideFormData.readTime || ''}
                          onChange={(e) => setGuideFormData({ ...guideFormData, readTime: e.target.value })}
                          placeholder="4 min read"
                          className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">Publication Date</label>
                        <input
                          type="text"
                          value={guideFormData.publishDate || ''}
                          onChange={(e) => setGuideFormData({ ...guideFormData, publishDate: e.target.value })}
                          placeholder="Oct 14, 2026"
                          className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                        />
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!guideFormData.featured}
                            onChange={(e) => setGuideFormData({ ...guideFormData, featured: e.target.checked })}
                            className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                          />
                          <span className="font-bold text-neutral-800">Featured Article</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Summary / Excerpt</label>
                      <textarea
                        rows={2}
                        value={guideFormData.excerpt || ''}
                        onChange={(e) => setGuideFormData({ ...guideFormData, excerpt: e.target.value })}
                        placeholder="Brief overview summary of this guide..."
                        className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                      />
                    </div>

                    {/* ARTICLE FORMAT & MEDIA DISPLAY CONTROLS */}
                    <div className="p-4 bg-orange-50/70 border border-orange-200/90 rounded-2xl space-y-4">
                      <div>
                        <label className="block font-bold text-neutral-800 text-xs mb-1.5">
                          1. Article Layout Format
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setGuideFormData({ ...guideFormData, layoutFormat: 'document' })}
                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              guideFormData.layoutFormat === 'document'
                                ? 'bg-white border-[#FF6B00] shadow-xs ring-2 ring-[#FF6B00]/20'
                                : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${guideFormData.layoutFormat === 'document' ? 'text-[#FF6B00]' : 'text-neutral-400'}`} />
                            <div>
                              <div className="font-bold text-xs text-neutral-900">📄 Clean Document Format</div>
                              <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                                Continuous editorial flow without forced point numbers (standard blog/essay).
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setGuideFormData({ ...guideFormData, layoutFormat: 'steps' })}
                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              guideFormData.layoutFormat !== 'document'
                                ? 'bg-white border-[#FF6B00] shadow-xs ring-2 ring-[#FF6B00]/20'
                                : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <ListOrdered className={`w-4 h-4 shrink-0 mt-0.5 ${guideFormData.layoutFormat !== 'document' ? 'text-[#FF6B00]' : 'text-neutral-400'}`} />
                            <div>
                              <div className="font-bold text-xs text-neutral-900">🔢 Structured Step-by-Step</div>
                              <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                                Modular point-based walkthrough (01, 02, etc.).
                              </div>
                            </div>
                          </button>
                        </div>

                        {/* Hide numbers option if in steps format */}
                        {guideFormData.layoutFormat !== 'document' && (
                          <div className="mt-2.5 p-2.5 bg-white/80 rounded-xl border border-orange-200/80">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!guideFormData.hideStepNumbers}
                                onChange={(e) => setGuideFormData({ ...guideFormData, hideStepNumbers: e.target.checked })}
                                className="w-4 h-4 rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                              />
                              <span className="text-xs text-neutral-700 font-medium">
                                Hide point numbers (01, 02) on steps (display titles only)
                              </span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Photo Control Selector */}
                      <div className="pt-3 border-t border-orange-200/70">
                        <label className="block font-bold text-neutral-800 text-xs mb-1.5">
                          2. Article Body Photos
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setGuideFormData({ ...guideFormData, showContentImages: false })}
                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              !guideFormData.showContentImages
                                ? 'bg-white border-[#FF6B00] shadow-xs ring-2 ring-[#FF6B00]/20'
                                : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <span className="text-base shrink-0">🌟</span>
                            <div>
                              <div className="font-bold text-xs text-neutral-900">Hero Cover Photo Only (Recommended)</div>
                              <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                                Uses only the primary Hero image at top. Body text remains completely clean with zero empty image boxes.
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setGuideFormData({ ...guideFormData, showContentImages: true })}
                            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                              guideFormData.showContentImages
                                ? 'bg-white border-[#FF6B00] shadow-xs ring-2 ring-[#FF6B00]/20'
                                : 'bg-white/60 border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            <span className="text-base shrink-0">📷</span>
                            <div>
                              <div className="font-bold text-xs text-neutral-900">Enable Images in Article Body</div>
                              <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                                Display photos within each step when supporting diagrams or photos are available.
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <AdminImageUploader
                        label="Hero Header Image URL (Hero Section)"
                        value={guideFormData.image || ''}
                        onChange={(newUrl) => setGuideFormData({ ...guideFormData, image: newUrl })}
                        presets={['/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png']}
                        placeholder="https://example.com/guide-header.jpg or upload file"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 2: EDITORIAL & AUTHOR */}
                {guideModalTab === 'editorial' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">Author Name</label>
                        <input
                          type="text"
                          value={guideFormData.author?.name || ''}
                          onChange={(e) =>
                            setGuideFormData({
                              ...guideFormData,
                              author: {
                                name: e.target.value,
                                role: guideFormData.author?.role || 'Setup Specialist',
                                avatar: guideFormData.author?.avatar || '',
                              },
                            })
                          }
                          placeholder="TechCheck Editorial"
                          className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-700 mb-1">Author Role</label>
                        <input
                          type="text"
                          value={guideFormData.author?.role || ''}
                          onChange={(e) =>
                            setGuideFormData({
                              ...guideFormData,
                              author: {
                                name: guideFormData.author?.name || 'TechCheck Editorial',
                                role: e.target.value,
                                avatar: guideFormData.author?.avatar || '',
                              },
                            })
                          }
                          placeholder="Setup Specialist"
                          className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <AdminImageUploader
                        label="Author Avatar"
                        value={guideFormData.author?.avatar || ''}
                        onChange={(newUrl) =>
                          setGuideFormData({
                            ...guideFormData,
                            author: {
                              name: guideFormData.author?.name || 'TechCheck Editorial',
                              role: guideFormData.author?.role || 'Setup Specialist',
                              avatar: newUrl,
                            },
                          })
                        }
                        presets={['/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png']}
                        placeholder="https://example.com/avatar.jpg or upload avatar"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Introductory Paragraph (Intro)</label>
                      <textarea
                        rows={3}
                        value={guideFormData.intro || ''}
                        onChange={(e) => setGuideFormData({ ...guideFormData, intro: e.target.value })}
                        placeholder="In-depth opening editorial introduction..."
                        className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">
                        Core Spatial Principle (Callout Box)
                      </label>
                      <textarea
                        rows={2}
                        value={guideFormData.callout || ''}
                        onChange={(e) => setGuideFormData({ ...guideFormData, callout: e.target.value })}
                        placeholder="Key spatial or architectural takeaway to emphasize..."
                        className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-700 mb-1">Conclusion & Verdict (Summary)</label>
                      <textarea
                        rows={3}
                        value={guideFormData.summary || ''}
                        onChange={(e) => setGuideFormData({ ...guideFormData, summary: e.target.value })}
                        placeholder="Final summary takeaway and recommendation..."
                        className="w-full p-2.5 bg-[#F7F6F2] border border-[#E9E9E6] rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: DOCUMENT CONTENT & STEPS */}
                {guideModalTab === 'steps' && (
                  <div className="space-y-5">
                    {/* Notice if photo mode is off */}
                    {!guideFormData.showContentImages ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <span>
                            <strong>Clean Mode Active:</strong> Only the primary Hero cover photo is used. Article body remains clean without empty image placeholders.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGuideModalTab('basic')}
                          className="text-emerald-900 font-bold hover:underline shrink-0 text-[11px] cursor-pointer"
                        >
                          Change in Tab 1 →
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs flex items-center justify-between">
                        <span>
                          📷 <strong>Article Photos Active:</strong> Images uploaded for steps below will be displayed in the published article.
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuideModalTab('basic')}
                          className="text-amber-900 font-bold hover:underline shrink-0 text-[11px] cursor-pointer"
                        >
                          Switch to Hero Only →
                        </button>
                      </div>
                    )}

                    {/* CONTINUOUS DOCUMENT FORMAT */}
                    {guideFormData.layoutFormat === 'document' ? (
                      <div className="bg-[#F7F6F2] p-4 sm:p-5 rounded-2xl border border-[#E9E9E6] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E9E9E6]">
                          <div>
                            <h4 className="font-extrabold text-neutral-900 text-sm flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-[#FF6B00]" />
                              <span>Continuous Document Format (Unstructured)</span>
                            </h4>
                            <p className="text-[11px] text-neutral-500">
                              Compose flowing editorial essays or articles without being forced into separate step cards.
                            </p>
                          </div>

                          {/* Write vs Preview Toggle */}
                          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E9E9E6] shrink-0 self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setGuideDocPreview(false)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                !guideDocPreview
                                  ? 'bg-[#111111] text-white shadow-2xs'
                                  : 'text-neutral-600 hover:text-neutral-900'
                              }`}
                            >
                              ✍️ Write Document
                            </button>
                            <button
                              type="button"
                              onClick={() => setGuideDocPreview(true)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                guideDocPreview
                                  ? 'bg-[#111111] text-white shadow-2xs'
                                  : 'text-neutral-600 hover:text-neutral-900'
                              }`}
                            >
                              👁️ Live Preview
                            </button>
                          </div>
                        </div>

                        {/* Quick Format Toolbar (Active in Write Mode) */}
                        {!guideDocPreview && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-bold text-neutral-500 mr-1">Insert Format:</span>
                            <button
                              type="button"
                              onClick={() => {
                                const addition = '\n\n## Section Heading\n';
                                setGuideFormData((prev) => ({ ...prev, content: (prev.content || '') + addition }));
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#E9E9E6] rounded-lg text-[11px] font-bold text-neutral-700 cursor-pointer"
                            >
                              + H2 Heading
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const addition = '\n\n### Subtopic\n';
                                setGuideFormData((prev) => ({ ...prev, content: (prev.content || '') + addition }));
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#E9E9E6] rounded-lg text-[11px] font-bold text-neutral-700 cursor-pointer"
                            >
                              + H3 Topic
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const addition = '\n\n- Key practical point one\n- Key practical point two\n';
                                setGuideFormData((prev) => ({ ...prev, content: (prev.content || '') + addition }));
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#E9E9E6] rounded-lg text-[11px] font-bold text-neutral-700 cursor-pointer"
                            >
                              + Bullet List (-)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const addition = '\n\n> Important spatial principle or note here...\n';
                                setGuideFormData((prev) => ({ ...prev, content: (prev.content || '') + addition }));
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#E9E9E6] rounded-lg text-[11px] font-bold text-neutral-700 cursor-pointer"
                            >
                              + Quote (&gt;)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const addition = '\n\n---\n\n';
                                setGuideFormData((prev) => ({ ...prev, content: (prev.content || '') + addition }));
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-[#E9E9E6] rounded-lg text-[11px] font-bold text-neutral-700 cursor-pointer"
                            >
                              + Divider (---)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const addition = '\n\n![Image Caption](https://example.com/photo.jpg)\n\n';
                                setGuideFormData((prev) => ({ ...prev, content: (prev.content || '') + addition }));
                              }}
                              className="px-2.5 py-1 bg-white hover:bg-neutral-100 border border-orange-200 text-[#FF6B00] rounded-lg text-[11px] font-bold cursor-pointer flex items-center gap-1"
                            >
                              📷 + Insert Image
                            </button>

                            {/* Convert existing steps if available */}
                            {guideFormData.steps && guideFormData.steps.length > 0 && (
                              <button
                                type="button"
                                onClick={handleConvertStepsToDocument}
                                className="px-2.5 py-1 bg-orange-100 hover:bg-orange-200 border border-orange-300 rounded-lg text-[11px] font-bold text-[#FF6B00] cursor-pointer ml-auto"
                                title="Convert existing steps into continuous document text"
                              >
                                🔄 Convert {guideFormData.steps.length} Steps to Document
                              </button>
                            )}
                          </div>
                        )}

                        {/* Editor Body or Live Preview */}
                        {!guideDocPreview ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={12}
                              value={guideFormData.content || ''}
                              onChange={(e) => setGuideFormData({ ...guideFormData, content: e.target.value })}
                              placeholder="Write your editorial guide content here in clean markdown...&#10;&#10;## 1. Core Principles&#10;Explain the setup philosophy clearly without forcing separate cards.&#10;&#10;## 2. Spatial Implementation&#10;All paragraphs flow cleanly with zero unwanted image boxes!&#10;&#10;![Desk Architecture](https://example.com/setup.jpg)"
                              className="w-full p-3.5 bg-white border border-[#E9E9E6] rounded-xl text-xs font-sans leading-relaxed focus:border-[#FF6B00] focus:outline-none"
                            />
                            <p className="text-[11px] text-neutral-500">
                              Tips: Use <code>## Section</code> for headings, <code>**bold**</code> for emphasis, and <code>![Caption](IMAGE_URL)</code> to insert photos.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-neutral-500">
                              Public Document Preview:
                            </div>
                            {renderAdminDocPreview(guideFormData.content || '')}
                          </div>
                        )}

                        {/* Optional Hardware Mention in Document */}
                        <div className="pt-3 border-t border-[#E9E9E6]">
                          <label className="block font-bold text-neutral-800 text-xs mb-1">
                            Linked Recommended Hardware (Optional)
                          </label>
                          <select
                            value={guideFormData.steps?.[0]?.recommendedProductSlug || ''}
                            onChange={(e) => {
                              const slug = e.target.value;
                              const currentSteps = Array.isArray(guideFormData.steps) ? [...guideFormData.steps] : [];
                              if (currentSteps.length === 0) {
                                if (slug) {
                                  currentSteps.push({ number: '01', title: 'Recommended Hardware', text: '', recommendedProductSlug: slug });
                                }
                              } else {
                                currentSteps[0] = { ...currentSteps[0], recommendedProductSlug: slug };
                              }
                              setGuideFormData((prev) => ({
                                ...prev,
                                steps: currentSteps,
                              }));
                            }}
                            className="w-full p-2.5 bg-white border border-[#E9E9E6] rounded-xl text-xs font-medium"
                          >
                            <option value="">-- No Linked Hardware --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.slug}>
                                {p.name} ({p.category})
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-neutral-500 mt-1">
                            If selected, this product specification card will be neatly displayed at the bottom of the article.
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* STRUCTURED STEP-BY-STEP FORMAT */
                      <div className="space-y-4 pt-1">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E9E9E6]">
                          <div>
                            <h4 className="font-extrabold text-neutral-900 text-sm flex items-center gap-1.5">
                              <ListOrdered className="w-4 h-4 text-[#FF6B00]" />
                              <span>Structured Guide Steps ({guideFormData.steps?.length || 0})</span>
                            </h4>
                            <p className="text-[11px] text-neutral-500">
                              Add sequential action items (01, 02, etc.) or unnumbered points.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddGuideStep}
                            className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Step</span>
                          </button>
                        </div>

                        {(!guideFormData.steps || guideFormData.steps.length === 0) ? (
                          <div className="p-6 text-center bg-[#F7F6F2] rounded-2xl border border-dashed border-[#E9E9E6] text-neutral-500 space-y-1">
                            <p className="text-xs">No structured guide steps created yet.</p>
                            <button
                              type="button"
                              onClick={handleAddGuideStep}
                              className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer"
                            >
                              + Add First Step
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {guideFormData.steps.map((step, idx) => (
                              <div
                                key={idx}
                                className="bg-[#F7F6F2] rounded-2xl p-4 border border-[#E9E9E6] space-y-3"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                                  <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-[#FF6B00] text-white font-black font-mono flex items-center justify-center text-xs">
                                      {step.number || String(idx + 1).padStart(2, '0')}
                                    </span>
                                    <span className="font-extrabold text-neutral-800 text-xs">
                                      Step #{idx + 1}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveGuideStep(idx, 'up')}
                                      title="Move Up"
                                      className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      ▲
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === (guideFormData.steps?.length || 0) - 1}
                                      onClick={() => handleMoveGuideStep(idx, 'down')}
                                      title="Move Down"
                                      className="p-1 rounded text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                      ▼
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGuideStep(idx)}
                                      title="Delete Step"
                                      className="p-1 rounded text-rose-500 hover:bg-rose-100 transition-colors cursor-pointer ml-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block font-bold text-neutral-700 mb-1">
                                    Step Title
                                  </label>
                                  <input
                                    type="text"
                                    value={step.title || ''}
                                    onChange={(e) => handleUpdateGuideStep(idx, { title: e.target.value })}
                                    placeholder="Example: Positioning and Leveling Monitor Height"
                                    className="w-full p-2 bg-white border border-[#E9E9E6] rounded-xl text-xs font-semibold"
                                  />
                                </div>

                                <div>
                                  <label className="block font-bold text-neutral-700 mb-1">
                                    Step Instructions / Procedure
                                  </label>
                                  <textarea
                                    rows={3}
                                    value={step.text || ''}
                                    onChange={(e) => handleUpdateGuideStep(idx, { text: e.target.value })}
                                    placeholder="Detail the walkthrough steps and clearances..."
                                    className="w-full p-2 bg-white border border-[#E9E9E6] rounded-xl text-xs"
                                  />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block font-bold text-neutral-700 mb-1">
                                      Recommended Product (Optional)
                                    </label>
                                    <select
                                      value={step.recommendedProductSlug || ''}
                                      onChange={(e) => handleUpdateGuideStep(idx, { recommendedProductSlug: e.target.value })}
                                      className="w-full p-2 bg-white border border-[#E9E9E6] rounded-xl text-xs font-medium"
                                    >
                                      <option value="">-- No Linked Product --</option>
                                      {products.map((p) => (
                                        <option key={p.id} value={p.slug}>
                                          {p.name} ({p.category})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  <div>
                                    <AdminImageUploader
                                      label={`Step #${step.number || String(idx + 1).padStart(2, '0')} Photo (Article Block)`}
                                      value={step.image || ''}
                                      onChange={async (newUrl) => {
                                        handleUpdateGuideStep(idx, { image: newUrl, image_url: newUrl });
                                        setGuideFormData((prev) => ({ ...prev, showContentImages: true }));
                                        // Targeted save to public.article_blocks without rewriting whole article
                                        const gId = editingGuide?.id || guideFormData.id;
                                        if (gId) {
                                          const stepNum = step.number || String(idx + 1).padStart(2, '0');
                                          const blockId = step.id || `${gId}-step-${stepNum}`;
                                          try {
                                            const res = await dataStorage.saveArticleBlock(blockId, {
                                              image: newUrl,
                                              image_url: newUrl,
                                              step_number: stepNum,
                                              title: step.title || '',
                                              text: step.text || '',
                                              guide_id: gId,
                                            });
                                            if (res.success) {
                                              showToast(`Step #${stepNum} photo saved to database!`);
                                            }
                                          } catch (err) {
                                            console.warn('Targeted article block save error:', err);
                                          }
                                        }
                                      }}
                                      presets={['/hero-setup.jpg', '/acer-nitro.png', '/acer-creator.png', '/powerpac.png', '/acer-portable.png']}
                                      placeholder="https://... or upload step photo"
                                      helperText="Image uploaded to Supabase Storage & stored securely in article_blocks database."
                                    />
                                    {!guideFormData.showContentImages && (
                                      <div className="mt-2 p-2 bg-orange-50 border border-orange-200/60 rounded-xl text-[11px] text-orange-950 flex items-center justify-between">
                                        <span>🌟 Clean Mode active in Tab 1 (This photo is saved but hidden from public view).</span>
                                        <button
                                          type="button"
                                          onClick={() => setGuideFormData((prev) => ({ ...prev, showContentImages: true }))}
                                          className="text-[#FF6B00] font-bold hover:underline shrink-0 text-[10px] cursor-pointer ml-1"
                                        >
                                          Enable Photos →
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="shrink-0 sticky bottom-0 bg-[#F7F6F2] p-4 sm:p-5 border-t border-[#E9E9E6] flex items-center justify-between z-10 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <span>Tab: </span>
                  <span className="font-bold text-neutral-800 capitalize">{guideModalTab}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseGuideModal}
                    className="px-5 py-2 bg-white hover:bg-neutral-100 text-neutral-700 font-bold rounded-xl border border-[#E9E9E6] transition-all cursor-pointer shadow-2xs text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer text-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Guide</span>
                  </button>
                </div>
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
                  ? 'Confirm Factory Reset'
                  : 'Confirm Deletion'}
              </h3>

              <p className="text-xs text-neutral-600 leading-relaxed mb-6">
                {deleteTarget.type === 'factoryReset' ? (
                  <>
                    Are you sure you want to reset all website data to initial factory defaults? All newly added products,
                    categories, and custom settings will be restored to defaults.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete this {deleteTarget.type === 'product' ? 'product' : deleteTarget.type === 'category' ? 'category' : 'guide'}{' '}
                    <strong className="text-neutral-900 font-bold">"{deleteTarget.name}"</strong>? This action
                    will permanently remove it from the website and cannot be undone.
                  </>
                )}
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-5 py-2.5 bg-[#F7F6F2] hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {deleteTarget.type === 'factoryReset' ? 'Yes, Reset Now' : 'Yes, Delete Now'}
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
                    Supabase Database Schema (schema.sql)
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Run this script once in your Supabase Dashboard &gt; SQL Editor to create the 4 tables & RLS policies.
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
                  <span>{copiedSchema ? 'Copied!' : 'Copy All SQL'}</span>
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
              {schemaSql || 'Loading SQL schema...'}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-neutral-800 bg-[#1a1a1a] flex items-center justify-between text-xs text-neutral-400">
              <span>Includes: <code className="text-neutral-200">categories</code>, <code className="text-neutral-200">products</code>, <code className="text-neutral-200">guides</code>, <code className="text-neutral-200">site_settings</code> + RLS</span>
              <button
                type="button"
                onClick={() => setShowSchemaModal(false)}
                className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
