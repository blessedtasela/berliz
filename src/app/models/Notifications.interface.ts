export interface Notifications {
    id: number;
    userId: number;
    userFirstname: string;
    userLastname: string;
    userEmail: string;
    notification: string;
    type: string;
    date: Date;
    read?: boolean;
    checked?: boolean;
    message?: string;
}

export interface NotificationSection {
    label: string;
    items: (Notifications & { index: number })[];
}
