import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Payments } from '../models/payment.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addPayment(data: any): Observable<ApiResponse<Payments>> {
    return this.httpClient.post<ApiResponse<Payments>>(this.url + "/payment/add", data);
  }

  updatePayment(data: any): Observable<ApiResponse<Payments>> {
    return this.httpClient.put<ApiResponse<Payments>>(this.url + "/payment/update", data);
  }

  updateStatus(id: number): Observable<ApiResponse<Payments>> {
    return this.httpClient.put<ApiResponse<Payments>>(this.url + `/payment/updateStatus/${id}`, {});
  }

  getPayment(id: number): Observable<ApiResponse<Payments>> {
    return this.httpClient.get<ApiResponse<Payments>>(this.url + `/payment/getPayment/${id}`);
  }

  getAllPayments(): Observable<ApiResponse<Payments[]>> {
    return this.httpClient.get<ApiResponse<Payments[]>>(this.url + "/payment/get");
  }

  getActivePayments(): Observable<ApiResponse<Payments[]>> {
    return this.httpClient.get<ApiResponse<Payments[]>>(this.url + "/payment/getActivePayments");
  }

  getMyPayments(): Observable<ApiResponse<Payments[]>> {
    return this.httpClient.get<ApiResponse<Payments[]>>(this.url + "/payment/getMyPayments");
  }

  deletePayment(id: number): Observable<ApiResponse<void>> {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/payment/delete/${id}`);
  }

}
