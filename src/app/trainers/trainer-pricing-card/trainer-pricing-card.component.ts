import { Component, Input } from '@angular/core';
import { TrainerPricing } from 'src/app/models/trainers.interface';

interface PriceTier {
  label: string;
  caption: string;
  icon: string;
  value: string;
}

interface DiscountTier {
  label: string;
  value: string;
}

/**
 * Public read-only rendering of a trainer's pricing
 * (three delivery modes + long-commitment discounts).
 */
@Component({
  selector: 'app-trainer-pricing-card',
  templateUrl: './trainer-pricing-card.component.html',
  styleUrls: ['./trainer-pricing-card.component.css']
})
export class TrainerPricingCardComponent {

  @Input() trainerPricing: TrainerPricing | null = null;

  get tiers(): PriceTier[] {
    const p = this.trainerPricing;
    if (!p) return [];

    return [
      { label: 'Online', caption: 'Remote coaching', icon: 'globe', value: p.priceOnline },
      { label: 'Hybrid', caption: 'Online + in person', icon: 'layers', value: p.priceHybrid },
      { label: 'Personal', caption: 'One on one', icon: 'user', value: p.pricePersonal }
    ].filter(t => !!t.value);
  }

  get discounts(): DiscountTier[] {
    const p = this.trainerPricing;
    if (!p) return [];

    return [
      { label: '3 months', value: p.discount3Months },
      { label: '6 months', value: p.discount6Months },
      { label: '9 months', value: p.discount9Months },
      { label: '12 months', value: p.discount12Months },
      { label: '2 programs', value: p.discount2Programs }
    ].filter(d => !!d.value && Number(d.value) > 0);
  }

  get hasPricing(): boolean {
    return this.tiers.length > 0 || this.discounts.length > 0;
  }
}
