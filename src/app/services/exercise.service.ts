import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExerciseService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  addExercise(data: any) {
    return this.httpClient.post(this.url + "/exercise/add", data);
  }

  getExercises() {
    return this.httpClient.get(this.url + "/exercise/get");
  }

  getActiveExercises() {
    return this.httpClient.get(this.url + "/exercise/getActiveExercises");
  }

  updateExercise(data: any) {
    return this.httpClient.put(this.url + "/exercise/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any) {
    return this.httpClient.put(this.url + `/exercise/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteExercise(id: any) {
    return this.httpClient.delete(this.url + `/exercise/delete/${id}`);
  }

  getExercise(id: any) {
    return this.httpClient.get(this.url + `/exercise/getExercise/${id}`);
  }

  updateExerciseDemo(data: any) {
    return this.httpClient.put(this.url + "/exercise/updateDemo", data);
  }

}


