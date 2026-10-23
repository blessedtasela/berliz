import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { FilterState, SearchSortOption } from 'src/app/models/FilterState.interface';
import { Notifications } from 'src/app/models/Notifications.interface';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications, loadMyNotificationsFailure, loadMyNotificationsSuccess } from 'src/app/state/notification/notification.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import {
  NotificationCategory, NotificationCategoryKey, categoryKeyOf, countByCategory, isCategoryKey
} from 'src/app/utils/notification-category.util';
import { genericError } from 'src/validators/form-validators.module';

export type NotificationView = 'all' | 'unread' | 'read';
export type NotificationCategoryFilter = 'all' | NotificationCategoryKey;

const VIEWS: { key: NotificationView; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
];

/**
 * The notifications page. Its state lives in the URL so any view can be linked to or bookmarked:
 *   /dashboard/my-notifications?view=unread&category=bookings&q=cancelled
 * and a single notification can be deep-linked with ?id=123 -- the page jumps to it, scrolls it into view and
 * highlights it (revealing it first if the current filters would hide it).
 */
@Component({
    selector: 'app-my-notifications-page',
    templateUrl: './my-notifications-page.component.html',
    styleUrls: ['./my-notifications-page.component.css'],
    standalone: false
})
export class MyNotificationsPageComponent implements OnInit, OnDestroy {

  notificationData: Notifications[] = [];   // displayed list (after every filter)
  rawNotifications: Notifications[] = [];   // full list from server
  totalNotifications = 0;

  isAdmin = false;
  refreshing = false;
  markingAll = false;
  /** Why the notifications couldn't be loaded -- so a failed load never reads as "No notifications yet". */
  loadError: string | null = null;

  readonly views = VIEWS;
  view: NotificationView = 'all';
  category: NotificationCategoryFilter = 'all';
  query = '';
  private panelState: FilterState | null = null;

  unreadCount = 0;
  categoryCounts: { category: NotificationCategory; count: number }[] = [];

  /** The notification a ?id= link points at. */
  highlightId: number | null = null;
  /** Shown when an ?id= link points at a notification that no longer exists / isn't theirs. */
  linkNotice: string | null = null;
  private loadedOnce = false;

  // Read/unread are the tabs above the list now, so the panel keeps only the date-based chips.
  sortOptions: SearchSortOption[] = [
    { key: 'today', label: 'Today', priority: true },
    { key: 'yesterday', label: 'Yesterday', priority: true },
    { key: 'week', label: 'This Week', priority: true },
    { key: 'month', label: 'This Month', priority: false },
    { key: 'range', label: 'Date Range', priority: false },
    { key: 'exact-date', label: 'Exact Date', priority: false },
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private store: Store,
    private actions$: Actions,
    private authService: AuthService,
    private rxStompService: RxStompService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private snackBar: SnackBarService,
  ) { }

  retryLoad(): void {
    this.loadNotifications();
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    this.subscriptions.push(watchLoadError(this.actions$, loadMyNotificationsFailure, [loadMyNotifications, loadMyNotificationsSuccess], null, m => this.loadError = m));
    this.subscriptions.push(this.route.queryParamMap.subscribe(params =>
      this.applyUrlState(params.get('view'), params.get('category'), params.get('q'), params.get('id'))));
    this.watchStoreState();

    this.loadNotifications();

    this.webSocketListeners();
  }

  private watchStoreState(): void {
    this.subscriptions.push(
      this.store.select(selectMyNotifications).subscribe(myNotifications => {
        this.rawNotifications = myNotifications;
        this.applyFilters();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ---------------------------------------------------------
  // URL STATE
  // ---------------------------------------------------------

  /** Reads the query string into component state (also runs when a link with ?id= is followed while already on the page). */
  applyUrlState(view: string | null, category: string | null, q: string | null, id: string | null): void {
    this.view = (VIEWS.some(v => v.key === view) ? view : 'all') as NotificationView;
    this.category = isCategoryKey(category) ? category : 'all';
    this.query = q ?? '';
    const parsedId = id ? Number(id) : NaN;
    this.highlightId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null;
    this.linkNotice = null;
    this.applyFilters();
  }

  /** Writes the current view/category/query back to the URL (keeping ?id= unless told otherwise), without a history entry per click. */
  private syncUrl(extra: Record<string, unknown> = {}): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        view: this.view !== 'all' ? this.view : null,
        category: this.category !== 'all' ? this.category : null,
        q: this.query || null,
        ...extra,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  setView(view: NotificationView): void {
    if (this.view === view) return;
    this.view = view;
    this.afterUserFilterChange();
  }

  setCategory(category: NotificationCategoryFilter): void {
    if (this.category === category) return;
    this.category = category;
    this.afterUserFilterChange();
  }

  onSearchQueryChange(value: string): void {
    this.query = value ?? '';
    this.applyFilters();
    this.syncUrl();
  }

  private afterUserFilterChange(): void {
    // Changing a filter by hand ends the "look at this one notification" mode.
    this.highlightId = null;
    this.linkNotice = null;
    this.applyFilters();
    this.syncUrl({ id: null });
  }

  onFilterStateChange(state: FilterState): void {
    this.panelState = state;
    this.applyFilters();
  }

  // ---------------------------------------------------------
  // FILTERING
  // ---------------------------------------------------------

  private matchesView(n: Notifications): boolean {
    if (this.view === 'unread') return n.read !== true;
    if (this.view === 'read') return n.read === true;
    return true;
  }

  private matchesCategory(n: Notifications): boolean {
    return this.category === 'all' || categoryKeyOf(n) === this.category;
  }

  applyFilters(): void {
    const raw = this.rawNotifications;
    // Until the list has had something in it, an unknown ?id= may just mean "not loaded yet".
    if (raw.length > 0) this.loadedOnce = true;

    // A deep link must always land on the notification it points at, so widen the filters if they would hide it.
    if (this.highlightId !== null) {
      const target = raw.find(n => n.id === this.highlightId);
      if (target) {
        if (!this.matchesView(target)) this.view = 'all';
        if (!this.matchesCategory(target)) this.category = 'all';
        this.query = '';
        this.panelState = null;
      } else if (this.loadedOnce) {
        this.linkNotice = "That notification isn't available any more.";
        this.highlightId = null;
      }
    }

    this.unreadCount = raw.filter(n => n.read !== true).length;
    this.categoryCounts = countByCategory(raw.filter(n => this.matchesView(n)));

    this.notificationData = raw.filter(n =>
      this.matchesView(n) && this.matchesCategory(n) && this.matchesPanel(n, this.panelState));
    this.totalNotifications = this.notificationData.length;
  }

  /** The panel's own filters: free-text search and the date chips (read/unread are the tabs). */
  private matchesPanel(notification: Notifications, state: FilterState | null): boolean {
    const query = (this.query || state?.query || '').trim().toLowerCase();
    if (query) {
      const content = `${notification.notification ?? ''} ${notification.message ?? ''}`.toLowerCase();
      if (!content.includes(query)) return false;
    }
    if (!state) return true;

    const selectedSorts = (state.selectedSorts || []).filter(s => s !== 'range' && s !== 'exact-date');
    if (selectedSorts.length > 0) {
      const now = new Date();
      const date = new Date(notification.date);
      const normalizeDay = (d: Date) => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
      const todayKey = normalizeDay(now);
      const yesterdayKey = normalizeDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

      const matchesAllSelected = selectedSorts.every(sort => {
        switch (sort) {
          case 'today': return normalizeDay(date) === todayKey;
          case 'yesterday': return normalizeDay(date) === yesterdayKey;
          case 'week': return (now.getTime() - date.getTime()) / 86_400_000 <= 7;
          case 'month': return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          default: return true;
        }
      });
      if (!matchesAllSelected) return false;
    }

    if (state.startDate && new Date(notification.date) < new Date(state.startDate)) return false;
    if (state.endDate && new Date(notification.date) > new Date(state.endDate)) return false;
    if (state.exactDate && new Date(notification.date).toDateString() !== new Date(state.exactDate).toDateString()) return false;

    return true;
  }

  // ---------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------

  /** Load notifications from state service */
  private loadNotifications(): void {
    this.store.dispatch(loadMyNotifications());
  }

  /** Manual refresh button -- same load, just with a brief spin cue since
   *  there's no dedicated loading selector for this action to bind to. */
  onRefresh(): void {
    if (this.refreshing) return;
    this.refreshing = true;
    this.loadNotifications();
    setTimeout(() => this.refreshing = false, 500);
  }

  markAllRead(): void {
    if (this.markingAll || this.unreadCount === 0) return;
    this.markingAll = true;
    this.notificationService.markAllAsRead().subscribe({
      next: res => {
        this.markingAll = false;
        this.snackBar.openSnackBar(res?.message || 'All notifications marked as read', '');
        this.loadNotifications();
      },
      error: err => {
        this.markingAll = false;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      }
    });
  }

  dismissLinkNotice(): void {
    this.linkNotice = null;
    this.syncUrl({ id: null });
  }

  /** Generic websocket watcher */
  private watchWebsocket(topic: string): void {
    this.subscriptions.push(
      this.rxStompService.watch(topic).subscribe(() => {
        this.loadNotifications();
      })
    );
  }

  webSocketListeners() {
    this.watchWebsocket('/topic/getNotificationFromMap');
    this.watchWebsocket('/topic/notification');
    this.watchWebsocket('/topic/notificationBulkAction');
    this.watchWebsocket('/topic/readNotification');
    this.watchWebsocket('/topic/deleteNotification');
  }

}
