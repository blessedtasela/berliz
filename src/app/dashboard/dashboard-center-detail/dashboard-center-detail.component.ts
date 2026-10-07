import { Component } from '@angular/core';
import { CenterDetailComponent } from 'src/app/centers/center-detail/center-detail.component';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { LocationMenuItem } from 'src/app/shared/locations-menu/locations-menu.component';

/**
 * Light-themed, dashboard-native center profile — same pattern as
 * DashboardTrainerDetailComponent: extends the public component for its
 * data/state, supplies a different (light) template only.
 */
@Component({
    selector: 'app-dashboard-center-detail',
    templateUrl: './dashboard-center-detail.component.html',
    standalone: false
})
export class DashboardCenterDetailComponent extends CenterDetailComponent {

  resolveStrapiUrl = resolveStrapiUrl;

  protected override get likersRoutePrefix(): string {
    return '/dashboard/user';
  }

  get photoUrl(): string {
    return this.center?.photoResponse?.photoUrl ? resolveStrapiUrl(this.center.photoResponse.photoUrl) : 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  /**
   * Every branch the center lists; a center with none still has its main
   * address, so the tile never goes empty when there is somewhere to point to.
   */
  get locationMenuItems(): LocationMenuItem[] {
    if (this.centerLocation.length > 0) {
      return this.centerLocation.map(loc => ({
        title: loc.subName || loc.address,
        subtitle: loc.subName ? loc.address : null,
        href: loc.locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.address || '')}`
      }));
    }
    return this.center?.address
      ? [{ title: this.center.address, href: this.mapsUrl(this.center) }]
      : [];
  }

  get primaryLocationLabel(): string {
    return this.center?.address || this.centerLocation[0]?.address || '';
  }
}
