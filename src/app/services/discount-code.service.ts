import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';

/** A promo code as the admin sees it. Mirrors the backend DiscountCodeResponse. */
export interface DiscountCode {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  planId: number | null;
  planName: string | null;
  targetRole: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: string | null;
  status: string;
  note: string | null;
  createdByAdminEmail?: string | null;
  date?: string;
  message?: string;
}

export interface DiscountCodeRequest {
  /** Blank = the server generates one (SAVE-XXXXXX). */
  code?: string | null;
  discountType: 'percentage' | 'fixed';
  value: number;
  /** Limit to one plan... */
  planId?: number | null;
  /** ...or to all plans of a role. Neither = every plan. */
  targetRole?: string | null;
  maxRedemptions?: number | null;
  /** yyyy-MM-dd; usable through the end of that day. */
  expiresAt?: string | null;
  note?: string | null;
}

/** What a promo code would do to one plan's price. Mirrors the backend DiscountPreviewResponse. */
export interface DiscountPreview {
  code: string;
  originalPrice: number;
  amountOff: number;
  finalPrice: number;
  message?: string;
}

/**
 * Promo codes for plan checkout -- a percentage or fixed amount off the first payment, applied by the server as a
 * one-time Stripe coupon. Distinct from BypassCodeService, whose codes grant a plan with no payment at all.
 */
@Injectable({ providedIn: 'root' })
export class DiscountCodeService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Any signed-in user: what would this code do to this plan's price? Nothing is redeemed; a 400 carries the reason it can't be used. */
  preview(code: string, planId: number): Observable<ApiResponse<DiscountPreview>> {
    return this.httpClient.post<ApiResponse<DiscountPreview>>(this.url + '/discountCode/preview', { code, planId });
  }

  /** Admin only. */
  add(request: DiscountCodeRequest): Observable<ApiResponse<DiscountCode>> {
    return this.httpClient.post<ApiResponse<DiscountCode>>(this.url + '/discountCode/add', request);
  }

  /** Admin only. */
  getAll(): Observable<ApiResponse<DiscountCode[]>> {
    return this.httpClient.get<ApiResponse<DiscountCode[]>>(this.url + '/discountCode/get');
  }

  /** Admin only -- switches a code on or off. */
  toggle(id: number): Observable<ApiResponse<DiscountCode>> {
    return this.httpClient.put<ApiResponse<DiscountCode>>(this.url + `/discountCode/updateStatus/${id}`, null);
  }
}
