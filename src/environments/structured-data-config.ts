import { environment } from './environment';

/**
 * schema.org JSON-LD building blocks for Berliz.
 *
 * Only real, verifiable data lives here. Earlier versions of this file shipped
 * fabricated placeholder objects (fake phone number, a Burnaby address that
 * doesn't match the real one, invented social handles, a fake reviewer named
 * "John Doe", a fake trainer named "John Trainer"). Mismatched/fake structured
 * data can get a site flagged by Google, so anything we can't back with a real
 * value is simply omitted rather than invented.
 *
 * Source of truth for the contact details below is the live footer
 * (`src/app/footer/footer/footer.component.html` and the
 * `app-phone` / `app-email` components it renders).
 */

const logoUrl = `${environment.baseUrl}/assets/landing/logo.png`;

export const StructuredDataConfig = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Berliz Fitness',
    url: environment.baseUrl,
    logo: logoUrl,
    // Real handles from environment.socialUrls. Not yet linked from the footer's
    // social icons (see SocialComponent), but this is the real config the app
    // ships with — no invented URLs.
    sameAs: [
      environment.socialUrls.facebook,
      environment.socialUrls.instagram,
      environment.socialUrls.linkedin,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-236-990-0823',
      email: 'berlizworld@gmail.com',
      contactType: 'Customer Service',
    },
  },

  localBusiness: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Berliz Fitness',
    image: logoUrl,
    url: environment.baseUrl,
    telephone: '+1-236-990-0823',
    email: 'berlizworld@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '555 Burrard Street',
      addressLocality: 'Vancouver',
      addressRegion: 'BC',
      postalCode: 'V7X 1M8',
      addressCountry: 'CA',
    },
    // Opening hours and geo-coordinates are not published anywhere in the app
    // (footer has no hours, no map). Omitted rather than guessed — add these
    // once the business confirms real values.
  },
};

/**
 * Builds a Person schema for a real trainer record. Intentionally a function,
 * not static example data: a "person" schema only means something when it
 * describes an actual trainer on the site. Call this from a trainer profile
 * page once one exists, e.g.:
 *
 *   buildTrainerPersonSchema({ name: trainer.fullName, imageUrl: trainer.avatarUrl, profileUrl: `${environment.baseUrl}/trainers/${trainer.slug}` })
 */
export function buildTrainerPersonSchema(trainer: {
  name: string;
  imageUrl?: string;
  profileUrl: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: trainer.name,
    url: trainer.profileUrl,
    jobTitle: 'Personal Trainer',
    worksFor: {
      '@type': 'Organization',
      name: 'Berliz Fitness',
      url: environment.baseUrl,
    },
  };
  if (trainer.imageUrl) {
    schema['image'] = trainer.imageUrl;
  }
  return schema;
}
