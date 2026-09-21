import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ReferralLeaderboardEntry, ReferralStats } from '../models/promo-offer.model';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  getMyStats() {
    return this.httpClient.get<ApiResponse<ReferralStats>>(this.url + "/referral/mine");
  }

  getLeaderboard() {
    return this.httpClient.get<ApiResponse<ReferralLeaderboardEntry[]>>(this.url + "/referral/leaderboard");
  }

  /** One-time "I shared my link" bonus -- a free-session credit, once per user. */
  claimShareBonus() {
    return this.httpClient.post<ApiResponse<string>>(this.url + "/referral/claim-share-bonus", {});
  }
}
