import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationError } from '@angular/router';
import { BlurService } from './services/blur.service';
import { MatDialog } from '@angular/material/dialog';
import { SidebarDisplay, SidebarStateService } from './services/sidebar-state.service';
import { NewsletterPopupComponent } from './shared/newsletter-popup/newsletter-popup.component';
import { NewsletterTriggerService } from './shared/newsletter-popup/newsletter-trigger.service';
import { InactivityService } from './services/inactivity.service';
import { SeoService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Berliz';
  activeLayout: 'login' | 'topbar' | 'sidebar' = 'login';
  isBlurred$ = this.blurService.blur$;
  /**
   * Desktop sidebar display mode, mirrored from SidebarStateService so the page
   * wrapper knows how much horizontal space (if any) to reserve. Below `md` the
   * sidebar never reserves space — it is either a temporary overlay or fully
   * hidden behind a floating reopen button — so this only matters at `md` and up.
   */
  sidebarMode: SidebarDisplay = 'expanded';

  constructor(
    private router: Router,
    private blurService: BlurService,
    private dialog: MatDialog,
    private sidebarState: SidebarStateService,
    private newsletterTrigger: NewsletterTriggerService,
    private inactivityService: InactivityService,
    private seoService: SeoService,
  ) {
    this.sidebarState.mode$.subscribe(mode => {
      this.sidebarMode = mode;
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateLayout(event.urlAfterRedirects);
        // Title/meta description/OG/Twitter/canonical/JSON-LD for the page we
        // just landed on. Same NavigationEnd hook as updateLayout() above,
        // driven off the post-redirect URL so redirecting routes (e.g.
        // /testimonials -> /services) get the SEO data for where they land.
        this.seoService.updateForRoute(event.urlAfterRedirects);
        // Every completed navigation is one "pageview" of activity, and is also
        // the only place we consider showing the newsletter popup.
        this.newsletterTrigger.registerPageview();
        this.maybeShowNewsletter();
      }

      // Every lazy route (dashboard included) fetches its chunk on first
      // navigation -- there's no preloading strategy and no service worker, so
      // a tab left open across a deploy is still holding chunk hashes that no
      // longer exist on the server. That failure surfaces here as
      // NavigationError, not an exception anywhere visible, so without this
      // the click/login just silently does nothing and only a manual refresh
      // (which fetches the current build) recovers. A hard reload of the
      // attempted URL does the same thing automatically.
      if (event instanceof NavigationError) {
        const msg = String((event.error as any)?.message || event.error || '');
        if (/loading chunk|chunkloaderror|failed to fetch dynamically imported module/i.test(msg)) {
          window.location.href = event.url;
        }
      }
    });

    this.dialog.afterOpened.subscribe(() => {
      this.blurService.enable();
    });

    this.dialog.afterAllClosed.subscribe(() => {
      this.blurService.disable();
    });
  }

  ngOnInit() {
    // Single, global inactivity watch for the whole app. Expired access tokens
    // are refreshed silently by AuthInterceptor while the user is active; this
    // is what ends a session that has genuinely been left unattended.
    this.inactivityService.start();
  }
  private updateLayout(url: string) {

    // LOGIN ROUTES
    if (
      url === '/login' ||
      url.startsWith('/login/') ||
      url.startsWith('/sign-up') ||
      url.startsWith('/quick-sign-up') ||
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
      url.startsWith('/trainers') ||
      url.startsWith('/testimonials') ||
      url.startsWith('/equipments') ||
      url.startsWith('/exercises') ||
      url.startsWith('/members') ||
      url.startsWith('/user') ||
      url.startsWith('/faqs') ||
      url.startsWith('/report-problem') ||
      url.startsWith('/help-center') ||
      url.startsWith('/terms') ||
      url.startsWith('/privacy') ||
      url.startsWith('/shop')
    ) {
      this.activeLayout = 'topbar';
      return;
    }

    // EVERYTHING ELSE USES SIDEBAR
    this.activeLayout = 'sidebar';
  }

  /**
   * Newsletter popup trigger. Runs after `updateLayout()` on every
   * `NavigationEnd`, so `activeLayout` already reflects the route we just
   * landed on.
   *
   * Gate: the public marketing site only (`topbar` layout — home, pricing,
   * about, contact, blog, services, centers, trainers, testimonials,
   * equipments). Never on `login` (sign-up / reset flows, where a second email
   * field is actively confusing) and never on `sidebar` (the signed-in app,
   * where marketing interstitials do not belong). `/` redirects to `/home`, and
   * `NavigationEnd.urlAfterRedirects` is what feeds `updateLayout`, so the true
   * landing page is covered by the topbar gate.
   */
  private maybeShowNewsletter() {
    if (this.activeLayout !== 'topbar') return;
    if (!this.newsletterTrigger.shouldShow()) return;

    // Record the impression *now*, not when the dialog renders: a slow page (or
    // a fast second navigation inside the delay window) must not be able to
    // schedule a duplicate open.
    const delay = this.newsletterTrigger.openDelayMs();
    this.newsletterTrigger.markShown();

    setTimeout(() => {
      const dialogRef = this.dialog.open(NewsletterPopupComponent, {
        width: '400px',
        maxWidth: '95vw',
      });

      dialogRef.afterClosed().subscribe(() => {
        // A successful subscribe already set `subscribed`; anything else is an
        // explicit dismissal and earns the longer back-off.
        if (!this.newsletterTrigger.subscribed) {
          this.newsletterTrigger.markDismissed();
        }
      });
    }, delay);
  }
}
