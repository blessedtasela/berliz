import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginHistoryEntry, LoginStats } from '../models/analytics.interface';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Admin only — aggregated login/session/device stats for the last 30 days. */
  getLoginStats() {
    return this.httpClient.get<LoginStats>(this.url + "/analytics/getLoginStats");
  }

  /** Any authenticated role — the caller's own recent login events. */
  getMyLoginHistory() {
    return this.httpClient.get<LoginHistoryEntry[]>(this.url + "/analytics/getMyLoginHistory");
  }
}
