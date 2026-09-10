import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { CenterPricing } from 'src/app/models/centers.interface';
import { loadAllCenterPricing } from 'src/app/state/center/center.actions';
import { selectCenterPricing } from 'src/app/state/center/center.selectors';

/**
 * Routed detail page for a single center pricing plan —
 * `/dashboard/center-pricing/:id` (also reachable via
 * `/dashboard/hub/center-pricing/:id`, same lazy module).
 *
 * Mirrors TrainerPricingDetailPageComponent: looks the plan up in the
 * already-loaded `centerPricing` slice and dispatches `loadAllCenterPricing()`
 * if empty (direct link / refresh).
 */
@Component({
  selector: 'app-center-pricing-detail-page',
  templateUrl: './center-pricing-detail-page.component.html',
  styleUrls: ['./center-pricing-detail-page.component.css']
})
export class CenterPricingDetailPageComponent implements OnInit, OnDestroy {
  centerPricingData: CenterPricing | null = null;
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
          this.centerPricingData = null;
          return;
        }
        this.loadCenterPricing(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCenterPricing(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectCenterPricing)
      .pipe(takeUntil(this.destroy$))
      .subscribe(centerPricing => {
        const found = (centerPricing || []).find(item => item.id === id);
        if (found) {
          this.centerPricingData = found;
          this.loading = false;
        } else if (!centerPricing || centerPricing.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadAllCenterPricing());
          }
        } else {
          this.centerPricingData = null;
          this.loading = false;
        }
      });
  }

  formatDate(dateString: any): any {
    if (!dateString) return '';
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }
}
