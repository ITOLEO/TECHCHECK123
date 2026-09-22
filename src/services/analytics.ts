/**
 * TechCheck Analytics Event System
 * Lightweight event dispatcher for user interactions, affiliate clicks, and page views.
 * Protects user privacy while providing structured data for conversion and discovery tracking.
 */

export type AnalyticsEvent =
  | 'page_view'
  | 'product_view'
  | 'category_view'
  | 'guide_view'
  | 'search'
  | 'affiliate_click'
  | 'external_product_click';

export interface AnalyticsPayload {
  route?: string;
  productId?: string;
  productName?: string;
  category?: string;
  guideId?: string;
  guideTitle?: string;
  query?: string;
  resultsCount?: number;
  affiliateUrl?: string;
  merchant?: string;
  [key: string]: any;
}

export const analytics = {
  track(event: AnalyticsEvent, payload: AnalyticsPayload = {}) {
    const timestamp = new Date().toISOString();
    const eventData = {
      event,
      timestamp,
      ...payload,
    };

    // 1. Dispatch custom DOM event for potential external listeners
    if (typeof window !== 'undefined') {
      try {
        const customEvent = new CustomEvent('techcheck:analytics', {
          detail: eventData,
        });
        window.dispatchEvent(customEvent);
      } catch {
        // ignore
      }

      // 2. Google Analytics / Tag Manager compatibility if initialized
      const w = window as any;
      if (typeof w.gtag === 'function') {
        w.gtag('event', event, payload);
      } else if (Array.isArray(w.dataLayer)) {
        w.dataLayer.push({ event, ...payload });
      }

      // 3. Development debug logger
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug(`[TechCheck Analytics] ${event}:`, payload);
      }
    }
  },
};
