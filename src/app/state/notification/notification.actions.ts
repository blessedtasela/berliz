import { createAction, props } from '@ngrx/store';
import { ApiResponse } from '../../models/Api.interface';
import { Notifications } from 'src/app/models/Notifications.interface';

type Res<T> = { response: ApiResponse<T> };
type Err = { error: string };

// =============================================================================
// ADD
// =============================================================================
export const addNotification = createAction('[Notifications] Add', props<{ data: any }>());
export const addNotificationSuccess = createAction('[Notifications] Add Success', props<Res<Notifications>>());
export const addNotificationFailure = createAction('[Notifications] Add Failure', props<Err>());

// =============================================================================
// LOAD — MY (authenticated user)
// =============================================================================
export const loadMyNotifications = createAction('[Notifications] Load My');
export const loadMyNotificationsSuccess = createAction('[Notifications] Load My Success', props<Res<Notifications[]>>());
export const loadMyNotificationsFailure = createAction('[Notifications] Load My Failure', props<Err>());

export const loadUnreadNotifications = createAction('[Notifications] Load My Unread');
export const loadUnreadNotificationsSuccess = createAction('[Notifications] Load My Unread Success', props<Res<Notifications[]>>());
export const loadUnreadNotificationsFailure = createAction('[Notifications] Load My Unread Failure', props<Err>());

export const loadReadNotifications = createAction('[Notifications] Load My Read');
export const loadReadNotificationsSuccess = createAction('[Notifications] Load My Read Success', props<Res<Notifications[]>>());
export const loadReadNotificationsFailure = createAction('[Notifications] Load My Read Failure', props<Err>());

// =============================================================================
// LOAD — ALL (admin only)
// =============================================================================
export const loadAllNotifications = createAction('[Notifications] Load All');
export const loadAllNotificationsSuccess = createAction('[Notifications] Load All Success', props<Res<Notifications[]>>());
export const loadAllNotificationsFailure = createAction('[Notifications] Load All Failure', props<Err>());

// =============================================================================
// LOAD — BY ID
// =============================================================================
export const loadNotificationById = createAction('[Notifications] Load By Id', props<{ id: number }>());
export const loadNotificationByIdSuccess = createAction('[Notifications] Load By Id Success', props<Res<Notifications>>());
export const loadNotificationByIdFailure = createAction('[Notifications] Load By Id Failure', props<Err>());

// =============================================================================
// LOAD — UNREAD COUNT
// =============================================================================
export const loadUnreadCount = createAction('[Notifications] Load Unread Count');
export const loadUnreadCountSuccess = createAction('[Notifications] Load Unread Count Success', props<Res<number>>());
export const loadUnreadCountFailure = createAction('[Notifications] Load Unread Count Failure', props<Err>());

// =============================================================================
// LOAD — FILTER BY TYPE
// =============================================================================
export const loadNotificationsByType = createAction('[Notifications] Load By Type', props<{ notificationType: string }>());
export const loadNotificationsByTypeSuccess = createAction('[Notifications] Load By Type Success', props<Res<Notifications[]>>());
export const loadNotificationsByTypeFailure = createAction('[Notifications] Load By Type Failure', props<Err>());

// =============================================================================
// LOAD — FILTER BY DATE
// =============================================================================
export const loadNotificationsByDate = createAction('[Notifications] Load By Date', props<{ date: string }>());
export const loadNotificationsByDateSuccess = createAction('[Notifications] Load By Date Success', props<Res<Notifications[]>>());
export const loadNotificationsByDateFailure = createAction('[Notifications] Load By Date Failure', props<Err>());

// =============================================================================
// LOAD — PAGINATED
// =============================================================================
export const loadNotificationsPaginated = createAction('[Notifications] Load Paginated', props<{ page: number; size: number }>());
export const loadNotificationsPaginatedSuccess = createAction('[Notifications] Load Paginated Success', props<Res<Notifications[]>>());
export const loadNotificationsPaginatedFailure = createAction('[Notifications] Load Paginated Failure', props<Err>());

// =============================================================================
// MARK READ / UNREAD — returns the updated Notification entity
// =============================================================================
export const markAsRead = createAction('[Notifications] Mark As Read', props<{ id: number }>());
export const markAsReadSuccess = createAction('[Notifications] Mark As Read Success', props<Res<Notifications>>());
export const markAsReadFailure = createAction('[Notifications] Mark As Read Failure', props<Err>());

export const markAsUnread = createAction('[Notifications] Mark As Unread', props<{ id: number }>());
export const markAsUnreadSuccess = createAction('[Notifications] Mark As Unread Success', props<Res<Notifications>>());
export const markAsUnreadFailure = createAction('[Notifications] Mark As Unread Failure', props<Err>());

// Bulk mark — returns void (no entity back, reducer handles optimistically)
export const markAllAsRead = createAction('[Notifications] Mark All Read');
export const markAllAsReadSuccess = createAction('[Notifications] Mark All Read Success', props<Res<void>>());
export const markAllAsReadFailure = createAction('[Notifications] Mark All Read Failure', props<Err>());

export const markAllAsUnread = createAction('[Notifications] Mark All Unread');
export const markAllAsUnreadSuccess = createAction('[Notifications] Mark All Unread Success', props<Res<void>>());
export const markAllAsUnreadFailure = createAction('[Notifications] Mark All Unread Failure', props<Err>());

// =============================================================================
// BULK ACTION — void (delete/read/unread many at once)
// =============================================================================
export const bulkAction = createAction('[Notifications] Bulk Action', props<{ data: { ids: string; action: string } }>());
export const bulkActionSuccess = createAction('[Notifications] Bulk Action Success', props<Res<void>>());
export const bulkActionFailure = createAction('[Notifications] Bulk Action Failure', props<Err>());

// =============================================================================
// DELETE — void (id carried on the action, not the response)
// =============================================================================
export const deleteNotification = createAction('[Notifications] Delete', props<{ id: number }>());
export const deleteNotificationSuccess = createAction('[Notifications] Delete Success', props<{ id: number }>());
export const deleteNotificationFailure = createAction('[Notifications] Delete Failure', props<Err>());

export const deleteAllNotifications = createAction('[Notifications] Delete All');
export const deleteAllNotificationsSuccess = createAction('[Notifications] Delete All Success', props<Res<void>>());
export const deleteAllNotificationsFailure = createAction('[Notifications] Delete All Failure', props<Err>());

// =============================================================================
// MISC
// =============================================================================
/** Dispatched by the STOMP watch service when a new notification arrives. */
export const refreshNotifications = createAction('[Notifications] Refresh');