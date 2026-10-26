import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Store, StoreRequest } from '../models/store.model';

/** The Shop seller-facing surface -- mirrors `StoreRest`'s self-service endpoints. */
@Injectable({
  providedIn: 'root'
})
export class StoreService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** The caller's own store, or `data: null` if they haven't created one yet. */
  getMyStore() {
    return this.httpClient.get<ApiResponse<Store | null>>(this.url + '/store/my');
  }

  /** Creates the caller's store -- requires an admin-approved "store"-role Partner application. */
  createMyStore(request: StoreRequest) {
    return this.httpClient.post<ApiResponse<Store>>(this.url + '/store/my', request);
  }

  updateMyStore(request: StoreRequest) {
    return this.httpClient.put<ApiResponse<Store>>(this.url + '/store/my', request);
  }

  /** Public: a store's profile, for a buyer browsing it. */
  getPublicStore(id: number) {
    return this.httpClient.get<ApiResponse<Store>>(this.url + `/store/public/${id}`);
  }
}
