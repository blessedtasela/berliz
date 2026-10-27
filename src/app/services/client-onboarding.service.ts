import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { normaliseOnboarding } from '../client-onboarding/client-onboarding.options';
import { ApiResponse } from '../models/Api.interface';
import { ClientOnboarding, ClientOnboardingSave } from '../models/client-onboarding.model';

/**
 * Client onboarding. A direct service rather than NgRx: one signed-in user's own profile (or one client's, for
 * their trainer), fetched on demand by the wizard, the summary card and the checklist, with no shared list state.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientOnboardingService {

  private url = environment.api + '/client-onboarding';

  constructor(private http: HttpClient) { }

  getMine(): Observable<ClientOnboarding> {
    return this.http.get<ApiResponse<ClientOnboarding>>(`${this.url}/mine`).pipe(map(r => normaliseOnboarding(r.data)));
  }

  /** Saves one wizard step; only the fields present are changed. */
  saveMine(step: ClientOnboardingSave): Observable<ClientOnboarding> {
    return this.http.put<ApiResponse<ClientOnboarding>>(`${this.url}/mine`, step).pipe(map(r => normaliseOnboarding(r.data)));
  }

  deleteMyHealthAnswers(): Observable<ClientOnboarding> {
    return this.http.delete<ApiResponse<ClientOnboarding>>(`${this.url}/mine/health`).pipe(map(r => normaliseOnboarding(r.data)));
  }

  /** A client's profile, for the signed-in trainer they are connected to (403 for anyone else). */
  getForClient(clientUserId: number): Observable<ClientOnboarding> {
    return this.http.get<ApiResponse<ClientOnboarding>>(`${this.url}/client/${clientUserId}`).pipe(map(r => normaliseOnboarding(r.data)));
  }

  /** Completion percent by client user id, for the trainer's own clients. */
  getCompletion(clientUserIds: number[]): Observable<Record<number, number>> {
    if (!clientUserIds.length) return new Observable(s => { s.next({}); s.complete(); });
    return this.http.get<ApiResponse<Record<number, number>>>(`${this.url}/completion`, { params: { clientIds: clientUserIds.join(',') } })
      .pipe(map(r => r.data ?? {}));
  }
}
