import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { PeerSession, PeerSessionStatus } from '../models/peer-session.model';

@Injectable({
  providedIn: 'root'
})
export class PeerSessionService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  propose(data: { participantId: number; scheduledAt: string | Date; durationMinutes?: number; workoutId?: number | null; notes?: string }) {
    return this.httpClient.post<ApiResponse<PeerSession>>(this.url + "/peer-session/propose", data);
  }

  respond(id: number, status: Extract<PeerSessionStatus, 'confirmed' | 'declined'>) {
    return this.httpClient.put<ApiResponse<PeerSession>>(this.url + "/peer-session/respond/" + id, { status });
  }

  cancel(id: number) {
    return this.httpClient.put<ApiResponse<PeerSession>>(this.url + "/peer-session/cancel/" + id, {});
  }

  complete(id: number) {
    return this.httpClient.put<ApiResponse<PeerSession>>(this.url + "/peer-session/complete/" + id, {});
  }

  getMySessions() {
    return this.httpClient.get<ApiResponse<PeerSession[]>>(this.url + "/peer-session/mine");
  }
}
