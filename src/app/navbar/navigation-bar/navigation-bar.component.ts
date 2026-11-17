import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Users } from 'src/app/models/users.interface';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectMyNotifications } from 'src/app/state/notification/notification.selector';
import { loadMyNotifications } from 'src/app/state/notification/notification.actions';

@Component({
    selector: 'app-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.css'],
    standalone: false
})

export class NavigationBarComponent implements OnInit, OnDestroy {
  menuStatus: boolean = false;
  scrolled: boolean = false;
  currentRoute: any;

  // GN-49: this bar mounts on every public page, signed in or not (see
  // AppComponent#updateLayout) -- when signed in it also needs the bell and
  // account menu TopBarComponent shows on /dashboard, so a signed-in visitor
  // browsing a public page (or the home page itself) isn't stuck looking
  // logged-out beyond a plain "Dashboard" link.
  userData: Users | null = null;
  notificationLength = 0;
  notificationDropdown = false;
  private subscriptions: Subscription[] = [];
  navLinks = [
  { label: 'Home', path: '/home' },
  { label: 'Contact', path: '/contact' },
  { label: 'About', path: '/about' },
  { label: 'Centers', path: '/centers' },
  { label: 'Services', path: '/services' },
  { label: 'Disciplines', path: '/disciplines' },
  { label: 'Trainers', path: '/trainers' },
  { label: 'Members', path: '/members' },
  // Optional: products
  // { label: 'Products', path: '/products' }
];


  constructor(private router: Router,
    private authService: AuthService,
    private store: Store,
    @Inject(PLATFORM_ID) private platformId: Object,) {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
      if (event instanceof NavigationStart) {
        this.closeDropdown();
      }
    });
  }

  ngOnInit() {
    // No `window`/`document` during build-time prerendering.
    if (!isPlatformBrowser(this.platformId)) return;

    // this.subscribeToCloseNavBarOnMouseDown()
    this.subscribeToCloseNavBarOnScroll()
    // this.subscribeToCloseNavBarOnClick()
    this.scrolled = window.scrollY > 8;

    if (this.getUser()) {
      this.store.dispatch(loadUser());
      this.store.dispatch(loadMyNotifications());
      this.subscriptions.push(
        this.store.select(selectUser).subscribe(user => this.userData = user),
        this.store.select(selectMyNotifications).subscribe(notifications => {
          this.notificationLength = notifications?.filter(n => !n.read).length ?? 0;
        })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  toggleNotificationDropdown() {
    this.notificationDropdown = !this.notificationDropdown;
  }

  closeNotificationDropdown() {
    this.notificationDropdown = false;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled = window.scrollY > 8;
  }

  handleEmitEvent() {
  }

  navMenu(item: any): void {
    if (item === 'align-justify') {
      this.menuStatus = true;
    } else {
      this.menuStatus = false;
    }
  }

  subscribeToCloseNavBarOnMouseDown() {
    document.addEventListener('mousedown', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  subscribeToCloseNavBarOnClick() {
    document.addEventListener('click', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  subscribeToCloseNavBarOnScroll() {
    document.addEventListener('scroll', (event) => {
      if (!this.isClickInsideDropdown(event)) {
        this.closeDropdown();
      }
    });
  }

  isClickInsideDropdown(event: Event): any {
    const dropdownElement = document.getElementById('navbarView');
    return dropdownElement && dropdownElement.contains(event.target as Node);
  }

  closeDropdown() {
    this.menuStatus = false;
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }

  isActive(path: string): boolean {
    return this.currentRoute?.startsWith('/' + path);
  }

  getUser(): boolean {
    return this.authService.isAuthenticated();
  }

}
