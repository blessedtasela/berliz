import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { WeeklySlot, WeeklySubscription } from '../models/weekly-subscription.model';

/** Weekly fixed-time subscriptions: N sessions a week at fixed days and times, booked and held for the client. */
@Injectable({ providedIn: 'root' })
export class WeeklySubscriptionService {
  private base = environment.api + '/weekly-subscription';

  constructor(private http: HttpClient) { }

  mine() {
    return this.http.get<ApiResponse<WeeklySubscription[]>>(`${this.base}/mine`);
  }

  get(id: number) {
    return this.http.get<ApiResponse<WeeklySubscription>>(`${this.base}/${id}`);
  }

  setSchedule(id: number, slots: WeeklySlot[]) {
    return this.http.put<ApiResponse<WeeklySubscription>>(`${this.base}/${id}/schedule`, { slots });
  }

  pause(id: number) {
    return this.http.post<ApiResponse<WeeklySubscription>>(`${this.base}/${id}/pause`, {});
  }

  resume(id: number) {
    return this.http.post<ApiResponse<WeeklySubscription>>(`${this.base}/${id}/resume`, {});
  }

  cancel(id: number) {
    return this.http.post<ApiResponse<WeeklySubscription>>(`${this.base}/${id}/cancel`, {});
  }
}
