import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { TrainerPricing } from 'src/app/models/trainers.interface';
import { loadTrainerPricing } from 'src/app/state/trainer/trainer.actions';
import { selectTrainerPricing } from 'src/app/state/trainer/trainer.selector';

/**
 * Routed detail page for a single trainer pricing plan —
 * `/dashboard/trainer-pricing/:id` (also reachable via
 * `/dashboard/hub/trainer-pricing/:id`, same lazy module).
 *
 * Replaces the old TrainerPricingDetailsModalComponent dialog. Looks the
 * plan up in the already-loaded `trainerPricing` slice and dispatches
 * `loadTrainerPricing()` if empty (direct link / refresh).
 */
@Component({
  selector: 'app-trainer-pricing-detail-page',
  templateUrl: './trainer-pricing-detail-page.component.html',
  styleUrls: ['./trainer-pricing-detail-page.component.css']
})
export class TrainerPricingDetailPageComponent implements OnInit, OnDestroy {
  trainerPricingData: TrainerPricing | null = null;
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = Number(params.get('id'));
        if (!id || Number.isNaN(id)) {
          this.loading = false;
          this.trainerPricingData = null;
          return;
        }
        this.loadTrainerPricing(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTrainerPricing(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectTrainerPricing)
      .pipe(takeUntil(this.destroy$))
      .subscribe(trainerPricing => {
        const found = (trainerPricing || []).find(item => item.id === id);
        if (found) {
          this.trainerPricingData = found;
          this.loading = false;
        } else if (!trainerPricing || trainerPricing.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadTrainerPricing());
          }
        } else {
          this.trainerPricingData = null;
          this.loading = false;
        }
      });
  }

  openUrl(url: any) {
    window.open(url, '_blank');
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
