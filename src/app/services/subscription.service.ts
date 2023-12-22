import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  addSubscription(data: any) {
    return this.httpClient.post(this.url + "/subscription/add", data);
  }

  updateSubscription(data: any) {
    return this.httpClient.put(this.url + "/subscription/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/subscription/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getSubscription() {
    return this.httpClient.get(this.url + "/subscription/getSubscription")
  }

  getAllSubscriptions() {
    return this.httpClient.get(this.url + "/subscription/get")
  }

  getActiveSubscriptions() {
    return this.httpClient.get(this.url + "/subscription/getActiveSubscriptions")
  }

  deleteSubscription(id: number) {
    return this.httpClient.delete(this.url + `/subscription/delete/${id}`);
  }

}

