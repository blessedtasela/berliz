import { DatePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Notifications } from 'src/app/models/Notifications.interface';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { NotificationService } from 'src/app/services/notification.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { NotificationDetailsComponent } from 'src/app/shared/notification-details/notification-details.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.css'],
  animations: [
    trigger('fadeList', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(4px)' }),
        animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('120ms ease-in', style({ opacity: 0, transform: 'translateY(-4px)' }))
      ])
    ])
  ],
})
export class MyNotificationsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() notificationData: Notifications[] = []; // current page slice
  @Input() totalNotifications: number = 0;
  @Input() notificationsLength: number = 0;

  allNotificationData: Notifications[] = []; // full list

  @Output() emitEvent = new EventEmitter();

  selectedNotificationIds: number[] = [];
  menuOpen: boolean[] = [];
  showBulkAction = false;

  groupedNotifications: {
    label: string;
    items: (Notifications & { index: number })[];
  }[] = [];

  private subs: Subscription[] = [];

  view: 'berliz' | 'gmail' = 'berliz';

  currentPage = 1;
  pageSize = 50;

  focusedIndex: number | null = null;

  constructor(
    private notificationState: NotificationStateService,
    private notificationService: NotificationService,
    private snackbar: SnackBarService,
    private dialog: MatDialog,
    private rxStomp: RxStompService,
    private datePipe: DatePipe
  ) { }

  // ---------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------
  ngOnInit(): void {
    this.subscribeToOutsideClicks();
    this.initializeWebSocketListeners();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notificationData'] && this.notificationData.length > 0) {
      // Reset full list from parent input
      this.allNotificationData = [...this.notificationData];
      this.notificationsLength = this.allNotificationData.length;
      this.totalNotifications = this.allNotificationData.length;

      this.currentPage = 1;
      this.updatePage();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  // ---------------------------------------------------------
  // KEYBOARD NAVIGATION
  // ---------------------------------------------------------
  onKeyDown(event: KeyboardEvent): void {
    if (this.groupedNotifications.length === 0) return;

    const flatList = this.groupedNotifications.flatMap(g => g.items);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.focusedIndex === null) this.focusedIndex = 0;
      else this.focusedIndex = Math.min(this.focusedIndex + 1, flatList.length - 1);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.focusedIndex === null) this.focusedIndex = 0;
      else this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
    }

    if (event.key === 'Enter' && this.focusedIndex !== null) {
      const n = flatList[this.focusedIndex];
      if (n) this.readNotification(n.id);
    }
  }

  // ---------------------------------------------------------
  // WEBSOCKET LISTENER
  // ---------------------------------------------------------
  initializeWebSocketListeners(): void {
    const sub = this.rxStomp.watch('/topic/notifications').subscribe(msg => {
      const event = JSON.parse(msg.body);

      switch (event.type) {
        case 'ADD':
          this.allNotificationData.unshift(event.data);
          break;

        case 'UPDATE':
          this.updateNotification(event.data);
          break;

        case 'DELETE':
          this.allNotificationData = this.allNotificationData.filter(n => n.id !== event.data.id);
          break;
      }

      this.notificationsLength = this.allNotificationData.length;
      this.totalNotifications = this.allNotificationData.length;

      this.updatePage();
      this.notificationState.setmyNotificationsSubject([...this.allNotificationData]);
    });

    this.subs.push(sub);
  }

  updateNotification(updated: Notifications): void {
    const index = this.allNotificationData.findIndex(n => n.id === updated.id);
    if (index !== -1) {
      this.allNotificationData[index] = updated;
    }
  }

  // ---------------------------------------------------------
  // GROUPING LOGIC
  // ---------------------------------------------------------
  private buildGroups(): void {
    const now = new Date();

    const isToday = (d: Date) => d.toDateString() === now.toDateString();

    const isYesterday = (d: Date) => {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      return d.toDateString() === y.toDateString();
    };

    const isThisWeek = (d: Date) => {
      const diff = now.getTime() - d.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days >= 2 && days < 7;
    };

    const today: Notifications[] = [];
    const yesterday: Notifications[] = [];
    const thisWeek: Notifications[] = [];
    const older: Notifications[] = [];

    this.notificationData.forEach(n => {
      const d = new Date(n.date);
      if (isToday(d)) today.push(n);
      else if (isYesterday(d)) yesterday.push(n);
      else if (isThisWeek(d)) thisWeek.push(n);
      else older.push(n);
    });

    this.groupedNotifications = [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'This week', items: thisWeek },
      { label: 'Older', items: older }
    ]
      .filter(g => g.items.length > 0)
      .map(group => ({
        label: group.label,
        items: group.items.map(item => ({
          ...item,
          index: this.notificationData.findIndex(n => n.id === item.id)
        }))
      }));
  }

  // ---------------------------------------------------------
  // PAGINATION + PAGE UPDATE
  // ---------------------------------------------------------
  private updatePage(): void {
    const maxPage = Math.ceil(this.notificationsLength / this.pageSize);

    if (this.currentPage > maxPage) {
      this.currentPage = maxPage === 0 ? 1 : maxPage;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.notificationData = this.allNotificationData.slice(start, end);
    this.menuOpen = Array(this.notificationData.length).fill(false);

    this.buildGroups();
  }

  refreshNotifications(): void {
    const sub = this.notificationState.getMyNotifications().subscribe(data => {
      this.allNotificationData = data;
      this.notificationsLength = data.length;
      this.totalNotifications = data.length;

      const maxPage = Math.ceil(this.notificationsLength / this.pageSize);
      if (this.currentPage > maxPage) {
        this.currentPage = maxPage === 0 ? 1 : maxPage;
      }

      this.updatePage();
      this.selectedNotificationIds = [];

      this.notificationState.setmyNotificationsSubject(data);
    });

    this.subs.push(sub);
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

  onOpenMenu(event: Event, index: number): void {
    event.stopPropagation();
    this.openMenu(index);
  }

  closeAllMenus(): void {
    this.menuOpen = Array(this.notificationData.length).fill(false);
  }

  // ---------------------------------------------------------
  // SELECTION LOGIC
  // ---------------------------------------------------------
  isSelectAllChecked(): boolean {
    return this.notificationData.length > 0 &&
      this.notificationData.every(n => n.checked);
  }

  toggleSelectAll(event: Event): void {
    event.stopPropagation();

    const allSelected = this.isSelectAllChecked();

    this.notificationData.forEach(n => n.checked = !allSelected);

    if (!allSelected) {
      const idsToAdd = this.notificationData
        .map(n => n.id)
        .filter(id => !this.selectedNotificationIds.includes(id));

      this.selectedNotificationIds = [...this.selectedNotificationIds, ...idsToAdd];
    } else {
      const idsOnPage = this.notificationData.map(n => n.id);
      this.selectedNotificationIds = this.selectedNotificationIds.filter(id => !idsOnPage.includes(id));
    }
  }

  onToggleSelect(event: Event, notification: Notifications): void {
    event.stopPropagation();
    notification.checked = !notification.checked;

    if (notification.checked) {
      if (!this.selectedNotificationIds.includes(notification.id)) {
        this.selectedNotificationIds.push(notification.id);
      }
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
      width: '500px',
      data: notification
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.readNotification(id).subscribe(() => {
          this.refreshNotifications();
        });
      }
    });
  }

  markAsRead(id: number): void {
    this.notificationService.readNotification(id).subscribe(() => {
      this.refreshNotifications();
    });
  }

  markAsUnread(id: number): void {
    const payload = { action: 'unread', ids: id.toString() };
    this.notificationService.bulkAction(payload).subscribe(() => {
      this.refreshNotifications();
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
      this.notificationService.deleteNotification(id).subscribe((res: any) => {
        this.snackbar.openSnackBar(res.message || 'Notification deleted', '');
        this.refreshNotifications();
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }

  toggleBulkAction(event: Event): void {
    event.stopPropagation();

    if (this.selectedNotificationIds.length === 0) {
      this.snackbar.openSnackBar("Select at least one notification", "");
      return;
    }

    this.showBulkAction = !this.showBulkAction;
  }

  submitBulkAction(action: string): void {
    if (this.selectedNotificationIds.length === 0) {
      this.snackbar.openSnackBar("Select at least one notification", "");
      return;
    }

    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: `Are you sure you want to ${action} selected notifications?`,
        confirmation: true,
        disableClose: true
      }
    });

    const payload = { action, ids: this.selectedNotificationIds.join(',') };

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.notificationService.bulkAction(payload).subscribe((res: any) => {
        this.snackbar.openSnackBar(res.message || 'Action completed', '');
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

  get startIndex() {
    return this.notificationsLength === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex() {
    return Math.min(this.currentPage * this.pageSize, this.notificationsLength);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  nextPage() {
    const maxPage = Math.ceil(this.notificationsLength / this.pageSize);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.updatePage();
    }
  }
}
