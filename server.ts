import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Disable ETag completely so browsers never receive 304 Not Modified
app.set('etag', false);

app.use(express.json({ limit: '15mb' }));

// CORS & Anti-Cache Middleware for dynamic API routes
app.use((req: Request, res: Response, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  if (req.path.startsWith('/api')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    res.removeHeader('ETag');
  }
  next();
});

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

// Persistent Data Directory
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SUPABASE_CONFIG_FILE = path.join(DATA_DIR, 'supabase_config.json');
const IMAGES_FILE = path.join(DATA_DIR, 'images.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {}

// In-Memory & File Image Cache to guarantee uploaded images NEVER 404 regardless of serverless environment
let imagesCache: Record<string, { mimeType: string; base64: string }> = {};
try {
  if (fs.existsSync(IMAGES_FILE)) {
    imagesCache = JSON.parse(fs.readFileSync(IMAGES_FILE, 'utf8'));
  }
} catch (e) {
  imagesCache = {};
}

function saveImageToCache(filename: string, mimeType: string, base64: string) {
  imagesCache[filename] = { mimeType, base64 };
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(IMAGES_FILE, JSON.stringify(imagesCache), 'utf8');
  } catch (e) {}
}

// Google Search Console Verification routes
app.get('/googleak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg.html', (req: Request, res: Response) => {
  res.type('text/html').send('google-site-verification: googleak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg.html');
});
app.get('/ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg.html', (req: Request, res: Response) => {
  res.type('text/html').send('google-site-verification: ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37doS1Bg.html');
});
app.get('/googleak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37d.html', (req: Request, res: Response) => {
  res.type('text/html').send('google-site-verification: googleak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37d.html');
});
app.get('/ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37d.html', (req: Request, res: Response) => {
  res.type('text/html').send('google-site-verification: ak33i50nUtWjsrn9dKkM81hhDeHGK5EN-sA37d.html');
});
app.get('/googlebf09fd737c25f2c1.html', (req: Request, res: Response) => {
  res.type('text/html').send('google-site-verification: googlebf09fd737c25f2c1.html');
});

// Robots.txt
app.get('/robots.txt', (req: Request, res: Response) => {
  const robotsPath = path.join(process.cwd(), 'public', 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.type('text/plain').sendFile(robotsPath);
    return;
  }
  res.type('text/plain').send('User-agent: *\nAllow: /\nSitemap: https://techcheck.media/sitemap.xml\n');
});

// Sitemap.xml
app.get('/sitemap.xml', (req: Request, res: Response) => {
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    res.type('application/xml').sendFile(sitemapPath);
    return;
  }
  res.status(404).send('Not found');
});

// Dedicated Reliable Image Serving Route: Serves images from disk or in-memory cache
app.get('/api/images/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;

  // 1. Try disk
  const diskPath = path.join(uploadsDir, filename);
  if (fs.existsSync(diskPath)) {
    const ext = path.extname(filename).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.svg' ? 'image/svg+xml' : ext === '.gif' ? 'image/gif' : 'image/jpeg';
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.sendFile(diskPath);
    return;
  }

  // 2. Try JSON / In-Memory cache
  if (imagesCache[filename]) {
    const item = imagesCache[filename];
    const buffer = Buffer.from(item.base64, 'base64');
    res.setHeader('Content-Type', item.mimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(buffer);
    return;
  }

  res.status(404).send('Image not found');
});

// Dynamic Supabase Client
let supabaseClient: SupabaseClient | null = null;
let currentSupabaseConfigSignature = '';

function getSupabaseConfig(): { url: string; key: string } {
  let url = '';
  let key = '';

  // 1. Check custom saved configuration file
  try {
    if (fs.existsSync(SUPABASE_CONFIG_FILE)) {
      const conf = JSON.parse(fs.readFileSync(SUPABASE_CONFIG_FILE, 'utf8'));
      if (conf.url && conf.key) {
        url = conf.url.trim();
        key = conf.key.trim();
      }
    }
  } catch (e) {}

  // 2. Fall back to environment variables
  if (!url) {
    url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  }
  if (!key) {
    key = (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  }

  // Clean URL: Strip trailing /rest/v1 or trailing slashes
  url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  return { url, key };
}

function getSupabase(): SupabaseClient | null {
  const { url, key } = getSupabaseConfig();

  if (!url || !key || url.includes('your-project-id') || key.includes('your-supabase')) {
    return null;
  }

  const sig = `${url}:${key}`;
  if (!supabaseClient || currentSupabaseConfigSignature !== sig) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      currentSupabaseConfigSignature = sig;
    } catch (err) {
      console.error('[Supabase Init Error]:', err);
      return null;
    }
  }

  return supabaseClient;
}

// Convert any oversized base64 data URLs to clean persistent image URLs (Supabase CDN or Server Image Route)
// This prevents multi-megabyte payloads that cause network crashes (net::ERR_HTTP2_PING_FAILED, net::ERR_CONNECTION_CLOSED)
async function normalizeAndUploadImageIfBase64(imageUrl: string | undefined | null, prefix = 'img'): Promise<string> {
  if (!imageUrl || typeof imageUrl !== 'string') return imageUrl || '';
  if (!imageUrl.startsWith('data:image/')) return imageUrl;

  try {
    const mimeMatch = imageUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : mimeType === 'image/svg+xml' ? '.svg' : '.jpg';
    const base64Data = imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl;
    const fileBuffer = Buffer.from(base64Data, 'base64');
    const uniqueFilename = `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}${ext}`;

    // 1. Cache in memory and disk so /api/images/:filename is instantly available and never 404s
    saveImageToCache(uniqueFilename, mimeType, base64Data);
    try {
      const targetPath = path.join(uploadsDir, uniqueFilename);
      fs.writeFileSync(targetPath, fileBuffer);
    } catch (e) {}

    // 2. Primary: Upload to Supabase Storage if configured
    const supabase = getSupabase();
    if (supabase) {
      try {
        const BUCKET_NAME = 'techcheck-images';
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          if (!buckets?.some((b: any) => b.name === BUCKET_NAME)) {
            await supabase.storage.createBucket(BUCKET_NAME, { public: true });
          }
        } catch (bErr) {}

        const { error: storageErr } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uniqueFilename, fileBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!storageErr) {
          const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(uniqueFilename);

          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      } catch (sErr: any) {
        console.warn('Supabase image upload warning:', sErr.message);
      }
    }

    // 3. Reliable server route fallback
    return `/api/images/${uniqueFilename}`;
  } catch (err: any) {
    console.warn('normalizeAndUploadImageIfBase64 failed:', err.message);
    return imageUrl;
  }
}

interface LocalDbSchema {
  categories: any[];
  products: any[];
  guides: any[];
  settings: any;
}

function initLocalDb(): LocalDbSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn('Error reading local db file:', e);
  }
  return {
    categories: [],
    products: [],
    guides: [],
    settings: null,
  };
}

let localDbCache: LocalDbSchema = initLocalDb();

function getLocalDb(): LocalDbSchema {
  return localDbCache;
}

function saveLocalDb(partial: Partial<LocalDbSchema>) {
  localDbCache = { ...localDbCache, ...partial };
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(localDbCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to write local db:', err);
  }
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
  const rawSteps = Array.isArray(g.steps) ? g.steps.filter((s: any) => !s?.__guideMeta) : [];
  const cleanSteps = rawSteps.map((s: any, idx: number) => {
    const stepNumber = s.number || String(idx + 1).padStart(2, '0');
    const stableId = s.id || `${g.id}-step-${stepNumber}`;
    const img = s.image?.trim() || s.image_url?.trim() || '';
    return {
      ...s,
      id: stableId,
      number: stepNumber,
      image: img,
      image_url: img,
    };
  });
  const layoutFormat = g.layoutFormat ?? (g.content && cleanSteps.length === 0 ? 'document' : 'steps');
  const showContentImages = g.showContentImages !== false;
  const content = g.content ?? '';
  const hideStepNumbers = Boolean(g.hideStepNumbers);

  const metaItem = {
    __guideMeta: true,
    layoutFormat,
    showContentImages,
    content,
    hideStepNumbers,
  };
  const stepsWithMeta = [...cleanSteps, metaItem];

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
    steps: stepsWithMeta,
    callout: g.callout ?? '',
    summary: g.summary ?? '',
    // Explicit columns
    layout_format: layoutFormat,
    show_content_images: showContentImages,
    content,
    hide_step_numbers: hideStepNumbers,
  };
}

function fromGuideRow(row: any) {
  const rawSteps = Array.isArray(row.steps) ? row.steps : [];
  const metaItem = rawSteps.find((s: any) => s && s.__guideMeta);
  const cleanSteps = rawSteps
    .filter((s: any) => !s || !s.__guideMeta)
    .map((s: any, idx: number) => {
      const stepNumber = s.number || String(idx + 1).padStart(2, '0');
      const stableId = s.id || `${row.id}-step-${stepNumber}`;
      const img = s.image?.trim() || s.image_url?.trim() || '';
      return {
        ...s,
        id: stableId,
        number: stepNumber,
        image: img,
        image_url: img,
      };
    });

  const layoutFormat = row.layout_format || metaItem?.layoutFormat || (cleanSteps.length === 0 ? 'document' : 'steps');
  const showContentImages = row.show_content_images !== undefined
    ? Boolean(row.show_content_images)
    : metaItem?.showContentImages !== undefined
      ? Boolean(metaItem.showContentImages)
      : true; // Default to true so images are NEVER hidden by accident
  const content = row.content !== undefined ? row.content : (metaItem?.content || '');
  const hideStepNumbers = row.hide_step_numbers !== undefined ? Boolean(row.hide_step_numbers) : Boolean(metaItem?.hideStepNumbers);

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
    steps: cleanSteps,
    callout: row.callout ?? '',
    summary: row.summary ?? '',
    layoutFormat,
    showContentImages,
    content,
    hideStepNumbers,
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
    hero_image: s.heroImage || '/hero-setup.jpg',
    hero_image_alt: s.heroImageAlt || 'Build Better, Every Day. Compact Gaming Setup',
    hero_badge_eyebrow: s.heroBadgeEyebrow || 'SETUP ARCHITECTURE 2026',
    hero_badge_title: s.heroBadgeTitle || '100cm Compact Studio Desk',
    hero_badge_stat: s.heroBadgeStat || '45% Surface Cleared',
    hero_cta_primary_text: s.heroCtaPrimaryText || 'Explore Products',
    hero_cta_primary_url: s.heroCtaPrimaryUrl || 'recommendations',
    hero_cta_secondary_text: s.heroCtaSecondaryText || 'Read Our Guides',
    hero_cta_secondary_url: s.heroCtaSecondaryUrl || 'guides',
    og_image: s.ogImage || '/og-image.jpg',
    favicon: s.favicon || '/favicon.png',
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
    heroImage: row.hero_image || '/hero-setup.jpg',
    heroImageAlt: row.hero_image_alt || 'Build Better, Every Day. Compact Gaming Setup',
    heroBadgeEyebrow: row.hero_badge_eyebrow || 'SETUP ARCHITECTURE 2026',
    heroBadgeTitle: row.hero_badge_title || '100cm Compact Studio Desk',
    heroBadgeStat: row.hero_badge_stat || '45% Surface Cleared',
    heroCtaPrimaryText: row.hero_cta_primary_text || 'Explore Products',
    heroCtaPrimaryUrl: row.hero_cta_primary_url || 'recommendations',
    heroCtaSecondaryText: row.hero_cta_secondary_text || 'Read Our Guides',
    heroCtaSecondaryUrl: row.hero_cta_secondary_url || 'guides',
    ogImage: row.og_image || '/og-image.jpg',
    favicon: row.favicon || '/favicon.png',
    supportEmail: row.support_email ?? '',
    defaultAffiliateSubId: row.default_affiliate_sub_id ?? '',
    adminPasscode: row.admin_passcode ?? '654321',
  };
}

// ==========================================
// API ROUTES
// ==========================================

// 0. Image Upload API (Uploads to Supabase Storage with local / disk / cache fallback)
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

    const safeExt = ext || (mimeType === 'image/jpeg' ? '.jpg' : '.png');
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);
    const uniqueFilename = `${baseName}-${Date.now()}${safeExt}`;
    const base64Data = fileData.includes('base64,') ? fileData.split('base64,')[1] : fileData;
    const fileBuffer = Buffer.from(base64Data, 'base64');

    // Always cache image data so /api/images/:filename NEVER returns 404
    saveImageToCache(uniqueFilename, mimeType || (safeExt === '.png' ? 'image/png' : 'image/jpeg'), base64Data);

    // Save to disk if writable
    try {
      const targetPath = path.join(uploadsDir, uniqueFilename);
      fs.writeFileSync(targetPath, fileBuffer);
    } catch (e) {}

    // 1. Primary: Upload directly to Supabase Storage (Generates persistent public CDN URL)
    const supabase = getSupabase();
    if (supabase) {
      try {
        const BUCKET_NAME = 'techcheck-images';

        // Auto-create bucket if missing
        try {
          const { data: buckets } = await supabase.storage.listBuckets();
          if (!buckets?.some((b: any) => b.name === BUCKET_NAME)) {
            await supabase.storage.createBucket(BUCKET_NAME, { public: true });
          }
        } catch (bErr) {}

        const { error: storageErr } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(uniqueFilename, fileBuffer, {
            contentType: mimeType || (safeExt === '.png' ? 'image/png' : 'image/jpeg'),
            upsert: true,
          });

        if (!storageErr) {
          const { data: publicUrlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(uniqueFilename);

          if (publicUrlData?.publicUrl) {
            res.json({
              success: true,
              url: publicUrlData.publicUrl,
              filename: uniqueFilename,
              mimeType,
              storage: 'supabase',
            });
            return;
          }
        } else {
          console.warn('Supabase storage upload error:', storageErr.message);
        }
      } catch (storageEx: any) {
        console.warn('Supabase storage upload attempt skipped:', storageEx.message);
      }
    }

    // 2. Reliable Server Endpoint Fallback (Never 404s, works across serverless and browsers)
    res.json({
      success: true,
      url: `/api/images/${uniqueFilename}`,
      filename: uniqueFilename,
      mimeType,
      storage: 'server',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Image upload failed' });
  }
});

// Supabase Configuration Management API (Allows viewing & updating credentials directly from UI)
app.get('/api/supabase-config', (req: Request, res: Response) => {
  const { url, key } = getSupabaseConfig();
  const maskedKey = key ? `${key.slice(0, 6)}...${key.slice(-4)}` : '';
  res.json({
    url: url || '',
    keyMasked: maskedKey,
    hasKey: Boolean(key),
    isConfigured: Boolean(url && key),
  });
});

app.post('/api/supabase-config', async (req: Request, res: Response) => {
  try {
    const { url, key } = req.body;
    if (!url || !key) {
      res.status(400).json({ error: 'Supabase URL and API Key are required' });
      return;
    }

    const cleanUrl = url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
    const cleanKey = key.trim();

    // Test connection with a light test
    const testClient = createClient(cleanUrl, cleanKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Check bucket or light table read
    const testResult = await testClient.from('categories').select('id', { head: true, count: 'exact' });
    if (testResult.error && testResult.error.message.includes('fetch failed')) {
      res.status(400).json({
        error: `Gagal terhubung ke host Supabase: ${testResult.error.message}. Pastikan URL proyek aktif dan tidak ada typo.`,
      });
      return;
    }

    // Save configuration
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SUPABASE_CONFIG_FILE, JSON.stringify({ url: cleanUrl, key: cleanKey }, null, 2), 'utf8');

    // Invalidate client
    supabaseClient = null;
    currentSupabaseConfigSignature = '';

    // Auto-create techcheck-images bucket in newly connected Supabase
    try {
      const { data: buckets } = await testClient.storage.listBuckets();
      if (!buckets?.some((b: any) => b.name === 'techcheck-images')) {
        await testClient.storage.createBucket('techcheck-images', { public: true });
      }
    } catch (e) {}

    res.json({
      success: true,
      message: 'Konfigurasi Supabase berhasil disimpan dan terhubung!',
      url: cleanUrl,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gagal menyimpan konfigurasi Supabase' });
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
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const categories = data.map(fromCategoryRow);
        saveLocalDb({ categories });
        res.json(categories);
        return;
      }
    } catch (err: any) {
      console.warn('Supabase categories fetch failed, falling back to localDb:', err.message);
    }
  }

  // Fallback to local persistent storage
  const localDb = getLocalDb();
  res.json(localDb.categories || []);
});

app.post('/api/categories', async (req: Request, res: Response) => {
  const category = req.body;
  const row = toCategoryRow(category);

  // Update local persistent storage immediately
  const localDb = getLocalDb();
  const existing = localDb.categories || [];
  const updated = existing.some((c: any) => c.id === category.id)
    ? existing.map((c: any) => (c.id === category.id ? category : c))
    : [...existing, category];
  saveLocalDb({ categories: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .upsert(row)
        .select()
        .single();

      if (!error && data) {
        res.json(fromCategoryRow(data));
        return;
      }
    } catch (err: any) {
      console.warn('Supabase category upsert failed, preserved in localDb:', err.message);
    }
  }

  res.json(category);
});

app.delete('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  // Remove from local persistent storage
  const localDb = getLocalDb();
  const updated = (localDb.categories || []).filter((c: any) => c.id !== id);
  saveLocalDb({ categories: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch (err: any) {
      console.warn('Supabase category delete failed:', err.message);
    }
  }

  res.json({ success: true, id });
});

// 3. Products API
app.get('/api/products', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const products = data.map(fromProductRow);
        saveLocalDb({ products });
        res.json(products);
        return;
      }
    } catch (err: any) {
      console.warn('Supabase products fetch failed, falling back to localDb:', err.message);
    }
  }

  const localDb = getLocalDb();
  res.json(localDb.products || []);
});

app.post('/api/products', async (req: Request, res: Response) => {
  const product = { ...req.body };
  if (product.image && product.image.startsWith('data:image/')) {
    product.image = await normalizeAndUploadImageIfBase64(product.image, `prod-${product.slug || 'item'}`);
  }
  const row = toProductRow(product);

  // Update local persistent storage immediately
  const localDb = getLocalDb();
  const existing = localDb.products || [];
  const updated = existing.some((p: any) => p.id === product.id)
    ? existing.map((p: any) => (p.id === product.id ? product : p))
    : [product, ...existing];
  saveLocalDb({ products: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .upsert(row)
        .select()
        .single();

      if (!error && data) {
        res.json(fromProductRow(data));
        return;
      }
    } catch (err: any) {
      console.warn('Supabase product upsert failed, preserved in localDb:', err.message);
    }
  }

  res.json(product);
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  // Remove from local persistent storage
  const localDb = getLocalDb();
  const updated = (localDb.products || []).filter((p: any) => p.id !== id);
  saveLocalDb({ products: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err: any) {
      console.warn('Supabase product delete failed:', err.message);
    }
  }

  res.json({ success: true, id });
});

// 4. Guides API
app.get('/api/guides', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Auto-heal guides with oversized base64 images in background
        data.forEach((g: any) => {
          if (g.image && g.image.startsWith('data:image/')) {
            normalizeAndUploadImageIfBase64(g.image, `guide-${g.slug || 'hero'}`).then(async (cleanUrl) => {
              try {
                await supabase.from('guides').update({ image: cleanUrl }).eq('id', g.id);
              } catch (e) {}
            });
          }
        });

        const guides = data.map(fromGuideRow);
        saveLocalDb({ guides });
        res.json(guides);
        return;
      }
    } catch (err: any) {
      console.warn('Supabase guides fetch failed, falling back to localDb:', err.message);
    }
  }

  const localDb = getLocalDb();
  res.json(localDb.guides || []);
});

app.post('/api/guides', async (req: Request, res: Response) => {
  const guide = { ...req.body };

  // Convert raw base64 guide image and step images to compact persistent URLs
  if (guide.image && guide.image.startsWith('data:image/')) {
    guide.image = await normalizeAndUploadImageIfBase64(guide.image, `guide-${guide.slug || 'hero'}`);
  }
  if (Array.isArray(guide.steps)) {
    for (let i = 0; i < guide.steps.length; i++) {
      const st = guide.steps[i];
      if (st.image && st.image.startsWith('data:image/')) {
        st.image = await normalizeAndUploadImageIfBase64(st.image, `guide-step-${guide.slug || 'step'}-${i + 1}`);
        st.image_url = st.image;
      }
    }
  }

  const row = toGuideRow(guide);

  // Update local persistent storage immediately
  const localDb = getLocalDb();
  const existing = localDb.guides || [];
  const updated = existing.some((g: any) => g.id === guide.id)
    ? existing.map((g: any) => (g.id === guide.id ? guide : g))
    : [guide, ...existing];
  saveLocalDb({ guides: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      let { data, error } = await supabase
        .from('guides')
        .upsert(row)
        .select()
        .single();

      if (error && error.message.includes('column')) {
        // Fallback for pre-existing guides table without the new columns
        const fallbackRow = { ...row };
        delete (fallbackRow as any).layout_format;
        delete (fallbackRow as any).show_content_images;
        delete (fallbackRow as any).content;
        delete (fallbackRow as any).hide_step_numbers;
        const retry = await supabase.from('guides').upsert(fallbackRow).select().single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data) {
        // Also sync step blocks to public.article_blocks in Supabase
        if (Array.isArray(guide.steps) && guide.steps.length > 0) {
          try {
            const blocks = guide.steps.map((st: any, idx: number) => {
              const stepNum = st.number || String(idx + 1).padStart(2, '0');
              const blockId = st.id || `${guide.id}-step-${stepNum}`;
              const img = st.image?.trim() || st.image_url?.trim() || '';
              return {
                id: blockId,
                guide_id: guide.id,
                step_number: stepNum,
                title: st.title || '',
                text: st.text || '',
                image: img,
                image_url: img,
                caption: st.caption || st.title || '',
                alt_text: st.title || '',
                recommended_product_slug: st.recommendedProductSlug || st.recommended_product_slug || '',
                sort_order: idx,
              };
            });
            await supabase.from('article_blocks').upsert(blocks);
          } catch (bErr: any) {
            console.warn('Sync to article_blocks table error:', bErr.message);
          }
        }
        res.json(fromGuideRow(data));
        return;
      }
    } catch (err: any) {
      console.warn('Supabase guide upsert failed, preserved in localDb:', err.message);
    }
  }

  res.json(guide);
});

app.delete('/api/guides/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  // Remove from local persistent storage
  const localDb = getLocalDb();
  const updated = (localDb.guides || []).filter((g: any) => g.id !== id);
  saveLocalDb({ guides: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('guides').delete().eq('id', id);
    } catch (err: any) {
      console.warn('Supabase guide delete failed:', err.message);
    }
  }

  res.json({ success: true, id });
});

// ==========================================
// 4b. Targeted Article Blocks API (Zero-Payload Save Architecture)
// ==========================================

// Helper: Extract all article blocks from current guides in memory/db
function extractArticleBlocksFromGuides(): any[] {
  const localDb = getLocalDb();
  const guides = localDb.guides && localDb.guides.length > 0 ? localDb.guides : [];
  const blocks: any[] = [];

  guides.forEach((g: any) => {
    const rawSteps = Array.isArray(g.steps) ? g.steps.filter((s: any) => !s?.__guideMeta) : [];
    rawSteps.forEach((st: any, idx: number) => {
      const stepNumber = st.number || String(idx + 1).padStart(2, '0');
      const blockId = st.id || `${g.id}-step-${stepNumber}`;
      const img = st.image?.trim() || st.image_url?.trim() || '';
      blocks.push({
        id: blockId,
        guide_id: g.id,
        step_number: stepNumber,
        title: st.title || '',
        text: st.text || '',
        image: img,
        image_url: img,
        caption: st.caption || st.title || '',
        alt_text: st.title || '',
        recommended_product_slug: st.recommendedProductSlug || st.recommended_product_slug || '',
        sort_order: idx,
      });
    });
  });

  return blocks;
}

// GET all article blocks
app.get('/api/article-blocks', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('article_blocks')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        res.json(data);
        return;
      }

      // If table exists but has 0 rows, perform safe automatic backfill from existing guides
      if (!error && Array.isArray(data) && data.length === 0) {
        const backfillBlocks = extractArticleBlocksFromGuides();
        if (backfillBlocks.length > 0) {
          console.log(`[Auto-Backfill] Seeding ${backfillBlocks.length} records into public.article_blocks...`);
          await supabase.from('article_blocks').upsert(backfillBlocks);
          res.json(backfillBlocks);
          return;
        }
      }
    } catch (err: any) {
      console.warn('Supabase article_blocks fetch failed, falling back to localDb:', err.message);
    }
  }

  // Fallback: return extracted blocks from local storage
  res.json(extractArticleBlocksFromGuides());
});

// GET article blocks for a specific guide
app.get('/api/article-blocks/:guideId', async (req: Request, res: Response) => {
  const { guideId } = req.params;
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('article_blocks')
        .select('*')
        .eq('guide_id', guideId)
        .order('sort_order', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        res.json(data);
        return;
      }
    } catch (err: any) {
      console.warn('Supabase guide blocks fetch error:', err.message);
    }
  }

  const all = extractArticleBlocksFromGuides();
  const filtered = all.filter((b) => b.guide_id === guideId);
  res.json(filtered);
});

// PATCH a single article block (Targeted Update: Updates ONLY image/text without rewriting entire guide or dataset)
app.patch('/api/article-blocks/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    image_url,
    image,
    title,
    text,
    caption,
    alt_text,
    recommendedProductSlug,
    recommended_product_slug,
    step_number,
    guide_id,
  } = req.body;

  let newImageUrl = image_url !== undefined ? image_url : (image !== undefined ? image : undefined);
  if (newImageUrl && typeof newImageUrl === 'string' && newImageUrl.startsWith('data:image/')) {
    newImageUrl = await normalizeAndUploadImageIfBase64(newImageUrl, `block-${id}`);
  }

  // 1. Update local database persistent cache
  const localDb = getLocalDb();
  let foundGuideId: string | null = guide_id || null;
  let updatedBlockRecord: any = null;

  if (localDb.guides && Array.isArray(localDb.guides)) {
    localDb.guides = localDb.guides.map((g: any) => {
      if (Array.isArray(g.steps)) {
        let stepFound = false;
        const newSteps = g.steps.map((st: any, idx: number) => {
          const stepNumber = st.number || String(idx + 1).padStart(2, '0');
          const candidateId = st.id || `${g.id}-step-${stepNumber}`;
          if (candidateId === id || st.id === id) {
            stepFound = true;
            foundGuideId = g.id;
            const updatedSt = {
              ...st,
              id: candidateId,
              ...(newImageUrl !== undefined ? { image: newImageUrl, image_url: newImageUrl } : {}),
              ...(title !== undefined ? { title } : {}),
              ...(text !== undefined ? { text } : {}),
              ...(caption !== undefined ? { caption } : {}),
              ...(recommendedProductSlug !== undefined ? { recommendedProductSlug } : {}),
              ...(recommended_product_slug !== undefined ? { recommendedProductSlug: recommended_product_slug } : {}),
            };
            updatedBlockRecord = {
              id: candidateId,
              guide_id: g.id,
              step_number: stepNumber,
              ...updatedSt,
            };
            return updatedSt;
          }
          return st;
        });
        if (stepFound) {
          return { ...g, steps: newSteps };
        }
      }
      return g;
    });
    saveLocalDb({ guides: localDb.guides });
  }

  // 2. Targeted update in Supabase public.article_blocks
  const supabase = getSupabase();
  let supabaseResult: any = null;
  let supabaseError: any = null;

  if (supabase) {
    try {
      const updateData: Record<string, any> = {};
      if (newImageUrl !== undefined) {
        updateData.image_url = newImageUrl;
        updateData.image = newImageUrl;
      }
      if (title !== undefined) updateData.title = title;
      if (text !== undefined) updateData.text = text;
      if (caption !== undefined) updateData.caption = caption;
      if (alt_text !== undefined) updateData.alt_text = alt_text;
      if (recommendedProductSlug !== undefined) updateData.recommended_product_slug = recommendedProductSlug;
      if (recommended_product_slug !== undefined) updateData.recommended_product_slug = recommended_product_slug;
      if (step_number !== undefined) updateData.step_number = step_number;

      // Update targeted article_blocks row
      const { data, error } = await supabase
        .from('article_blocks')
        .update(updateData)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) {
        supabaseError = error.message;
        console.warn('Supabase article_blocks targeted update failed:', error.message);
      } else {
        supabaseResult = data;
      }

      // Also sync step update to guides table if guide was matched
      if (foundGuideId) {
        const guideRow = localDb.guides.find((g: any) => g.id === foundGuideId);
        if (guideRow) {
          const row = toGuideRow(guideRow);
          await supabase.from('guides').update({ steps: row.steps }).eq('id', foundGuideId);
        }
      }
    } catch (err: any) {
      supabaseError = err.message;
      console.warn('Supabase article_blocks patch error:', err.message);
    }
  }

  res.json({
    success: true,
    id,
    block: supabaseResult || updatedBlockRecord || { id, image_url: newImageUrl },
    supabaseUpdated: Boolean(supabaseResult),
    error: supabaseError || undefined,
  });
});

// Explicit backfill endpoint
app.post('/api/article-blocks/backfill', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  const blocks = extractArticleBlocksFromGuides();

  if (supabase) {
    try {
      const { error } = await supabase.from('article_blocks').upsert(blocks);
      if (error) {
        res.status(500).json({ error: error.message });
        return;
      }
      res.json({ success: true, count: blocks.length, message: `Berhasil backfill ${blocks.length} blok artikel ke Supabase!` });
      return;
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    }
  }

  res.json({ success: true, count: blocks.length, message: 'Backfill tersimpan di localDb.' });
});

// Targeted PUT for single guide
app.put('/api/guides/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const guide = { ...req.body, id };

  if (guide.image && guide.image.startsWith('data:image/')) {
    guide.image = await normalizeAndUploadImageIfBase64(guide.image, `guide-${guide.slug || 'hero'}`);
  }
  if (Array.isArray(guide.steps)) {
    for (let i = 0; i < guide.steps.length; i++) {
      const st = guide.steps[i];
      if (st.image && st.image.startsWith('data:image/')) {
        st.image = await normalizeAndUploadImageIfBase64(st.image, `guide-step-${guide.slug || 'step'}-${i + 1}`);
        st.image_url = st.image;
      }
    }
  }

  const row = toGuideRow(guide);

  const localDb = getLocalDb();
  const existing = localDb.guides || [];
  const updated = existing.some((g: any) => g.id === id)
    ? existing.map((g: any) => (g.id === id ? guide : g))
    : [...existing, guide];
  saveLocalDb({ guides: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('guides').upsert(row).select().maybeSingle();
      if (!error && data) {
        if (Array.isArray(guide.steps) && guide.steps.length > 0) {
          try {
            const blocks = guide.steps.map((st: any, idx: number) => {
              const stepNum = st.number || String(idx + 1).padStart(2, '0');
              const blockId = st.id || `${guide.id}-step-${stepNum}`;
              const img = st.image?.trim() || st.image_url?.trim() || '';
              return {
                id: blockId,
                guide_id: guide.id,
                step_number: stepNum,
                title: st.title || '',
                text: st.text || '',
                image: img,
                image_url: img,
                caption: st.caption || st.title || '',
                alt_text: st.title || '',
                recommended_product_slug: st.recommendedProductSlug || st.recommended_product_slug || '',
                sort_order: idx,
              };
            });
            await supabase.from('article_blocks').upsert(blocks);
          } catch (bErr: any) {
            console.warn('Sync to article_blocks table error:', bErr.message);
          }
        }
        res.json(fromGuideRow(data));
        return;
      }
    } catch (err: any) {
      console.warn('Supabase targeted guide update failed:', err.message);
    }
  }

  res.json(guide);
});

// Targeted PUT for single product
app.put('/api/products/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = { ...req.body, id };

  if (product.image && product.image.startsWith('data:image/')) {
    product.image = await normalizeAndUploadImageIfBase64(product.image, `prod-${product.slug || 'item'}`);
  }

  const row = toProductRow(product);

  const localDb = getLocalDb();
  const existing = localDb.products || [];
  const updated = existing.some((p: any) => p.id === id)
    ? existing.map((p: any) => (p.id === id ? product : p))
    : [...existing, product];
  saveLocalDb({ products: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('products').upsert(row).select().maybeSingle();
      if (!error && data) {
        res.json(fromProductRow(data));
        return;
      }
    } catch (err: any) {
      console.warn('Supabase targeted product update failed:', err.message);
    }
  }

  res.json(product);
});

// Targeted PUT for single category
app.put('/api/categories/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const cat = { ...req.body, id };
  const row = toCategoryRow(cat);

  const localDb = getLocalDb();
  const existing = localDb.categories || [];
  const updated = existing.some((c: any) => c.id === id)
    ? existing.map((c: any) => (c.id === id ? cat : c))
    : [...existing, cat];
  saveLocalDb({ categories: updated });

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categories').upsert(row).select().maybeSingle();
      if (!error && data) {
        res.json(fromCategoryRow(data));
        return;
      }
    } catch (err: any) {
      console.warn('Supabase targeted category update failed:', err.message);
    }
  }

  res.json(cat);
});

// 5. Site Settings API
app.get('/api/settings', async (req: Request, res: Response) => {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        // Auto-heal oversized base64 images if found in database
        if (data.hero_image && data.hero_image.startsWith('data:image/')) {
          normalizeAndUploadImageIfBase64(data.hero_image, 'hero-banner').then(async (cleanUrl) => {
            try {
              await supabase.from('site_settings').update({ hero_image: cleanUrl }).eq('id', 1);
            } catch (e) {}
          });
        }

        const settings = fromSettingsRow(data);
        saveLocalDb({ settings });
        res.json(settings);
        return;
      }
    } catch (err: any) {
      console.warn('Supabase settings fetch failed, falling back to localDb:', err.message);
    }
  }

  const localDb = getLocalDb();
  res.json(localDb.settings || null);
});

app.post('/api/settings', async (req: Request, res: Response) => {
  const settings = { ...req.body };

  // Convert raw base64 heroImage to compact CDN or persistent image URL
  if (settings.heroImage && settings.heroImage.startsWith('data:image/')) {
    settings.heroImage = await normalizeAndUploadImageIfBase64(settings.heroImage, 'hero-banner');
  }

  const row = toSettingsRow(settings);

  // Update local persistent storage immediately
  saveLocalDb({ settings });

  const supabase = getSupabase();
  if (supabase) {
    try {
      let { data, error } = await supabase
        .from('site_settings')
        .upsert(row)
        .select()
        .maybeSingle();

      if (error && error.message.includes('column')) {
        console.warn('[Supabase Settings Column Missing] Falling back to core columns.');
        const fallbackRow = {
          id: 1,
          announcement_text: row.announcement_text,
          announcement_enabled: row.announcement_enabled,
          announcement_link: row.announcement_link,
          hero_eyebrow: row.hero_eyebrow,
          hero_headline1: row.hero_headline1,
          hero_headline2: row.hero_headline2,
          hero_subtext: row.hero_subtext,
          support_email: row.support_email,
          default_affiliate_sub_id: row.default_affiliate_sub_id,
          admin_passcode: row.admin_passcode,
        };
        const fallbackResult = await supabase
          .from('site_settings')
          .upsert(fallbackRow)
          .select()
          .maybeSingle();

        if (!fallbackResult.error) {
          res.json({
            ...fromSettingsRow(fallbackResult.data || fallbackRow),
            heroImage: row.hero_image,
            heroImageAlt: row.hero_image_alt,
            heroBadgeEyebrow: row.hero_badge_eyebrow,
            heroBadgeTitle: row.hero_badge_title,
            heroBadgeStat: row.hero_badge_stat,
            heroCtaPrimaryText: row.hero_cta_primary_text,
            heroCtaPrimaryUrl: row.hero_cta_primary_url,
            heroCtaSecondaryText: row.hero_cta_secondary_text,
            heroCtaSecondaryUrl: row.hero_cta_secondary_url,
          });
          return;
        }
      }

      if (!error && (data || row)) {
        res.json(fromSettingsRow(data || row));
        return;
      }
    } catch (err: any) {
      console.warn('Supabase settings upsert failed, preserved in localDb:', err.message);
    }
  }

  res.json(settings);
});

// 6. Bulk Sync / Seed API (Pushes existing data to Supabase and persists locally)
app.post('/api/sync-seed', async (req: Request, res: Response) => {
  try {
    const { categories = [], products = [], guides = [], settings } = req.body;

    // 1. Normalize oversized base64 images to prevent network crashes
    if (settings && settings.heroImage && settings.heroImage.startsWith('data:image/')) {
      settings.heroImage = await normalizeAndUploadImageIfBase64(settings.heroImage, 'hero-banner');
    }

    for (const g of guides) {
      if (g.image && g.image.startsWith('data:image/')) {
        g.image = await normalizeAndUploadImageIfBase64(g.image, `guide-${g.slug || 'hero'}`);
      }
      if (Array.isArray(g.steps)) {
        for (let i = 0; i < g.steps.length; i++) {
          if (g.steps[i].image && g.steps[i].image.startsWith('data:image/')) {
            g.steps[i].image = await normalizeAndUploadImageIfBase64(g.steps[i].image, `guide-step-${g.slug || 'step'}-${i + 1}`);
            g.steps[i].image_url = g.steps[i].image;
          }
        }
      }
    }

    for (const p of products) {
      if (p.image && p.image.startsWith('data:image/')) {
        p.image = await normalizeAndUploadImageIfBase64(p.image, `prod-${p.slug || 'item'}`);
      }
    }

    const partial: any = {};
    if (categories.length > 0) partial.categories = categories;
    if (products.length > 0) partial.products = products;
    if (guides.length > 0) partial.guides = guides;
    if (settings) partial.settings = settings;

    // Always persist to local server database first!
    saveLocalDb(partial);

    const supabase = getSupabase();
    if (!supabase) {
      res.json({
        success: true,
        message: 'Data berhasil disimpan aman di server (penyimpanan lokal aktif).',
        results: { localDb: true },
      });
      return;
    }

    const results: Record<string, any> = { localDb: true };

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
      let { error: guideErr } = await supabase.from('guides').upsert(guideRows);
      if (guideErr && guideErr.message.includes('column')) {
        const fallbackGuideRows = guideRows.map((r: any) => {
          const fb = { ...r };
          delete fb.layout_format;
          delete fb.show_content_images;
          delete fb.content;
          delete fb.hide_step_numbers;
          return fb;
        });
        const retry = await supabase.from('guides').upsert(fallbackGuideRows);
        guideErr = retry.error;
      }
      results.guides = guideErr ? `Error: ${guideErr.message}` : `Synced ${guideRows.length} guides`;
    }

    // 4. Settings
    if (settings) {
      const settRow = toSettingsRow(settings);
      let { error: settErr } = await supabase.from('site_settings').upsert(settRow);
      if (settErr && settErr.message.includes('column')) {
        const fallbackSettRow = {
          id: 1,
          announcement_text: settRow.announcement_text,
          announcement_enabled: settRow.announcement_enabled,
          announcement_link: settRow.announcement_link,
          hero_eyebrow: settRow.hero_eyebrow,
          hero_headline1: settRow.hero_headline1,
          hero_headline2: settRow.hero_headline2,
          hero_subtext: settRow.hero_subtext,
          support_email: settRow.support_email,
          default_affiliate_sub_id: settRow.default_affiliate_sub_id,
          admin_passcode: settRow.admin_passcode,
        };
        const retry = await supabase.from('site_settings').upsert(fallbackSettRow);
        settErr = retry.error;
      }
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
