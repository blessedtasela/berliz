import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { MetaData, MetaDataConfig } from 'src/environments/meta-data-configs';
import { environment } from 'src/environments/environment';

const STRUCTURED_DATA_SCRIPT_ID = 'seo-structured-data';

/**
 * Owns every per-page SEO tag: <title>, meta description, Open Graph, Twitter
 * Card, the canonical <link>, and JSON-LD structured data.
 *
 * This app is client-side-rendered only (no Angular Universal / SSR or
 * pre-rendering), so crawlers that don't execute JavaScript will still only
 * see the shell in index.html. That's a known, separate limitation — this
 * service is what makes the *rendered* page correct for crawlers/social
 * previews that do run JS (Googlebot, and link-unfurling by most chat/social
 * apps), and it's what keeps the canonical tag from lying on every route the
 * way the old hardcoded one in index.html did.
 *
 * Wired from `AppComponent`'s existing `router.events` subscription (see
 * `app.component.ts`), which is this codebase's established place for
 * app-wide per-navigation side effects (layout switching, newsletter popup).
 * `updateForRoute` is called there on every `NavigationEnd` with
 * `event.urlAfterRedirects`.
 */
@Injectable({
  providedIn: 'root',
})
export class SeoService {
  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
  ) {}

  updateForRoute(url: string): void {
    const cleanPath = this.stripQueryAndFragment(url);
    const data = this.resolveMetaData(cleanPath);
    const canonicalUrl = this.buildCanonicalUrl(cleanPath);

    this.titleService.setTitle(data.title);

    this.setTag('name', 'description', data.description);

    // Open Graph
    this.setTag('property', 'og:title', data.title);
    this.setTag('property', 'og:description', data.description);
    this.setTag('property', 'og:image', data.imageUrl);
    this.setTag('property', 'og:url', canonicalUrl);
    this.setTag('property', 'og:type', data.ogType ?? 'website');

    // Twitter Card
    this.setTag('name', 'twitter:card', 'summary_large_image');
    this.setTag('name', 'twitter:title', data.title);
    this.setTag('name', 'twitter:description', data.description);
    this.setTag('name', 'twitter:image', data.imageUrl);

    this.setCanonicalLink(canonicalUrl);
    this.setStructuredData(data, canonicalUrl);
  }

  /**
   * Maps a path like '/trainers/jane-doe' to the 'trainers' config key, falling
   * back to 'default'. Tries the first TWO segments first (e.g. '/services/faqs'
   * -> 'services/faqs') so real child pages nested under a parent route (like
   * FAQs under Services) can carry their own SEO copy instead of silently
   * inheriting the parent's — then falls back to the first segment alone (e.g.
   * '/services/42/some-category' -> 'services').
   */
  private resolveMetaData(cleanPath: string): MetaData {
    const segments = cleanPath.split('/').filter(Boolean);

    const twoSegmentKey = segments.slice(0, 2).join('/');
    if (segments.length > 1 && MetaDataConfig[twoSegmentKey]) {
      return MetaDataConfig[twoSegmentKey];
    }

    const firstSegment = segments[0];
    if (firstSegment && MetaDataConfig[firstSegment]) {
      return MetaDataConfig[firstSegment];
    }
    return MetaDataConfig['default'];
  }

  private buildCanonicalUrl(cleanPath: string): string {
    if (!cleanPath || cleanPath === '/') {
      return `${environment.baseUrl}/`;
    }
    return `${environment.baseUrl}${cleanPath}`;
  }

  private stripQueryAndFragment(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  private setTag(attr: 'name' | 'property', key: string, content: string | undefined): void {
    if (!content) {
      return;
    }
    this.meta.updateTag({ [attr]: key, content } as { name?: string; property?: string; content: string });
  }

  private setCanonicalLink(canonicalUrl: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', canonicalUrl);
  }

  private setStructuredData(data: MetaData, canonicalUrl: string): void {
    const existing = this.doc.getElementById(STRUCTURED_DATA_SCRIPT_ID);
    if (existing) {
      existing.remove();
    }

    const webPageSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.title,
      description: data.description,
      url: canonicalUrl,
    };

    const extra = data.structuredData
      ? (Array.isArray(data.structuredData) ? data.structuredData : [data.structuredData])
      : [];

    const payload = [webPageSchema, ...extra];

    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = STRUCTURED_DATA_SCRIPT_ID;
    script.text = JSON.stringify(payload.length === 1 ? payload[0] : payload);
    this.doc.head.appendChild(script);
  }
}
