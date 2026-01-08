import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addTestimonial(data: any) {
    return this.httpClient.post(this.url + "/testimonial/add", data);
  }

  updateTestimonial(data: any) {
    return this.httpClient.put(this.url + "/testimonial/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/testimonial/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getTestimonial() {
    return this.httpClient.get(this.url + "/testimonial/getTestimonial")
  }

  getAllTestimonials() {
    return this.httpClient.get(this.url + "/testimonial/get")
  }

  getActiveTestimonials() {
    return this.httpClient.get(this.url + "/testimonial/getActiveCenters")
  }

  deleteTestimonial(id: number) {
    return this.httpClient.delete(this.url + `/testimonial/delete/${id}`);
  }

}

