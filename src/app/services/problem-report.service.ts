import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ProblemReport } from '../models/problem-report.model';

@Injectable({
  providedIn: 'root'
})
export class ProblemReportService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addProblemReport(data: any) {
    return this.httpClient.post<{ message: string }>(this.url + "/problemReport/add", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllProblemReports() {
    return this.httpClient.get<ProblemReport[]>(this.url + "/problemReport/get");
  }

  getProblemReport(id: any) {
    return this.httpClient.get<ProblemReport>(this.url + `/problemReport/getProblemReport/${id}`);
  }

  updateStatus(id: any) {
    return this.httpClient.put<{ message: string }>(this.url + `/problemReport/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  deleteProblemReport(id: any) {
    return this.httpClient.delete<{ message: string }>(this.url + `/problemReport/delete/${id}`);
  }
}
