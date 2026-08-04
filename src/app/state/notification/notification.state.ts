import { Notifications } from 'src/app/models/Notifications.interface';

export interface NotificationState {

    // ── My notifications (authenticated user) ─────────────────────────────────
    myNotifications: Notifications[];
    myUnread: Notifications[];
    myRead: Notifications[];

    // ── Admin view ────────────────────────────────────────────────────────────
    allNotifications: Notifications[];

    // ── Filtered / paginated views ────────────────────────────────────────────
    byType: Notifications[];
    byDate: Notifications[];
    paginated: Notifications[];

    // ── Single selected ───────────────────────────────────────────────────────
    selectedNotification: Notifications | null;

    // ── Derived counters ──────────────────────────────────────────────────────
    unreadCount: number;

    // ── Async state ───────────────────────────────────────────────────────────
    loading: boolean;
    error: string | null;
}

export const initialNotificationState: NotificationState = {
    myNotifications: [],
    myUnread: [],
    myRead: [],
    allNotifications: [],
    byType: [],
    byDate: [],
    paginated: [],
    selectedNotification: null,
    unreadCount: 0,
    loading: false,
    error: null,
};