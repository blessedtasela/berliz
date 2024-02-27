import { Users } from "./users.interface";

export interface Notifications {
    id: number;
    notification: string;
    adminNotification: string;
    user: Users;
    date: Date;
    checked: boolean;
    read: boolean;
}