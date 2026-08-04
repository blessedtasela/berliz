import { createReducer, on } from '@ngrx/store';
import * as A from './notification.actions';
import { initialNotificationState } from './notification.state';

export const notificationFeatureKey = 'notifications';

/**
 * Upserts a notification into a list by id.
 */
function upsert(list: any[], item: any): any[] {
  if (!item) return list;
  const idx = list.findIndex(n => n.id === item.id);
  return idx >= 0
    ? [...list.slice(0, idx), item, ...list.slice(idx + 1)]
    : [...list, item];
}

export const notificationReducer = createReducer(

  initialNotificationState,

  // ── LOADING ───────────────────────────────────────────────────────────────
  on(
    A.addNotification,
    A.loadMyNotifications, A.loadAllNotifications,
    A.loadUnreadNotifications, A.loadReadNotifications,
    A.loadNotificationById, A.loadUnreadCount,
    A.loadNotificationsByType, A.loadNotificationsByDate,
    A.loadNotificationsPaginated,
    A.markAsRead, A.markAsUnread,
    A.markAllAsRead, A.markAllAsUnread,
    A.bulkAction,
    A.deleteNotification, A.deleteAllNotifications,
    state => ({ ...state, loading: true, error: null })
  ),

  // ── ALL FAILURES ──────────────────────────────────────────────────────────
  on(
    A.addNotificationFailure,
    A.loadMyNotificationsFailure, A.loadAllNotificationsFailure,
    A.loadUnreadNotificationsFailure, A.loadReadNotificationsFailure,
    A.loadNotificationByIdFailure, A.loadUnreadCountFailure,
    A.loadNotificationsByTypeFailure, A.loadNotificationsByDateFailure,
    A.loadNotificationsPaginatedFailure,
    A.markAsReadFailure, A.markAsUnreadFailure,
    A.markAllAsReadFailure, A.markAllAsUnreadFailure,
    A.bulkActionFailure,
    A.deleteNotificationFailure, A.deleteAllNotificationsFailure,
    (state, { error }) => ({ ...state, loading: false, error })
  ),

  // =========================================================================
  // ADD
  // =========================================================================
  on(A.addNotificationSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    myNotifications: response.data
      ? [...state.myNotifications, response.data]
      : state.myNotifications,
  })),

  // =========================================================================
  // MY NOTIFICATIONS (user-scoped)
  // =========================================================================
  on(A.loadMyNotificationsSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    myNotifications: response.data ?? [],
  })),

  on(A.loadUnreadNotificationsSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    myUnread: response.data ?? [],
  })),

  on(A.loadReadNotificationsSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    myRead: response.data ?? [],
  })),

  // =========================================================================
  // ALL NOTIFICATIONS (admin)
  // =========================================================================
  on(A.loadAllNotificationsSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    allNotifications: response.data ?? [],
  })),

  // =========================================================================
  // SINGLE
  // =========================================================================
  on(A.loadNotificationByIdSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    selectedNotification: response.data ?? null,
  })),

  // =========================================================================
  // UNREAD COUNT
  // =========================================================================
  on(A.loadUnreadCountSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    unreadCount: response.data ?? 0,
  })),

  // =========================================================================
  // FILTERS
  // =========================================================================
  on(A.loadNotificationsByTypeSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    byType: response.data ?? [],
  })),

  on(A.loadNotificationsByDateSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    byDate: response.data ?? [],
  })),

  on(A.loadNotificationsPaginatedSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    paginated: response.data ?? [],
  })),

  // =========================================================================
  // MARK AS READ — upsert returned entity into all relevant lists
  // =========================================================================
  on(A.markAsReadSuccess, (state, { response }) => {
    const updated = response.data;
    if (!updated) return { ...state, loading: false };
    return {
      ...state,
      loading: false,
      myNotifications: upsert(state.myNotifications, updated),
      myUnread: state.myUnread.filter(n => n.id !== updated.id),
      myRead: upsert(state.myRead, updated),
      allNotifications: upsert(state.allNotifications, updated),
      selectedNotification:
        state.selectedNotification?.id === updated.id
          ? updated
          : state.selectedNotification,
      // Decrement unread count optimistically
      unreadCount: Math.max(0, state.unreadCount - 1),
    };
  }),

  // =========================================================================
  // MARK AS UNREAD — upsert returned entity into all relevant lists
  // =========================================================================
  on(A.markAsUnreadSuccess, (state, { response }) => {
    const updated = response.data;
    if (!updated) return { ...state, loading: false };
    return {
      ...state,
      loading: false,
      myNotifications: upsert(state.myNotifications, updated),
      myRead: state.myRead.filter(n => n.id !== updated.id),
      myUnread: upsert(state.myUnread, updated),
      allNotifications: upsert(state.allNotifications, updated),
      selectedNotification:
        state.selectedNotification?.id === updated.id
          ? updated
          : state.selectedNotification,
      // Increment unread count optimistically
      unreadCount: state.unreadCount + 1,
    };
  }),

  // =========================================================================
  // MARK ALL AS READ — optimistic bulk update
  // =========================================================================
  on(A.markAllAsReadSuccess, state => ({
    ...state,
    loading: false,
    myNotifications: state.myNotifications.map(n => ({ ...n, read: true })),
    myUnread: [],
    unreadCount: 0,
  })),

  // =========================================================================
  // MARK ALL AS UNREAD — optimistic bulk update
  // =========================================================================
  on(A.markAllAsUnreadSuccess, state => ({
    ...state,
    loading: false,
    myNotifications: state.myNotifications.map(n => ({ ...n, read: false })),
    myRead: [],
    unreadCount: state.myNotifications.length,
  })),

  // =========================================================================
  // BULK ACTION — effects reload the lists; reducer just clears loading
  // =========================================================================
  on(A.bulkActionSuccess, state => ({
    ...state,
    loading: false,
  })),

  // =========================================================================
  // DELETE — remove by id from all lists
  // =========================================================================
  on(A.deleteNotificationSuccess, (state, { id }) => ({
    ...state,
    loading: false,
    myNotifications: state.myNotifications.filter(n => n.id !== id),
    myUnread: state.myUnread.filter(n => n.id !== id),
    myRead: state.myRead.filter(n => n.id !== id),
    allNotifications: state.allNotifications.filter(n => n.id !== id),
    selectedNotification:
      state.selectedNotification?.id === id ? null : state.selectedNotification,
    byType: state.byType.filter(n => n.id !== id),
    byDate: state.byDate.filter(n => n.id !== id),
    paginated: state.paginated.filter(n => n.id !== id),
    // effects reload unreadCount after delete
  })),

  on(A.deleteAllNotificationsSuccess, state => ({
    ...state,
    loading: false,
    myNotifications: [],
    myUnread: [],
    myRead: [],
    allNotifications: [],
    byType: [],
    byDate: [],
    paginated: [],
    selectedNotification: null,
    unreadCount: 0,
  })),

  // =========================================================================
  // STOMP REFRESH — re-triggers loadMyNotifications$ in effects
  // =========================================================================
  on(A.refreshNotifications, state => ({ ...state, loading: true })),
);