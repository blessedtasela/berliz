import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { GroupSession, GroupSessionRequest } from '../models/group-session.model';

/** Group sessions (`/group-session`): start one, join or leave one, and see the open groups of a trainer. */
@Injectable({
  providedIn: 'root'
})
export class GroupSessionService {

  private url = environment.api + '/group-session';

  constructor(private httpClient: HttpClient) { }

  /** Starts a group: the person starting is its first member and is responsible for filling the rest of the places. */
  start(data: GroupSessionRequest) {
    return this.httpClient.post<ApiResponse<GroupSession>>(`${this.url}/start`, data);
  }

  join(id: number, slots: number) {
    return this.httpClient.post<ApiResponse<GroupSession>>(`${this.url}/${id}/join`, { slots });
  }

  leave(id: number) {
    return this.httpClient.post<ApiResponse<GroupSession>>(`${this.url}/${id}/leave`, null);
  }

  /** The groups the signed-in person is in. */
  getMine() {
    return this.httpClient.get<ApiResponse<GroupSession[]>>(`${this.url}/mine`);
  }

  /** The trainer's groups that still have places left (public: no names, no notes). */
  getOpenForTrainer(trainerId: number) {
    return this.httpClient.get<ApiResponse<GroupSession[]>>(`${this.url}/trainer/${trainerId}/open`);
  }
}
