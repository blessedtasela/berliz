import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, NavigationError } from '@angular/router';
import { BlurService } from './services/blur.service';
import { MatDialog } from '@angular/material/dialog';
import { SidebarDisplay, SidebarStateService } from './services/sidebar-state.service';
import { NewsletterPopupComponent } from './shared/newsletter-popup/newsletter-popup.component';
import { NewsletterTriggerService } from './shared/newsletter-popup/newsletter-trigger.service';
import { InactivityService } from './services/inactivity.service';
import { SeoService } from './services/seo.service';
import { ScrollRestorationService } from './services/scroll-restoration.service';
import { AuthService } from './services/auth.service';

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
    private scrollRestoration: ScrollRestorationService,
    private authService: AuthService,
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
        const msg = String((event.error as any)?.message || (event.error as any)?.name || event.error || '');
        if (/chunkloaderror|loading chunk [\w-]+ failed|loading css chunk|failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|not a valid javascript mime type|responded with a mime type of "text\/html"/i.test(msg)) {
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
    // Keeps your scroll position across a hard refresh -- see the service
    // doc comment for why this doesn't just come from the browser for free.
    this.scrollRestoration.init();
  }
  private updateLayout(url: string) {

    // The chrome is chosen by the ROUTE, never by auth state. A signed-in user
    // browsing a public page — a trainer's/center's public page, /members, the
    // marketing site, "Home" from the footer — gets the PUBLIC top navbar
    // there, exactly like a logged-out visitor, instead of being stuck behind
    // the dashboard side/top bar. The public navbar already shows a
    // "Dashboard" link once you're signed in, so you can't get stranded. The
    // dashboard chrome shows ONLY on genuinely protected routes (the
    // /dashboard subtree, which contains every admin page too); AuthGuard on
    // those still bounces a logged-out hit to /login before this runs.
    const path = url.split(/[?#]/)[0];

    // LOGIN / AUTH-FLOW ROUTES — bare login chrome, no matter the auth state.
    if (
      path === '/login' ||
      path.startsWith('/login/') ||
      path.startsWith('/sign-up') ||
      path.startsWith('/quick-sign-up') ||
      path.startsWith('/user/activate') ||
      path.startsWith('/reset-password') ||
      path.startsWith('/forgot-password')
    ) {
      this.activeLayout = 'login';
      return;
    }

    // PROTECTED APP ROUTES — the whole /dashboard subtree.
    if (path === '/dashboard' || path.startsWith('/dashboard/')) {
      this.activeLayout = 'sidebar';
      return;
    }

    // EVERYTHING ELSE — the public marketing / browse site, plus the 404
    // wildcard. Public navbar + footer, signed in or not.
    this.activeLayout = 'topbar';
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
    // The public navbar now also renders for signed-in users on public pages
    // (see updateLayout) — but a marketing/newsletter interstitial still has no
    // place in front of someone who already has an account.
    if (this.authService.isAuthenticated()) return;
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
