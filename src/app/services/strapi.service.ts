import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {

  constructor(private httpClient: HttpClient) { }

  uploadToStrapi(formData: FormData): Observable<any> {
    return this.httpClient.post('http://localhost:1337/api/upload', formData);
  }

}
