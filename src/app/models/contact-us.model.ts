export interface ContactUs {
    id: number;
    name: string;
    email: string;
    message: string;
    status: string;
    date: Date;
    lastUpdate: Date;
}

export interface ContactUsMessage {
    id: number;
    subject: string;
    message: string;
    date: Date;
}