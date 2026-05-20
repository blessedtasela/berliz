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
    strapiBearerToken: "caddda86e732c7d7302d34b471bd875db2f6c6c93666dcf" +
        "7a747517893d6e32d5aaf0903146f10bc256b99f4e63683d6cdf6da6cc1ea14db39b" +
        "166f772719ed745556ba0d72745cf2463e79e5a0196515f33ff52f8efed9ee5d2cef14" +
        "fde3a9c00e6177e195993ab73a8e03777ad13888a14d60ba5d884bb7aa16e5f82db2c4f",
    strapiUrl: 'http://localhost:1337',
};


