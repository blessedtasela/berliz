import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import * as A from './notification.actions';

@Injectable()
export class NotificationEffects {

  constructor(
    private actions$: Actions,
    private svc: NotificationService,
  ) { }

  // =========================================================================
  // ADD
  // =========================================================================

  addNotification$ = createEffect(() => this.actions$.pipe(
    ofType(A.addNotification),
    mergeMap(({ data }) => this.svc.addNotification(data).pipe(
      map(r => A.addNotificationSuccess({ response: r })),
      catchError(e => of(A.addNotificationFailure({ error: e?.error?.message || 'Failed to add notification' })))
    ))
  ));

  // =========================================================================
  // MY NOTIFICATIONS (user-scoped)
  // =========================================================================

  /**
   * Loads the current user's own notification feed.
   * Also triggered by refreshNotifications (dispatched by STOMP watch).
   */
  loadMyNotifications$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadMyNotifications, A.refreshNotifications),
    switchMap(() => this.svc.getMyNotifications().pipe(
      map(r => A.loadMyNotificationsSuccess({ response: r })),
      catchError(e => of(A.loadMyNotificationsFailure({
        error: e?.error?.message || 'Failed to load notifications'
      })))
    ))
  ));

  loadUnreadNotifications$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadUnreadNotifications),
    mergeMap(() => this.svc.getUnreadNotifications().pipe(
      map(r => A.loadUnreadNotificationsSuccess({ response: r })),
      catchError(e => of(A.loadUnreadNotificationsFailure({
        error: e?.error?.message || 'Failed to load unread notifications'
      })))
    ))
  ));

  loadReadNotifications$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadReadNotifications),
    mergeMap(() => this.svc.getReadNotifications().pipe(
      map(r => A.loadReadNotificationsSuccess({ response: r })),
      catchError(e => of(A.loadReadNotificationsFailure({
        error: e?.error?.message || 'Failed to load read notifications'
      })))
    ))
  ));

  // =========================================================================
  // ALL NOTIFICATIONS (admin only)
  // =========================================================================

  loadAllNotifications$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadAllNotifications, A.refreshNotifications),
    mergeMap(() => this.svc.getAllNotifications().pipe(
      map(r => A.loadAllNotificationsSuccess({ response: r })),
      catchError(e => of(A.loadAllNotificationsFailure({
        error: e?.error?.message || 'Failed to load all notifications'
      })))
    ))
  ));

  // =========================================================================
  // BY ID
  // =========================================================================

  loadNotificationById$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadNotificationById),
    mergeMap(({ id }) => this.svc.getNotificationById(id).pipe(
      map(r => A.loadNotificationByIdSuccess({ response: r })),
      catchError(e => of(A.loadNotificationByIdFailure({
        error: e?.error?.message || 'Failed to load notification'
      })))
    ))
  ));

  // =========================================================================
  // UNREAD COUNT
  // =========================================================================

  loadUnreadCount$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadUnreadCount),
    mergeMap(() => this.svc.getUnreadCount().pipe(
      map(r => A.loadUnreadCountSuccess({ response: r })),
      catchError(e => of(A.loadUnreadCountFailure({
        error: e?.error?.message || 'Failed to load unread count'
      })))
    ))
  ));

  // =========================================================================
  // FILTERS
  // =========================================================================

  loadByType$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadNotificationsByType),
    mergeMap(({ type }) => this.svc.getNotificationsByType(type).pipe(
      map(r => A.loadNotificationsByTypeSuccess({ response: r })),
      catchError(e => of(A.loadNotificationsByTypeFailure({
        error: e?.error?.message || 'Failed to load notifications by type'
      })))
    ))
  ));

  loadByDate$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadNotificationsByDate),
    mergeMap(({ date }) => this.svc.getNotificationsByDate(date).pipe(
      map(r => A.loadNotificationsByDateSuccess({ response: r })),
      catchError(e => of(A.loadNotificationsByDateFailure({
        error: e?.error?.message || 'Failed to load notifications by date'
      })))
    ))
  ));

  loadPaginated$ = createEffect(() => this.actions$.pipe(
    ofType(A.loadNotificationsPaginated),
    mergeMap(({ page, size }) => this.svc.getNotificationsPaginated(page, size).pipe(
      map(r => A.loadNotificationsPaginatedSuccess({ response: r })),
      catchError(e => of(A.loadNotificationsPaginatedFailure({
        error: e?.error?.message || 'Failed to load paginated notifications'
      })))
    ))
  ));

  // =========================================================================
  // MARK READ / UNREAD
  // After each mutation, reload unread count to keep the badge in sync.
  // The reducer handles optimistic update of the list immediately.
  // =========================================================================

  markAsRead$ = createEffect(() => this.actions$.pipe(
    ofType(A.markAsRead),
    mergeMap(({ id }) => this.svc.markAsRead(id).pipe(
      map(r => A.markAsReadSuccess({ response: r })),
      catchError(e => of(A.markAsReadFailure({
        error: e?.error?.message || 'Failed to mark as read'
      })))
    ))
  ));

  markAsReadReload$ = createEffect(() => this.actions$.pipe(
    ofType(A.markAsReadSuccess),
    mergeMap(() => [A.loadUnreadCount()])
  ));

  markAsUnread$ = createEffect(() => this.actions$.pipe(
    ofType(A.markAsUnread),
    mergeMap(({ id }) => this.svc.markAsUnread(id).pipe(
      map(r => A.markAsUnreadSuccess({ response: r })),
      catchError(e => of(A.markAsUnreadFailure({
        error: e?.error?.message || 'Failed to mark as unread'
      })))
    ))
  ));

  markAsUnreadReload$ = createEffect(() => this.actions$.pipe(
    ofType(A.markAsUnreadSuccess),
    mergeMap(() => [A.loadUnreadCount()])
  ));

  markAllAsRead$ = createEffect(() => this.actions$.pipe(
    ofType(A.markAllAsRead),
    mergeMap(() => this.svc.markAllAsRead().pipe(
      map(r => A.markAllAsReadSuccess({ response: r })),
      catchError(e => of(A.markAllAsReadFailure({
        error: e?.error?.message || 'Failed to mark all as read'
      })))
    ))
  ));

  markAllAsReadReload$ = createEffect(() => this.actions$.pipe(
    ofType(A.markAllAsReadSuccess),
    mergeMap(() => [A.loadUnreadCount()])
  ));

  markAllAsUnread$ = createEffect(() => this.actions$.pipe(
    ofType(A.markAllAsUnread),
    mergeMap(() => this.svc.markAllAsUnread().pipe(
      map(r => A.markAllAsUnreadSuccess({ response: r })),
      catchError(e => of(A.markAllAsUnreadFailure({
        error: e?.error?.message || 'Failed to mark all as unread'
      })))
    ))
  ));

  markAllAsUnreadReload$ = createEffect(() => this.actions$.pipe(
    ofType(A.markAllAsUnreadSuccess),
    mergeMap(() => [A.loadUnreadCount()])
  ));

  // =========================================================================
  // BULK ACTION
  // =========================================================================

  bulkAction$ = createEffect(() => this.actions$.pipe(
    ofType(A.bulkAction),
    mergeMap(({ data }) => this.svc.bulkAction(data).pipe(
      map(r => A.bulkActionSuccess({ response: r })),
      catchError(e => of(A.bulkActionFailure({
        error: e?.error?.message || 'Failed to perform bulk action'
      })))
    ))
  ));

  /** After bulk action, reload the full list and count */
  bulkActionReload$ = createEffect(() => this.actions$.pipe(
    ofType(A.bulkActionSuccess),
    mergeMap(() => [
      A.loadMyNotifications(),
      A.loadUnreadCount(),
    ])
  ));

  // =========================================================================
  // DELETE
  // =========================================================================

  deleteNotification$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteNotification),
    mergeMap(({ id }) => this.svc.deleteNotification(id).pipe(
      map(() => A.deleteNotificationSuccess({ id })),
      catchError(e => of(A.deleteNotificationFailure({
        error: e?.error?.message || 'Failed to delete notification'
      })))
    ))
  ));

  deleteNotificationReload$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteNotificationSuccess),
    mergeMap(() => [A.loadUnreadCount()])
  ));

  deleteAllNotifications$ = createEffect(() => this.actions$.pipe(
    ofType(A.deleteAllNotifications),
    mergeMap(() => this.svc.deleteAllNotifications().pipe(
      map(r => A.deleteAllNotificationsSuccess({ response: r })),
      catchError(e => of(A.deleteAllNotificationsFailure({
        error: e?.error?.message || 'Failed to delete all notifications'
      })))
    ))
  ));
}