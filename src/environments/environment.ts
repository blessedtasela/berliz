export const environment = {
    production: false,
    // apiUrl: 'https://berliz-server-fd9efef771e8.herokuapp.com',
    apiUrl: 'http://localhost:8001',
    // apiUrl: 'http://192.168.43.56:8001',

    baseUrl: 'https://berliz.netlify.app',
    assetsUrl: 'https://berliz.netlify.app/assets/berliz-files/',
    socialUrls: {
        facebook: 'https://www.facebook.com/berlizfitness',
        instagram: 'https://www.instagram.com/berlizfitness',
        linkedin: 'https://www.linkedin.com/company/berlizfitness'
    },
    //  brokerURL : 'wss://berliz-server-fd9efef771e8.herokuapp.com/stomp',
    brokerURL: 'ws://localhost:8001/stomp',
    //  brokerURL : 'ws://192.168.43.56:8001/stomp',
};
