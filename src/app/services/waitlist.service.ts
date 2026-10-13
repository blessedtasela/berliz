import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiResponse } from 'src/app/models/Api.interface';
import { environment } from 'src/environments/environment';

export interface WaitlistEntry {
  id: number;
  trainerId?: number | null;
  centerId?: number | null;
  providerName?: string | null;
  /** yyyy-MM-dd */
  date: string;
  status: 'waiting' | 'notified' | string;
  message?: string | null;
}

/** "Tell me if a time opens up on this day." Signed-in clients only. */
@Injectable({ providedIn: 'root' })
export class WaitlistService {

  private url = environment.api + '/waitlist';

  constructor(private http: HttpClient) { }

  join(target: { trainerId?: number; centerId?: number }, date: string): Observable<ApiResponse<WaitlistEntry>> {
    return this.http.post<ApiResponse<WaitlistEntry>>(this.url + '/join', { ...target, date });
  }

  leave(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.url}/${id}`);
  }

  mine(): Observable<ApiResponse<WaitlistEntry[]>> {
    return this.http.get<ApiResponse<WaitlistEntry[]>>(this.url + '/mine');
  }
}
