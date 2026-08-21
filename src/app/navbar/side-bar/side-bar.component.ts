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
  mode: SidebarDisplay = 'hidden';
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

  /** Mobile collapsed rail's own expand button — same reopen behavior as the top-bar toggle. */
  openSidebar(): void {
    this.sidebarState.openSidebar();
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
        // guards against re-seeding on later reloads). Skip while `user` is still
        // null/loading — store.select() emits synchronously with whatever the
        // store held BEFORE the /user/getUser response arrives, and treating
        // that transient null as "no preference saved" used to permanently latch
        // in the viewport-based default a moment before the REAL saved value
        // showed up, since applyPreferredMode only ever applies once per session.
        // No preference saved yet (backend sends null — see
        // UserMapper.resolveSidebarDisplay) picks a default based on viewport:
        // desktop opens expanded, mobile stays hidden behind the menu button.
        if (user) {
          const preference: SidebarDisplay = KNOWN_SIDEBAR_MODES.includes(user.sidebarDisplay as SidebarDisplay)
            ? (user.sidebarDisplay as SidebarDisplay)
            : (this.sidebarState.isMobileViewport() ? 'hidden' : 'expanded');
          this.sidebarState.applyPreferredMode(preference);
        }
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
    const target = event.target as HTMLElement;
    const dropdownElement = document.getElementById('sidebarView');
    if (dropdownElement && dropdownElement.contains(target)) {
      return true;
    }
    // The floating reopen button lives in the top bar, outside #sidebarView.
    // Without this, clicking it opened the overlay and this same document-level
    // click listener, seeing a click "outside" #sidebarView, closed it again in
    // the same event — the button appeared to do nothing.
    return !!target.closest('[aria-label="Show sidebar"]');
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
