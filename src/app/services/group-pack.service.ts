import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { GroupPack } from '../models/group-pack.model';
import { StripeCheckoutSessionResponse } from '../models/stripe.model';

/** Group packs (`/group-pack`): a group package bought together, everyone paying their own share. */
@Injectable({
  providedIn: 'root'
})
export class GroupPackService {

  private url = environment.api + '/group-pack';

  constructor(private httpClient: HttpClient) { }

  /** Starts a pack: the person starting holds one or more places and is responsible for filling the rest. */
  start(packageId: number, slots: number) {
    return this.httpClient.post<ApiResponse<GroupPack>>(`${this.url}/start`, { packageId, slots });
  }

  join(id: number, slots: number) {
    return this.httpClient.post<ApiResponse<GroupPack>>(`${this.url}/${id}/join`, { slots });
  }

  /** Gives a place back (only before the share is paid). */
  leave(id: number) {
    return this.httpClient.post<ApiResponse<GroupPack>>(`${this.url}/${id}/leave`, null);
  }

  /** Pay my share of a full pack: returns the Stripe checkout to send the person to. */
  checkout(id: number) {
    return this.httpClient.post<ApiResponse<StripeCheckoutSessionResponse>>(`${this.url}/${id}/checkout`, null);
  }

  /** The packs the signed-in person is in. */
  getMine() {
    return this.httpClient.get<ApiResponse<GroupPack[]>>(`${this.url}/mine`);
  }

  /** The trainer's packs that still have places left (public: no names). */
  getOpenForTrainer(trainerId: number) {
    return this.httpClient.get<ApiResponse<GroupPack[]>>(`${this.url}/trainer/${trainerId}/open`);
  }
}
