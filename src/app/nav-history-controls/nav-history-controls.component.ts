import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IconsModule } from '../icons/icons.module';
import { SnackBarService } from '../services/snack-bar.service';
import {
  NavControlsAppearance,
  NavControlsDockSide,
  NavControlsPosition,
  NavControlsService,
  NavControlsStyle
} from '../services/nav-controls.service';

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
 *
 * Within 'button', two extra per-device gestures on top of ordinary dragging
 * (some users find a floating control obstructive, some rely on it heavily —
 * this gives a spectrum from "gone for good" down to "out of the way for now"
 * without forcing everyone through Settings for either):
 *  - Long-press the pill, then (still holding) drag it onto the "x" target
 *    that appears — releasing there switches to 'off', same as the Settings
 *    toggle (reversible there too). A deliberate two-step gesture on purpose,
 *    so it can't fire from an ordinary drag-to-reposition.
 *  - Drag the pill (no long-press needed) and release it near either screen
 *    edge — collapses it to a small peek tab docked there instead of turning
 *    it off outright. Tap the tab to bring the full pill back.
 */
@Component({
  selector: 'app-nav-history-controls',
  standalone: true,
  imports: [CommonModule, IconsModule, DragDropModule],
  templateUrl: './nav-history-controls.component.html'
})
export class NavHistoryControlsComponent implements OnInit, OnDestroy {

  /**
   * CdkDrag only reads [cdkDragFreeDragPosition] to set its INITIAL position --
   * once the element has been dragged, CDK tracks the free-drag offset
   * internally, and simply changing the bound input again (e.g. after
   * "Reset position" in Settings) is a silent no-op. Reset needs to call
   * setFreeDragPosition() on the directive itself to actually move it.
   */
  @ViewChild(CdkDrag) private dragRef?: CdkDrag;

  /** The "drag here to hide" target — only rendered (and only queryable) once armed. */
  @ViewChild('dismissTarget') private dismissTargetRef?: ElementRef<HTMLElement>;

  private navigationCount = 0;
  hasGoneBack = false;

  style: NavControlsStyle = 'button';
  appearance: NavControlsAppearance = 'translucent';
  dragPosition: NavControlsPosition = { x: 0, y: 0 };

  docked: NavControlsDockSide = null;
  dockY = 160;

  /** True once a long-press on the pill has been held long enough to show the
   *  dismiss ("x") target; only meaningful mid-drag. */
  dismissArmed = false;
  /** True while dismissArmed and the pointer is currently over the dismiss target. */
  dismissHover = false;

  private pressTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly LONG_PRESS_MS = 450;
  private static readonly DISMISS_HOVER_RADIUS_PX = 44;
  private static readonly DOCK_EDGE_THRESHOLD_PX = 56;

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

  constructor(
    private location: Location,
    private router: Router,
    private navControls: NavControlsService,
    private snackBar: SnackBarService,
  ) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.navigationCount++);
  }

  ngOnInit(): void {
    let firstPositionEmission = true;
    this.subscriptions.push(
      this.navControls.style$.subscribe(style => this.style = style),
      this.navControls.appearance$.subscribe(appearance => this.appearance = appearance),
      this.navControls.position$.subscribe(saved => {
        this.dragPosition = saved ?? this.defaultPosition();
        // The first emission is just this component's own initial read, already
        // applied via the [cdkDragFreeDragPosition] template binding at create
        // time -- only emissions AFTER that (e.g. Settings' "Reset position")
        // need to be pushed into the already-rendered drag directive by hand.
        if (!firstPositionEmission) {
          this.dragRef?.setFreeDragPosition(this.dragPosition);
        }
        firstPositionEmission = false;
      }),
      this.navControls.docked$.subscribe(docked => this.docked = docked),
      this.navControls.dockY$.subscribe(y => { if (y != null) this.dockY = y; }),
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
    this.clearPressTimer();
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

  // ── Long-press → drag-to-dismiss, and drag-to-edge → dock ────────────────

  /** True once cdkDragStarted has actually fired for the current press --
   *  distinguishes "held still, never dragged" (onPressEnd must clean up,
   *  since cdkDragEnded never fires) from "dragged" (onDragEnded owns
   *  cleanup, and must not race with onPressEnd over which one resets
   *  dismissArmed/dismissHover first -- their firing order relative to each
   *  other for the SAME native pointerup isn't guaranteed). */
  private dragOccurred = false;

  /** Starts the long-press timer. Bound to (mousedown)/(touchstart) on the pill
   *  itself, alongside (not instead of) cdkDrag's own listeners on the same
   *  element -- both can observe the same native event independently. */
  onPressStart(): void {
    if (this.docked) return; // docked tab is tap-to-undock, not a long-press target
    this.clearPressTimer();
    this.dragOccurred = false;
    this.pressTimer = setTimeout(() => { this.dismissArmed = true; }, NavHistoryControlsComponent.LONG_PRESS_MS);
  }

  /** A quick press-and-release before the timer fired (a normal click, or a
   *  fast drag that starts moving right away), or a long-press held past the
   *  threshold but released WITHOUT ever actually dragging -- either way, if
   *  no drag occurred there's nothing for onDragEnded to clean up, so this is
   *  the only place that will reset dismissArmed/dismissHover for this press. */
  onPressEnd(): void {
    this.clearPressTimer();
    if (!this.dragOccurred) {
      this.dismissArmed = false;
      this.dismissHover = false;
    }
  }

  /** cdkDrag started actually moving the pill. If the long-press timer hasn't
   *  fired yet, this is an ordinary fast drag, not a hold-then-drag -- cancel
   *  it so the dismiss target never appears. If it already fired, dismissArmed
   *  is already true and stays that way for the rest of this drag. */
  onDragStarted(_event: CdkDragStart): void {
    this.dragOccurred = true;
    if (this.pressTimer) this.clearPressTimer();
  }

  /** Only does anything meaningful once armed -- tracks whether the pointer is
   *  currently close enough to the dismiss target to highlight it. */
  onDragMoved(event: CdkDragMove): void {
    if (!this.dismissArmed || !this.dismissTargetRef) return;
    const rect = this.dismissTargetRef.nativeElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = event.pointerPosition.x - cx;
    const dy = event.pointerPosition.y - cy;
    this.dismissHover = Math.hypot(dx, dy) <= NavHistoryControlsComponent.DISMISS_HOVER_RADIUS_PX;
  }

  onDragEnded(event: CdkDragEnd): void {
    this.clearPressTimer();

    if (this.dismissArmed && this.dismissHover) {
      // Released on the "x" -- hide the control entirely, same effect as
      // choosing "Off" in Settings (and reversible there the same way).
      // Deliberately does NOT save a new position: this drag was a dismiss
      // gesture, not a reposition, so wherever it's re-enabled from Settings
      // it should reappear right where it always was.
      this.dismissArmed = false;
      this.dismissHover = false;
      this.navControls.setStyle('off');
      this.snackBar.openSnackBar('In-app navigation hidden — turn it back on any time in Settings.', '');
      return;
    }
    this.dismissArmed = false;
    this.dismissHover = false;

    if (typeof window !== 'undefined') {
      const dockEdge = this.edgeDockSideFor(event.dropPoint.x);
      if (dockEdge) {
        this.navControls.setDocked(dockEdge, event.dropPoint.y);
        return;
      }
    }

    // Not dismissed, not docked -- an ordinary reposition. Also the path that
    // undocks: dragging a docked tab back out and releasing away from either
    // edge lands here, clearing `docked` via the normal position update.
    if (this.docked) this.navControls.setDocked(null);
    const point = event.source.getFreeDragPosition();
    this.navControls.setPosition(point); // pushes back through position$, which sets dragPosition
  }

  /** Tap (not drag) on the collapsed peek tab brings the full pill back. */
  onDockedTabClick(): void {
    this.navControls.setDocked(null);
  }

  private edgeDockSideFor(clientX: number): NavControlsDockSide {
    if (typeof window === 'undefined') return null;
    if (clientX <= NavHistoryControlsComponent.DOCK_EDGE_THRESHOLD_PX) return 'left';
    if (window.innerWidth - clientX <= NavHistoryControlsComponent.DOCK_EDGE_THRESHOLD_PX) return 'right';
    return null;
  }

  private clearPressTimer(): void {
    if (this.pressTimer) {
      clearTimeout(this.pressTimer);
      this.pressTimer = null;
    }
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
