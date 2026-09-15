const fs = require('fs');
let content = fs.readFileSync('src/pages/SuperAdminPage.tsx', 'utf8');

// Replace handleSaveProduct
content = content.replace(
  /let updatedList: Product\[\];\s*if \(editingProduct\) \{\s*updatedList = products\.map\(\(p\) => \(p\.id === editingProduct\.id \? newProduct : p\)\);\s*\} else \{\s*updatedList = \[newProduct, \.\.\.products\];\s*\}\s*dataStorage\.saveProducts\(updatedList\);\s*setProducts\(updatedList\);\s*showToast\('Produk berhasil disimpan!'\);\s*setIsProductModalOpen\(false\);/,
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

// Replace handleSaveCategory
content = content.replace(
  /let updatedList: CategoryInfo\[\];\s*if \(editingCategory\) \{\s*updatedList = categories\.map\(\(c\) => \(c\.id === editingCategory\.id \? newCat : c\)\);\s*\} else \{\s*updatedList = \[\.\.\.categories, newCat\];\s*\}\s*dataStorage\.saveCategories\(updatedList\);\s*setCategories\(updatedList\);\s*showToast\('Kategori berhasil disimpan!'\);\s*setIsCategoryModalOpen\(false\);/,
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

      const updated = editingCategory
        ? categories.map((c) => (c.id === editingCategory.id ? savedCat : c))
        : [...categories, savedCat];

      dataStorage.saveCategories(updated);
      setCategories(updated);
      showToast('Kategori berhasil disimpan ke Supabase!');
      setIsCategoryModalOpen(false);
    } catch (err: any) {
      setCategoryFormError(err.message || 'Terjadi kesalahan saat menyimpan.');
    }`
);

// Replace handleSaveGuide
content = content.replace(
  /let updatedList: Guide\[\];\s*if \(editingGuide\) \{\s*updatedList = guides\.map\(\(g\) => \(g\.id === editingGuide\.id \? newGuide : g\)\);\s*\} else \{\s*updatedList = \[newGuide, \.\.\.guides\];\s*\}\s*dataStorage\.saveGuides\(updatedList\);\s*setGuides\(updatedList\);\s*showToast\('Panduan berhasil disimpan!'\);\s*setIsGuideModalOpen\(false\);/,
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

fs.writeFileSync('src/pages/SuperAdminPage.tsx', content, 'utf8');
