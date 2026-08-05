import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { ApiResponse } from '../models/Api.interface';
import {
  WorkoutResponse,
  WorkoutAssignmentResponse,
} from '../models/workout.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  // ─────────────────────────────
  // WORKOUTS
  // ─────────────────────────────

  addWorkout(data: any) {
    return this.httpClient.post<ApiResponse<WorkoutResponse>>(`${this.url}/workout/add`, data);
  }

  updateWorkout(data: any) {
    return this.httpClient.put<ApiResponse<WorkoutResponse>>(`${this.url}/workout/update`, data);
  }

  deleteWorkout(id: number) {
    return this.httpClient.delete<ApiResponse<any>>(`${this.url}/workout/delete/${id}`);
  }

  getWorkout(id: number) {
    return this.httpClient.get<ApiResponse<WorkoutResponse>>(`${this.url}/workout/getWorkout/${id}`);
  }

  getMyWorkouts() {
    return this.httpClient.get<ApiResponse<WorkoutResponse[]>>(`${this.url}/workout/getMyWorkouts`);
  }

  // ─────────────────────────────
  // ASSIGNMENTS
  // ─────────────────────────────

  assignWorkout(data: any) {
    return this.httpClient.post<ApiResponse<WorkoutAssignmentResponse>>(`${this.url}/workout/assign`, data);
  }

  updateAssignmentStatus(id: number, status: string) {
    return this.httpClient.put<ApiResponse<WorkoutAssignmentResponse>>(
      `${this.url}/workout/updateAssignmentStatus/${id}`, { status });
  }

  getMyAssignedWorkouts() {
    return this.httpClient.get<ApiResponse<WorkoutAssignmentResponse[]>>(
      `${this.url}/workout/getMyAssignedWorkouts`);
  }

  getAssignmentsIMade() {
    return this.httpClient.get<ApiResponse<WorkoutAssignmentResponse[]>>(
      `${this.url}/workout/getAssignmentsIMade`);
  }
}
