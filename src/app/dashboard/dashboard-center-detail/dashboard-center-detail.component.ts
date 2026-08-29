import { Component } from '@angular/core';
import { CenterDetailComponent } from 'src/app/centers/center-detail/center-detail.component';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

/**
 * Light-themed, dashboard-native center profile — same pattern as
 * DashboardTrainerDetailComponent: extends the public component for its
 * data/state, supplies a different (light) template only.
 */
@Component({
  selector: 'app-dashboard-center-detail',
  templateUrl: './dashboard-center-detail.component.html',
})
export class DashboardCenterDetailComponent extends CenterDetailComponent {

  resolveStrapiUrl = resolveStrapiUrl;

  get photoUrl(): string {
    return this.center?.photoResponse?.photoUrl ? resolveStrapiUrl(this.center.photoResponse.photoUrl) : 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }
}
