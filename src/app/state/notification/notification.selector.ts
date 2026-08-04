import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NotificationState } from './notification.state';
import { notificationFeatureKey } from './notification.reducer';

const selectState = createFeatureSelector<NotificationState>(notificationFeatureKey);

// ── Async ─────────────────────────────────────────────────────────────────────
export const selectNotificationLoading = createSelector(selectState, s => s.loading);
export const selectNotificationError = createSelector(selectState, s => s.error);

// ── My notifications (user-scoped) ────────────────────────────────────────────
export const selectMyNotifications = createSelector(selectState, s => s.myNotifications);
export const selectMyUnread = createSelector(selectState, s => s.myUnread);
export const selectMyRead = createSelector(selectState, s => s.myRead);

// ── Admin ─────────────────────────────────────────────────────────────────────
export const selectAllNotifications = createSelector(selectState, s => s.allNotifications);

// ── Single selected ───────────────────────────────────────────────────────────
export const selectSelectedNotification = createSelector(selectState, s => s.selectedNotification);

// ── Count ─────────────────────────────────────────────────────────────────────
export const selectUnreadCount = createSelector(selectState, s => s.unreadCount);

export const selectMyNotificationsCount = createSelector(
    selectMyNotifications,
    list => list.length
);

/**
 * Derived: unread count computed from myNotifications in case the server
 * count endpoint hasn't been called yet. Components can use either.
 */
export const selectDerivedUnreadCount = createSelector(
    selectMyNotifications,
    list => list.filter(n => !n.read).length
);

// ── Filtered / paginated views ────────────────────────────────────────────────
export const selectNotificationsByType = createSelector(selectState, s => s.byType);
export const selectNotificationsByDate = createSelector(selectState, s => s.byDate);
export const selectPaginatedNotifications = createSelector(selectState, s => s.paginated);

// ── Derived: split myNotifications into read vs unread in-place ───────────────
// Useful when you only call loadMyNotifications once and derive both lists from it
export const selectMyUnreadDerived = createSelector(
    selectMyNotifications,
    list => list.filter(n => !n.read)
);

export const selectMyReadDerived = createSelector(
    selectMyNotifications,
    list => list.filter(n => !!n.read)
);

/** True when there is at least one unread notification */
export const selectHasUnread = createSelector(
    selectUnreadCount,
    count => count > 0
);