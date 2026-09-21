import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PromotionService } from 'src/app/services/promotion.service';
import { PromoOffer } from 'src/app/models/promo-offer.model';

/**
 * Compact "active offer" cards for a trainer/center's public profile --
 * dropped into both the public (dark) and dashboard (light) variants of the
 * trainer/center detail page, since both share this same data need. Renders
 * nothing when there's nothing live, so it's always safe to include.
 */
@Component({
  selector: 'app-promo-badge-list',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './promo-badge-list.component.html',
  styleUrls: ['./promo-badge-list.component.css']
})
export class PromoBadgeListComponent implements OnChanges {

  @Input() ownerType!: 'trainer' | 'center';
  @Input() ownerId: number | null = null;

  promotions: PromoOffer[] = [];

  constructor(private promotionService: PromotionService) { }

  ngOnChanges(): void {
    if (!this.ownerId) {
      this.promotions = [];
      return;
    }

    const request$ = this.ownerType === 'center'
      ? this.promotionService.getPublicForCenter(this.ownerId)
      : this.promotionService.getPublicForTrainer(this.ownerId);

    request$.pipe(take(1)).subscribe({
      next: (res) => { this.promotions = res?.data ?? []; },
      error: () => { this.promotions = []; },
    });
  }

  label(p: PromoOffer): string {
    switch (p.type) {
      case 'percentage': return `${p.value ?? ''}% off`;
      case 'fixed': return `$${p.value ?? ''} off`;
      case 'free_session': return 'Free session';
      default: return 'Special offer';
    }
  }
}
