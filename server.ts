import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Static uploads directory serving
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Ignore in read-only environment
}
app.use('/uploads', express.static(uploadsDir));

// Lazy Supabase Client
let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (!url || !key || url.includes('your-project-id') || key.includes('your-supabase')) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.error('[Supabase Init Error]:', err);
      return null;
    }
  }

  return supabaseClient;
}

// Helpers for Data Transformation
function toProductRow(p: any) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    rating: Number(p.rating ?? 0),
    review_count: Number(p.reviewCount ?? 0),
    image: p.image ?? '',
    gallery: p.gallery ?? [],
    badge: p.badge ?? '',
    short_benefit: p.shortBenefit ?? '',
    description: p.description ?? '',
    benefits: p.benefits ?? [],
    highlights: p.highlights ?? [],
    specifications: p.specifications ?? {},
    best_for: p.bestFor ?? '',
    great_for: p.greatFor ?? [],
    setup_considerations: p.setupConsiderations ?? [],
    verdict: p.verdict ?? '',
    affiliate_url: p.affiliateUrl ?? '',
    featured: Boolean(p.featured),
    product_type: p.productType ?? 'Gear',
    desk_size_compatibility: p.deskSizeCompatibility ?? 'All Desks',
  };
}

function fromProductRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    image: row.image,
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    badge: row.badge ?? '',
    shortBenefit: row.short_benefit ?? '',
    description: row.description ?? '',
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    specifications: typeof row.specifications === 'object' && row.specifications !== null ? row.specifications : {},
    bestFor: row.best_for ?? '',
    greatFor: Array.isArray(row.great_for) ? row.great_for : [],
    setupConsiderations: Array.isArray(row.setup_considerations) ? row.setup_considerations : [],
    verdict: row.verdict ?? '',
    affiliateUrl: row.affiliate_url ?? '',
    featured: Boolean(row.featured),
    productType: row.product_type ?? 'Gear',
    deskSizeCompatibility: row.desk_size_compatibility ?? 'All Desks',
  };
}

function toCategoryRow(c: any, index: number = 0) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? '',
    product_count: Number(c.productCount ?? 0),
    image: c.image ?? '',
    sort_order: index,
  };
}

function fromCategoryRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    productCount: Number(row.product_count ?? 0),
    image: row.image ?? '',
  };
}

function toGuideRow(g: any) {
  return {
    id: g.id,
    slug: g.slug,
    title: g.title,
    category: g.category,
    read_time: g.readTime ?? '5 min',
    publish_date: g.publishDate ?? '',
    excerpt: g.excerpt ?? '',
    image: g.image ?? '',
    featured: Boolean(g.featured),
    author_name: g.author?.name ?? '',
    author_role: g.author?.role ?? '',
    author_avatar: g.author?.avatar ?? '',
    intro: g.intro ?? '',
    steps: g.steps ?? [],
    callout: g.callout ?? '',
    summary: g.summary ?? '',
  };
}

function fromGuideRow(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    readTime: row.read_time ?? '5 min',
    publishDate: row.publish_date ?? '',
    excerpt: row.excerpt ?? '',
    image: row.image ?? '',
    featured: Boolean(row.featured),
    author: {
      name: row.author_name ?? '',
      role: row.author_role ?? '',
      avatar: row.author_avatar ?? '',
    },
    intro: row.intro ?? '',
    steps: Array.isArray(row.steps) ? row.steps : [],
    callout: row.callout ?? '',
    summary: row.summary ?? '',
  };
}

function toSettingsRow(s: any) {
  return {
    id: 1,
    announcement_text: s.announcementText ?? '',
    announcement_enabled: Boolean(s.announcementEnabled),
    announcement_link: s.announcementLink ?? '',
    hero_eyebrow: s.heroEyebrow ?? '',
    hero_headline1: s.heroHeadline1 ?? '',
    hero_headline2: s.heroHeadline2 ?? '',
    hero_subtext: s.heroSubtext ?? '',
    support_email: s.supportEmail ?? '',
    default_affiliate_sub_id: s.defaultAffiliateSubId ?? '',
    admin_passcode: s.adminPasscode ?? '654321',
  };
}

function fromSettingsRow(row: any) {
  return {
    announcementText: row.announcement_text ?? '',
    announcementEnabled: Boolean(row.announcement_enabled),
    announcementLink: row.announcement_link ?? '',
    heroEyebrow: row.hero_eyebrow ?? '',
    heroHeadline1: row.hero_headline1 ?? '',
    heroHeadline2: row.hero_headline2 ?? '',
    heroSubtext: row.hero_subtext ?? '',
    supportEmail: row.support_email ?? '',
    defaultAffiliateSubId: row.default_affiliate_sub_id ?? '',
    adminPasscode: row.admin_passcode ?? '654321',
  };
}

// ==========================================
// API ROUTES
// ==========================================

// 0. Image Upload API (Supports JPG, JPEG, PNG, WEBP, GIF, SVG)
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { filename, fileData, mimeType } = req.body;
    if (!fileData || !filename) {
      res.status(400).json({ error: 'Missing fileData or filename' });
      return;
    }

    const validMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    const ext = path.extname(filename).toLowerCase();
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

    if (!validMimes.includes(mimeType) && !validExts.includes(ext)) {
      res.status(400).json({
        error: 'Unsupported image format. Please upload JPG, JPEG, PNG, WEBP, GIF, or SVG.',
      });
      return;
    }

    // SVG security check
    if (mimeType === 'image/svg+xml' || ext === '.svg') {
      const base64Data = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
      const rawContent = Buffer.from(base64Data, 'base64').toString('utf8');
      if (/<script|javascript:|onload=|onerror=/i.test(rawContent)) {
        res.status(400).json({ error: 'Unsafe SVG content detected.' });
        return;
      }
    }

    // Try saving to public/uploads
    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }

    const safeExt = ext || (mimeType === 'image/jpeg' ? '.jpg' : '.png');
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const uniqueFilename = `${baseName}-${Date.now()}${safeExt}`;
    const targetPath = path.join(uploadsPath, uniqueFilename);

    const base64Data = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
    fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));

    res.json({
      success: true,
      url: `/uploads/${uniqueFilename}`,
      filename: uniqueFilename,
      mimeType,
    });
  } catch (err: any) {
    console.warn('Local disk write failed, fallback to data url:', err.message);
    res.json({
      success: true,
      url: req.body.fileData,
      filename: req.body.filename,
      mimeType: req.body.mimeType,
    });
  }
});

// 1. Status & Health (Verifies all 4 Supabase tables)
app.get('/api/status', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.json({
      configured: false,
      connected: false,
      message: 'Supabase belum dikonfigurasi pada environment variables (SUPABASE_URL & SUPABASE_KEY). Web saat ini berjalan dengan penyimpanan lokal.',
      tables: ['categories', 'products', 'guides', 'site_settings'],
      tableDetails: [
        { name: 'categories', ready: false, count: 0, label: 'Kategori Produk' },
        { name: 'products', ready: false, count: 0, label: 'Katalog Produk' },
        { name: 'guides', ready: false, count: 0, label: 'Panduan & Artikel' },
        { name: 'site_settings', ready: false, count: 0, label: 'Pengaturan Website' },
      ],
    });
    return;
  }

  try {
    const tableChecks = [
      { name: 'categories', label: 'Kategori Produk' },
      { name: 'products', label: 'Katalog Produk' },
      { name: 'guides', label: 'Panduan & Artikel' },
      { name: 'site_settings', label: 'Pengaturan Website' },
    ];

    const results = await Promise.all(
      tableChecks.map(async (t) => {
        try {
          const { count, error } = await supabase
            .from(t.name)
            .select('*', { count: 'exact', head: true });

          if (error) {
            return {
              name: t.name,
              label: t.label,
              ready: false,
              count: 0,
              error: error.message,
            };
          }

          return {
            name: t.name,
            label: t.label,
            ready: true,
            count: count ?? 0,
          };
        } catch (err: any) {
          return {
            name: t.name,
            label: t.label,
            ready: false,
            count: 0,
            error: err.message || String(err),
          };
        }
      })
    );

    const allReady = results.every((r) => r.ready);
    const failedTables = results.filter((r) => !r.ready);

    if (!allReady) {
      const errorMsg = failedTables.map((f) => `Tabel '${f.name}': ${f.error}`).join('; ');
      res.json({
        configured: true,
        connected: false,
        message: `Terhubung ke Supabase URL, namun beberapa tabel belum tersedia (${failedTables.map((f) => f.name).join(', ')}). Silakan jalankan file schema.sql di Supabase SQL Editor. Detail: ${errorMsg}`,
        tables: ['categories', 'products', 'guides', 'site_settings'],
        tableDetails: results,
      });
      return;
    }

    res.json({
      configured: true,
      connected: true,
      message: 'Database web dan seluruh 4 tabel di Supabase terhubung 100% dan siap digunakan!',
      tables: ['categories', 'products', 'guides', 'site_settings'],
      tableDetails: results,
    });
  } catch (err: any) {
    res.json({
      configured: true,
      connected: false,
      message: `Error saat memeriksa tabel Supabase: ${err.message || err}`,
      tables: ['categories', 'products', 'guides', 'site_settings'],
    });
  }
});

// Endpoint to fetch schema.sql for quick viewing / copying
app.get('/api/schema', (req: Request, res: Response) => {
  try {
    
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(sql);
      return;
    }
    res.status(404).send('schema.sql not found');
  } catch (e: any) {
    res.status(500).send(e.message || 'Error reading schema.sql');
  }
});

// 2. Categories API
app.get('/api/categories', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data.map(fromCategoryRow));
});

app.post('/api/categories', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const category = req.body;
  const row = toCategoryRow(category);

  const { data, error } = await supabase
    .from('categories')
    .upsert(row)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(fromCategoryRow(data));
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const { id } = req.params;
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true, id });
});

// 3. Products API
app.get('/api/products', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data.map(fromProductRow));
});

app.post('/api/products', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const product = req.body;
  const row = toProductRow(product);

  const { data, error } = await supabase
    .from('products')
    .upsert(row)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(fromProductRow(data));
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const { id } = req.params;
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true, id });
});

// 4. Guides API
app.get('/api/guides', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(data.map(fromGuideRow));
});

app.post('/api/guides', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const guide = req.body;
  const row = toGuideRow(guide);

  const { data, error } = await supabase
    .from('guides')
    .upsert(row)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(fromGuideRow(data));
});

app.delete('/api/guides/:id', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const { id } = req.params;
  const { error } = await supabase.from('guides').delete().eq('id', id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ success: true, id });
});

// 5. Site Settings API
app.get('/api/settings', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  if (!data) {
    res.json(null);
    return;
  }

  res.json(fromSettingsRow(data));
});

app.post('/api/settings', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  const settings = req.body;
  const row = toSettingsRow(settings);

  const { data, error } = await supabase
    .from('site_settings')
    .upsert(row)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(fromSettingsRow(data));
});

// 6. Bulk Sync / Seed API (Pushes existing data to Supabase)
app.post('/api/sync-seed', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: 'Supabase not configured' });
    return;
  }

  try {
    const { categories = [], products = [], guides = [], settings } = req.body;
    const results: Record<string, any> = {};

    // 1. Categories
    if (categories.length > 0) {
      const catRows = categories.map((c: any, i: number) => toCategoryRow(c, i));
      const { error: catErr } = await supabase.from('categories').upsert(catRows);
      results.categories = catErr ? `Error: ${catErr.message}` : `Synced ${catRows.length} categories`;
    }

    // 2. Products
    if (products.length > 0) {
      const prodRows = products.map(toProductRow);
      const { error: prodErr } = await supabase.from('products').upsert(prodRows);
      results.products = prodErr ? `Error: ${prodErr.message}` : `Synced ${prodRows.length} products`;
    }

    // 3. Guides
    if (guides.length > 0) {
      const guideRows = guides.map(toGuideRow);
      const { error: guideErr } = await supabase.from('guides').upsert(guideRows);
      results.guides = guideErr ? `Error: ${guideErr.message}` : `Synced ${guideRows.length} guides`;
    }

    // 4. Settings
    if (settings) {
      const settRow = toSettingsRow(settings);
      const { error: settErr } = await supabase.from('site_settings').upsert(settRow);
      results.settings = settErr ? `Error: ${settErr.message}` : 'Synced site settings';
    }

    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

// ==========================================
// VITE MIDDLEWARE & STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vi' + 'te'); // Hidden from static analyzer
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
