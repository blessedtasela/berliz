import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Notifications } from 'src/app/models/Notifications.interface';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { MyNotificationDetailModalComponent } from '../my-notification-detail-modal/my-notification-detail-modal.component';

@Component({
  selector: 'app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.css']
})
export class MyNotificationsComponent {
  @Input() notificationData: Notifications[] = [];
  responseMessage: any;
  showFullData: boolean = false;
  @Input() totalNotifications: number = 0;
  @Input() notificationsLength: number = 0;
  subscriptions: Subscription[] = []
  @Output() emitEvent = new EventEmitter()
  isNotificationChecked: boolean[] = [];
  menuOpen: boolean[] = Array(this.notificationData.length).fill(false);
  showBulkAction: boolean = false;
  selectedNotificationIds: number[] = [];

  constructor(private notificationStateService: NotificationStateService,
    private notificationService: NotificationService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private datePipe: DatePipe,) { }

  ngOnInit(): void {
    console.log(this.notificationData)
    this.ngxService.start();
    this.subscribeToCloseNotificationAction()
    this.isNotificationChecked = this.notificationData.map(notification => notification.checked === true);
    this.ngxService.stop();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => (sub.unsubscribe()))
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.notificationStateService.getMyNotifications().subscribe((myNotification) => {
        this.notificationData = myNotification;
        this.totalNotifications = this.notificationData.length;
        this.notificationsLength = myNotification.length;
        this.notificationData.forEach((Notification) => {
          Notification.checked = false;
          this.selectedNotificationIds = [];
        });
        this.notificationStateService.setmyNotificationsSubject(myNotification);
      }),
    );
  }

  openMenu(index: number) {
    // this.closeNotificationDropdown();
    this.menuOpen[index] = !this.menuOpen[index];
  }

  subscribeToCloseNotificationAction() {
    document.addEventListener('click', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeBulkDropdown();
        this.closeNotificationDropdown();
      }
    });

  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('NotificationAction');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeNotificationDropdown() {
    this.menuOpen = Array(this.notificationData.length).fill(false);
  }

  closeBulkDropdown() {
    this.showBulkAction = false;
  }

  unSelectAll() {
    this.notificationData.forEach((Notification) => {
      Notification.checked = false;
    });
    this.selectedNotificationIds = [];
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  readNotification(id: number) {
    const notification = this.notificationData.find((c) => c.id === id);
    if (notification) {
      const dialogRef = this.dialog.open(MyNotificationDetailModalComponent, {
        width: '700px',
        data: {
          notificationData: notification
        }
      });
      const childComponentInstance = dialogRef.componentInstance as MyNotificationDetailModalComponent;
      childComponentInstance.emitEVent.subscribe(() => {
        this.handleEmitEvent();
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log(`Dialog result: ${result}`);
          this.notificationService.readNotification(notification.id);
        } else {
          console.log('Dialog closed without performing any action');
        }
      });
    } else {
      console.log('Notification not found');
    }
  }

  deleteNotification(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this Notification? This is irreversible.";
    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.notificationService.deleteNotification(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('Notification deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting Notification');
            }
          })
        })
    }, (error) => {
      this.ngxService.stop();
      this.snackbarService.openSnackBar(error, 'error');
      if (error.error?.message) {
        this.responseMessage = error.error?.message;
      } else {
        this.responseMessage = genericError;
      }
      this.snackbarService.openSnackBar(this.responseMessage, 'error');
    });
  }

  toggleBulkAction() {
    this.showBulkAction = !this.showBulkAction;
  }

  isSelectAllChecked(): boolean {
    if (!this.notificationData || this.notificationData.length === 0) {
      return false;
    }
    return this.notificationData.every((Notification) => Notification.checked);
  }

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.notificationData.forEach((notification) => {
        notification.checked = true;
        this.selectedNotificationIds.push(notification.id);
      });
      console.log("is checked ", this.selectedNotificationIds);
    } else {
      this.notificationData.forEach((notification) => {
        notification.checked = false;
      });
      this.selectedNotificationIds = [];
      console.log('unchecked ', this.selectedNotificationIds);
    }
  }

  toggleSelect(event: any, notification: Notifications) {
    const isChecked = event.target.checked;
    if (isChecked) {
      notification.checked = true;
      this.selectedNotificationIds.push(notification.id);
      console.log("is checked ", this.selectedNotificationIds);
    } else {
      notification.checked = false;
      this.selectedNotificationIds = this.selectedNotificationIds.filter((id) => id !== notification.id);
      console.log('unchecked ', this.selectedNotificationIds);
    }
  }

  submitBulkAction(action: string) {
    const dialogConfig = new MatDialogConfig();
    var message: any;
    if (action === 'delete') {
      message = 'delete selected these notifications?';
    }
    if (action === 'read') {
      message = 'mark selected notifications as read?';
    }
    if (action === 'unread') {
      message = 'mark selected notifications as unread?';
    }
    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    // Convert array of IDs to a comma-separated string
    const idsString = this.selectedNotificationIds.join(',');
    const payload = {
      action: action,
      ids: idsString,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.notificationService.bulkAction(payload).subscribe(
        (response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent();
          this.emitEvent.emit()
          this.closeBulkDropdown()
          this.unSelectAll();
          dialogRef.close('action completed successfully');
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without performing any action');
              this.closeBulkDropdown()
              this.unSelectAll();
            }
          });
        },
        (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        }
      );
    });
  }

  formatDate(dateString: any): string {
    const date = new Date(dateString);
    const now = new Date();
  
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) {
      return diffInSeconds === 1 ? `${diffInSeconds} sec ago` : `${diffInSeconds} secs ago`;
    }
  
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return diffInMinutes === 1 ? `${diffInMinutes} min ago` : `${diffInMinutes} mins ago`;
    }
  
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return diffInHours === 1 ? `${diffInHours} hour ago` : `${diffInHours} hours ago`;
    }
  
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return diffInDays === 1 ? `${diffInDays} day ago` : `${diffInDays} days ago`;
    }
  
    const diffInWeeks = Math.floor(diffInDays / 7);
    return diffInWeeks === 1 ? `${diffInWeeks} week ago` : `${diffInWeeks} weeks ago`;
  }
  
}



