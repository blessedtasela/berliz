import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router, NavigationEnd } from '@angular/router';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { UserService } from 'src/app/services/user.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { AuthService } from 'src/app/services/auth.service';
import {
  SidebarDisplay,
  SidebarStateService,
} from 'src/app/services/sidebar-state.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { Store } from '@ngrx/store';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications } from 'src/app/state/notification/notification.actions';

const KNOWN_SIDEBAR_MODES: SidebarDisplay[] = ['expanded', 'collapsed', 'hidden'];

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit, OnDestroy {
  currentRoute: any;

  /** Desktop display mode — 'expanded' | 'collapsed' | 'hidden'. Mirrors SidebarStateService.mode$. */
  mode: SidebarDisplay = 'collapsed';
  /** True below the md breakpoint. Mobile never reserves layout space for any mode. */
  isMobile = false;
  /** Mobile-only: whether the temporary, full-screen overlay sidebar is showing. */
  mobileOverlayOpen = false;

  userData!: any;
  responseMessage: any;
  profilePhoto: any;
  subscriptions: Subscription[] = [];
  notificationLength: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private store: Store,
    private snackbarService: SnackBarService,
    private rxStompService: RxStompService,
    private authService: AuthService,
    private sidebarState: SidebarStateService
  ) {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  // -----------------------------
  // MODE / VIEWPORT
  // -----------------------------
  // The floating reopen button itself now lives in TopBarComponent (see
  // sidebar-state.service.ts's showFloatingButton$) — this component no
  // longer needs its own copy of that visibility rule.

  setMode(mode: SidebarDisplay): void {
    this.sidebarState.setMode(mode);
  }

  closeMobileOverlay(): void {
    this.sidebarState.setMobileOverlayOpen(false);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = this.sidebarState.isMobileViewport();
  }

  // -----------------------------
  // INIT
  // -----------------------------
  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.onResize();

    this.sidebarState.mode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(mode => this.mode = mode);

    this.sidebarState.mobileOverlayOpen$
      .pipe(takeUntil(this.destroy$))
      .subscribe(open => this.mobileOverlayOpen = open);

    this.subscribeToCloseSideBar();
    this.handleEmitEvent();
    this.watchReadNotification();
    this.watchNotification();
    this.watchGetNotificationFromMap();
    this.watchNotificationBulkAction();
    this.watchDeleteNotification();
  }

  // Called once from ngOnInit AND again on every one of the five websocket
  // notification topics below. Re-dispatching loadMyNotifications() on each
  // is fine (that effect uses switchMap, so a new dispatch just supersedes
  // whatever request was still in flight), but the store subscriptions used
  // to be re-created on every single call too, without ever unsubscribing —
  // leaking two more live subscriptions per event for as long as this
  // component (the app shell sidebar) stayed mounted, i.e. the whole session.
  // This was very likely the real cause of "data doesn't update until I
  // rotate my phone" — many overlapping stale subscriptions racing to set
  // the same fields from increasingly-old snapshots.
  private storeStateWatched = false;

  handleEmitEvent(): void {

    this.store.dispatch(loadMyNotifications());

    if (this.storeStateWatched) return;
    this.storeStateWatched = true;

    this.subscriptions.push(

      this.store.select(selectUser).subscribe(user => {
        this.userData = user;

        this.profilePhoto = user?.profilePhoto
          ? `data:image/jpeg;base64,${user.profilePhoto}`
          : null;

        // Seed the runtime sidebar mode from the user's saved "Sidebar display"
        // preference the first time it's seen this session (SidebarStateService
        // guards against re-seeding on later reloads). Unknown/missing values
        // default to 'collapsed' (icon rail), matching the backend's own
        // null-reads-as-collapsed rule (see UserMapper.resolveSidebarDisplay).
        const preference: SidebarDisplay = KNOWN_SIDEBAR_MODES.includes(user?.sidebarDisplay as SidebarDisplay)
          ? (user!.sidebarDisplay as SidebarDisplay)
          : 'collapsed';
        this.sidebarState.applyPreferredMode(preference);
      }),

      this.store.select(selectMyNotifications).subscribe(notifications => {
        this.notificationLength =
          notifications?.filter(notification => !notification.read).length ?? 0;
      })

    );

  }


  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path);
  }

  isPath(path: string): boolean {
    return this.currentRoute === '/' + path;;
  }

  isNotActive(): boolean {
    const paths = ['/dashboard/my-tasks', '/dashboard/my-notifications', '/dashboard/my-subscriptions', '/dashboard/my-faqs',
      '/dashboard/my-todos', '/dashboard/workspace', '/dashboard/profile', '/dashboard/settings'];
    return paths.some(route => this.currentRoute?.startsWith(route));
  }

  subscribeToCloseSideBar() {
    document.addEventListener('click', (event) => {
      if (!this.isClickInsideDropdown(event) && this.isMobile) {
        this.closeMobileOverlay();
      }
    });
  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('sidebarView');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  logout() {
    console.log('logging out')
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'Logout',
      confirmation: true
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((response: any) => {
      dialogRef.close();
      this.userService.logout();
      this.responseMessage = "you have successfully logged out"
      this.snackbarService.openSnackBar(this.responseMessage, '');
    });
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
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
