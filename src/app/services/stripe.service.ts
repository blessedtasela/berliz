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
}
