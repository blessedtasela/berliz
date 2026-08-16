import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { ClientIntake } from '../models/client-intake.model';

@Injectable({
  providedIn: 'root'
})
export class ClientIntakeService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  createIntake(data: any) {
    return this.httpClient.post<ApiResponse<ClientIntake>>(this.url + "/client-intake/add", data);
  }

  getIntake(id: number) {
    return this.httpClient.get<ApiResponse<ClientIntake>>(this.url + `/client-intake/get/${id}`);
  }

  updateIntake(data: any) {
    return this.httpClient.put<ApiResponse<ClientIntake>>(this.url + "/client-intake/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getMyIntakes() {
    return this.httpClient.get<ApiResponse<ClientIntake[]>>(this.url + "/client-intake/getMyIntakes");
  }
}
