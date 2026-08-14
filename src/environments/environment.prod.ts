// Deliberately NOT imported from './environment' — angular.json's fileReplacements
// swaps *every* resolution of that path (including this file's own relative imports)
// over to this file in a production build, so `import { berliz } from './environment'`
// here would resolve back to this same file and create a circular self-import
// ("declares 'berliz' locally, but it is not exported"). Redeclaring it is the
// standard Angular workaround.
const berliz = 'https://berliz.fitness';

// angular.json's "production" build configuration swaps environment.ts for this file
// via fileReplacements — this is what actually ships to Netlify.
export const environment = {
    production: true,
    api: 'https://berliz-api.up.railway.app',

    baseUrl: berliz,
    assetsUrl: `${berliz}/assets/berliz-files/`,
    socialUrls: {
        facebook: 'https://www.facebook.com/berlizfitness',
        instagram: 'https://www.instagram.com/berlizfitness',
        linkedin: 'https://www.linkedin.com/company/berlizfitness'
    },
    brokerURL: 'wss://berliz-api.up.railway.app/stomp',
    firebase: {
        apiKey: 'YOUR_API_KEY',
        authDomain: 'your-app.firebaseapp.com',
        projectId: 'your-app',
        appId: 'your-app-id',
        // ...
    },
    // Reads only (resolveStrapiUrl) — uploads go through the backend's /strapi/upload,
    // which holds the Strapi API token server-side. No token belongs in this file.
    // Cloudflare-cached, proxied to strapi-berliz-production.up.railway.app — see
    // the media.berliz.fitness CNAME + /uploads/* cache rule in the berliz.fitness zone.
    strapiUrl: 'https://media.berliz.fitness',

    // Google Identity Services OAuth Client ID (Web application). Same value as the
    // backend's google.oauth.client-id / GOOGLE_OAUTH_CLIENT_ID.
    googleClientId: '692894350003-r9khav9f4ugi14p0en251vr8ldbt8254.apps.googleusercontent.com',

    // Facebook App ID. Same value as the backend's facebook.oauth.app-id /
    // FACEBOOK_OAUTH_APP_ID. The App Secret is backend-only and must never
    // appear in a frontend environment file.
    facebookAppId: '2049936165913597',

    // Stripe publishable key (safe for client-side use). From the Stripe
    // Dashboard > Developers > API keys. Same value as the backend's
    // stripe.publishable-key / STRIPE_PUBLISHABLE_KEY.
    stripePublishableKey: '',
};
