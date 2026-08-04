import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BodyParts, MuscleGroups } from '../models/muscle-groups.interface';

@Injectable({
  providedIn: 'root'
})
export class MuscleGroupService {
  url = environment.api;
  bodyParts: BodyParts[];

  constructor(private httpClient: HttpClient) {
    this.bodyParts = [
      { id: 1, name: "chest" },
      { id: 2, name: "shoulders" },
      { id: 3, name: "legs" },
      { id: 4, name: "back" },
      { id: 5, name: "abs" },
      { id: 6, name: "arms" },
      { id: 7, name: "bicep" },
      { id: 8, name: "tricep" },
    ];
  }

  getBodyParts() {
    return this.bodyParts;
  }

  addMuscleGroup(data: any) {
    return this.httpClient.post<{ message: string }>(this.url + "/muscleGroup/add", data);
  }

  getMuscleGroups() {
    return this.httpClient.get<MuscleGroups[]>(this.url + "/muscleGroup/get");
  }

  getActiveMuscleGroups() {
    return this.httpClient.get<MuscleGroups[]>(this.url + "/muscleGroup/getActiveMuscleGroups");
  }

  updateMuscleGroup(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/muscleGroup/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any) {
    return this.httpClient.put<{ message: string }>(this.url + `/muscleGroup/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteMuscleGroup(id: any) {
    return this.httpClient.delete<{ message: string }>(this.url + `/muscleGroup/delete/${id}`);
  }

  getMuscleGroup(id: any) {
    return this.httpClient.get<MuscleGroups>(this.url + `/muscleGroup/getMuscleGroup/${id}`);
  }

  updateMuscleGroupImage(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/muscleGroup/updateImage", data);
  }

}
