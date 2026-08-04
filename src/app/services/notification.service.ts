import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Notifications } from '../models/Notifications.interface';
import { ApiResponse } from '../models/Api.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  url = environment.api;

  constructor(private http: HttpClient) { }

  // ─────────────────────────────
  // READ
  // ─────────────────────────────

  addNotification(data: any) {
    return this.http.post<ApiResponse<Notifications>>(`${this.url}/notification/add`, data);
  }

  getAllNotifications() {
    return this.http.get<ApiResponse<Notifications[]>>(`${this.url}/notification/get`);
  }

  getMyNotifications() {
    return this.http.get<ApiResponse<Notifications[]>>(`${this.url}/notification/getMyNotifications`);
  }

  getUnreadNotifications() {
    return this.http.get<ApiResponse<Notifications[]>>(`${this.url}/notification/getMyUnreadNotifications`);
  }

  getReadNotifications() {
    return this.http.get<ApiResponse<Notifications[]>>(`${this.url}/notification/getMyReadNotifications`);
  }

  getNotificationById(id: number) {
    return this.http.get<ApiResponse<Notifications>>(`${this.url}/notification/get/${id}`);
  }

  getUnreadCount() {
    return this.http.get<ApiResponse<number>>(`${this.url}/notification/unreadCount`);
  }

  getNotificationsByType(type: string) {
    return this.http.get<ApiResponse<Notifications[]>>(`${this.url}/notification/type/${type}`);
  }

  getNotificationsByDate(date: string) {
    return this.http.get<ApiResponse<Notifications[]>>(`${this.url}/notification/date/${date}`);
  }

  getNotificationsPaginated(page: number, size: number) {
    return this.http.get<ApiResponse<Notifications[]>>(
      `${this.url}/notification/paginated?page=${page}&size=${size}`);
  }

  // ─────────────────────────────
  // MARK READ / UNREAD
  // ─────────────────────────────

  markAsRead(id: number) {
    return this.http.put<ApiResponse<Notifications>>(`${this.url}/notification/markAsRead/${id}`, {});
  }

  markAsUnread(id: number) {
    return this.http.put<ApiResponse<Notifications>>(`${this.url}/notification/markAsUnread/${id}`, {});
  }

  markAllAsRead() {
    return this.http.put<ApiResponse<void>>(`${this.url}/notification/markAllAsRead`, {});
  }

  markAllAsUnread() {
    return this.http.put<ApiResponse<void>>(`${this.url}/notification/markAllAsUnread`, {});
  }

  // ─────────────────────────────
  // BULK ACTION
  // ─────────────────────────────

  bulkAction(data: { ids: string; action: string}) {
    return this.http.put<ApiResponse<void>>(`${this.url}/notification/bulkAction`, data);
  }

  // ─────────────────────────────
  // DELETE
  // ─────────────────────────────

  deleteNotification(id: number) {
    return this.http.delete<ApiResponse<void>>(`${this.url}/notification/delete/${id}`);
  }

  deleteAllNotifications() {
    return this.http.delete<ApiResponse<void>>(`${this.url}/notification/deleteAll`);
  }
}