import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Clients } from '../models/clients.interface';
import { TrainerReview } from '../models/trainers.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addClient(data: any) {
    return this.httpClient.post<{ message: string }>(this.url + "/client/add", data);
  }

  updateClient(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/client/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put<{ message: string }>(this.url + `/client/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getClient() {
    return this.httpClient.get<Clients>(this.url + "/client/getMyClient")
  }

  getAllClients() {
    return this.httpClient.get<Clients[]>(this.url + "/client/get")
  }

  getActiveClients() {
    return this.httpClient.get<Clients[]>(this.url + "/client/getActiveClients")
  }

  deleteClient(id: number) {
    return this.httpClient.delete<{ message: string }>(this.url + `/client/delete/${id}`);
  }

  /** Reviews the signed-in client has written about trainers -- distinct from `TrainerService.getMyTrainerReviews`, which is a trainer viewing reviews written about them. */
  getMyTrainerReviews() {
    return this.httpClient.get<ApiResponse<TrainerReview[]>>(this.url + "/client/getMyTrainerReviews");
  }

}
