import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  url = environment.api;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  addNotification(data: any) {
    return this.httpClient.post(this.url + "/notification/add", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllNotifications() {
    return this.httpClient.get(this.url + "/notification/get");
  }

  getMyNotifications() {
    return this.httpClient.get(this.url + "/notification/getMyNotifications");
  }

  bulkAction(data: any) {
    return this.httpClient.put(this.url + "/notification/bulkAction", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteNotification(id: any) {
    return this.httpClient.delete(this.url + `/notification/delete/${id}`);
  }

  readNotification(id: any) {
    return this.httpClient.put(this.url + `/notification/read/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

}

