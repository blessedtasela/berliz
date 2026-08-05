import { Component, Input } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';
import { environment } from 'src/environments/environment';

/**
 * Public hero header for a single trainer profile.
 * Built entirely from the real `Trainers` record (photoResponse / name /
 * motto / categories / experience / address / likes).
 */
@Component({
  selector: 'app-trainers-details-hero',
  templateUrl: './trainers-details-hero.component.html',
  styleUrls: ['./trainers-details-hero.component.css']
})
export class TrainersDetailsHeroComponent {

  @Input() trainer: Trainers | null = null;
  @Input() reviewCount = 0;

  readonly strapiUrl = environment.strapiUrl;

  get photoUrl(): string {
    const url = this.trainer?.photoResponse?.photoUrl;
    if (!url) return 'assets/avatar.png';
    return url.startsWith('http') ? url : `${this.strapiUrl}${url}`;
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  get mapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.trainer?.address || '')}`;
  }
}
