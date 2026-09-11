import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';

export interface BerlizFeedback {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  message: string;
  status: string;
  date: Date;
  lastUpdate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BerlizFeedbackService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /** Any logged-in user may submit platform feedback. */
  addFeedback(message: string) {
    return this.httpClient.post<ApiResponse<BerlizFeedback>>(this.url + '/feedback/add', { message });
  }

  /** Admin-only. */
  getAllFeedback() {
    return this.httpClient.get<ApiResponse<BerlizFeedback[]>>(this.url + '/feedback/getAll');
  }
}
