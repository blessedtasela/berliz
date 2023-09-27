import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})

export class NavigationBarComponent {
  menuStatus: boolean;


  constructor(private router: ActivatedRoute,
    private authService: AuthenticationService) {
    this.menuStatus = false
  }

  navMenu(item: any): void {
    if (item === 'align-justify') {
      this.menuStatus = true;
    } else {
      this.menuStatus = false;
    }
  }

  isActive(path: string): boolean {
    return this.router.snapshot.routeConfig?.path === path;
  }

  getUser(): boolean {
    return this.authService.isAuthenticated();
  }
}
