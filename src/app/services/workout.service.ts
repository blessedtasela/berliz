import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { ApiResponse } from '../models/Api.interface';
import {
  WorkoutResponse,
  WorkoutAssignmentResponse,
  WorkoutLogResponse,
  WorkoutLogRequest,
  ExerciseProgressPoint,
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
  // PUBLIC TEMPLATES
  // ─────────────────────────────

  // Public endpoint — no auth required.
  getTemplates() {
    return this.httpClient.get<ApiResponse<WorkoutResponse[]>>(`${this.url}/workout/getTemplates`);
  }

  // Authenticated — clones the template into a workout owned by the caller.
  cloneTemplate(id: number) {
    return this.httpClient.post<ApiResponse<WorkoutResponse>>(`${this.url}/workout/cloneTemplate/${id}`, {});
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

  // ─────────────────────────────
  // WORKOUT LOG (history — what a user actually performed)
  // ─────────────────────────────

  addWorkoutLog(data: WorkoutLogRequest) {
    return this.httpClient.post<ApiResponse<WorkoutLogResponse>>(`${this.url}/workoutLog/add`, data);
  }

  updateWorkoutLog(data: WorkoutLogRequest) {
    return this.httpClient.put<ApiResponse<WorkoutLogResponse>>(`${this.url}/workoutLog/update`, data);
  }

  deleteWorkoutLog(id: number) {
    return this.httpClient.delete<ApiResponse<any>>(`${this.url}/workoutLog/delete/${id}`);
  }

  getWorkoutLog(id: number) {
    return this.httpClient.get<ApiResponse<WorkoutLogResponse>>(`${this.url}/workoutLog/getLog/${id}`);
  }

  getMyWorkoutLogs() {
    return this.httpClient.get<ApiResponse<WorkoutLogResponse[]>>(`${this.url}/workoutLog/getMyLogs`);
  }

  getExerciseProgress(exerciseId: number) {
    return this.httpClient.get<ApiResponse<ExerciseProgressPoint[]>>(
      `${this.url}/workoutLog/getExerciseProgress/${exerciseId}`);
  }

  // Owner/admin only — target must be one of the owner's accepted connections.
  shareWorkoutLog(id: number, userId: number) {
    return this.httpClient.post<ApiResponse<WorkoutLogResponse>>(`${this.url}/workoutLog/${id}/share/${userId}`, {});
  }

  // Owner/admin, or a collaborator removing their own access.
  unshareWorkoutLog(id: number, userId: number) {
    return this.httpClient.delete<ApiResponse<WorkoutLogResponse>>(`${this.url}/workoutLog/${id}/share/${userId}`);
  }
}
