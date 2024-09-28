import { environment } from '../environments/environment';

export interface MetaData {
    title: string;
    description: string;
    imageUrl: string;
    url: string;
}
export const MetaDataConfig: Record<string, MetaData> = {
    home: {
        title: 'Welcome to Berliz - Unlock Your Potential',
        description: 'Discover personalized training solutions that combine martial arts, fitness, and wellness. Join Berliz to transform your lifestyle today!',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        url: `${environment.baseUrl}/home`
    },
    about: {
        title: 'About Berliz - Your Path to Fitness and Martial Arts',
        description: 'At Berliz, we are dedicated to empowering individuals through tailored fitness programs, martial arts training, and comprehensive wellness solutions. Join our community and elevate your training journey.',
        imageUrl: `${environment.assetsUrl}flyer.jpg`,
        url: `${environment.baseUrl}/about`
    },
    dashboard: {
        title: 'Dashboard - Your Personalized Berliz Experience',
        description: 'Manage your action plans, track your progress with todos, visualize your achievements with charts, and explore available services tailored just for you.',
        imageUrl: `${environment.assetsUrl}dashboard.jpg`,
        url: `${environment.baseUrl}/dashboard`
    },
    // Add more pages as needed
    default: {
        title: 'Berliz - Personal Training, Martial Arts & Fitness Solutions',
        description: 'Berliz offers comprehensive training solutions including personal training, martial arts, bodybuilding, dieting, calisthenics, crossfit, Brazilian jiu-jitsu, and more. Ignite your potential with us!',
        imageUrl: `${environment.assetsUrl}berliz-site.png`,
        url: `${environment.baseUrl}`
    }
};

