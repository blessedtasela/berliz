import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Booking, MyClientSummary } from '../models/booking.model';
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

  /** Client-facing: a time outside the provider's normal lead-time/availability rules. `data.notes` is required. */
  createUrgentBooking(data: any) {
    return this.httpClient.post<ApiResponse<Booking>>(this.url + "/booking/addUrgent", data);
  }

  /** Provider-only: moves a booking to a new time and confirms it in one step. */
  reschedule(id: number, data: any) {
    return this.httpClient.put<ApiResponse<Booking>>(this.url + `/booking/reschedule/${id}`, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  /** Provider-only: creates a new, already-confirmed booking directly for one of their clients. */
  createBookingForClient(data: any) {
    return this.httpClient.post<ApiResponse<Booking>>(this.url + "/booking/addForClient", data);
  }

  /** Provider-only: the distinct clients the current trainer/center has a booking relationship with. */
  getMyClients() {
    return this.httpClient.get<ApiResponse<MyClientSummary[]>>(this.url + "/booking/myClients");
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

  /** Provider-only, and only once the booking is already cancelled -- clears it off their list entirely. */
  deleteBooking(id: number) {
    return this.httpClient.delete<ApiResponse<string>>(this.url + `/booking/${id}`);
  }

  getBooking(id: number) {
    return this.httpClient.get<ApiResponse<Booking>>(this.url + `/booking/getBooking/${id}`);
  }

  /** The distinct trainers/centers the current user has an active or past booking relationship with. */
  getMyTrainers() {
    return this.httpClient.get<ApiResponse<MyTrainerSummary[]>>(this.url + "/booking/myTrainers");
  }

}
