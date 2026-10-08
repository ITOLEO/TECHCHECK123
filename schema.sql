-- ==============================================================================
-- TechCheck Database Schema
-- Compatible with: PostgreSQL (12+), Supabase, Neon, Cloud SQL (Postgres)
-- Note: For MySQL 8+, replace 'TIMESTAMPTZ' with 'DATETIME', 'JSONB' with 'JSON',
--       and 'BOOLEAN' with 'TINYINT(1)'.
-- ==============================================================================

-- 1. EXTENSIONS (PostgreSQL only, optional for UUID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- Table: categories
-- Stores product categorization (Desk Organizers, Cable Management, Compact Audio, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    product_count INT DEFAULT 0,
    image TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ==============================================================================
-- Table: products
-- Stores curated affiliate tech items, review metrics, and specifications
-- ==============================================================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    review_count INT DEFAULT 0 CHECK (review_count >= 0),
    image TEXT NOT NULL,
    gallery JSONB DEFAULT '[]'::jsonb,
    badge VARCHAR(100) DEFAULT '',
    short_benefit VARCHAR(255) DEFAULT '',
    description TEXT NOT NULL,
    benefits JSONB DEFAULT '[]'::jsonb,
    highlights JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '{}'::jsonb,
    best_for TEXT DEFAULT '',
    great_for JSONB DEFAULT '[]'::jsonb,
    setup_considerations JSONB DEFAULT '[]'::jsonb,
    verdict TEXT DEFAULT '',
    affiliate_url TEXT NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    product_type VARCHAR(100) DEFAULT 'Gear',
    desk_size_compatibility VARCHAR(100) DEFAULT 'All Desks',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating DESC);

-- ==============================================================================
-- Table: guides
-- Stores editorial articles, setup guides, and desk optimization tutorials
-- ==============================================================================
CREATE TABLE IF NOT EXISTS guides (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    read_time VARCHAR(50) DEFAULT '5 min',
    publish_date VARCHAR(50),
    excerpt TEXT,
    image TEXT,
    featured BOOLEAN DEFAULT FALSE,
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(150) DEFAULT 'Setup Specialist',
    author_avatar TEXT,
    intro TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    callout TEXT,
    summary TEXT,
    layout_format VARCHAR(50) DEFAULT 'steps',
    show_content_images BOOLEAN DEFAULT TRUE,
    content TEXT DEFAULT '',
    hide_step_numbers BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for pre-existing guides table (safe to run multiple times)
ALTER TABLE guides ADD COLUMN IF NOT EXISTS layout_format VARCHAR(50) DEFAULT 'steps';
ALTER TABLE guides ADD COLUMN IF NOT EXISTS show_content_images BOOLEAN DEFAULT TRUE;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS content TEXT DEFAULT '';
ALTER TABLE guides ADD COLUMN IF NOT EXISTS hide_step_numbers BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_guides_slug ON guides(slug);
CREATE INDEX IF NOT EXISTS idx_guides_category ON guides(category);
CREATE INDEX IF NOT EXISTS idx_guides_featured ON guides(featured);

-- ==============================================================================
-- Table: guide_steps
-- Stores step-by-step instructions for guides with optional product references
-- ==============================================================================
CREATE TABLE IF NOT EXISTS guide_steps (
    id VARCHAR(64) PRIMARY KEY,
    guide_id VARCHAR(64) NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    step_number VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    image TEXT,
    recommended_product_slug VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guide_steps_guide_id ON guide_steps(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_steps_sort_order ON guide_steps(guide_id, sort_order);

-- ==============================================================================
-- Table: article_blocks
-- Stores granular content blocks / steps for editorial guides
-- Supports targeted block-level updates (image, text, caption) without rewriting articles
-- ==============================================================================
CREATE TABLE IF NOT EXISTS article_blocks (
    id VARCHAR(64) PRIMARY KEY,
    guide_id VARCHAR(64) NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
    step_number VARCHAR(20) DEFAULT '01',
    title VARCHAR(255) DEFAULT '',
    text TEXT DEFAULT '',
    image TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    alt_text TEXT DEFAULT '',
    recommended_product_slug VARCHAR(255) DEFAULT '',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations for article_blocks (safe re-run)
ALTER TABLE article_blocks ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE article_blocks ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE article_blocks ADD COLUMN IF NOT EXISTS caption TEXT DEFAULT '';
ALTER TABLE article_blocks ADD COLUMN IF NOT EXISTS alt_text TEXT DEFAULT '';
ALTER TABLE article_blocks ADD COLUMN IF NOT EXISTS recommended_product_slug VARCHAR(255) DEFAULT '';
ALTER TABLE article_blocks ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_article_blocks_guide_id ON article_blocks(guide_id);
CREATE INDEX IF NOT EXISTS idx_article_blocks_sort_order ON article_blocks(guide_id, sort_order);

-- ==============================================================================
-- Table: site_settings (Singleton row)
-- Stores website banners, branding copy, support info, and admin passcode
-- ==============================================================================
CREATE TABLE IF NOT EXISTS site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    announcement_text TEXT DEFAULT '🔥 Update: Rekomendasi Monitor & Aksesoris Compact Setup Terbaru Sudah Tersedia!',
    announcement_enabled BOOLEAN DEFAULT FALSE,
    announcement_link TEXT DEFAULT '',
    hero_eyebrow VARCHAR(255) DEFAULT 'SMART TECH FOR BETTER SETUPS',
    hero_headline1 VARCHAR(255) DEFAULT 'Better Gear.',
    hero_headline2 VARCHAR(255) DEFAULT 'Smarter Spaces.',
    hero_subtext TEXT DEFAULT 'Discover space-saving tech and accessories that help you build a cleaner, more functional gaming setup — without the clutter.',
    hero_image TEXT DEFAULT '/acer-nitro.png',
    hero_image_alt TEXT DEFAULT 'Compact Gaming Setup',
    hero_badge_eyebrow VARCHAR(255) DEFAULT 'SETUP ARCHITECTURE 2026',
    hero_badge_title VARCHAR(255) DEFAULT '100cm Compact Studio Desk',
    hero_badge_stat VARCHAR(255) DEFAULT '45% Surface Cleared',
    hero_cta_primary_text VARCHAR(255) DEFAULT 'Explore Products',
    hero_cta_primary_url VARCHAR(255) DEFAULT 'recommendations',
    hero_cta_secondary_text VARCHAR(255) DEFAULT 'Read Our Guides',
    hero_cta_secondary_url VARCHAR(255) DEFAULT 'guides',
    support_email VARCHAR(255) DEFAULT 'itleo4444@gmail.com',
    default_affiliate_sub_id VARCHAR(100) DEFAULT '14139310000',
    admin_passcode VARCHAR(255) DEFAULT '654321',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Migrations: Ensure all columns exist on pre-existing site_settings table
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image TEXT DEFAULT '/acer-nitro.png';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_image_alt TEXT DEFAULT 'Compact Gaming Setup';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_badge_eyebrow VARCHAR(255) DEFAULT 'SETUP ARCHITECTURE 2026';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_badge_title VARCHAR(255) DEFAULT '100cm Compact Studio Desk';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_badge_stat VARCHAR(255) DEFAULT '45% Surface Cleared';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_primary_text VARCHAR(255) DEFAULT 'Explore Products';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_primary_url VARCHAR(255) DEFAULT 'recommendations';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_secondary_text VARCHAR(255) DEFAULT 'Read Our Guides';
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS hero_cta_secondary_url VARCHAR(255) DEFAULT 'guides';

-- Seed default site settings singleton
INSERT INTO site_settings (id, admin_passcode)
VALUES (1, '654321')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Table: admin_users (Optional authentication table)
-- For future multi-user admin authentication with hashed passwords
-- ==============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'superadmin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ
);

-- ==============================================================================
-- Table: subscribers (NEW)
-- Stores email subscriptions for newsletters
-- ==============================================================================
CREATE TABLE IF NOT EXISTS subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Table: product_reviews (NEW)
-- Stores user-submitted reviews or comments on products
-- ==============================================================================
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(100) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- HELPER TRIGGER: Auto-update updated_at timestamp
-- ==============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp_categories ON categories;
CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_products ON products;
CREATE TRIGGER set_timestamp_products
BEFORE UPDATE ON products
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_guides ON guides;
CREATE TRIGGER set_timestamp_guides
BEFORE UPDATE ON guides
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_site_settings ON site_settings;
CREATE TRIGGER set_timestamp_site_settings
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

DROP TRIGGER IF EXISTS set_timestamp_article_blocks ON article_blocks;
CREATE TRIGGER set_timestamp_article_blocks
BEFORE UPDATE ON article_blocks
FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & ACCESS POLICIES (Supabase PostgREST)
-- ==============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_blocks ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Allow public read categories" ON categories;
DROP POLICY IF EXISTS "Allow full access categories" ON categories;
DROP POLICY IF EXISTS "Allow public read products" ON products;
DROP POLICY IF EXISTS "Allow full access products" ON products;
DROP POLICY IF EXISTS "Allow public read guides" ON guides;
DROP POLICY IF EXISTS "Allow full access guides" ON guides;
DROP POLICY IF EXISTS "Allow public read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow full access site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow public read article_blocks" ON article_blocks;
DROP POLICY IF EXISTS "Allow full access article_blocks" ON article_blocks;

-- Public read policies (anyone can read catalog, guides, categories, settings, article_blocks)
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read guides" ON guides FOR SELECT USING (true);
CREATE POLICY "Allow public read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow public read article_blocks" ON article_blocks FOR SELECT USING (true);

-- Full access policies for data synchronization and admin operations
CREATE POLICY "Allow full access categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access guides" ON guides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access article_blocks" ON article_blocks FOR ALL USING (true) WITH CHECK (true);

-- Explicitly grant permissions to anon, authenticated, and service_role
GRANT ALL ON TABLE categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE products TO anon, authenticated, service_role;
GRANT ALL ON TABLE guides TO anon, authenticated, service_role;
GRANT ALL ON TABLE site_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE article_blocks TO anon, authenticated, service_role;

-- ==============================================================================
-- SUPABASE STORAGE BUCKET: techcheck-images (For High-Efficiency CDN Image Storage)
-- ==============================================================================
-- Run these lines in Supabase SQL editor to enable the public image bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('techcheck-images', 'techcheck-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public Read techcheck-images" ON storage.objects;
CREATE POLICY "Public Read techcheck-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'techcheck-images');

DROP POLICY IF EXISTS "Public Insert techcheck-images" ON storage.objects;
CREATE POLICY "Public Insert techcheck-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'techcheck-images');

DROP POLICY IF EXISTS "Public Update techcheck-images" ON storage.objects;
CREATE POLICY "Public Update techcheck-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'techcheck-images');

