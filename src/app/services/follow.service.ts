import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { FollowedUser } from '../models/follow.model';

/** Following — mirrors `FollowRest` on the backend. A real one-way follow, separate from the
 *  mutual request/accept Connection: no acceptance needed to follow a trainer's posts. */
@Injectable({
  providedIn: 'root'
})
export class FollowService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  followUser(userId: number): Observable<ApiResponse<FollowedUser>> {
    return this.httpClient.post<ApiResponse<FollowedUser>>(this.url + `/follow/${userId}`, {});
  }

  unfollowUser(userId: number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/follow/${userId}`);
  }

  getFollowing(): Observable<ApiResponse<FollowedUser[]>> {
    return this.httpClient.get<ApiResponse<FollowedUser[]>>(this.url + `/follow/following`);
  }

  getFollowers(): Observable<ApiResponse<FollowedUser[]>> {
    return this.httpClient.get<ApiResponse<FollowedUser[]>>(this.url + `/follow/followers`);
  }

  isFollowing(userId: number): Observable<ApiResponse<boolean>> {
    return this.httpClient.get<ApiResponse<boolean>>(this.url + `/follow/${userId}/is-following`);
  }
}
