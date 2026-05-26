import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { StrapiUploadResponse } from '../models/Strapi.interface';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {

  private strapiUrl = environment.strapiUrl;
  private uploadUrl = `${environment.strapiUrl}/api/upload`;
  private bearerToken = environment.strapiBearerToken;

  constructor(private http: HttpClient) { }

  uploadToStrapi(file: File): Observable<StrapiUploadResponse[]> {

    const formData = new FormData();
    formData.append('files', file, file.name);

    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.bearerToken}`
    );


    return this.http.post<any>(
      this.uploadUrl,
      formData,
      { headers }
    ).pipe(
      map((res: any[]) => {

        return res.map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          fullUrl: `${this.strapiUrl}${file.url}`,
          mime: file.mime,
          size: file.size
        }));

      })
    );
  }
}