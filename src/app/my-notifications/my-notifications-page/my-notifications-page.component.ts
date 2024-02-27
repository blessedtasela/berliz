import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
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
export class MyNotificationsPageComponent {
  notificationData: Notifications[] = [];
  totalNotifications: number = 0;
  notificationsLength: number = 0;
  allNotificationData: Notifications[] = [];
  allTotalNotifications: number = 0;
  allNotificationsLength: number = 0;
  searchComponent: string = 'myNotification';
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  isAdmin: boolean = false;

  constructor(private ngxService: NgxUiLoaderService,
    private notificationStateService: NotificationStateService,
    private authService: AuthenticationService,
    private rxStompService: RxStompService) {
  }

  ngOnInit(): void {
    this.ngxService.start()
    this.handleEmitEvent()
    this.isAdmin = this.authService.isAdmin()
    this.watchReadNotification()
    this.watchNotification()
    this.watchGetNotificationFromMap()
    this.watchNotificationBulkAction()
    this.watchDeleteNotification()
    this.ngxService.stop()
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => (subscription.unsubscribe()));
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.notificationStateService.getMyNotifications().subscribe((myNotifications) => {
        console.log('isCachedData false')
        this.notificationData = myNotifications;
        this.totalNotifications = myNotifications.length
        this.notificationsLength = myNotifications.length
        this.notificationStateService.setmyNotificationsSubject(myNotifications);
      }),
    );
  }

  handleSearchResults(results: Notifications[]): void {
    this.notificationData = results;
    this.totalNotifications = results.length;
  }

  handleAllSearchResults(results: Notifications[]): void {
    this.allNotificationData = results;
    this.allTotalNotifications = results.length;
  }

  emitData() {
    this.handleEmitEvent();
  }

  watchGetNotificationFromMap() {
    this.rxStompService.watch('/topic/getNotificationFromMap').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchNotification() {
    this.rxStompService.watch('/topic/notification').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchNotificationBulkAction() {
    this.rxStompService.watch('/topic/notificationBulkAction').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchReadNotification() {
    this.rxStompService.watch('/topic/readNotification').subscribe((message) => {
      this.handleEmitEvent();
    });
  }

  watchDeleteNotification() {
    this.rxStompService.watch('/topic/deleteNotification').subscribe((message) => {
      this.handleEmitEvent();
      // const receivedNewsletter: Notifications = JSON.parse(message.body);
      // this.notificationData = this.notificationData.filter(Notification => Notification.id !== receivedNewsletter.id);
      // this.totalNotifications = this.notificationData.length;
    });
  }

}


