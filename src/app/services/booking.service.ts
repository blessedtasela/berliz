import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Booking } from '../models/booking.model';
import { MyTrainerSummary } from '../models/progress-share.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  createBooking(data: any) {
    return this.httpClient.post<ApiResponse<Booking>>(this.url + "/booking/add", data);
  }

  getMyBookings() {
    return this.httpClient.get<ApiResponse<Booking[]>>(this.url + "/booking/getMyBookings");
  }

  getMyProviderBookings() {
    return this.httpClient.get<ApiResponse<Booking[]>>(this.url + "/booking/getMyProviderBookings");
  }

  getAllBookings() {
    return this.httpClient.get<ApiResponse<Booking[]>>(this.url + "/booking/get");
  }

  updateStatus(id: number, status: string) {
    return this.httpClient.put<ApiResponse<Booking>>(this.url + `/booking/updateStatus/${id}`, { status }, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  cancelBooking(id: number) {
    return this.httpClient.put<ApiResponse<Booking>>(this.url + `/booking/cancel/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getBooking(id: number) {
    return this.httpClient.get<ApiResponse<Booking>>(this.url + `/booking/getBooking/${id}`);
  }

  /** The distinct trainers/centers the current user has an active or past booking relationship with. */
  getMyTrainers() {
    return this.httpClient.get<ApiResponse<MyTrainerSummary[]>>(this.url + "/booking/myTrainers");
  }

}
