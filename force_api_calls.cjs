const fs = require('fs');
let content = fs.readFileSync('src/pages/SuperAdminPage.tsx', 'utf8');

// Replace handleSaveProduct
content = content.replace(
  /if \(supabaseStatus\?\.connected\) \{[\s\S]*?setIsProductModalOpen\(false\);/m,
  `try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error');
      }
      showToast(editingProduct ? \`Produk "\${newProduct.name}" berhasil diperbarui di Supabase!\` : \`Produk "\${newProduct.name}" berhasil ditambahkan ke Supabase!\`);
    } catch (err: any) {
      showToast(\`Tersimpan lokal, tapi gagal dikirim ke Supabase: \${err.message}\`);
      console.error(err);
    }

    setIsProductModalOpen(false);`
);

// Replace handleSaveCategory
content = content.replace(
  /if \(supabaseStatus\?\.connected\) \{[\s\S]*?setIsCategoryModalOpen\(false\);/m,
  `try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error');
      }
      showToast(editingCategory ? \`Kategori "\${newCat.name}" diperbarui di Supabase!\` : \`Kategori "\${newCat.name}" ditambahkan ke Supabase!\`);
    } catch (err: any) {
      showToast(\`Tersimpan lokal, tapi gagal dikirim ke Supabase: \${err.message}\`);
      console.error(err);
    }

    setIsCategoryModalOpen(false);`
);

// Replace handleSaveGuide
content = content.replace(
  /if \(supabaseStatus\?\.connected\) \{[\s\S]*?setIsGuideModalOpen\(false\);/m,
  `try {
      const res = await fetch('/api/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGuide),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error');
      }
      showToast(editingGuide ? \`Panduan "\${newGuide.title}" diperbarui di Supabase!\` : \`Panduan "\${newGuide.title}" ditambahkan ke Supabase!\`);
    } catch (err: any) {
      showToast(\`Tersimpan lokal, tapi gagal dikirim ke Supabase: \${err.message}\`);
      console.error(err);
    }

    setIsGuideModalOpen(false);`
);

// Replace handleSaveSettings
content = content.replace(
  /if \(supabaseStatus\?\.connected\) \{[\s\S]*?showToast\('Pengaturan website berhasil disimpan lokal!'\);\s*\}/m,
  `try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Server error');
      }
      showToast('Pengaturan website berhasil disimpan ke Supabase!');
    } catch (err: any) {
      showToast(\`Tersimpan lokal, tapi gagal dikirim ke Supabase: \${err.message}\`);
      console.error(err);
    }`
);

fs.writeFileSync('src/pages/SuperAdminPage.tsx', content, 'utf8');
