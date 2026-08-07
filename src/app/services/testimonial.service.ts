import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { Testimonials } from '../models/testimonials.model';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {

  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addTestimonial(data: any) {
    return this.httpClient.post<ApiResponse<Testimonials>>(this.url + "/testimonial/add", data);
  }

  updateTestimonial(data: any) {
    return this.httpClient.put<ApiResponse<Testimonials>>(this.url + "/testimonial/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put<ApiResponse<Testimonials>>(this.url + `/testimonial/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getTestimonial(id: number) {
    return this.httpClient.get<ApiResponse<Testimonials>>(this.url + `/testimonial/getTestimonial/${id}`)
  }

  getAllTestimonials() {
    return this.httpClient.get<ApiResponse<Testimonials[]>>(this.url + "/testimonial/get")
  }

  getActiveTestimonials() {
    return this.httpClient.get<ApiResponse<Testimonials[]>>(this.url + "/testimonial/getActiveTestimonials")
  }

  getByTrainer(trainerId: number) {
    return this.httpClient.get<ApiResponse<Testimonials[]>>(this.url + `/testimonial/getByTrainer/${trainerId}`)
  }

  getByCenter(centerId: number) {
    return this.httpClient.get<ApiResponse<Testimonials[]>>(this.url + `/testimonial/getByCenter/${centerId}`)
  }

  updateFeatured(id: number) {
    return this.httpClient.put<ApiResponse<Testimonials>>(this.url + `/testimonial/updateFeatured/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  deleteTestimonial(id: number) {
    return this.httpClient.delete<ApiResponse<Testimonials>>(this.url + `/testimonial/delete/${id}`);
  }

}
