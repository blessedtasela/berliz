import {
  Component,
  OnInit,
  HostListener,
  Input,
  ViewChild
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription, takeUntil } from 'rxjs';



import { UserService } from 'src/app/services/user.service';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadUser } from 'src/app/state/user/user.actions';
import { Store } from '@ngrx/store';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications } from 'src/app/state/notification/notification.actions';
import { GlobalSearchComponent } from '../global-search/global-search.component';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']

})
export class TopBarComponent implements OnInit {
  openMenu = false;
  mdScreen = false;
  userData!: Users | null;
  profilePhoto: string | null = null;
  currentRoute: string | null = null;

  notificationLength = 0;
  notificationDropdown = false;

  /**
   * Below `md`, the bar collapses to a search-only row: logo, breadcrumb, bell,
   * home and profile step aside so the input and its results own the full
   * width. Above `md` the flag is inert — every element it hides carries a
   * `md:` class that wins back the display.
   */
  isMobileSearchOpen = false;

  @ViewChild('globalSearch') globalSearch?: GlobalSearchComponent;

  destroy$ = new Subject<void>();

  subscriptions: Subscription[] = [];

  // Still consumed by <app-profile [search]="isSearch">.
  @Input() isSearch = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private dialog: MatDialog,
    private store: Store,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private rxStompService: RxStompService,
    private authService: AuthService
  ) {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      return;
    }
    this.onResize();
    this.subscribeToCloseSideBar();
    this.store.dispatch(loadUser());
    this.store.dispatch(loadMyNotifications());
    this.handleEmitEvent();
    this.registerNotificationTopics();
    this.watchUpdateProfilePhoto();
    this.watchUpdateUser();
    this.watchUpdateUserRole();
    this.watchUpdateUserStatus();
  }

  handleEmitEvent(): void {

    this.subscriptions.push(

      this.store.select(selectUser).subscribe(user => {
        this.userData = user;

        this.profilePhoto = user?.profilePhoto
          ? `data:image/jpeg;base64,${user.profilePhoto}`
          : null;
      }),

      this.store.select(selectMyNotifications).subscribe(notifications => {
        this.notificationLength =
          notifications?.filter(notification => !notification.read).length ?? 0;
      })

    );

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  openMobileSearch() {
    if (this.isMobileSearchOpen) {
      return;
    }
    this.isMobileSearchOpen = true;
    // The input is only rendered-visible after this change is flushed, so hand
    // focus over on the next tick — one tap gets the user typing.
    setTimeout(() => this.globalSearch?.focusInput());
  }

  closeMobileSearch() {
    this.isMobileSearchOpen = false;
    this.globalSearch?.clear();
  }

  toggleNotificationDropdown() {
    this.notificationDropdown = !this.notificationDropdown;
  }

  closeNotificationDropdown() {
    this.notificationDropdown = false;
  }

  toggleSidebar(): void {
    this.openMenu = !this.openMenu;
    this.mdScreen = !this.mdScreen;
  }

  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path) ?? false;
  }

  @HostListener('window:resize')
  onResize(): void {
    this.openMenu = window.innerWidth >= 768;

    // Desktop focus also raises `activated`; make sure the flag never survives
    // a resize back down into the mobile layout.
    if (window.innerWidth >= 768) {
      this.isMobileSearchOpen = false;
    }
  }

  subscribeToCloseSideBar() {
    document.addEventListener('mousedown', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('sidebarView');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeDropdown() {
    this.openMenu = false;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  private registerNotificationTopics() {
    const topics = [
      '/topic/getNotificationFromMap',
      '/topic/notification',
      '/topic/notificationBulkAction',
      '/topic/readNotification',
      '/topic/deleteNotification',
      '/topic/activateAccount',
      '/topic/deactivateAccount',
      '/topic/updateUserStatus',
      '/topic/updateUserRole',
      '/topic/updateUser'
    ];

    topics.forEach(topic => {
      this.rxStompService.watch(topic).subscribe(() => {
        this.handleEmitEvent();
      });
    });
  }

  watchUpdateProfilePhoto() {
    this.rxStompService.watch('/topic/updateProfilePhoto').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdateUser() {
    this.rxStompService.watch('/topic/updateUser').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdateUserRole() {
    this.rxStompService.watch('/topic/updateUserRole').subscribe(() => {
      this.handleEmitEvent();
    });
  }

  watchUpdateUserStatus() {
    this.rxStompService.watch('/topic/updateUserStatus').subscribe(() => {
      this.handleEmitEvent();
    });
  }
}