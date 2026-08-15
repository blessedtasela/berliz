import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ClientProgress, ProgressShare } from '../models/progress-share.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressShareService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  grant(trainerId: number) {
    return this.httpClient.post<ApiResponse<ProgressShare>>(this.url + "/progress-share/grant", { trainerId }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  revoke(trainerId: number) {
    return this.httpClient.post<ApiResponse<ProgressShare>>(this.url + "/progress-share/revoke", { trainerId }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getMyGrants() {
    return this.httpClient.get<ApiResponse<ProgressShare[]>>(this.url + "/progress-share/getMyGrants");
  }

  getSharedWithMe() {
    return this.httpClient.get<ApiResponse<ProgressShare[]>>(this.url + "/progress-share/getSharedWithMe");
  }

  getClientProgress(clientId: number) {
    return this.httpClient.get<ApiResponse<ClientProgress>>(this.url + "/progress-share/getClientProgress/" + clientId);
  }

}
