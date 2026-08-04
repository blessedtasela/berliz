import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Exercises } from '../models/exercise.interface';

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

}
