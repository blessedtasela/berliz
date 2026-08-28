import { Component } from '@angular/core';
import { TrainersDetailsComponent } from 'src/app/trainers/trainers-details/trainers-details.component';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

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
})
export class DashboardTrainerDetailComponent extends TrainersDetailsComponent {

  resolveStrapiUrl = resolveStrapiUrl;

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

  get serviceModeLabel(): string {
    switch (this.trainer?.serviceMode) {
      case 'ONLINE': return 'Online';
      case 'HYBRID': return 'Hybrid';
      case 'IN_PERSON':
      default: return 'In-person';
    }
  }

}
