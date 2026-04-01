import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Notifications } from 'src/app/models/Notifications.interface';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { NotificationDetailsComponent } from 'src/app/shared/notification-details/notification-details.component';

@Component({
  selector: 'app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.css']
})
export class MyNotificationsComponent implements OnInit, OnDestroy {

  @Input() notificationData: Notifications[] = [];
  @Input() totalNotifications: number = 0;
  @Input() notificationsLength: number = 0;

  @Output() emitEvent = new EventEmitter();

  selectedNotificationIds: number[] = [];
  menuOpen: boolean[] = [];
  showBulkAction = false;

  private subs: Subscription[] = [];

  view: 'berliz' | 'gmail' = 'berliz';
  showScrollArrow = false;

  currentPage = 1;
  pageSize = 100;

  constructor(
    private notificationState: NotificationStateService,
    private notificationService: NotificationService,
    private snackbar: SnackBarService,
    private dialog: MatDialog,
    private rxStomp: RxStompService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    console.log(this.notificationData);
    this.subscribeToOutsideClicks();
    this.menuOpen = Array(this.notificationData.length).fill(false);

    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll = () => {
    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
    this.showScrollArrow = nearBottom;
  };

  // ---------------------------------------------------------
  // STATE REFRESH
  // ---------------------------------------------------------
  refreshNotifications(): void {
    const sub = this.notificationState.getMyNotifications().subscribe(data => {
      this.notificationData = data;
      this.notificationsLength = data.length;
      this.totalNotifications = data.length;
      this.selectedNotificationIds = [];
      this.menuOpen = Array(data.length).fill(false);
      this.notificationState.setmyNotificationsSubject(data);
    });

    this.subs.push(sub);
  }

  // ---------------------------------------------------------
  // WEBSOCKET LISTENER (Unified)
  // ---------------------------------------------------------
  initializeWebSocketListeners(): void {
    const sub = this.rxStomp.watch('/topic/notifications').subscribe(msg => {
      const event = JSON.parse(msg.body);

      switch (event.type) {
        case 'ADD':
          this.notificationData.unshift(event.data);
          break;
        case 'UPDATE':
          this.updateNotification(event.data);
          break;
        case 'DELETE':
          this.notificationData = this.notificationData.filter(n => n.id !== event.data.id);
          break;
      }

      this.notificationState.setmyNotificationsSubject([...this.notificationData]);
    });

    this.subs.push(sub);
  }

  updateNotification(updated: Notifications): void {
    const index = this.notificationData.findIndex(n => n.id === updated.id);
    if (index !== -1) {
      this.notificationData[index] = updated;
    }
  }

  // ---------------------------------------------------------
  // DROPDOWN HANDLING
  // ---------------------------------------------------------
  subscribeToOutsideClicks(): void {
    document.addEventListener('click', () => {
      this.closeAllMenus();
      this.showBulkAction = false;
    });
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  openMenu(index: number): void {
    this.closeAllMenus();
    this.menuOpen[index] = true;
  }

  closeAllMenus(): void {
    this.menuOpen = Array(this.notificationData.length).fill(false);
  }

  toggleBulkAction(): void {
    this.showBulkAction = !this.showBulkAction;
  }

  // ---------------------------------------------------------
  // SELECTION LOGIC
  // ---------------------------------------------------------
  isSelectAllChecked(): boolean {
    return this.notificationData.length > 0 &&
      this.notificationData.every(n => n.checked);
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    this.notificationData.forEach(n => (n.checked = checked));

    this.selectedNotificationIds = checked
      ? this.notificationData.map(n => n.id)
      : [];
  }

  toggleSelect(event: any, notification: Notifications): void {
    const checked = event.target.checked;
    notification.checked = checked;

    if (checked) {
      this.selectedNotificationIds.push(notification.id);
    } else {
      this.selectedNotificationIds = this.selectedNotificationIds.filter(id => id !== notification.id);
    }
  }

  // ---------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------
  readNotification(id: number): void {
    const notification = this.notificationData.find(n => n.id === id);
    if (!notification) return;

    const dialogRef = this.dialog.open(NotificationDetailsComponent, {
      width: '700px',
      data: { notificationData: notification }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.readNotification(id).subscribe(() => {
          this.refreshNotifications();
        });
      }
    });
  }

  deleteNotification(id: number): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: 'Delete this notification? This is irreversible.',
        confirmation: true,
        disableClose: true
      }
    });

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.notificationService.deleteNotification(id).subscribe(() => {
        this.snackbar.openSnackBar('Notification deleted', '');
        this.refreshNotifications();
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }

  submitBulkAction(action: string): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: `Are you sure you want to ${action} selected notifications?`,
        confirmation: true,
        disableClose: true
      }
    });

    const payload = {
      action,
      ids: this.selectedNotificationIds.join(',')
    };

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.notificationService.bulkAction(payload).subscribe(() => {
        this.snackbar.openSnackBar('Action completed', '');
        this.refreshNotifications();
        this.showBulkAction = false;
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }

  // ---------------------------------------------------------
  // DATE FORMATTER
  // ---------------------------------------------------------
  formatDate(dateString: any): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

    return `${Math.floor(diff / 604800)}w ago`;
  }

  // ---------------------------------------------------------
  // VIEW + PAGINATION
  // ---------------------------------------------------------
  setView(view: 'berliz' | 'gmail'): void {
    this.view = view;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.notificationsLength);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      // hook real paging here if needed
    }
  }

  nextPage(): void {
    const maxPage = Math.ceil(this.notificationsLength / this.pageSize);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      // hook real paging here if needed
    }
  }

  scrollToBottom(): void {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }
}
