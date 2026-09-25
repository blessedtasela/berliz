import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ProviderPackage, ProviderPackageRequest } from '../models/provider-package.model';

@Injectable({
  providedIn: 'root'
})
export class ProviderPackageService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Trainer/center self-service create on their own catalog. */
  create(data: ProviderPackageRequest) {
    return this.httpClient.post<ApiResponse<ProviderPackage>>(this.url + "/provider-package/mine", data);
  }

  update(id: number, data: ProviderPackageRequest) {
    return this.httpClient.put<ApiResponse<ProviderPackage>>(this.url + "/provider-package/mine/" + id, data);
  }

  delete(id: number) {
    return this.httpClient.delete<ApiResponse<string>>(this.url + "/provider-package/mine/" + id);
  }

  /** Every package (active and inactive) belonging to the currently authenticated trainer/center. */
  getMine() {
    return this.httpClient.get<ApiResponse<ProviderPackage[]>>(this.url + "/provider-package/mine");
  }

  /** Public, unauthenticated: a specific provider's ACTIVE packages only. */
  getForTrainer(trainerId: number) {
    return this.httpClient.get<ApiResponse<ProviderPackage[]>>(this.url + "/provider-package/provider?trainerId=" + trainerId);
  }

  getForCenter(centerId: number) {
    return this.httpClient.get<ApiResponse<ProviderPackage[]>>(this.url + "/provider-package/provider?centerId=" + centerId);
  }
}
