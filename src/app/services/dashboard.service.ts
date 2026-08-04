import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PartnerDetails } from '../models/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  url = environment.api;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  getDashboardDetails() {
    return this.httpClient.get<Record<string, any>>(this.url + "/dashboard/details")
}

getBerlizDetails() {
  return this.httpClient.get<Record<string, any>>(this.url + "/dashboard/berliz")
}

getPartnerDetails() {
  return this.httpClient.get<PartnerDetails>(this.url + "/dashboard/getPartnerDetails")
}

getProfileData() {
  return this.httpClient.get<Record<string, any>>(this.url + "/dashboard/getProfileData")
}
}
