import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})

export class NavigationBarComponent implements OnInit {
  menuStatus: boolean;


  constructor(private router: ActivatedRoute,
    private authService: AuthenticationService) {
    this.menuStatus = false
  }

  ngOnInit() {
    this.subscribeToCloseSideBar()
  }

  navMenu(item: any): void {
    if (item === 'align-justify') {
      this.menuStatus = true;
    } else {
      this.menuStatus = false;
    }
  }

  subscribeToCloseSideBar() {
    document.addEventListener('click', (event) => {
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
    return this.router.snapshot.routeConfig?.path === path;
  }

  getUser(): boolean {
    return this.authService.isAuthenticated();
  }
}
