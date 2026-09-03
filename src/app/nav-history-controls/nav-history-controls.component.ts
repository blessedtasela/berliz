import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconsModule } from '../icons/icons.module';

/**
 * Floating back/forward controls, mounted once in AppComponent so they show
 * on every layout (login, public topbar, signed-in sidebar) -- the app's own
 * navigation chrome rather than relying on the browser's back/forward
 * buttons, which don't exist at all once this is installed as a PWA / opened
 * in a chromeless window.
 *
 * "Forward" always renders enabled: there's no reliable way to know whether
 * the browser actually has forward history, and `location.forward()` is a
 * harmless no-op when it doesn't -- same as clicking a browser's own forward
 * button with nothing ahead of it.
 */
@Component({
  selector: 'app-nav-history-controls',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './nav-history-controls.component.html'
})
export class NavHistoryControlsComponent {

  /** Completed in-app navigations this tab has made. 0 means we're still on
   *  the page the app booted into, so "back" would leave the app entirely --
   *  disabled until there's actually somewhere in-app to go back to. */
  private navigationCount = 0;

  constructor(private location: Location, private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.navigationCount++);
  }

  get canGoBack(): boolean {
    return this.navigationCount > 1;
  }

  goBack(): void {
    if (!this.canGoBack) return;
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }
}
