import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { PlanSubscriptionResponse } from '../models/plan.model';
import { PlanCodeRequest, PlanCodeRequestInput } from '../models/payment-code.model';

export interface BypassCode {
  id: number;
  code: string;
  planId: number;
  planName: string;
  targetRole: string;
  durationMonths: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  expiresAt: string | null;
  createdByAdminEmail: string;
  status: string;
  note: string | null;
  date?: string;
  lastUpdate?: string;
}

export interface BypassCodeRequest {
  planId: number;
  durationMonths?: number;
  maxRedemptions?: number | null;
  expiresAt?: string | null;
  note?: string | null;
  code?: string | null;
}

/** Admin-comped subscription codes — no payment involved. See PlanRest/BypassCodeRest on the backend. */
@Injectable({
  providedIn: 'root'
})
export class BypassCodeService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Any authenticated user. */
  redeem(code: string): Observable<ApiResponse<PlanSubscriptionResponse>> {
    return this.httpClient.post<ApiResponse<PlanSubscriptionResponse>>(
      this.url + '/bypassCode/redeem',
      { code }
    );
  }

  /** Admin only. */
  addBypassCode(request: BypassCodeRequest): Observable<ApiResponse<BypassCode>> {
    return this.httpClient.post<ApiResponse<BypassCode>>(this.url + '/bypassCode/add', request);
  }

  /** Admin only. */
  getAllBypassCodes(): Observable<ApiResponse<BypassCode[]>> {
    return this.httpClient.get<ApiResponse<BypassCode[]>>(this.url + '/bypassCode/get');
  }

  /** Admin only. */
  updateStatus(id: number): Observable<ApiResponse<BypassCode>> {
    return this.httpClient.put<ApiResponse<BypassCode>>(this.url + `/bypassCode/updateStatus/${id}`, null);
  }

  /** Client only — "I don't have a code, please send me one for this plan." */
  requestCode(input: PlanCodeRequestInput): Observable<ApiResponse<PlanCodeRequest>> {
    return this.httpClient.post<ApiResponse<PlanCodeRequest>>(this.url + '/bypassCode/requestCode', input);
  }

  /** Any authenticated user — their own past requests, so the page can show "already asked". */
  getMyCodeRequests(): Observable<ApiResponse<PlanCodeRequest[]>> {
    return this.httpClient.get<ApiResponse<PlanCodeRequest[]>>(this.url + '/bypassCode/myCodeRequests');
  }

  /** Admin only. */
  getAllCodeRequests(status?: 'OPEN' | 'CLOSED'): Observable<ApiResponse<PlanCodeRequest[]>> {
    const params = status ? { status } : undefined;
    return this.httpClient.get<ApiResponse<PlanCodeRequest[]>>(this.url + '/bypassCode/codeRequests', { params });
  }

  /** Admin only. */
  closeCodeRequest(id: number, note?: string): Observable<ApiResponse<PlanCodeRequest>> {
    return this.httpClient.put<ApiResponse<PlanCodeRequest>>(this.url + `/bypassCode/codeRequests/${id}/close`, { note });
  }
}
