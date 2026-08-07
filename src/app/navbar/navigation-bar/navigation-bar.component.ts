import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})

export class NavigationBarComponent implements OnInit {
  menuStatus: boolean = false;
  scrolled: boolean = false;
  currentRoute: any;
  navLinks = [
  { label: 'Home', path: '/home' },
  { label: 'Contact', path: '/contact' },
  { label: 'About', path: '/about' },
  { label: 'Centers', path: '/centers' },
  { label: 'Programs', path: '/services' },
  { label: 'Trainers', path: '/trainers' },
  { label: 'Members', path: '/members' },
  // Optional: products
  // { label: 'Products', path: '/products' }
];


  constructor(private router: Router,
    private authService: AuthService,) {
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
    // this.subscribeToCloseNavBarOnMouseDown()
    this.subscribeToCloseNavBarOnScroll()
    // this.subscribeToCloseNavBarOnClick()
    this.scrolled = window.scrollY > 8;
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
