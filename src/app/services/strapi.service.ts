import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, catchError, filter, map, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { StrapiUploadResponse } from '../models/Strapi.interface';
import { resolveStrapiUrl } from '../utils/strapi-url.util';
import { UploadRules, describeUploadError, effectiveUploadType, validateUpload } from '../utils/media-upload.util';

/** One step of an upload: `percent` while bytes are going up, then a final `done` carrying the stored file(s). */
export interface UploadProgress {
  percent: number;
  done: boolean;
  result?: StrapiUploadResponse[];
}

/**
 * Uploads go through Spring Boot (which holds the Strapi API token server-side)
 * rather than straight to Strapi from the browser — see /strapi/upload on the
 * backend. Reads still resolve straight to Strapi's public URL (resolveStrapiUrl),
 * that's unauthenticated and unaffected by this.
 *
 * Every upload is checked against what the server accepts before any bytes are sent,
 * and every failure leaves here as `{ status, error: { message, detail } }` with a
 * message a person can act on (too big / wrong type / offline / media server down),
 * so callers that just show `err.error.message` or `err.error.detail` get a real reason.
 */
@Injectable({
  providedIn: 'root'
})
export class StrapiService {

  private uploadUrl = `${environment.api}/strapi/upload`;

  constructor(private http: HttpClient) { }

  /** Uploads and resolves with the stored file(s) once finished. Use {@link uploadWithProgress} to show a bar. */
  uploadToStrapi(file: File, rules?: UploadRules): Observable<StrapiUploadResponse[]> {
    return this.uploadWithProgress(file, rules).pipe(
      filter(step => step.done),
      map(step => step.result ?? [])
    );
  }

  /** Emits `{percent}` as bytes go up, then one `{done: true, result}`. */
  uploadWithProgress(file: File, rules?: UploadRules): Observable<UploadProgress> {
    const problem = validateUpload(file, rules);
    if (problem) {
      return throwError(() => this.shape(400, problem));
    }

    // Some devices (and drag-and-drop from certain file managers) hand over a file with no
    // MIME type; the server rejects those, so send the type we can work out from the name.
    const type = effectiveUploadType(file);
    const toSend = file.type === type ? file : new File([file], file.name, { type, lastModified: file.lastModified });

    const formData = new FormData();
    formData.append('files', toSend, toSend.name);

    // No Authorization header here — the auth interceptor attaches the Berliz
    // JWT automatically for any request that isn't a public/Strapi URL.
    return this.http.post<any[]>(this.uploadUrl, formData, { reportProgress: true, observe: 'events' }).pipe(
      map((event: HttpEvent<any[]>): UploadProgress | null => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total ? Math.min(99, Math.round((event.loaded / event.total) * 100)) : 0;
          return { percent, done: false };
        }
        if (event.type === HttpEventType.Response) {
          const files = (event.body ?? []).map(f => ({
            id: f.id,
            name: f.name,
            url: f.url,
            fullUrl: resolveStrapiUrl(f.url),
            mime: f.mime,
            size: f.size
          }));
          return { percent: 100, done: true, result: files };
        }
        return null;
      }),
      filter((step): step is UploadProgress => step !== null),
      catchError(err => throwError(() => this.shape(err?.status ?? 0, describeUploadError(err), err?.error?.detail)))
    );
  }

  private shape(status: number, message: string, detail?: string) {
    return { status, error: { message, detail: message || detail } };
  }
}
