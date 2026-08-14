import { environment } from './environment';
import { StructuredDataConfig } from './structured-data-config';

export type OgType = 'website' | 'profile';

export interface MetaData {
    title: string;
    description: string;
    imageUrl: string;
    /** og:type. Defaults to 'website' in SeoService if omitted. */
    ogType?: OgType;
    /** Optional extra JSON-LD object(s) merged alongside the page's own WebPage schema. */
    structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Real per-page SEO copy for every public, top-level route in
 * `app-routing.module.ts`. Keyed by the route's first path segment, e.g.
 * '/trainers/:name' and '/trainers' both resolve to the 'trainers' key.
 * A real child page that needs its own SEO copy distinct from its parent
 * (e.g. '/services/faqs') is keyed by its first TWO segments instead — see
 * SeoService.resolveMetaData.
 *
 * `SeoService` looks a route up here on every NavigationEnd and falls back to
 * `default` for anything not listed (private/dashboard routes, 404s, etc).
 *
 * NOTE on 'testimonials': `{ path: 'testimonials', redirectTo: 'services' }`
 * redirects before any component renders, and SeoService reads
 * `urlAfterRedirects`, so a visitor to /testimonials always resolves to the
 * 'services' entry below. No separate entry needed.
 */
export const MetaDataConfig: Record<string, MetaData> = {
    home: {
        title: 'Berliz - Find Trainers, Gyms & Martial Arts Centers Near You',
        description: 'Discover personalized training solutions that combine martial arts, fitness, and wellness. Join Berliz to transform your lifestyle today!',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
        structuredData: StructuredDataConfig.organization,
    },
    about: {
        title: 'About Berliz - Connecting You to Gyms, Trainers & Community',
        description: 'Berliz connects you to verified gyms and training centers, certified trainers in person or online, and a supportive fitness community, all in one place.',
        imageUrl: `${environment.assetsUrl}flyer.jpg`,
        ogType: 'website',
    },
    contact: {
        title: 'Contact Berliz - Get in Touch',
        description: 'Have a question or want to partner with Berliz? Reach us at 555 Burrard Street, Vancouver BC, by phone at +1 (236) 990 0823, or send us a message.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
        structuredData: StructuredDataConfig.localBusiness,
    },
    services: {
        title: 'Services - Fitness Programs, Equipment & Exercises | Berliz',
        description: 'Browse Berliz training programs and services, explore equipment and exercise guides, and read member testimonials before you book.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    trainers: {
        title: 'Find a Trainer | Berliz',
        description: 'Search certified personal trainers on Berliz by specialty and location, view profiles, and book training in person or online.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    centers: {
        title: 'Find a Gym or Training Center | Berliz',
        description: 'Browse gyms and martial arts training centers on Berliz, compare programs, and connect directly with centers near you.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    members: {
        title: 'Members Directory | Berliz',
        description: 'Browse Berliz members who have made their profile public, including clients, trainers and centers, and visit their profiles to learn more.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    // FAQs live at /services/faqs (a real child page of Services), so this is
    // keyed by both segments — see SeoService.resolveMetaData, which tries the
    // two-segment key before falling back to the 'services' entry above.
    'services/faqs': {
        title: 'Frequently Asked Questions | Berliz',
        description: 'Answers to the most common questions about Berliz, our centers, trainers and billing.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    'report-problem': {
        title: 'Report a Problem | Berliz',
        description: 'Let the Berliz team know about an issue with your account, a booking, or the app. This page is coming soon.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    'help-center': {
        title: 'Help Center | Berliz',
        description: 'The Berliz Help Center is coming soon. In the meantime, reach us via the Contact page.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    terms: {
        title: 'Terms of Service | Berliz',
        description: "Berliz's Terms of Service. This page is coming soon.",
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    privacy: {
        title: 'Privacy Policy | Berliz',
        description: "Berliz's Privacy Policy. This page is coming soon.",
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    // Private/authenticated route. Not indexed (see robots.txt), but SeoService
    // still needs a sane fallback if it's ever hit directly.
    dashboard: {
        title: 'Dashboard - Your Personalized Berliz Experience',
        description: 'Manage your action plans, track your progress, and explore available services tailored for you.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
    default: {
        title: 'Berliz - Personal Training, Martial Arts & Fitness Solutions',
        description: 'Berliz offers comprehensive training solutions including personal training, martial arts, bodybuilding, and more.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        ogType: 'website',
    },
};
