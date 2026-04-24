import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Notifications } from '../models/Notifications.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  url = environment.api + '/notification';

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  addNotification(data: any) {
    return this.httpClient.post(this.url + "/add", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllNotifications() {
    return this.httpClient.get<Notifications[]>(this.url + `/get`);
  }

  getMyNotifications() {
    return this.httpClient.get<Notifications[]>(this.url + `/getMyNotifications`);
  }


  bulkAction(data: any) {
    return this.httpClient.put(this.url + "/bulkAction", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteNotification(id: any) {
    return this.httpClient.delete(this.url + `/delete/${id}`);
  }

  readNotification(id: any) {
    return this.httpClient.put(this.url + `/read/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

}

