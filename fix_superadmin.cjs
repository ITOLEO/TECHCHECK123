const fs = require('fs');
let content = fs.readFileSync('src/pages/SuperAdminPage.tsx', 'utf8');

content = content.replace(
  /const updated = editingProduct\s*\?\s*products\.map\(\(p\) => \(p\.id === editingProduct\.id \? newProduct : p\)\)\s*:\s*\[newProduct, \.\.\.products\];\s*dataStorage\.saveProducts\(updated\);\s*setProducts\(updated\);\s*showToast\('Produk berhasil disimpan!'\);\s*setIsProductModalOpen\(false\);/,
  `try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal menyimpan produk ke database.');
      }
      const savedProduct = await res.json();
      
      const updated = editingProduct
        ? products.map((p) => (p.id === editingProduct.id ? savedProduct : p))
        : [savedProduct, ...products];
      
      dataStorage.saveProducts(updated);
      setProducts(updated);
      showToast('Produk berhasil disimpan ke Supabase!');
      setIsProductModalOpen(false);
    } catch (err: any) {
      setProductFormError(err.message || 'Terjadi kesalahan saat menyimpan.');
    }`
);

content = content.replace(
  /updatedList = editingCategory\s*\?\s*categories\.map\(\(c\) => \(c\.id === editingCategory\.id \? newCat : c\)\)\s*:\s*\[\.\.\.categories, newCat\];\s*dataStorage\.saveCategories\(updatedList\);\s*setCategories\(updatedList\);\s*showToast\('Kategori berhasil disimpan!'\);\s*setIsCategoryModalOpen\(false\);/,
  `try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal menyimpan kategori ke database.');
      }
      const savedCat = await res.json();

      updatedList = editingCategory
        ? categories.map((c) => (c.id === editingCategory.id ? savedCat : c))
        : [...categories, savedCat];

      dataStorage.saveCategories(updatedList);
      setCategories(updatedList);
      showToast('Kategori berhasil disimpan ke Supabase!');
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      setCategoryFormError(err.message || 'Terjadi kesalahan saat menyimpan.');
    }`
);

content = content.replace(
  /const updated = editingGuide\s*\?\s*guides\.map\(\(g\) => \(g\.id === editingGuide\.id \? newGuide : g\)\)\s*:\s*\[newGuide, \.\.\.guides\];\s*dataStorage\.saveGuides\(updated\);\s*setGuides\(updated\);\s*showToast\('Panduan berhasil disimpan!'\);\s*setIsGuideModalOpen\(false\);/,
  `try {
      const res = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuide),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal menyimpan panduan ke database.');
      }
      const savedGuide = await res.json();

      const updated = editingGuide
        ? guides.map((g) => (g.id === editingGuide.id ? savedGuide : g))
        : [savedGuide, ...guides];
        
      dataStorage.saveGuides(updated);
      setGuides(updated);
      showToast('Panduan berhasil disimpan ke Supabase!');
      setIsGuideModalOpen(false);
    } catch (err: any) {
      setGuideFormError(err.message || 'Terjadi kesalahan saat menyimpan.');
    }`
);

content = content.replace(
  /const handleSaveSettings = \(newSettings: SiteSettings\) => \{\s*dataStorage\.saveSiteSettings\(newSettings\);\s*onUpdateSettings\(newSettings\);\s*showToast\('Pengaturan berhasil disimpan!'\);\s*\};/,
  `const handleSaveSettings = async (newSettings: SiteSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) throw new Error('Gagal menyimpan pengaturan.');
      const savedSettings = await res.json();
      
      dataStorage.saveSiteSettings(savedSettings);
      onUpdateSettings(savedSettings);
      showToast('Pengaturan berhasil disimpan ke Supabase!');
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan pengaturan');
    }
  };`
);

fs.writeFileSync('src/pages/SuperAdminPage.tsx', content, 'utf8');
