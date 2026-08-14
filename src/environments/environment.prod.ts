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

    // Google Identity Services OAuth Client ID (Web application). See environment.ts
    // for where to get it. Same value as the backend's google.oauth.client-id /
    // GOOGLE_OAUTH_CLIENT_ID.
    googleClientId: '',

    // Facebook App ID. See environment.ts for where to get it. The App Secret is
    // backend-only and must never appear in a frontend environment file.
    facebookAppId: '',
};
