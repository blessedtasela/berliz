import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { FilterState } from 'src/app/models/FilterState.interface';
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
    this.notificationData = this.rawNotifications.filter(notification => this.matchesFilter(notification, state));
    this.totalNotifications = this.notificationData.length;
  }

  private matchesFilter(notification: Notifications, state: FilterState): boolean {
    const filterState = state as any;
    if (!filterState) {
      return true;
    }

    if (filterState.query) {
      const term = String(filterState.query).toLowerCase();
      const content = `${(notification as any).title ?? ''} ${(notification as any).message ?? ''}`.toLowerCase();
      if (!content.includes(term)) {
        return false;
      }
    }

    if (filterState.type && (notification as any).type !== filterState.type) {
      return false;
    }

    if (filterState.status && (notification as any).status !== filterState.status) {
      return false;
    }

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

  /** Child component sends filtered results */
  handleSearchResults(results: Notifications[]): void {
    this.isSearch = true;
    this.notificationData = results;
    this.totalNotifications = results.length;
    console.log('PARENT RECEIVED:', this.notificationData.length); // 👈 add this
  }

  /** Reset search and show full list again */
  clearSearch(): void {
    this.isSearch = false;
    this.notificationData = this.rawNotifications;
    this.totalNotifications = this.rawNotifications.length;
  }

  webSocketListeners() {
    this.watchWebsocket('/topic/getNotificationFromMap');
    this.watchWebsocket('/topic/notification');
    this.watchWebsocket('/topic/notificationBulkAction');
    this.watchWebsocket('/topic/readNotification');
    this.watchWebsocket('/topic/deleteNotification');
  }

}
