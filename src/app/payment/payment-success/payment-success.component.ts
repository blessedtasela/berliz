import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';

/**
 * Stripe Checkout's successUrl redirect target
 * (StripePaymentServiceImplement.createCheckoutSession's default:
 * `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`).
 * Doesn't need to read session_id or poll anything -- the webhook
 * (handleCheckoutSessionCompleted) is what actually activates the
 * subscription, asynchronously and independent of whether this page ever
 * loads (a closed tab, a flaky redirect, etc. still gets the webhook).
 * This is purely a "here's what just happened" confirmation.
 */
@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './payment-success.component.html'
})
export class PaymentSuccessComponent { }
