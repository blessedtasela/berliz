import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {
  url = environment.api;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  addNewsletter(data: any) {
    return this.httpClient.post(this.url + "/newsletter/add", data,{
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllNewsletters() {
    return this.httpClient.get(this.url + "/newsletter/get");
  }

  getActiveNewsletters() {
    return this.httpClient.get(this.url + "/newsletter/getActiveNewsletters");
  }

  getNewsletterMessages() {
    return this.httpClient.get(this.url + "/newsletter/getNewsletterMessages");
  }

  updateNewsletter(data: any) {
    return this.httpClient.put(this.url + "/newsletter/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any) {
    return this.httpClient.put(this.url + `/newsletter/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  sendMessage(data: any) {
    return this.httpClient.post(this.url + "/newsletter/sendMessage", data,{
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  sendBulkMessage(data: any) {
    return this.httpClient.post(this.url + "/newsletter/sendBulkMessage", data,{
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  deleteNewsletter(id: any) {
    return this.httpClient.delete(this.url + `/newsletter/delete/${id}`);
  }
  
  getNewsletter(id: any) {
    return this.httpClient.get(this.url + `/getNewsletter/${id}`);
  }
  
}
