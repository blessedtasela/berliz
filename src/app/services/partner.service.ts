import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Partner } from '../models/partners.interface';

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  url = environment.api;
  partnerFormIndex: any;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  addPartner(data: any) {
    return this.httpClient.post<ApiResponse<Partner>>(this.url + "/partner/add", data);
  }

  updatePartner(data: any) {
    return this.httpClient.put<ApiResponse<Partner>>(this.url + "/partner/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateFile(data: any) {
    return this.httpClient.put<ApiResponse<Partner>>(this.url + "/partner/updateFile", data);
  }

  validateToken(data: any) {
    return this.httpClient.post(this.url + "/partner/validateToken", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  activateRole(data: any) {
    return this.httpClient.put(this.url + "/partner/activateRole", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  deactivateApplication() {
    return this.httpClient.put(this.url + "/partner/deactivateAccount", {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateStatus(id: number) {
    return this.httpClient.put<ApiResponse<Partner>>(this.url + `/partner/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getPartner() {
    return this.httpClient.get<ApiResponse<Partner>>(this.url + "/partner/getPartner")
  }

  getPartnerById(id: number) {
    return this.httpClient.get<ApiResponse<Partner>>(this.url + `/partner/getById/${id}`);
  }

  getAllPartners() {
    return this.httpClient.get<ApiResponse<Partner[]>>(this.url + "/partner/get")
  }

  getActivePartners() {
    return this.httpClient.get<ApiResponse<Partner[]>>(this.url + "/partner/getActivePartners")
  }

  deletePartner(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(this.url + `/partner/delete/${id}`);
  }

  rejectApplication(id: number) {
    return this.httpClient.put<ApiResponse<Partner>>(this.url + `/partner/reject/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  setPartnerFormIndex(index: number) {
    this.partnerFormIndex = index;
    localStorage.setItem("partnerFormIndex", index.toString());
    console.log('current index:', this.partnerFormIndex);
  }
}
