// notification-main.component.ts
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NotificationSection, Notifications } from 'src/app/models/Notifications.interface';
import { FilterState, SearchSortOption } from 'src/app/models/FilterState.interface';
import { NotificationService } from 'src/app/services/notification.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NotificationDetailsComponent } from 'src/app/shared/notification-details/notification-details.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { Store } from '@ngrx/store';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';

@Component({
  selector: 'notification-main',
  templateUrl: './notification-main.component.html'
})
export class NotificationMainComponent implements OnInit, OnDestroy {

  @Input() searchQuery = '';
  placeholder = 'Search notifications...';
  allNotifications: Notifications[] = [];
  filteredNotifications: Notifications[] = [];
  pagedNotifications: Notifications[] = [];
  sections: NotificationSection[] = [];

  selectedNotificationIds: number[] = [];
  notificationSortOptions: SearchSortOption[] = [];
  currentPage = 1;
  pageSize = 50;

  private subs: Subscription[] = [];

  constructor(
    private store: Store,
    private notificationService: NotificationService,
    private snackbar: SnackBarService,
    private dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    const sub = this.store.select(selectMyNotifications).subscribe(data => {
      this.allNotifications = data;

      this.filteredNotifications = [...data];
      this.currentPage = 1;
      this.updatePage();
    });
    this.subs.push(sub);
  }


  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // from search panel
  onFilterStateChange(state: FilterState): void {
    this.filteredNotifications = this.filterNotifications(state);
    this.currentPage = 1;
    this.updatePage();
    this.selectedNotificationIds = [];
  }

  private filterNotifications(state: FilterState): Notifications[] {
    const query = state.query?.trim().toLowerCase() || '';
    const selectedSorts = state.selectedSorts || [];
    const startDate = state.startDate ? new Date(state.startDate) : null;
    const endDate = state.endDate ? new Date(state.endDate) : null;
    const exactDate = state.exactDate ? new Date(state.exactDate) : null;

    return this.allNotifications.filter(notification => {
      const text = (notification.notification || '').toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const date = new Date(notification.date);
      const matchesStart = !startDate || date >= startDate;
      const matchesEnd = !endDate || date <= endDate;
      const matchesExact = !exactDate || date.toDateString() === exactDate.toDateString();
      const matchesSorts = selectedSorts.length === 0 || selectedSorts.every(sort => {
        if (sort === 'read') return notification.read === true;
        if (sort === 'unread') return notification.read === false;
        return true;
      });

      return matchesQuery && matchesStart && matchesEnd && matchesExact && matchesSorts;
    });
  }

  // pagination
  get notificationsLength() {
    return this.filteredNotifications.length;
  }

  get totalNotifications() {
    return this.allNotifications.length;
  }

  get startIndex() {
    return this.notificationsLength === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex() {
    return Math.min(this.currentPage * this.pageSize, this.notificationsLength);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePage();
    }
  }

  nextPage(): void {
    const maxPage = Math.ceil(this.notificationsLength / this.pageSize);
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.updatePage();
    }
  }

  private updatePage(): void {
    const maxPage = Math.ceil(this.notificationsLength / this.pageSize);
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage === 0 ? 1 : maxPage;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.pagedNotifications = this.filteredNotifications.slice(start, end);
    this.buildSections();
  }

  // grouping
  private buildSections(): void {
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

    this.pagedNotifications.forEach(n => {
      const d = new Date(n.date);
      if (isToday(d)) today.push(n);
      else if (isYesterday(d)) yesterday.push(n);
      else if (isThisWeek(d)) thisWeek.push(n);
      else older.push(n);
    });

    const groups = [
      { label: 'Today', items: today },
      { label: 'Yesterday', items: yesterday },
      { label: 'This week', items: thisWeek },
      { label: 'Older', items: older }
    ];

    this.sections = groups
      .filter(g => g.items.length > 0)
      .map(group => ({
        label: group.label,
        items: group.items.map(item => ({
          ...item,
          index: this.pagedNotifications.findIndex(n => n.id === item.id)
        }))
      }));
  }

  // selection
  isSelectAllChecked(): boolean {
    return this.pagedNotifications.length > 0 && this.pagedNotifications.every(n => n.checked);
  }

  onToggleSelectAll(): void {
    const allSelected = this.isSelectAllChecked();

    this.sections.forEach(section => {
      section.items.forEach((n: any) => {
        n.checked = !allSelected;
      });
    });

    // If you still keep pagedNotifications, sync it:
    this.pagedNotifications = this.sections.flatMap((s: any) => s.items);

    // Update selected ids
    if (!allSelected) {
      const idsToAdd = this.pagedNotifications
        .map(n => n.id)
        .filter(id => !this.selectedNotificationIds.includes(id));

      this.selectedNotificationIds = [...this.selectedNotificationIds, ...idsToAdd];
    } else {
      const idsOnPage = this.pagedNotifications.map(n => n.id);

      this.selectedNotificationIds = this.selectedNotificationIds.filter(
        id => !idsOnPage.includes(id)
      );
    }
  }


  get selectionMode(): boolean {
    return this.selectedNotificationIds.length > 0;
  }


  onToggleItem(notification: Notifications): void {
    notification.checked = !notification.checked;
    if (notification.checked) {
      if (!this.selectedNotificationIds.includes(notification.id)) {
        this.selectedNotificationIds.push(notification.id);
      }
    } else {
      this.selectedNotificationIds =
        this.selectedNotificationIds.filter(id => id !== notification.id);
    }
  }

  // open details
  openDetails(notification: Notifications): void {
    const dialogRef = this.dialog.open(NotificationDetailsComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: notification
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.notificationService.markAsRead(notification.id).subscribe(() => {
          this.refreshNotifications();
        });
      }
    });
  }

  // bulk actions
  onBulkAction(action: string): void {
    if (this.selectedNotificationIds.length === 0) {
      this.snackbar.openSnackBar('Select at least one notification', '');
      return;
    }

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
      this.notificationService.bulkAction(payload).subscribe((res: any) => {
        this.snackbar.openSnackBar(res.message || 'Action completed', '');
        this.refreshNotifications();
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }

  // single actions
  onMarkAsRead(notification: Notifications): void {
    this.notificationService.markAsRead(notification.id).subscribe(() => {
      this.refreshNotifications();
    });
  }

  onMarkAsUnread(notification: Notifications): void {
    const payload = { action: 'unread', ids: notification.id.toString() };
    this.notificationService.markAsUnread(notification.id).subscribe(() => {
      this.refreshNotifications();
    });
  }

  onDelete(notification: Notifications): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: 'Delete this notification? This is irreversible.',
        confirmation: true,
        disableClose: true
      }
    });

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.notificationService.deleteNotification(notification.id).subscribe((res: any) => {
        this.snackbar.openSnackBar(res.message || 'Notification deleted', '');
        this.refreshNotifications();
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }

  private refreshNotifications(): void {
    const sub = this.store.select(selectMyNotifications).subscribe(data => {
      this.allNotifications = data;
      this.filteredNotifications = [...data];
      this.currentPage = 1;
      this.updatePage();
      this.selectedNotificationIds = [];
    });
    this.subs.push(sub);
  }

  onMarkRead(notification: Notifications) {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: 'Mark this notification as read?',
        confirmation: true,
        disableClose: true
      }
    });

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.notificationService.markAsRead(notification.id).subscribe((res: any) => {
        this.snackbar.openSnackBar(res.message || 'Notification marked as read', '');
        this.refreshNotifications();
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }

  onMarkUnread(notification: Notifications) {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: {
        message: 'Mark this notification as unread?',
        confirmation: true,
        disableClose: true
      }
    });

    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      const payload = { action: 'unread', ids: notification.id.toString() };
      this.notificationService.bulkAction(payload).subscribe((res: any) => {
        this.snackbar.openSnackBar(res.message || 'Notification marked as unread', '');
        this.refreshNotifications();
        dialogRef.close();
      });
    });

    this.subs.push(sub);
  }


}
