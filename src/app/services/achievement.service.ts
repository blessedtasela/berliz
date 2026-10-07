import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { FitnessAchievement, FitnessAchievementRequest } from '../models/fitness-achievement.model';

/** A user's own fitness achievements — mirrors `FitnessAchievementRest` (/achievement). Strictly per-user. */
@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** The signed-in user's achievements, newest first. */
  getMine(): Observable<ApiResponse<FitnessAchievement[]>> {
    return this.httpClient.get<ApiResponse<FitnessAchievement[]>>(this.url + '/achievement/mine');
  }

  add(request: FitnessAchievementRequest): Observable<ApiResponse<FitnessAchievement>> {
    return this.httpClient.post<ApiResponse<FitnessAchievement>>(this.url + '/achievement/add', request);
  }

  update(request: FitnessAchievementRequest & { id: number }): Observable<ApiResponse<FitnessAchievement>> {
    return this.httpClient.put<ApiResponse<FitnessAchievement>>(this.url + '/achievement/update', request);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/achievement/delete/${id}`);
  }
}
