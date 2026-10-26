import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { IconsModule } from 'src/app/icons/icons.module';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { ProfileTheme } from './profile-theme';

/**
 * The line every trainer/center card needs before anyone opens the profile: what a session costs and
 * how much social proof there is. A full price, never "from" -- or an honest "Rate on request". Social proof is
 * the star average and count once anyone has rated, and just the review count before that.
 */
@Component({
  selector: 'app-provider-card-meta',
  imports: [CommonModule, IconsModule, StarRatingComponent],
  template: `
    <div class="flex items-center justify-between gap-3 text-[11px] font-sans">
      <span *ngIf="rateNumber" [ngClass]="strong" class="font-bold">
        {{ rateNumber | currency:'CAD':'symbol':'1.0-2' }}<span [ngClass]="muted" class="font-normal"> / hour</span>
      </span>
      <span *ngIf="!rateNumber" [ngClass]="muted">Rate on request</span>

      <app-star-rating *ngIf="averageRating; else countOnly" [value]="averageRating" [count]="reviewCount ?? 0" [size]="11"
        [textClass]="strong"></app-star-rating>
      <ng-template #countOnly>
        <span [ngClass]="muted" class="flex items-center gap-1" [attr.aria-label]="reviewLabel">
          <i-feather name="message-square" style="width:11px;height:11px;"></i-feather>
          {{ reviewLabel }}
        </span>
      </ng-template>
    </div>
  `
})
export class ProviderCardMetaComponent {
  @Input() rate: number | string | null | undefined = null;
  @Input() reviewCount: number | null | undefined = 0;
  @Input() averageRating: number | null | undefined = null;
  @Input() theme: ProfileTheme = 'dark';

  get rateNumber(): number | null {
    if (this.rate === null || this.rate === undefined || this.rate === '') return null;
    const n = Number(this.rate);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  get reviewLabel(): string {
    const n = this.reviewCount ?? 0;
    return n === 1 ? '1 review' : `${n} reviews`;
  }

  get strong(): string { return this.theme === 'dark' ? 'text-white' : 'text-gray-900 dark:text-gray-100'; }
  get muted(): string { return this.theme === 'dark' ? 'text-zinc-500' : 'text-gray-400 dark:text-gray-500'; }
}
