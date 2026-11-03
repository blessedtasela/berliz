import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import {
  PaymentCode, PaymentCodeCheck, PaymentCodeDecisionInput, PaymentCodeRedeemInput, PaymentCodeRedeemResult,
  PaymentCodeRequest, PaymentCodeRequestInput,
} from '../models/payment-code.model';

/** Admin-approved payment codes: a trainer asks the administration, a super admin approves, either person uses the code instead of paying. */
@Injectable({ providedIn: 'root' })
export class PaymentCodeService {
  private base = environment.api + '/payment-code';

  constructor(private http: HttpClient) { }

  /** Trainer / center: ask the administration for a code for one of their clients. */
  request(input: PaymentCodeRequestInput) {
    return this.http.post<ApiResponse<PaymentCodeRequest>>(`${this.base}/request`, input);
  }

  /** Client without a code: ask my trainer for one. */
  askTrainer(input: PaymentCodeRequestInput) {
    return this.http.post<ApiResponse<PaymentCodeRequest>>(`${this.base}/ask-trainer`, input);
  }

  forward(id: number, note?: string) {
    return this.http.post<ApiResponse<PaymentCodeRequest>>(`${this.base}/requests/${id}/forward`, { note });
  }

  decline(id: number, note?: string) {
    return this.http.post<ApiResponse<PaymentCodeRequest>>(`${this.base}/requests/${id}/decline`, { note });
  }

  cancel(id: number) {
    return this.http.post<ApiResponse<PaymentCodeRequest>>(`${this.base}/requests/${id}/cancel`, {});
  }

  myRequests() {
    return this.http.get<ApiResponse<PaymentCodeRequest[]>>(`${this.base}/requests/mine`);
  }

  myCodes() {
    return this.http.get<ApiResponse<PaymentCode[]>>(`${this.base}/mine`);
  }

  check(input: PaymentCodeRedeemInput) {
    return this.http.post<ApiResponse<PaymentCodeCheck>>(`${this.base}/check`, input);
  }

  redeem(input: PaymentCodeRedeemInput) {
    return this.http.post<ApiResponse<PaymentCodeRedeemResult>>(`${this.base}/redeem`, input);
  }

  // ---- super admin ----
  adminRequests(status?: string) {
    return this.http.get<ApiResponse<PaymentCodeRequest[]>>(`${this.base}/admin/requests`, { params: status ? { status } : {} });
  }

  approve(id: number, input: PaymentCodeDecisionInput) {
    return this.http.post<ApiResponse<PaymentCodeRequest>>(`${this.base}/admin/requests/${id}/approve`, input);
  }

  reject(id: number, input: PaymentCodeDecisionInput) {
    return this.http.post<ApiResponse<PaymentCodeRequest>>(`${this.base}/admin/requests/${id}/reject`, input);
  }

  revoke(codeId: number) {
    return this.http.post<ApiResponse<PaymentCode>>(`${this.base}/admin/codes/${codeId}/revoke`, {});
  }

  adminCodes() {
    return this.http.get<ApiResponse<PaymentCode[]>>(`${this.base}/admin/codes`);
  }
}
