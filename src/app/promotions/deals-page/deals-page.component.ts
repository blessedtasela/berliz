import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PromotionService } from 'src/app/services/promotion.service';
import { PromoOffer } from 'src/app/models/promo-offer.model';

/**
 * Dashboard-native "Deals" feed -- every currently-live promotion
 * platform-wide (provider offers + Berliz's own growth campaigns), for a
 * signed-in user to browse. Signed-in only (AuthGuard) -- the underlying
 * `/promotion/feed` endpoint itself is public (also feeds the badge on each
 * provider's own profile page), this route just doesn't expose it to a
 * logged-out visitor.
 */
@Component({
  selector: 'app-deals-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './deals-page.component.html',
  styleUrls: ['./deals-page.component.css']
})
export class DealsPageComponent implements OnInit {

  deals: PromoOffer[] = [];
  loading = true;

  constructor(private promotionService: PromotionService) { }

  ngOnInit(): void {
    this.promotionService.getPublicFeed().pipe(take(1)).subscribe({
      next: (res) => { this.deals = res?.data ?? []; this.loading = false; },
      error: () => { this.deals = []; this.loading = false; }
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

  /**
   * Dashboard-native profile routes: `/dashboard/find-trainers/:name` (a
   * dashes-slugified name, no id) and `/dashboard/find-centers/:id/:name` --
   * same convention DashboardTrainerDetailComponent/DashboardCenterDetailComponent
   * parse against, kept consistent with "dashboard routes stay in the
   * dashboard for a signed-in user" elsewhere in this app.
   */
  profileLink(p: PromoOffer): string[] | null {
    if (!p.ownerName || p.ownerType === 'platform') return null;
    const slug = p.ownerName.replace(/ /g, '-').toLowerCase();
    if (p.ownerType === 'trainer') return ['/dashboard/find-trainers', slug];
    if (p.ownerType === 'center' && p.ownerId != null) return ['/dashboard/find-centers', String(p.ownerId), slug];
    return null;
  }
}
