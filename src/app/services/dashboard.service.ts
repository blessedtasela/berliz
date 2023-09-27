import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  getDetails() {
    return this.httpClient.get(this.url + "/dashboard/details")
}

getBerlizDetails() {
  return this.httpClient.get(this.url + "/dashboard/berliz")
}

}
