import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { DisciplineRankResponse, RankAwardRequest, RankAwardResponse } from '../models/rank.interface';

/** Belt / rank progression — mirrors `RankRest`. */
@Injectable({ providedIn: 'root' })
export class RankService {
  private url = environment.api;

  constructor(private http: HttpClient) {}

  getUserRanks(userId: number): Observable<ApiResponse<DisciplineRankResponse[]>> {
    return this.http.get<ApiResponse<DisciplineRankResponse[]>>(`${this.url}/rank/user/${userId}`);
  }

  getMyRanks(): Observable<ApiResponse<DisciplineRankResponse[]>> {
    return this.http.get<ApiResponse<DisciplineRankResponse[]>>(`${this.url}/rank/me`);
  }

  /** Trainer / center only. */
  award(request: RankAwardRequest): Observable<ApiResponse<RankAwardResponse>> {
    return this.http.post<ApiResponse<RankAwardResponse>>(`${this.url}/rank/award`, request);
  }
}
