import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Booking, BookingPlan, BookingPlanPreview, BookingPlanRequest, MyClientSummary, NewMemberOffer } from '../models/booking.model';
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

  /** Whether the signed-in client still gets the new-member offer on a first trial, and the platform default trial price. */
  getNewMemberOffer() {
    return this.httpClient.get<ApiResponse<NewMemberOffer>>(this.url + "/booking/newMemberOffer");
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

  // ── Monthly plans: several sessions booked in one go ─────────────────────

  /** Checks the plan against the provider's real availability and prices it; saves nothing. */
  previewPlan(data: BookingPlanRequest) {
    return this.httpClient.post<ApiResponse<BookingPlanPreview>>(this.url + "/booking/plan/preview", data);
  }

  /** Books every session at once (all or none); the provider then accepts or declines the whole plan. */
  createPlan(data: BookingPlanRequest) {
    return this.httpClient.post<ApiResponse<BookingPlan>>(this.url + "/booking/plan/add", data);
  }

  getMyPlans() {
    return this.httpClient.get<ApiResponse<BookingPlan[]>>(this.url + "/booking/plan/mine");
  }

  getProviderPlans() {
    return this.httpClient.get<ApiResponse<BookingPlan[]>>(this.url + "/booking/plan/provider");
  }

  /** Provider (or admin): accept or decline every session of the plan still waiting for a reply. */
  respondToPlan(id: number, action: 'confirm' | 'decline') {
    return this.httpClient.put<ApiResponse<BookingPlan>>(this.url + `/booking/plan/${id}/respond`, { action });
  }

  /** Client: cancels the plan's upcoming sessions, each under the normal cancellation and refund rules. */
  cancelPlan(id: number) {
    return this.httpClient.put<ApiResponse<BookingPlan>>(this.url + `/booking/plan/${id}/cancel`, null);
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

  /** Sends the client the "pay for your session" reminder right now (the booking's provider or an admin). */
  remindPayment(id: number) {
    return this.httpClient.post<ApiResponse<string>>(this.url + `/booking/remindPayment/${id}`, null);
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
