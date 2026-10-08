import { Component } from '@angular/core';
import { TrainersDetailsComponent } from 'src/app/trainers/trainers-details/trainers-details.component';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { LocationMenuFooter, LocationMenuItem } from 'src/app/shared/locations-menu/locations-menu.component';

/**
 * Light-themed, dashboard-native trainer profile — same route param, same
 * data (all fetching/state lives in the parent), different template. The
 * public /trainers/:name page is intentionally dark/cinematic; a signed-in
 * user browsing from inside the dashboard shell shouldn't hit a black page
 * in the middle of an otherwise white/gray-50 app.
 */
@Component({
    selector: 'app-dashboard-trainer-detail',
    templateUrl: './dashboard-trainer-detail.component.html',
    standalone: false
})
export class DashboardTrainerDetailComponent extends TrainersDetailsComponent {

  resolveStrapiUrl = resolveStrapiUrl;

  private menuItemsFor: unknown;
  private menuItemsCache: LocationMenuItem[] | null = null;
  private menuFooterFor: unknown;
  private menuFooterCache: LocationMenuFooter | null = null;

  protected override get likersRoutePrefix(): string {
    return '/dashboard/user';
  }

  get photoUrl(): string {
    const url = this.trainer?.photoResponse?.photoUrl;
    return url ? resolveStrapiUrl(url) : 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  get primaryLocationLabel(): string {
    const first = this.trainer?.locations?.[0];
    if (!first) return '—';
    return [first.city, first.country].filter(Boolean).join(', ');
  }

  get extraLocationCount(): number {
    return Math.max(0, (this.trainer?.locations?.length ?? 0) - 1);
  }

  /** Every place this trainer works from, for the "Available in" dropdown. */
  get locationMenuItems(): LocationMenuItem[] {
    // Cached per trainer: this getter is bound straight to the menu's `items`
    // input, so building a fresh array each change-detection pass made the
    // menu tear down and re-create its rows (and its open state's anchors)
    // on every tick.
    if (this.menuItemsFor === this.trainer && this.menuItemsCache) return this.menuItemsCache;
    this.menuItemsFor = this.trainer;
    return this.menuItemsCache = (this.trainer?.locations ?? []).map(loc => {
      const place = [loc.city, loc.stateProvince, loc.country].filter(Boolean).join(', ');
      const query = [loc.venue, place].filter(Boolean).join(', ');
      return {
        title: loc.venue || place,
        subtitle: loc.venue ? place : null,
        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        note: loc.fee ? `+${Number(loc.fee).toFixed(2)}` : 'No extra fee',
        noteHighlight: !!loc.fee
      };
    });
  }

  get locationMenuFooter(): LocationMenuFooter | null {
    if (!this.trainer?.customLocationAllowed) return null;
    if (this.menuFooterFor === this.trainer && this.menuFooterCache) return this.menuFooterCache;
    this.menuFooterFor = this.trainer;
    const fee = this.trainer.customLocationFee;
    return this.menuFooterCache = {
      text: 'Or train at a place of your choice',
      note: fee ? `+${Number(fee).toFixed(2)}` : 'No extra fee',
      noteHighlight: !!fee
    };
  }

  get serviceModeLabel(): string {
    switch (this.trainer?.serviceMode) {
      case 'ONLINE': return 'Online';
      case 'HYBRID': return 'Hybrid';
      case 'IN_PERSON':
      default: return 'In-person';
    }
  }

}
