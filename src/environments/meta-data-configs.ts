import { environment } from "./environment";

export interface MetaData {
    title: string;
    description: string;
    imageUrl: string;
    url: string;
    structuredData?: string;  // Add optional structured data field
}

export const MetaDataConfig: Record<string, MetaData> = {
    home: {
        title: 'Welcome to Berliz - Unlock Your Potential',
        description: 'Discover personalized training solutions that combine martial arts, fitness, and wellness. Join Berliz to transform your lifestyle today!',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        url: `${environment.baseUrl}/home`,
        structuredData: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Berliz Fitness",
            "url": `${environment.baseUrl}/home`,
            "logo": `${environment.assetsUrl}berliz-site.png`
        })
    },
    about: {
        title: 'About Berliz - Your Path to Fitness and Martial Arts',
        description: 'At Berliz, we are dedicated to empowering individuals through tailored fitness programs, martial arts training, and comprehensive wellness solutions.',
        imageUrl: `${environment.assetsUrl}flyer.jpg`,
        url: `${environment.baseUrl}/about`,
        structuredData: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Berliz Fitness",
            "url": `${environment.baseUrl}/about`,
            "logo": `${environment.assetsUrl}flyer.jpg`
        })
    },
    // Add other pages similarly
    dashboard: {
        title: 'Dashboard - Your Personalized Berliz Experience',
        description: 'Manage your action plans, track your progress, and explore available services tailored for you.',
        imageUrl: `${environment.assetsUrl}dashboard.jpg`,
        url: `${environment.baseUrl}/dashboard`,
        structuredData: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Dashboard - Berliz Fitness",
            "url": `${environment.baseUrl}/dashboard`,
            "description": "Your personalized Berliz experience."
        })
    },
    default: {
        title: 'Berliz - Personal Training, Martial Arts & Fitness Solutions',
        description: 'Berliz offers comprehensive training solutions including personal training, martial arts, bodybuilding, and more.',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        url: `${environment.baseUrl}`,
        structuredData: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Berliz Fitness",
            "url": `${environment.baseUrl}`,
            "logo": `${environment.assetsUrl}berliz-site.png`
        })
    }
};
