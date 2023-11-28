import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MuscleGroupService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  addMuscleGroup(data: any) {
    return this.httpClient.post(this.url + "/muscleGroup/add", data);
  }

  getMuscleGroups() {
    return this.httpClient.get(this.url + "/muscleGroup/get");
  }

  getActiveMuscleGroups() {
    return this.httpClient.get(this.url + "/muscleGroup/getActiveMuscleGroups");
  }

  updateMuscleGroup(data: any) {
    return this.httpClient.put(this.url + "/muscleGroup/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any) {
    return this.httpClient.put(this.url + `/muscleGroup/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteMuscleGroup(id: any) {
    return this.httpClient.delete(this.url + `/muscleGroup/delete/${id}`);
  }

  getMuscleGroup(id: any) {
    return this.httpClient.get(this.url + `/muscleGroup/getMuscleGroup/${id}`);
  }

  updateMuscleGroupImage(data: any) {
    return this.httpClient.put(this.url + "/muscleGroup/updateImage", data);
  }

}

