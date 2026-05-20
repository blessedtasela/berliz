import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BlurService } from './services/blur.service';
import { MatDialog } from '@angular/material/dialog';
import { SidebarStateService } from './services/sidebar-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Berliz';
  activeLayout: 'login' | 'topbar' | 'sidebar' = 'login';
  isBlurred$ = this.blurService.blur$;
  sidebarOpen = false;

  constructor(
    private router: Router,
    private blurService: BlurService,
    private dialog: MatDialog,
    private sidebarState: SidebarStateService
  ) {
    this.sidebarState.sidebarOpen$.subscribe(open => {
      this.sidebarOpen = open;
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateLayout(event.urlAfterRedirects);
      }
    });

    this.dialog.afterOpened.subscribe(() => {
      this.blurService.enable();
    });

    this.dialog.afterAllClosed.subscribe(() => {
      this.blurService.disable();
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
      url.startsWith('/blog') ||
      url.startsWith('/home') ||
      url.startsWith('/services') ||
      url.startsWith('/centers') ||
      url.startsWith('/trainers')
    ) {
      this.activeLayout = 'topbar';
      return;
    }

    // EVERYTHING ELSE USES SIDEBAR
    this.activeLayout = 'sidebar';
  }
}
