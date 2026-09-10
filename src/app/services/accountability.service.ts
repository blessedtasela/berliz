import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { PartnerStatusResponse } from '../models/accountability.interface';

/** Accountability partners + streak-slip nudges — mirrors `AccountabilityRest`. */
@Injectable({ providedIn: 'root' })
export class AccountabilityService {
  private url = environment.api;

  constructor(private http: HttpClient) {}

  getPartners(): Observable<ApiResponse<PartnerStatusResponse[]>> {
    return this.http.get<ApiResponse<PartnerStatusResponse[]>>(this.url + '/accountability/partners');
  }

  setPartners(partnerIds: number[]): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(this.url + '/accountability/partners', { partnerIds });
  }

  nudge(partnerId: number): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.url}/accountability/nudge/${partnerId}`, {});
  }
}
