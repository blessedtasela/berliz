import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from 'src/app/models/Api.interface';
import { environment } from 'src/environments/environment';

export interface ProviderSummary {
  days: number;
  views: number;
  requests: number;
  confirmed: number;
  completed: number;
  /** Cancelled, declined or withdrawn. */
  cancelled: number;
  /** Share of requests that became bookings, 0-100; null with no requests. */
  acceptedPercent: number | null;
  /** Share of profile views that became a request, 0-100; null with no views. */
  requestRatePercent: number | null;
  /** Money actually paid for sessions requested in the window. */
  paid: number;
  viewsByDay: { date: string; views: number }[];
}

/** A trainer's / center's own numbers, plus the anonymous "someone looked at this profile" ping. */
@Injectable({ providedIn: 'root' })
export class ProviderAnalyticsService {

  private url = environment.api + '/provider-analytics';

  constructor(private http: HttpClient) { }

  summary(days = 30): Observable<ApiResponse<ProviderSummary>> {
    return this.http.get<ApiResponse<ProviderSummary>>(`${this.url}/summary`, { params: { days } });
  }

  /** Fire-and-forget; counted once per profile per visit, never blocks or fails the page. */
  recordProfileView(target: { trainerId?: number; centerId?: number }): void {
    if (typeof window === 'undefined') return; // prerender / SSR must not count as a visitor
    const key = `berliz.pv.${target.trainerId ? 't' : 'c'}${target.trainerId ?? target.centerId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch { /* no storage: count it, the server rate-limits anyway */ }
    this.http.post(`${this.url}/profileView`, target).subscribe({ error: () => { } });
  }
}
