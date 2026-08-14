import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { loadSubscriptions } from 'src/app/state/subscription/subscription.actions';
import { selectSubscriptions } from 'src/app/state/subscription/subscription.selectors';

/**
 * Routed detail page for a single subscription —
 * `/dashboard/subscriptions/:id` (also reachable via
 * `/dashboard/hub/subscriptions/:id`, same lazy module).
 *
 * Replaces the old SubscriptionDetailsModalComponent dialog. Looks the
 * subscription up in the already-loaded `subscriptions` slice and
 * dispatches `loadSubscriptions()` if empty (direct link / refresh).
 */
@Component({
  selector: 'app-subscription-detail-page',
  templateUrl: './subscription-detail-page.component.html',
  styleUrls: ['./subscription-detail-page.component.css']
})
export class SubscriptionDetailPageComponent implements OnInit, OnDestroy {
  subscriptionData: Subscriptions | null = null;
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
          this.subscriptionData = null;
          return;
        }
        this.loadSubscription(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSubscription(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectSubscriptions)
      .pipe(takeUntil(this.destroy$))
      .subscribe(subscriptions => {
        const found = (subscriptions || []).find(subscription => subscription.id === id);
        if (found) {
          this.subscriptionData = found;
          this.loading = false;
        } else if (!subscriptions || subscriptions.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadSubscriptions());
          }
        } else {
          this.subscriptionData = null;
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
