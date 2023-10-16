import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  url = environment.apiUrl;
  trainerEventEmitter = new EventEmitter();


  constructor(private httpClient: HttpClient) { }

  addTrainer(data: any) {
    return this.httpClient.post(this.url + "/trainer/add", data);
  }

  updateTrainer(data: any) {
    return this.httpClient.put(this.url + "/trainer/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updatePhoto(data: any) {
    return this.httpClient.put(this.url + "/trainer/updatePhoto", data);
  }


  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/trainer/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getTrainer() {
    return this.httpClient.get(this.url + "/trainer/getTrainer")
  }

  getAllTrainers() {
    return this.httpClient.get(this.url + "/trainer/get")
  }

  getTrainerLikes() {
    return this.httpClient.get(this.url + "/trainer/getTrainerLikes")
  }

  getActiveTrainers() {
    return this.httpClient.get(this.url + "/trainer/getActiveTrainers")
  }

  deleteTrainer(id: number) {
    return this.httpClient.delete(this.url + `/trainer/delete/${id}`);
  }

  likeTrainer(id: number) {
    return this.httpClient.put(this.url + `/trainer/like/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

}
