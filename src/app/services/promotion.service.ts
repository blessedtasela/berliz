import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { PromoOffer, PromoOfferRequest } from '../models/promo-offer.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Trainer/center self-service create on their own profile, or admin creating a platform-wide campaign. */
  create(data: PromoOfferRequest) {
    return this.httpClient.post<ApiResponse<PromoOffer>>(this.url + "/promotion/create", data);
  }

  update(id: number, data: PromoOfferRequest) {
    return this.httpClient.put<ApiResponse<PromoOffer>>(this.url + "/promotion/update/" + id, data);
  }

  toggle(id: number, active: boolean) {
    return this.httpClient.put<ApiResponse<PromoOffer>>(this.url + "/promotion/toggle/" + id, { active });
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<string>>(this.url + "/promotion/delete/" + id);
  }

  getMine() {
    return this.httpClient.get<ApiResponse<PromoOffer[]>>(this.url + "/promotion/mine");
  }

  getPublicForTrainer(trainerId: number) {
    return this.httpClient.get<ApiResponse<PromoOffer[]>>(this.url + "/promotion/public/trainer/" + trainerId);
  }

  getPublicForCenter(centerId: number) {
    return this.httpClient.get<ApiResponse<PromoOffer[]>>(this.url + "/promotion/public/center/" + centerId);
  }

  getPublicFeed() {
    return this.httpClient.get<ApiResponse<PromoOffer[]>>(this.url + "/promotion/feed");
  }

  getPlatformCampaigns() {
    return this.httpClient.get<ApiResponse<PromoOffer[]>>(this.url + "/promotion/platform");
  }
}
