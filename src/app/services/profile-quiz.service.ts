import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ProfileQuizAnswerInput, ProfileQuizQuestion, ProfileQuizStatus } from '../models/profile-quiz.model';

/** User-facing side of the GN-75 profile quiz -- mirrors `OnboardingRest` (`/onboarding`) on the backend. */
@Injectable({
  providedIn: 'root'
})
export class ProfileQuizService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  getQuestions(): Observable<ApiResponse<ProfileQuizQuestion[]>> {
    return this.httpClient.get<ApiResponse<ProfileQuizQuestion[]>>(this.url + `/onboarding/questions`);
  }

  submitAnswers(answers: ProfileQuizAnswerInput[]): Observable<ApiResponse<void>> {
    return this.httpClient.post<ApiResponse<void>>(this.url + `/onboarding/answers`, answers);
  }

  getStatus(): Observable<ApiResponse<ProfileQuizStatus>> {
    return this.httpClient.get<ApiResponse<ProfileQuizStatus>>(this.url + `/onboarding/status`);
  }
}
