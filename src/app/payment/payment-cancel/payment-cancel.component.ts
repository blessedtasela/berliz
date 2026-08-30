import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';

/**
 * Stripe Checkout's cancelUrl redirect target -- the user backed out of the
 * hosted Checkout page without paying. The Subscription row this was for
 * stays exactly where selectPlan() left it (PENDING_PAYMENT); nothing to
 * clean up here, they can just try again from My Subscriptions.
 */
@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './payment-cancel.component.html'
})
export class PaymentCancelComponent { }
