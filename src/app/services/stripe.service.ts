import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { StripeCheckoutSessionRequest, StripeCheckoutSessionResponse } from '../models/stripe.model';

/** Stripe Checkout — mirrors `StripePaymentRest` on the backend. */
@Injectable({
  providedIn: 'root'
})
export class StripeService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Creates a Checkout Session and returns its hosted URL — redirect the browser there (`window.location.href = response.checkoutUrl`), don't just navigate the Angular router. */
  createCheckoutSession(request: StripeCheckoutSessionRequest): Observable<ApiResponse<StripeCheckoutSessionResponse>> {
    return this.httpClient.post<ApiResponse<StripeCheckoutSessionResponse>>(
      this.url + '/payment/stripe/create-checkout-session',
      request
    );
  }

  /**
   * "Pay now" for one confirmed session. The amount is the booking's own `amountDue` -- the server
   * never takes a price from the client. Redirect the browser to the returned `checkoutUrl`.
   */
  createBookingCheckout(bookingId: number): Observable<ApiResponse<StripeCheckoutSessionResponse>> {
    return this.httpClient.post<ApiResponse<StripeCheckoutSessionResponse>>(
      this.url + `/payment/stripe/booking-checkout/${bookingId}`,
      null
    );
  }

  /** Admin-only — full Stripe refund of a payment. */
  refundPayment(paymentId: number): Observable<ApiResponse<{ id?: number; message?: string }>> {
    return this.httpClient.post<ApiResponse<{ id?: number; message?: string }>>(
      this.url + `/payment/stripe/refund/${paymentId}`,
      null
    );
  }
}
