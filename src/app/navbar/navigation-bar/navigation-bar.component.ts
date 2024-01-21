import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Route, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})

export class NavigationBarComponent implements OnInit {
  menuStatus: boolean = false;
  currentRoute: any;

  constructor(private router: Router,
    private authService: AuthenticationService) {
    this.currentRoute = this.router.url;
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  ngOnInit() {
    this.subscribeToCloseNavBarOnMouseDown()
    this.subscribeToCloseNavBarOnScroll()
    this.subscribeToCloseNavBarOnClick()
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
