import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Notifications } from '../models/announcements.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientDbService {
  db = 'BerlizClient';
  store = 'notifications';

  constructor(private ngxDbService: NgxIndexedDBService) { }

  addNotification(notification: Notifications) {
    return this.ngxDbService.add(this.store, notification);
  }

  getNotifications() {
    return this.ngxDbService.getAll(this.store);
  }
}
