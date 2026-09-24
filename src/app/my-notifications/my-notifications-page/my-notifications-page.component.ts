import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { FilterState, SearchSortOption } from 'src/app/models/FilterState.interface';
import { Notifications } from 'src/app/models/Notifications.interface';
import { AuthService } from 'src/app/services/auth.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { selectMyNotifications, selectMyNotificationsCount } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications } from 'src/app/state/notification/notification.actions';

@Component({
  selector: 'app-my-notifications-page',
  templateUrl: './my-notifications-page.component.html',
  styleUrls: ['./my-notifications-page.component.css']
})
export class MyNotificationsPageComponent implements OnInit, OnDestroy {

  notificationData: Notifications[] = [];   // displayed list
  rawNotifications: Notifications[] = [];   // full list from server
  totalNotifications = 0;

  isSearch = false;
  isAdmin = false;
  refreshing = false;

  // Was never bound to app-search-panel's [sortOptions] at all -- the input
  // defaulted to [], so the panel's whole filter-chip row rendered empty.
  sortOptions: SearchSortOption[] = [
    { key: 'unread', label: 'Unread', priority: true },
    { key: 'read', label: 'Read', priority: true },
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
    private authService: AuthService,
    private rxStompService: RxStompService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    // Store subscription set up ONCE. Previously loadNotifications() both
    // dispatched AND re-subscribed to selectMyNotifications, and every one
    // of the five websocket topics below called loadNotifications() again on
    // every message -- stacking a brand-new, never-unsubscribed subscription
    // on top of the last one for as long as this page stayed mounted.
    this.watchStoreState();

    // Initial load
    this.loadNotifications();

    // Watch all websocket events with one helper
    this.webSocketListeners();
  }

  private watchStoreState(): void {
    this.subscriptions.push(
      this.store.select(selectMyNotifications).subscribe(myNotifications => {
        this.rawNotifications = myNotifications;

        // ONLY update UI if no filter is active
        if (!this.isSearch) {
          this.notificationData = [...myNotifications];
          this.totalNotifications = myNotifications.length;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  onFilterStateChange(state: FilterState) {
    this.isSearch = !!(state.query || (state.selectedSorts && state.selectedSorts.length));
    this.notificationData = this.rawNotifications.filter(notification => this.matchesFilter(notification, state));
    this.totalNotifications = this.notificationData.length;
  }

  private matchesFilter(notification: Notifications, state: FilterState): boolean {
    if (!state) return true;

    // The real text field is `notification` (see Notifications.interface.ts)
    // -- `title` never existed on this model, and `message` is optional, so
    // matching against those two alone meant a search almost never matched
    // anything: every result got filtered out.
    if (state.query) {
      const term = state.query.toLowerCase();
      const content = `${notification.notification ?? ''} ${notification.message ?? ''}`.toLowerCase();
      if (!content.includes(term)) return false;
    }

    const selectedSorts = (state.selectedSorts || []).filter(s => s !== 'range' && s !== 'exact-date');
    if (selectedSorts.length > 0) {
      const now = new Date();
      const date = new Date(notification.date);
      const normalizeDay = (d: Date) => { const c = new Date(d); c.setHours(0, 0, 0, 0); return c.getTime(); };
      const todayKey = normalizeDay(now);
      const yesterdayKey = normalizeDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

      const matchesAllSelected = selectedSorts.every(sort => {
        switch (sort) {
          case 'read': return notification.read === true;
          case 'unread': return notification.read === false;
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

  /** Load notifications from state service */
  private loadNotifications(): void {
    this.store.dispatch(loadMyNotifications());
  }

  /** Manual refresh button — same load, just with a brief spin cue since
   *  there's no dedicated loading selector for this action to bind to. */
  onRefresh(): void {
    if (this.refreshing) return;
    this.refreshing = true;
    this.loadNotifications();
    setTimeout(() => this.refreshing = false, 500);
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
