export interface Partner {
    id: number;

    // User fields
    userId: number;
    firstname: string;
    lastname: string;
    email: string;
    userStatus: string;

    // Partner fields
    role: string;
    motivation: string;

    certificationUrl: string;
    resumeUrl: string;

    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;

    status: string;

    date: Date;
    lastUpdate: Date;

    message?: string;
}