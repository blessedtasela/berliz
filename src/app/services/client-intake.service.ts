import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ClientIntake, ClientIntakeAuditEntry } from '../models/client-intake.model';

@Injectable({
  providedIn: 'root'
})
export class ClientIntakeService {

  url = environment.api;
  private readonly jsonHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private httpClient: HttpClient) { }

  sendIntake(data: any) {
    return this.httpClient.post<ApiResponse<ClientIntake>>(this.url + "/client-intake/send", data);
  }

  getIntake(id: number) {
    return this.httpClient.get<ApiResponse<ClientIntake>>(this.url + `/client-intake/get/${id}`);
  }

  /** Client or the creating trainer, only while status is SENT ("Fill Together" co-filling). */
  saveDraft(data: any) {
    return this.httpClient.put<ApiResponse<ClientIntake>>(this.url + "/client-intake/draft", data, { headers: this.jsonHeaders });
  }

  /** Client-only: signs the PAR-Q, locking it. */
  signIntake(data: any) {
    return this.httpClient.put<ApiResponse<ClientIntake>>(this.url + "/client-intake/sign", data, { headers: this.jsonHeaders });
  }

  /** Client-only: asks a super admin to reopen their signed, locked PAR-Q. */
  requestEdit(id: number, reason: string) {
    return this.httpClient.post<ApiResponse<ClientIntake>>(this.url + `/client-intake/${id}/request-edit`, { reason }, { headers: this.jsonHeaders });
  }

  /** Admin-only: approves (grants a one-time edit window) or denies a pending edit request. */
  decideEditRequest(id: number, data: { approve: boolean; note?: string }) {
    return this.httpClient.put<ApiResponse<ClientIntake>>(this.url + `/client-intake/${id}/decide-edit`, data, { headers: this.jsonHeaders });
  }

  /** Admin-only: edits a PAR-Q directly, regardless of its lock state. */
  adminEditIntake(id: number, data: any) {
    return this.httpClient.put<ApiResponse<ClientIntake>>(this.url + `/client-intake/${id}/admin-edit`, data, { headers: this.jsonHeaders });
  }

  /** Admin-only: the full send/sign/edit-request/grant/deny/admin-edit history for one PAR-Q. */
  getAuditLog(id: number) {
    return this.httpClient.get<ApiResponse<ClientIntakeAuditEntry[]>>(this.url + `/client-intake/${id}/audit-log`);
  }

  /** Admin-only: every PAR-Q currently awaiting an edit-request decision. */
  getPendingEditRequests() {
    return this.httpClient.get<ApiResponse<ClientIntake[]>>(this.url + "/client-intake/pending-edit-requests");
  }

  getMyIntakes() {
    return this.httpClient.get<ApiResponse<ClientIntake[]>>(this.url + "/client-intake/getMyIntakes");
  }
}
