import { Component, HostListener } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { forkJoin, merge, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationStateService } from 'src/app/services/notification-state.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserStateService } from 'src/app/services/user-state.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

@Component({
  selector: 'app-side-bar-open',
  templateUrl: './side-bar-open.component.html',
  styleUrls: ['./side-bar-open.component.css']
})
export class SideBarOpenComponent {

  currentRoute: string | null = null;
  openMenu = false;
  mdScreen = false;
  userData: any;
  responseMessage: string | null = null;
  profilePhoto: string | null = null;
  notificationLength = 0;

  private destroy$ = new Subject<void>();

  // merge all notification-related topics into a single stream
  private notificationEvents$ = merge(
    this.rxStompService.watch('/topic/notification'),
    this.rxStompService.watch('/topic/readNotification'),
    this.rxStompService.watch('/topic/deleteNotification'),
    this.rxStompService.watch('/topic/notificationBulkAction'),
    this.rxStompService.watch('/topic/getNotificationFromMap')
  );

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private userStateService: UserStateService,
    private snackbarService: SnackBarService,
    private notificationStateService: NotificationStateService,
    private rxStompService: RxStompService,
    private authService: AuthService
  ) {
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.onResize();
    this.refreshUserData();

    this.notificationEvents$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshUserData());
  }


  private refreshUserData() {
    forkJoin({
      user: this.userStateService.getUser().pipe(take(1)),
      notifications: this.notificationStateService.getMyNotifications().pipe(take(1))
    }).pipe(take(1))
      .subscribe(({ user, notifications }) => {
        this.userData = user;
        this.profilePhoto = user?.profilePhoto
          ? 'data:image/jpeg;base64,' + user.profilePhoto
          : null;

        this.notificationLength = notifications
          ? notifications.filter((n: any) => !n.read).length
          : 0;
      });
  }


  // -----------------------------
  // ROUTE HELPERS
  // -----------------------------

  isActive(route: string, exact: boolean = false): boolean {
    return exact
      ? this.currentRoute === route
      : this.currentRoute?.startsWith(route) ?? false;
  }

  isNotActive(): boolean {
    const paths = [
      '/dashboard/my-tasks',
      '/dashboard/my-notifications',
      '/dashboard/my-subscriptions',
      '/dashboard/my-faqs',
      '/dashboard/my-todos',
      '/dashboard/workspace',
      '/dashboard/profile',
      '/dashboard/settings'
    ];
    return paths.some(route => this.currentRoute?.startsWith(route));
  }

  isPath(path: string): boolean {
    return this.currentRoute === '/' + path;
  }

  setRouterName(routeName: string) {
    this.currentRoute = routeName;
  }

  clearRouterName(): void {
    this.currentRoute = null;
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------

  logout() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Logout',
      confirmation: true
    };

    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);

    dialogRef.componentInstance.onEmitStatusChange
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(() => {
        dialogRef.close();
        this.userService.logout();
        this.responseMessage = "You have successfully logged out";
        this.snackbarService.openSnackBar(this.responseMessage, '');
      });
  }

  // -----------------------------
  // CLEANUP
  // -----------------------------

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.openMenu = window.innerWidth >= 768;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event): void {
    if (!this.isClickInsideDropdown(event) && window.innerWidth < 768) {
      this.closeDropdown();
    }
  }

  private isClickInsideDropdown(event: Event): boolean {
    const dropdownElement = document.getElementById('sidebarView');
    return !!dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeDropdown() {
    this.openMenu = false;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
    this.mdScreen = !this.mdScreen;
  }

}