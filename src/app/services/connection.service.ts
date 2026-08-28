import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Connection, ConnectionStatus } from '../models/connection.model';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  sendRequest(recipientId: number) {
    return this.httpClient.post<ApiResponse<Connection>>(this.url + "/connection/request/" + recipientId, {});
  }

  respond(id: number, status: ConnectionStatus) {
    return this.httpClient.put<ApiResponse<Connection>>(this.url + "/connection/respond/" + id, { status });
  }

  cancel(id: number) {
    return this.httpClient.put<ApiResponse<Connection>>(this.url + "/connection/cancel/" + id, {});
  }

  getMyConnections() {
    return this.httpClient.get<ApiResponse<Connection[]>>(this.url + "/connection/mine");
  }

  getPendingRequests() {
    return this.httpClient.get<ApiResponse<Connection[]>>(this.url + "/connection/pending");
  }
}
