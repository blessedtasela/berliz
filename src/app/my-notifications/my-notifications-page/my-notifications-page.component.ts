import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Notifications } from 'src/app/models/Notifications.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';

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

  private subscriptions: Subscription[] = [];

  constructor(
    private notificationStateService: NotificationStateService,
    private authService: AuthenticationService,
    private rxStompService: RxStompService
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();

    // Initial load
    this.loadNotifications();

    // Watch all websocket events with one helper
    this.webSocketListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /** Load notifications from state service */
  private loadNotifications(): void {
    this.subscriptions.push(
      this.notificationStateService.getMyNotifications().subscribe(myNotifications => {
        this.rawNotifications = myNotifications;

        // Only overwrite UI if user is NOT filtering
        this.rawNotifications = myNotifications;

        // ONLY update UI if no filter is active
        if (!this.isSearch) {
          this.notificationData = [...myNotifications];
          this.totalNotifications = myNotifications.length;
        }

        this.notificationStateService.setmyNotificationsSubject(myNotifications);
      })
    );
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
