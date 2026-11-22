import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ProfileQuizQuestion, ProfileQuizQuestionAdminRequest } from '../models/profile-quiz.model';

/** Admin CRUD for the profile quiz's question bank -- mirrors `OnboardingAdminRest` (`/admin/onboarding-questions`) on the backend. */
@Injectable({
  providedIn: 'root'
})
export class ProfileQuizAdminService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  getAllQuestions(): Observable<ApiResponse<ProfileQuizQuestion[]>> {
    return this.httpClient.get<ApiResponse<ProfileQuizQuestion[]>>(this.url + `/admin/onboarding-questions/get`);
  }

  addQuestion(request: ProfileQuizQuestionAdminRequest): Observable<ApiResponse<ProfileQuizQuestion>> {
    return this.httpClient.post<ApiResponse<ProfileQuizQuestion>>(this.url + `/admin/onboarding-questions/add`, request);
  }

  updateQuestion(request: ProfileQuizQuestionAdminRequest): Observable<ApiResponse<ProfileQuizQuestion>> {
    return this.httpClient.put<ApiResponse<ProfileQuizQuestion>>(this.url + `/admin/onboarding-questions/update`, request);
  }

  deleteQuestion(id: number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/admin/onboarding-questions/delete/${id}`);
  }

  updateStatus(id: number): Observable<ApiResponse<ProfileQuizQuestion>> {
    return this.httpClient.put<ApiResponse<ProfileQuizQuestion>>(this.url + `/admin/onboarding-questions/updateStatus/${id}`, {});
  }
}
