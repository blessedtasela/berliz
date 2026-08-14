import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from 'src/environments/environment';
import { StrapiUploadResponse } from '../models/Strapi.interface';
import { resolveStrapiUrl } from '../utils/strapi-url.util';

/**
 * Uploads go through Spring Boot (which holds the Strapi API token server-side)
 * rather than straight to Strapi from the browser — see /strapi/upload on the
 * backend. Reads still resolve straight to Strapi's public URL (resolveStrapiUrl),
 * that's unauthenticated and unaffected by this.
 */
@Injectable({
  providedIn: 'root'
})
export class StrapiService {

  private uploadUrl = `${environment.api}/strapi/upload`;

  constructor(private http: HttpClient) { }

  uploadToStrapi(file: File): Observable<StrapiUploadResponse[]> {

    const formData = new FormData();
    formData.append('files', file, file.name);

    // No Authorization header here — the auth interceptor attaches the Berliz
    // JWT automatically for any request that isn't a public/Strapi URL.
    return this.http.post<any>(
      this.uploadUrl,
      formData
    ).pipe(
      map((res: any[]) => {

        return res.map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          fullUrl: resolveStrapiUrl(file.url),
          mime: file.mime,
          size: file.size
        }));

      })
    );
  }
}