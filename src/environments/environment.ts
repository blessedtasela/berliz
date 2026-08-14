export const berliz = 'https://www.berliz.fitness';

export const environment = {
    production: false,
    // api: 'https://berliz-server-fd9efef771e8.herokuapp.com',
    api: 'http://localhost:8001',
    // api: 'http://192.168.43.56:8001',

    baseUrl: berliz,
    assetsUrl: `${berliz}/assets/berliz-files/`,
    socialUrls: {
        facebook: 'https://www.facebook.com/berlizfitness',
        instagram: 'https://www.instagram.com/berlizfitness',
        linkedin: 'https://www.linkedin.com/company/berlizfitness'
    },
    //  brokerURL : 'wss://berliz-server-fd9efef771e8.herokuapp.com/stomp',
    brokerURL: 'ws://localhost:8001/stomp',
    //  brokerURL : 'ws://192.168.43.56:8001/stomp',
    firebase: {
        apiKey: 'YOUR_API_KEY',
        authDomain: 'your-app.firebaseapp.com',
        projectId: 'your-app',
        appId: 'your-app-id',
        // ...
    },
    // Reads only (resolveStrapiUrl) — uploads go through the backend's /strapi/upload,
    // which holds the Strapi API token server-side. No token belongs in this file.
    strapiUrl: 'http://localhost:1337',

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


