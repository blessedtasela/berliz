import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Payout } from '../models/payout.model';

@Injectable({
  providedIn: 'root'
})
export class PayoutService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** The current authenticated trainer/center's own payout history. */
  getMyPayouts() {
    return this.httpClient.get<ApiResponse<Payout[]>>(this.url + "/payout/getMyPayouts");
  }

  /** Admin only — every payout across the marketplace. */
  getAllPayouts() {
    return this.httpClient.get<ApiResponse<Payout[]>>(this.url + "/payout/getAllPayouts");
  }

  /** Paid sessions that haven't happened yet -- projected (status "UPCOMING"), not a real Payout row. */
  getMyUpcomingPaidEarnings() {
    return this.httpClient.get<ApiResponse<Payout[]>>(this.url + "/payout/getMyUpcomingPaidEarnings");
  }

  /** Admin triggers the real Stripe Connect transfer for a PENDING payout. */
  payOutViaStripe(id: number) {
    return this.httpClient.put<ApiResponse<Payout>>(this.url + `/payout/pay/${id}`, null);
  }

  /**
   * Admin only — PY-24: recomputes a not-yet-paid-out payout from the booking's real amountPaid.
   * PY-25: `reason` is logged server-side (actor/time/before/after); may be omitted.
   */
  recalculatePayout(bookingId: number, reason?: string) {
    return this.httpClient.put<ApiResponse<Payout>>(this.url + `/payout/recalculate/${bookingId}`, { reason });
  }
}
