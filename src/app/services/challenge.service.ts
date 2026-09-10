import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ChallengeRequest, ChallengeResponse } from '../models/challenge.interface';

/** Time-boxed challenges — mirrors `ChallengeRest`. */
@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private url = environment.api;

  constructor(private http: HttpClient) {}

  list(): Observable<ApiResponse<ChallengeResponse[]>> {
    return this.http.get<ApiResponse<ChallengeResponse[]>>(this.url + '/challenge');
  }

  get(id: number): Observable<ApiResponse<ChallengeResponse>> {
    return this.http.get<ApiResponse<ChallengeResponse>>(`${this.url}/challenge/${id}`);
  }

  create(request: ChallengeRequest): Observable<ApiResponse<ChallengeResponse>> {
    return this.http.post<ApiResponse<ChallengeResponse>>(this.url + '/challenge', request);
  }

  join(id: number): Observable<ApiResponse<ChallengeResponse>> {
    return this.http.post<ApiResponse<ChallengeResponse>>(`${this.url}/challenge/${id}/join`, {});
  }

  leave(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/challenge/${id}/leave`);
  }
}
