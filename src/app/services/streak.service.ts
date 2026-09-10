import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { StreakResponse } from '../models/streak.interface';

/** Training-consistency (streak) figures — mirrors `StreakRest`. */
@Injectable({ providedIn: 'root' })
export class StreakService {
  private url = environment.api;

  constructor(private http: HttpClient) {}

  /** The signed-in user's current/longest streak and this week's activity. */
  getMyStreak(): Observable<ApiResponse<StreakResponse>> {
    return this.http.get<ApiResponse<StreakResponse>>(this.url + '/streak/me');
  }
}
