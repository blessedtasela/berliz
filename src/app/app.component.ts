import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BlurService } from './services/blur.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Berliz';
  activeLayout: 'login' | 'topbar' | 'sidebar' = 'login';
  isBlurred = false;

  constructor(
    private router: Router,
    private blurService: BlurService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateLayout(event.urlAfterRedirects);
      }
    });

    this.blurService.blur$.subscribe(state => {
      this.isBlurred = state;
    });
  }

  private updateLayout(url: string) {

    // LOGIN ROUTES
    if (
      url === '/login' ||
      url.startsWith('/user/activate') ||
      url.startsWith('/reset-password') ||
      url.startsWith('/forgot-password')
    ) {
      this.activeLayout = 'login';
      return;
    }

    // PUBLIC TOPBAR ROUTES
    if (
      url.startsWith('/pricing') ||
      url.startsWith('/about') ||
      url.startsWith('/contact') ||
      url.startsWith('/blog')
    ) {
      this.activeLayout = 'topbar';
      return;
    }

    // EVERYTHING ELSE USES SIDEBAR
    this.activeLayout = 'sidebar';
  }
}
