import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { OrderDetailsRequest, OrderRequest } from 'src/app/models/order.model';
import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StripeService } from 'src/app/services/stripe.service';
import { isUnauthorizedHttpError } from 'src/app/utils/auth-error.util';

interface CheckoutForm {
  name: string;
  email: string;
  contact: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  address: string;
}

/**
 * `/shop/checkout` — creates the real `Order` (its line items + total come from the cart,
 * never re-typed by the buyer), then redirects to Stripe Checkout for the actual charge --
 * same two-step pattern as `LevelUpPageComponent`/`MySubscriptionsPlansComponent`.
 */
@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  standalone: false
})
export class CheckoutComponent implements OnInit {
  submitting = false;

  form: CheckoutForm = {
    name: '',
    email: '',
    contact: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    address: '',
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private stripeService: StripeService,
    private authService: AuthService,
    private authRedirect: AuthRedirectService,
    private snackBar: SnackBarService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    if (this.cartService.lines.length === 0) {
      this.router.navigate(['/shop/cart']);
      return;
    }
    const email = this.authService.getCurrentUserEmail();
    if (email) this.form.email = email;
  }

  get total(): number {
    return this.cartService.total;
  }

  get lines() {
    return this.cartService.lines;
  }

  get isValid(): boolean {
    const f = this.form;
    return !!(f.name.trim() && f.email.trim() && f.contact.trim() && f.country.trim()
      && f.state.trim() && f.city.trim() && f.postalCode.trim() && f.address.trim());
  }

  private handleUnauthorized(): void {
    this.snackBar.openSnackBar('Your session has expired. Please log in again to continue.', 'error');
    this.authRedirect.goToLogin();
  }

  submit(): void {
    if (!this.isValid || this.submitting) return;

    this.submitting = true;
    const orderDetails: OrderDetailsRequest[] = this.lines.map(l => ({
      productId: l.product.id,
      quantity: l.quantity,
    }));

    const request: OrderRequest = {
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      contact: this.form.contact.trim(),
      country: this.form.country.trim(),
      state: this.form.state.trim(),
      city: this.form.city.trim(),
      postalCode: Number(this.form.postalCode),
      address: this.form.address.trim(),
      paymentMethod: 'card',
      orderDetails,
    };

    this.orderService.addOrder(request).subscribe({
      next: res => {
        const orderId = res?.data?.id;
        if (!orderId) {
          this.submitting = false;
          this.snackBar.openSnackBar('Could not place your order — try again.', 'error');
          return;
        }
        this.stripeService.createOrderCheckout(orderId).subscribe({
          next: checkoutRes => {
            const checkoutUrl = checkoutRes?.data?.checkoutUrl;
            if (checkoutUrl) {
              this.cartService.clear();
              window.location.href = checkoutUrl;
            } else {
              this.submitting = false;
              this.snackBar.openSnackBar('Order placed, but payment could not be started — contact support.', 'error');
            }
          },
          error: (err: any) => {
            this.submitting = false;
            if (isUnauthorizedHttpError(err)) { this.handleUnauthorized(); return; }
            this.snackBar.openSnackBar(err?.error?.message || 'Order placed, but payment could not be started — try again.', 'error');
          },
        });
      },
      error: (err: any) => {
        this.submitting = false;
        if (isUnauthorizedHttpError(err)) { this.handleUnauthorized(); return; }
        this.snackBar.openSnackBar(err?.error?.message || 'Could not place your order — try again.', 'error');
      },
    });
  }
}
