import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ExerciseLikes, Exercises } from '../models/exercise.interface';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addExercise(data: any) {
    return this.httpClient.post<{ message: string }>(this.url + "/exercise/add", data);
  }

  getExercises() {
    return this.httpClient.get<Exercises[]>(this.url + "/exercise/get");
  }

  getActiveExercises() {
    return this.httpClient.get<Exercises[]>(this.url + "/exercise/getActiveExercises");
  }

  updateExercise(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/exercise/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any) {
    return this.httpClient.put<{ message: string }>(this.url + `/exercise/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteExercise(id: any) {
    return this.httpClient.delete<{ message: string }>(this.url + `/exercise/delete/${id}`);
  }

  getExercise(id: any) {
    return this.httpClient.get<Exercises>(this.url + `/exercise/getExercise/${id}`);
  }

  updateExerciseDemo(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/exercise/updateDemo", data);
  }

  /** Attach (video: a StrapiUploadResponse-shaped object) or remove (video: null) an exercise's demo video. */
  updateExerciseVideo(id: number, video: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/exercise/updateExerciseVideo", { id, video });
  }

  // ── Discovery ───────────────────────────────────────────────────────────────

  /**
   * Trending exercises (likes DESC, date DESC), optionally narrowed to one
   * category. Public endpoint — the backend ranks and caps the list, so the
   * category toggle re-requests rather than filtering a fixed list client-side.
   */
  getTrendingExercises(categoryId?: number | null) {
    let params = new HttpParams();
    if (categoryId != null) {
      params = params.set('categoryId', categoryId);
    }
    return this.httpClient.get<Exercises[]>(this.url + "/exercise/getTrending", { params });
  }

  // ── Likes ───────────────────────────────────────────────────────────────────

  /** Toggles the current user's like; returns the exercise with its new count. */
  likeExercise(id: number) {
    return this.httpClient.put<Exercises>(this.url + `/exercise/like/${id}`, null);
  }

  getMyExerciseLikes() {
    return this.httpClient.get<ExerciseLikes[]>(this.url + "/exercise/getMyExerciseLikes");
  }

}
