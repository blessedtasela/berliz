export interface Notifications {
    id: number;
    userId: number;
    userFirstname: string;
    userLastname: string;
    userEmail: string;
    notification: string;
    type: string;
    /** What this notification is about, e.g. "message" — lets a click deep-link
     *  straight to the relevant page instead of just showing text. Most
     *  notification types don't set this yet. */
    entityType?: string;
    /** The id to act on for entityType, e.g. the sender's user id for a
     *  "message" notification. */
    entityId?: number;
    date: Date;
    read?: boolean;
    checked?: boolean;
    message?: string;
}

export interface NotificationSection {
    label: string;
    items: (Notifications & { index: number })[];
}
