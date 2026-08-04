import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Members } from '../models/members.interface';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  url = environment.api;

  constructor(private http: HttpClient) { }

  addMember(data: any): Observable<ApiResponse<Members>> {
    return this.http.post<ApiResponse<Members>>(`${this.url}/member/add`, data);
  }

  updateMember(data: any): Observable<ApiResponse<Members>> {
    return this.http.put<ApiResponse<Members>>(`${this.url}/member/update`, data);
  }

  updateStatus(id: number): Observable<ApiResponse<Members>> {
    return this.http.put<ApiResponse<Members>>(`${this.url}/member/updateStatus/${id}`, {});
  }

  getMember(id: number): Observable<ApiResponse<Members>> {
    return this.http.get<ApiResponse<Members>>(`${this.url}/member/getMember/${id}`);
  }

  getAllMembers(): Observable<ApiResponse<Members[]>> {
    return this.http.get<ApiResponse<Members[]>>(`${this.url}/member/get`);
  }

  getActiveMembers(): Observable<ApiResponse<Members[]>> {
    return this.http.get<ApiResponse<Members[]>>(`${this.url}/member/getActiveMembers`);
  }

  deleteMember(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.url}/member/delete/${id}`);
  }

}
