export interface Partners {
    id: number;
    user: {
        id: number;
        email: string
    };
    role: string;
    certificate: any;
    motivation: string;
    cv: any;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    date: Date;
    lastUpdate: Date;
    status: string;
}