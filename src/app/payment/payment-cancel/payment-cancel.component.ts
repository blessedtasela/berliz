import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/models/Api.interface';
import { StripeCheckoutSessionResponse } from 'src/app/models/stripe.model';
import { StripeService } from 'src/app/services/stripe.service';
import { GroupPackService } from 'src/app/services/group-pack.service';
import { PersonalizedRequestService } from 'src/app/services/personalized-request.service';
import { SubscriptionService } from 'src/app/services/subscription.service';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { completePaymentLink, subscriptionTitle } from 'src/app/my-subscriptions/subscription-status.util';

type CancelType = 'booking' | 'grouppack' | 'order' | 'personalizedRequest' | 'subscription';

const RETRY_ID_PARAM: Record<CancelType, string> = {
  booking: 'bookingId',
  grouppack: 'groupPackId',
  order: 'orderId',
  personalizedRequest: 'id',
  subscription: 'subscriptionId',
};

/**
 * Stripe Checkout's cancelUrl redirect target -- the user backed out of the hosted Checkout page
 * without paying. PY-31: a bare link to "my bookings" / "my subscriptions" was the ONLY way back,
 * even though the thing they were paying for (a booking, a group pack share, an order, a
 * personalized-request plan, or a package/plan purchase) still exists exactly as it was and can
 * usually be retried in one click. StripePaymentServiceImplement now appends `?type=...&...Id=...`
 * to the cancel URL for every checkout it creates, so this page can offer that retry first; a plain
 * `/payment/cancel` (an older in-flight checkout, or Stripe itself linking back here) still falls
 * back to the generic buttons below.
 */
@Component({
    selector: 'app-payment-cancel',
    imports: [CommonModule, RouterModule, IconsModule],
    templateUrl: './payment-cancel.component.html'
})
export class PaymentCancelComponent implements OnInit {
  type: CancelType | null = null;
  retryId: number | null = null;
  retrying = false;
  retryError: string | null = null;

  /** Only populated for type 'subscription' -- needed for completePaymentLink() and the retry amount. */
  subscription: Subscriptions | null = null;

  constructor(
    private route: ActivatedRoute,
    private stripeService: StripeService,
    private groupPackService: GroupPackService,
    private personalizedRequestService: PersonalizedRequestService,
    private subscriptionService: SubscriptionService,
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const type = params.get('type') as CancelType | null;
    if (!type || !(type in RETRY_ID_PARAM)) return;
    const id = Number(params.get(RETRY_ID_PARAM[type]));
    if (!Number.isFinite(id) || id <= 0) return;

    this.type = type;
    this.retryId = id;

    if (type === 'subscription') {
      this.subscriptionService.getSubscription(id).subscribe({
        next: (sub) => { this.subscription = sub; },
        // The retry/back-to-page actions both need this -- without it, fall back to the generic buttons.
        error: () => { this.type = null; this.retryId = null; },
      });
    }
  }

  get retryLabel(): string {
    switch (this.type) {
      case 'booking': return 'Retry payment for this booking';
      case 'grouppack': return 'Retry payment for my group pack share';
      case 'order': return 'Retry payment for this order';
      case 'personalizedRequest': return 'Retry payment for this plan';
      case 'subscription': return this.subscription ? `Retry payment for ${subscriptionTitle(this.subscription)}` : 'Retry payment';
      default: return 'Retry payment';
    }
  }

  /** Only for 'subscription' -- the provider's Level Up page, with the same package pre-selected (BK's own tested mechanism). */
  get backToProviderLink(): { path: string[]; query: { plan: number } } | null {
    return this.type === 'subscription' ? completePaymentLink(this.subscription) : null;
  }

  retryPayment(): void {
    if (this.retrying || this.retryId == null) return;

    let obs: Observable<ApiResponse<StripeCheckoutSessionResponse>> | undefined;
    switch (this.type) {
      case 'booking': obs = this.stripeService.createBookingCheckout(this.retryId); break;
      case 'grouppack': obs = this.groupPackService.checkout(this.retryId); break;
      case 'order': obs = this.stripeService.createOrderCheckout(this.retryId); break;
      case 'personalizedRequest': obs = this.personalizedRequestService.checkout(this.retryId); break;
      case 'subscription': {
        if (!this.subscription) return;
        const amount = this.subscription.amount ?? this.subscription.providerPackage?.price;
        if (!amount) return; // nothing sane to charge -- let the back-to-page link handle it instead
        obs = this.stripeService.createCheckoutSession({
          subscriptionId: this.retryId,
          amount,
          productName: subscriptionTitle(this.subscription),
        });
        break;
      }
      default: return;
    }
    if (!obs) return;

    this.retrying = true;
    this.retryError = null;
    obs.subscribe({
      next: (res) => {
        const checkoutUrl = res?.data?.checkoutUrl;
        if (!checkoutUrl) {
          this.retrying = false;
          this.retryError = 'Could not start checkout — try again.';
          return;
        }
        // A real cross-origin navigation to Stripe's hosted page, not an Angular route.
        window.location.href = checkoutUrl;
      },
      error: (err) => {
        this.retrying = false;
        this.retryError = err?.error?.message || 'Could not start checkout — try again.';
      },
    });
  }
}
