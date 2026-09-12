import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IconsModule } from '../icons/icons.module';
import { NavControlsAppearance, NavControlsPosition, NavControlsService, NavControlsStyle } from '../services/nav-controls.service';

/**
 * The app's own back/forward navigation chrome — mounted once in AppComponent
 * so it shows on every layout. Exists because the browser's own back/forward
 * buttons don't exist at all once this is installed as a PWA / opened in a
 * chromeless window.
 *
 * Three user-selectable styles (NavControlsService, wired into
 * UserProfileSettingsComponent's "In-app navigation" section):
 *  - 'button' (default): a draggable pill anchored at the bottom of the
 *    screen, translucent or solid white per `appearance` (same choice as the
 *    top bar's own NavbarStyleService) — deliberately never a loud color so
 *    it never fully hides the content underneath it, and draggable so a
 *    user can move it off anything it happens to land on.
 *  - 'swipe': no visible control at all — swipe right from the left edge,
 *    same gesture as iOS's edge-swipe-back. Because a real edge-swipe is
 *    also a gesture the BROWSER itself recognizes (Android Chrome's own
 *    "swipe from edge to go back", which navigates the browser -- not this
 *    app's router -- and can trigger a full page reload), this style also
 *    suppresses that native gesture for the duration of a tracked swipe.
 *  - 'off': render nothing; the user relies on their browser's native
 *    back/forward (this component never disables that, it's purely additive).
 *
 * Shown only when there's actually somewhere to go, not as a permanent
 * fixture: hidden until there's an in-app page to go back to, and "forward"
 * only appears once "back" has actually been used.
 */
@Component({
  selector: 'app-nav-history-controls',
  standalone: true,
  imports: [CommonModule, IconsModule, DragDropModule],
  templateUrl: './nav-history-controls.component.html'
})
export class NavHistoryControlsComponent implements OnInit, OnDestroy {

  private navigationCount = 0;
  hasGoneBack = false;

  style: NavControlsStyle = 'button';
  appearance: NavControlsAppearance = 'translucent';
  dragPosition: NavControlsPosition = { x: 0, y: 0 };

  /** Left-edge swipe tracking for 'swipe' style — only armed while a touch actually started near the edge. */
  private swipeTracking = false;
  private swipeStartX = 0;
  private swipeStartY = 0;
  private static readonly EDGE_ZONE_PX = 24;
  private static readonly SWIPE_THRESHOLD_PX = 70;
  private static readonly SWIPE_MAX_VERTICAL_PX = 60;

  private subscriptions: Subscription[] = [];

  /**
   * Bound manually via the raw DOM API (not Angular's @HostListener) with
   * { passive: false }. Zone.js patches touchstart/touchmove listeners added
   * through Angular's event binding to be passive by default (a scroll-perf
   * optimization) -- calling preventDefault() from inside one of those is a
   * silent no-op, which is exactly why the native edge-swipe used to win over
   * this component's own gesture handling and hand off to the browser (full
   * page reload) instead of the in-app router.
   */
  private readonly onTouchStartBound = (event: TouchEvent) => this.handleTouchStart(event);
  private readonly onTouchMoveBound = (event: TouchEvent) => this.handleTouchMove(event);
  private readonly onTouchEndBound = (event: TouchEvent) => this.handleTouchEnd(event);
  private readonly onTouchCancelBound = () => { this.swipeTracking = false; };

  constructor(private location: Location, private router: Router, private navControls: NavControlsService) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.navigationCount++);
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.navControls.style$.subscribe(style => this.style = style),
      this.navControls.appearance$.subscribe(appearance => this.appearance = appearance),
      this.navControls.position$.subscribe(saved => this.dragPosition = saved ?? this.defaultPosition()),
    );

    if (typeof document !== 'undefined') {
      document.addEventListener('touchstart', this.onTouchStartBound, { passive: false });
      document.addEventListener('touchmove', this.onTouchMoveBound, { passive: false });
      document.addEventListener('touchend', this.onTouchEndBound);
      document.addEventListener('touchcancel', this.onTouchCancelBound);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (typeof document !== 'undefined') {
      document.removeEventListener('touchstart', this.onTouchStartBound);
      document.removeEventListener('touchmove', this.onTouchMoveBound);
      document.removeEventListener('touchend', this.onTouchEndBound);
      document.removeEventListener('touchcancel', this.onTouchCancelBound);
    }
  }

  private defaultPosition(): NavControlsPosition {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    // Horizontally centered, resting just above the bottom edge — the
    // container itself is anchored bottom-left (see the template), so this
    // offset is relative to that anchor, not the viewport origin.
    return { x: Math.max(0, window.innerWidth / 2 - 76), y: 0 };
  }

  get canGoBack(): boolean {
    return this.navigationCount > 1;
  }

  goBack(): void {
    if (!this.canGoBack) return;
    this.hasGoneBack = true;
    this.location.back();
  }

  goForward(): void {
    this.location.forward();
  }

  /** Frosted-glass or solid-white, matching the top bar's own translucent/solid choice. */
  get pillClasses(): string {
    return this.appearance === 'solid'
      ? 'bg-white border border-gray-200'
      : 'bg-white/70 backdrop-blur-md border border-gray-200/70';
  }

  onDragEnded(event: CdkDragEnd): void {
    const point = event.source.getFreeDragPosition();
    this.navControls.setPosition(point); // pushes back through position$, which sets dragPosition
  }

  // ── Edge-swipe-back (only active while style === 'swipe') ────────────────
  // Bound via the raw DOM API in ngOnInit, not @HostListener — see the field
  // doc comment above for why preventDefault() needs that.

  private handleTouchStart(event: TouchEvent): void {
    if (this.style !== 'swipe' || !this.canGoBack) return;
    const touch = event.touches[0];
    if (!touch || touch.clientX > NavHistoryControlsComponent.EDGE_ZONE_PX) return;
    this.swipeTracking = true;
    this.swipeStartX = touch.clientX;
    this.swipeStartY = touch.clientY;
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.swipeTracking) return;
    const touch = event.touches[0];
    if (!touch) return;
    const dy = Math.abs(touch.clientY - this.swipeStartY);
    if (dy > NavHistoryControlsComponent.SWIPE_MAX_VERTICAL_PX) {
      // Turned into a vertical scroll -- not our gesture, let go of it and
      // stop suppressing the browser's default handling for this touch.
      this.swipeTracking = false;
      return;
    }
    // Still tracking a plausible horizontal swipe from the edge -- suppress
    // the browser's OWN edge-swipe-back (and any rubber-banding) for this
    // touch sequence so it doesn't fire alongside (or instead of) the
    // in-app goBack() below, which is what used to cause a full page
    // reload / native navigation on the actual swipe gesture.
    event.preventDefault();
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.swipeTracking) return;
    this.swipeTracking = false;

    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - this.swipeStartX;
    const dy = Math.abs(touch.clientY - this.swipeStartY);
    if (dx >= NavHistoryControlsComponent.SWIPE_THRESHOLD_PX && dy <= NavHistoryControlsComponent.SWIPE_MAX_VERTICAL_PX) {
      this.goBack();
    }
  }
}
