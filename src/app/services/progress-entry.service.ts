import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ProgressEntry, ProgressEntryPhotoRequest, ProgressEntryRequest } from '../models/progress-entry.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressEntryService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  create(request: ProgressEntryRequest) {
    return this.httpClient.post<ApiResponse<ProgressEntry>>(this.url + "/progress-entry", request, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  update(entryId: number, request: ProgressEntryRequest) {
    return this.httpClient.put<ApiResponse<ProgressEntry>>(this.url + "/progress-entry/" + entryId, request, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  delete(entryId: number) {
    return this.httpClient.delete<ApiResponse<ProgressEntry>>(this.url + "/progress-entry/" + entryId);
  }

  addPhoto(entryId: number, photo: ProgressEntryPhotoRequest) {
    return this.httpClient.post<ApiResponse<ProgressEntry>>(this.url + "/progress-entry/" + entryId + "/photo", photo, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  removePhoto(entryId: number, photoId: number) {
    return this.httpClient.delete<ApiResponse<ProgressEntry>>(this.url + "/progress-entry/" + entryId + "/photo/" + photoId);
  }

  getMyEntries() {
    return this.httpClient.get<ApiResponse<ProgressEntry[]>>(this.url + "/progress-entry/mine");
  }

  getClientEntries(clientId: number) {
    return this.httpClient.get<ApiResponse<ProgressEntry[]>>(this.url + "/progress-entry/client/" + clientId);
  }
}
