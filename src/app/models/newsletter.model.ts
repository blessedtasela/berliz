export interface Newsletter {
    id: number;
    email: string;
    status: string;
    date: Date;
    lastUpdate: Date;
}

export interface NewsletterMessage {
    id: number;
    subject: string;
    message: string;
    date: Date;
}