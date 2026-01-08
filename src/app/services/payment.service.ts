import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addPayment(data: any) {
    return this.httpClient.post(this.url + "/payment/add", data);
  }

  updatePayment(data: any) {
    return this.httpClient.put(this.url + "/payment/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/payment/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getPayment() {
    return this.httpClient.get(this.url + "/payment/getPayment")
  }

  getAllPayments() {
    return this.httpClient.get(this.url + "/payment/get")
  }

  getActivePayments() {
    return this.httpClient.get(this.url + "/payment/getActivePayments")
  }

  deletePayment(id: number) {
    return this.httpClient.delete(this.url + `/payment/delete/${id}`);
  }

}

