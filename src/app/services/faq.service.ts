import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Faq } from '../models/faq.model';

@Injectable({
  providedIn: 'root'
})
export class FaqService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addFaq(data: any) {
    return this.httpClient.post<ApiResponse<Faq>>(this.url + "/faq/add", data);
  }

  updateFaq(data: any) {
    return this.httpClient.put<ApiResponse<Faq>>(this.url + "/faq/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateStatus(id: number) {
    return this.httpClient.put<ApiResponse<Faq>>(this.url + `/faq/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllFaqs() {
    return this.httpClient.get<ApiResponse<Faq[]>>(this.url + "/faq/get");
  }

  getActiveFaqs() {
    return this.httpClient.get<ApiResponse<Faq[]>>(this.url + "/faq/getActiveFaqs");
  }

  deleteFaq(id: number) {
    return this.httpClient.delete<ApiResponse<Faq>>(this.url + `/faq/delete/${id}`);
  }

}
