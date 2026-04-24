import { Users } from "./users.interface";


export interface Notifications {
    id: number;
    notification: string;
    adminNotification: string;
    user: Users;
    date: Date;
    read?: boolean;
    checked?: boolean;
}

export interface NotificationSection {
    label: string;
    items: (Notifications & { index: number })[];
}
