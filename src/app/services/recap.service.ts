import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { RecapPeriod, RecapResponse } from '../models/recap.interface';

/** D2 — "Your time in Berliz" recap. Mirrors `RecapRest`. Never gated. */
@Injectable({ providedIn: 'root' })
export class RecapService {
  private url = environment.api;

  constructor(private http: HttpClient) {}

  getMyRecap(period: RecapPeriod = 'year'): Observable<ApiResponse<RecapResponse>> {
    return this.http.get<ApiResponse<RecapResponse>>(this.url + '/recap/me', {
      params: new HttpParams().set('period', period),
    });
  }
}
