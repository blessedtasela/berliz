import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { RunEventRequest, RunEventResponse, RunLogRequest, RunLogResponse } from '../models/run.interface';

@Injectable({
  providedIn: 'root'
})
export class RunService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  // ─────────────────────────────
  // SCHEDULING
  // ─────────────────────────────

  createRunEvent(data: RunEventRequest) {
    return this.httpClient.post<ApiResponse<RunEventResponse>>(`${this.url}/run/event/add`, data);
  }

  updateRunEvent(data: RunEventRequest) {
    return this.httpClient.put<ApiResponse<RunEventResponse>>(`${this.url}/run/event/update`, data);
  }

  cancelRunEvent(id: number) {
    return this.httpClient.delete<ApiResponse<any>>(`${this.url}/run/event/${id}`);
  }

  getRunEvent(id: number) {
    return this.httpClient.get<ApiResponse<RunEventResponse>>(`${this.url}/run/event/${id}`);
  }

  getMyRunEvents() {
    return this.httpClient.get<ApiResponse<RunEventResponse[]>>(`${this.url}/run/event/getMine`);
  }

  /** Public, upcoming, group runs in this city. */
  discoverRunEvents(city: string) {
    return this.httpClient.get<ApiResponse<RunEventResponse[]>>(`${this.url}/run/event/discover`, { params: { city } });
  }

  // ─────────────────────────────
  // JOINING A GROUP RUN
  // ─────────────────────────────

  requestToJoin(id: number) {
    return this.httpClient.post<ApiResponse<RunEventResponse>>(`${this.url}/run/event/${id}/request`, {});
  }

  inviteConnection(id: number, userId: number) {
    return this.httpClient.post<ApiResponse<RunEventResponse>>(`${this.url}/run/event/${id}/invite/${userId}`, {});
  }

  /** The invited/requesting user accepting or declining their own spot. */
  respondToParticipation(id: number, accept: boolean) {
    return this.httpClient.put<ApiResponse<RunEventResponse>>(
      `${this.url}/run/event/${id}/respond`, {}, { params: { accept: String(accept) } });
  }

  /** The creator accepting or declining someone else's join request. */
  respondToRequest(id: number, userId: number, accept: boolean) {
    return this.httpClient.put<ApiResponse<RunEventResponse>>(
      `${this.url}/run/event/${id}/respondTo/${userId}`, {}, { params: { accept: String(accept) } });
  }

  // ─────────────────────────────
  // TIME TRACKING
  // ─────────────────────────────

  logRun(data: RunLogRequest) {
    return this.httpClient.post<ApiResponse<RunLogResponse>>(`${this.url}/run/log/add`, data);
  }

  updateRunLog(data: RunLogRequest) {
    return this.httpClient.put<ApiResponse<RunLogResponse>>(`${this.url}/run/log/update`, data);
  }

  deleteRunLog(id: number) {
    return this.httpClient.delete<ApiResponse<any>>(`${this.url}/run/log/${id}`);
  }

  getMyRunLogs() {
    return this.httpClient.get<ApiResponse<RunLogResponse[]>>(`${this.url}/run/log/getMine`);
  }
}
