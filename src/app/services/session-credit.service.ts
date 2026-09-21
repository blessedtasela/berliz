import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { SessionCredit } from '../models/promo-offer.model';

@Injectable({
  providedIn: 'root'
})
export class SessionCreditService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  getMine() {
    return this.httpClient.get<ApiResponse<SessionCredit[]>>(this.url + "/session-credit/mine");
  }
}
