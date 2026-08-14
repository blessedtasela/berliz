import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Plan } from '../models/plan.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  getActivePlans() {
    return this.httpClient.get<ApiResponse<Plan[]>>(this.url + "/plan/get");
  }
}
