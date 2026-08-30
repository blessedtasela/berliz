import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ContentReportRequest, ContentReportResponse } from '../models/content-report.model';

/** Reporting a post or comment — mirrors `ContentReportRest` on the backend. */
@Injectable({
  providedIn: 'root'
})
export class ContentReportService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addReport(request: ContentReportRequest): Observable<ApiResponse<ContentReportResponse>> {
    return this.httpClient.post<ApiResponse<ContentReportResponse>>(this.url + '/report/add', request);
  }

  /** Admin only. Omit status to get pending reports. */
  getReports(status?: string): Observable<ApiResponse<ContentReportResponse[]>> {
    return this.httpClient.get<ApiResponse<ContentReportResponse[]>>(this.url + '/report', {
      params: status ? { status } : {},
    });
  }

  /** Admin only. status: "resolved" | "dismissed". */
  updateStatus(id: number, status: 'resolved' | 'dismissed'): Observable<ApiResponse<ContentReportResponse>> {
    return this.httpClient.put<ApiResponse<ContentReportResponse>>(this.url + `/report/${id}/status`, {}, {
      params: { status },
    });
  }
}
