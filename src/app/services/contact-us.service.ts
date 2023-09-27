import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactUsService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  addContactUs(data: any) {
    return this.httpClient.post(this.url + "/contactUs/add", data,{
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllContactUs() {
    return this.httpClient.get(this.url + "/contactUs/get");
  }

  updateContactUs(data: any) {
    return this.httpClient.put(this.url + "/contactUs/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any) {
    return this.httpClient.put(this.url + `/contactUs/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteContactUs(id: any) {
    return this.httpClient.delete(this.url + `/contactUs/delete/${id}`);
  }
  
  getContactUs(id: any) {
    return this.httpClient.get(this.url + `/contactUs/${id}`);
  }
  
}
