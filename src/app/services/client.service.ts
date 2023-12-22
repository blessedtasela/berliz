import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  addClient(data: any) {
    return this.httpClient.post(this.url + "/client/add", data);
  }

  updateClient(data: any) {
    return this.httpClient.put(this.url + "/client/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/client/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getClient() {
    return this.httpClient.get(this.url + "/client/getClient")
  }

  getAllClients() {
    return this.httpClient.get(this.url + "/client/get")
  }

  getActiveClients() {
    return this.httpClient.get(this.url + "/client/getActiveClients")
  }

  deleteClient(id: number) {
    return this.httpClient.delete(this.url + `/client/delete/${id}`);
  }

}

