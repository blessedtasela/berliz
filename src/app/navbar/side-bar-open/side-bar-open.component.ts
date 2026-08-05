import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';

import { Store } from '@ngrx/store';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { Notifications } from 'src/app/models/Notifications.interface';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications } from 'src/app/state/notification/notification.actions';

@Component({
  selector: 'app-side-bar-open',
  templateUrl: './side-bar-open.component.html',
  styleUrls: ['./side-bar-open.component.css']
})
export class SideBarOpenComponent implements OnInit, OnDestroy {

  currentRoute: string | null = null;
  openMenu = false;
  mdScreen = false;

  userData: any;
  notificationLength = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private snackbarService: SnackBarService,
    private rxStompService: RxStompService,
    private authService: AuthService,
    private store: Store
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

  // -----------------------------
  // INIT
  // -----------------------------
  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) return;
    this.onResize();

    // Load user from store
    this.store.dispatch(loadUser());

    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.userData = user;
      });

    // Initial notification load
    this.refreshNotifications();

  }

  // -----------------------------
  // NOTIFICATIONS
  // -----------------------------
  private refreshNotifications(): void {
    this.store.dispatch(loadMyNotifications());
    this.store.select(selectMyNotifications)
      .subscribe((notifications: Notifications[]) => {
        this.notificationLength =
          notifications?.filter(n => !n.read).length ?? 0;
      });
  }


  // -----------------------------
  // ROUTING HELPERS
  // -----------------------------
  isActive(route: string, exact = false): boolean {
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

    return paths.some(r => this.currentRoute?.startsWith(r));
  }

  isPath(path: string): boolean {
    return this.currentRoute === '/' + path;
  }

  setRouterName(routeName: string): void {
    this.currentRoute = routeName;
  }

  clearRouterName(): void {
    this.currentRoute = null;
  }

  // -----------------------------
  // LOGOUT
  // -----------------------------
  logout(): void {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Are you sure you want to log out?',
      confirmation: true
    };

    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);

    dialogRef.componentInstance.onEmitStatusChange
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe(() => {
        dialogRef.close();
        this.userService.logout();
        this.snackbarService.openSnackBar('You have successfully logged out', '');
      });
  }

  // -----------------------------
  // UI EVENTS
  // -----------------------------
  @HostListener('window:resize')
  onResize(): void {
    this.openMenu = window.innerWidth >= 768;
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event): void {
    if (!this.isClickInsideSidebar(event) && window.innerWidth < 768) {
      this.openMenu = false;
    }
  }

  private isClickInsideSidebar(event: Event): boolean {
    const el = document.getElementById('sidebarView');
    return !!el && el.contains(event.target as Node);
  }

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
    this.mdScreen = !this.mdScreen;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}