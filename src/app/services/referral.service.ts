import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ReferralStats } from '../models/promo-offer.model';

@Injectable({
  providedIn: 'root'
})
export class ReferralService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  getMyStats() {
    return this.httpClient.get<ApiResponse<ReferralStats>>(this.url + "/referral/mine");
  }
}
