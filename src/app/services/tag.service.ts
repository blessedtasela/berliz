import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Tags } from '../models/tags.interface';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  url = environment.api;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  addTag(data: any) {
    return this.httpClient.post<{ message: string }>(this.url + "/tag/add", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getAllTags() {
    return this.httpClient.get<Tags[]>(this.url + "/tag/get");
  }

  getActiveTags() {
    return this.httpClient.get<Tags[]>(this.url + "/tag/getActiveTags");
  }

  updateTag(data: any) {
    return this.httpClient.put<{ message: string }>(this.url + "/tag/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: any) {
    return this.httpClient.put<{ message: string }>(this.url + `/tag/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  deleteTag(id: any) {
    return this.httpClient.delete<{ message: string }>(this.url + `/tag/delete/${id}`);
  }

  getTag(id: any) {
    return this.httpClient.get(this.url + `/tag/getTag/${id}`);
  }

}
