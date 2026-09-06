import { CommonModule, Location } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { filter } from 'rxjs/operators';
import { IconsModule } from '../icons/icons.module';
import { NavControlsPosition, NavControlsService, NavControlsStyle } from '../services/nav-controls.service';

/**
 * The app's own back/forward navigation chrome — mounted once in AppComponent
 * so it shows on every layout. Exists because the browser's own back/forward
 * buttons don't exist at all once this is installed as a PWA / opened in a
 * chromeless window.
 *
 * Three user-selectable styles (NavControlsService, wired into
 * UserProfileSettingsComponent's "In-app navigation" section):
 *  - 'button' (default): a draggable, frosted-glass pill anchored at the
 *    bottom of the screen — deliberately translucent (not a solid color)
 *    so it never fully hides the content underneath it, and draggable so a
 *    user can move it off anything it happens to land on.
 *  - 'swipe': no visible control at all — swipe right from the left edge,
 *    same gesture as iOS's edge-swipe-back.
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
export class NavHistoryControlsComponent implements OnInit {

  private navigationCount = 0;
  hasGoneBack = false;

  style: NavControlsStyle = 'button';
  dragPosition: NavControlsPosition = { x: 0, y: 0 };

  /** Left-edge swipe tracking for 'swipe' style — only armed while a touch actually started near the edge. */
  private swipeTracking = false;
  private swipeStartX = 0;
  private swipeStartY = 0;
  private static readonly EDGE_ZONE_PX = 24;
  private static readonly SWIPE_THRESHOLD_PX = 70;
  private static readonly SWIPE_MAX_VERTICAL_PX = 60;

  constructor(private location: Location, private router: Router, private navControls: NavControlsService) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.navigationCount++);
  }

  ngOnInit(): void {
    this.style = this.navControls.style;

    const saved = this.navControls.getPosition();
    if (saved) {
      this.dragPosition = saved;
    } else if (typeof window !== 'undefined') {
      // Default: horizontally centered, resting just above the bottom edge —
      // the container itself is anchored bottom-left (see the template), so
      // this offset is relative to that anchor, not the viewport origin.
      this.dragPosition = { x: Math.max(0, window.innerWidth / 2 - 76), y: 0 };
    }
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

  onDragEnded(event: CdkDragEnd): void {
    const point = event.source.getFreeDragPosition();
    this.dragPosition = point;
    this.navControls.setPosition(point);
  }

  // ── Edge-swipe-back (only active while style === 'swipe') ────────────────

  @HostListener('window:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.style !== 'swipe' || !this.canGoBack) return;
    const touch = event.touches[0];
    if (!touch || touch.clientX > NavHistoryControlsComponent.EDGE_ZONE_PX) return;
    this.swipeTracking = true;
    this.swipeStartX = touch.clientX;
    this.swipeStartY = touch.clientY;
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
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

  @HostListener('window:touchcancel')
  onTouchCancel(): void {
    this.swipeTracking = false;
  }
}
