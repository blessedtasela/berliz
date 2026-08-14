import { Component, Input } from '@angular/core';
import { Trainers } from 'src/app/models/trainers.interface';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';

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

  get photoUrl(): string {
    const url = this.trainer?.photoResponse?.photoUrl;
    return url ? resolveStrapiUrl(url) : 'assets/avatar.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/avatar.png';
  }

  get mapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.trainer?.address || '')}`;
  }
}
