import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { BlockedUser } from '../models/block.model';

/** Blocking — mirrors `BlockRest` on the backend. Blocking someone stops them messaging you, mentioning you, or commenting on your posts. */
@Injectable({
  providedIn: 'root'
})
export class BlockService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  blockUser(userId: number): Observable<ApiResponse<BlockedUser>> {
    return this.httpClient.post<ApiResponse<BlockedUser>>(this.url + `/block/${userId}`, {});
  }

  unblockUser(userId: number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/block/${userId}`);
  }

  getBlockedUsers(): Observable<ApiResponse<BlockedUser[]>> {
    return this.httpClient.get<ApiResponse<BlockedUser[]>>(this.url + `/block`);
  }
}
