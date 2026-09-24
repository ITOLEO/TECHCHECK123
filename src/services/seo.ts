import { Product, Guide } from '../types';

interface SEOConfig {
  title: string;
  description: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const BASE_URL = 'https://techcheck.media';
const DEFAULT_TITLE = 'TechCheck — Small Space. Serious Setup.';
const DEFAULT_DESCRIPTION =
  'Curated space-saving gaming monitors, ergonomic arms, cable management, and audio gear for compact desks (80cm–140cm). Singapore setup reviews & blueprints.';
const DEFAULT_OG_IMAGE = 'https://techcheck.media/acer-nitro.png';

/**
 * Updates dynamic meta tags, title, OpenGraph tags, and JSON-LD structured data.
 */
export function updateSEO(config: SEOConfig): void {
  if (typeof document === 'undefined') return;

  const {
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    canonicalPath = '',
    ogType = 'website',
    ogImage = DEFAULT_OG_IMAGE,
    jsonLd,
  } = config;

  // 1. Title tag
  document.title = title;

  // 2. Meta description
  setMetaTag('name', 'description', description);

  // 3. Canonical link
  const canonicalUrl = canonicalPath
    ? `${BASE_URL}/#${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`
    : BASE_URL;
  setLinkTag('canonical', canonicalUrl);

  // 4. OpenGraph tags
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', description);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:type', ogType);
  setMetaTag('property', 'og:site_name', 'TechCheck');
  setMetaTag('property', 'og:locale', 'en_SG');
  if (ogImage) {
    const fullOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
    setMetaTag('property', 'og:image', fullOgImage);
  }

  // 5. Twitter Card tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', description);
  if (ogImage) {
    const fullOgImage = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage.startsWith('/') ? '' : '/'}${ogImage}`;
    setMetaTag('name', 'twitter:image', fullOgImage);
  }

  // 6. Schema.org JSON-LD injection
  updateJsonLd(jsonLd);
}

function setMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string): void {
  let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function updateJsonLd(data?: Record<string, any> | Array<Record<string, any>>): void {
  const SCRIPT_ID = 'techcheck-schema-ld';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!data) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  try {
    script.textContent = JSON.stringify(data);
  } catch (err) {
    console.warn('Failed to serialize JSON-LD structured data', err);
  }
}

/**
 * Builds Schema.org Product structured data for hardware reviews.
 */
export function buildProductSchema(product: Product): Record<string, any> {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image?.startsWith('http') ? product.image : `${BASE_URL}${product.image}`,
    description: product.description || product.shortBenefit,
    category: product.category,
    brand: {
      '@type': 'Brand',
      name: product.name.split(' ')[0] || 'TechCheck Curation',
    },
  };

  if (product.rating && product.rating > 0 && product.reviewCount && product.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

/**
 * Builds Schema.org TechArticle structured data for setup guides.
 */
export function buildGuideSchema(guide: Guide): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: guide.title,
    description: guide.excerpt,
    image: guide.image?.startsWith('http') ? guide.image : `${BASE_URL}${guide.image}`,
    author: {
      '@type': 'Organization',
      name: guide.author?.name || 'TechCheck Editorial Team',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TechCheck Media',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/acer-nitro.png`,
      },
    },
    datePublished: '2026-01-15T08:00:00+08:00',
    dateModified: '2026-03-20T08:00:00+08:00',
    articleSection: guide.category,
    inLanguage: 'en-SG',
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data.
 */
export function buildBreadcrumbSchema(items: { name: string; path: string }[]): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${BASE_URL}/#${item.path.startsWith('/') ? item.path : `/${item.path}`}`,
    })),
  };
}
