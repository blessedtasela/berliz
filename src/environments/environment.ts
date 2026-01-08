export const berlizUrl = 'https://www.berliz.fitness';

export const environment = {
    production: false,
    // api: 'https://berliz-server-fd9efef771e8.herokuapp.com',
    api: 'http://localhost:8001',
    // api: 'http://192.168.43.56:8001',

    baseUrl: berlizUrl,
    assetsUrl: `${berlizUrl}/assets/berliz-files/`,
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
};


