import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { Payments } from 'src/app/models/payment.interface';
import { loadPayments } from 'src/app/state/payment/payment.actions';
import { selectPayments } from 'src/app/state/payment/payment.selectors';

/**
 * Routed detail page for a single payment — `/dashboard/payments/:id`
 * (also reachable via `/dashboard/hub/payments/:id`, same lazy module).
 *
 * Replaces the old PaymentDetailsModalComponent dialog. Looks the payment
 * up in the already-loaded `payments` slice and dispatches `loadPayments()`
 * if empty (direct link / refresh).
 */
@Component({
  selector: 'app-payment-detail-page',
  templateUrl: './payment-detail-page.component.html',
  styleUrls: ['./payment-detail-page.component.css']
})
export class PaymentDetailPageComponent implements OnInit, OnDestroy {
  paymentData: Payments | null = null;
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
          this.paymentData = null;
          return;
        }
        this.loadPayment(id);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPayment(id: number): void {
    this.loading = true;
    let dispatched = false;
    this.store.select(selectPayments)
      .pipe(takeUntil(this.destroy$))
      .subscribe(payments => {
        const found = (payments || []).find(payment => payment.id === id);
        if (found) {
          this.paymentData = found;
          this.loading = false;
        } else if (!payments || payments.length === 0) {
          if (!dispatched) {
            dispatched = true;
            this.store.dispatch(loadPayments());
          }
        } else {
          this.paymentData = null;
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
