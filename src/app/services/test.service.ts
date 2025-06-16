import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private apiUrl = 'http://localhost:1337/api/upload/'; // URL of the Strapi upload endpoint

  constructor(private http: HttpClient) {}

  // Method to upload a file
uploadFile(file: File, ): Observable<any> {
  const formData = new FormData();
  formData.append('files', file, file.name);

  // const headers = new HttpHeaders({
  //   Authorization: `Bearer ${jwt}`,
  // });

  return this.http.post(this.apiUrl, formData);
}

}
