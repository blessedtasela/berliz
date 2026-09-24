// notification-main.component.ts
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { NotificationSection, Notifications } from 'src/app/models/Notifications.interface';
import { FilterState, SearchSortOption } from 'src/app/models/FilterState.interface';
import { NotificationService } from 'src/app/services/notification.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NotificationDetailsComponent } from 'src/app/shared/notification-details/notification-details.component';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { navigateToNotificationEntity, notificationHasDeepLink } from 'src/app/utils/notification-entity-link.util';
import { Store } from '@ngrx/store';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';

/** Rough character count at which notification-item's 3-line clamp (text-xs) actually starts cutting text off. Not pixel-exact, but nothing here needs it to be -- just "did they already see the whole thing". */
const TRIM_THRESHOLD_CHARS = 150;

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
  // Was declared but never populated -- app-search-panel's filter-chip row
  // (visibleSortOptions, sliced from this input) had nothing to slice, so
  // the entire "Unread / Read / Today / ..." chip row silently rendered
  // empty. Nothing was actually broken in the click-a-chip-and-filter path;
  // there was just never anything to click.
  notificationSortOptions: SearchSortOption[] = [
    { key: 'unread', label: 'Unread', priority: true },
    { key: 'read', label: 'Read', priority: true },
    { key: 'today', label: 'Today', priority: true },
    { key: 'yesterday', label: 'Yesterday', priority: true },
    { key: 'week', label: 'This Week', priority: true },
    { key: 'month', label: 'This Month', priority: false },
    { key: 'range', label: 'Date Range', priority: false },
    { key: 'exact-date', label: 'Exact Date', priority: false },
  ];
  currentPage = 1;
  pageSize = 50;

  private subs: Subscription[] = [];

  constructor(
    private store: Store,
    private notificationService: NotificationService,
    private snackbar: SnackBarService,
    private dialog: MatDialog,
    private router: Router,
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
    // 'range'/'exact-date' are pure UI toggles that reveal the date pickers in
    // the panel's drawer (see search-panel.component.html) -- the actual date
    // filtering they turn on is handled below via startDate/endDate/exactDate,
    // not as a per-notification predicate here, so they're excluded rather
    // than falling into the `default: return true` case (harmless either way
    // today since it's `true`, but the exclusion documents that they're not
    // filter predicates on their own).
    const selectedSorts = (state.selectedSorts || []).filter(s => s !== 'range' && s !== 'exact-date');
    const startDate = state.startDate ? new Date(state.startDate) : null;
    const endDate = state.endDate ? new Date(state.endDate) : null;
    const exactDate = state.exactDate ? new Date(state.exactDate) : null;

    const now = new Date();
    const normalizeDay = (d: Date) => {
      const c = new Date(d);
      c.setHours(0, 0, 0, 0);
      return c.getTime();
    };
    const todayKey = normalizeDay(now);
    const yesterdayKey = normalizeDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));

    return this.allNotifications.filter(notification => {
      const text = (notification.notification || '').toLowerCase();
      const matchesQuery = !query || text.includes(query);
      const date = new Date(notification.date);
      const matchesStart = !startDate || date >= startDate;
      const matchesEnd = !endDate || date <= endDate;
      const matchesExact = !exactDate || date.toDateString() === exactDate.toDateString();
      // every(), not some(): each selected chip narrows the result further
      // (e.g. "Unread" + "This Week" means unread AND from this week), matching
      // how the chips visually combine rather than acting as alternatives.
      const matchesSorts = selectedSorts.length === 0 || selectedSorts.every(sort => {
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

  /** Whether this notification's own text got cut off by the 3-line clamp in the list -- see notification-item.component.html. */
  isTrimmed(notification: Notifications): boolean {
    return (notification.notification?.length ?? 0) > TRIM_THRESHOLD_CHARS;
  }

  // open details
  openDetails(notification: Notifications): void {
    // The list row already showed the whole thing (nothing left to read) --
    // if it's also a notification we know how to route, skip the detail
    // dialog and go straight there. A trimmed row, or one with no known
    // destination, still opens the dialog so the full text is seen first
    // (NotificationDetailsComponent's own "Go there" button continues on
    // from there once they've read it).
    if (!this.isTrimmed(notification) && notificationHasDeepLink(notification)) {
      navigateToNotificationEntity(this.router, notification);
      this.notificationService.markAsRead(notification.id).subscribe(() => this.refreshNotifications());
      return;
    }

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
