import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CenterService {
  url = environment.apiUrl;

  constructor(private httpClient: HttpClient) { }

  addCenter(data: any) {
    return this.httpClient.post(this.url + "/center/add", data);
  }

  updateCenter(data: any) {
    return this.httpClient.put(this.url + "/center/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updatePhoto(data: any) {
    return this.httpClient.put(this.url + "/center/updatePhoto", data);
  }

  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/center/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getCenter() {
    return this.httpClient.get(this.url + "/center/getCenter")
  }

  getAllCenters() {
    return this.httpClient.get(this.url + "/center/get")
  }

  getCenterLikes() {
    return this.httpClient.get(this.url + "/center/getCenterLikes")
  }

  getActiveCenters() {
    return this.httpClient.get(this.url + "/center/getActiveCenters")
  }

  deleteCenter(id: number) {
    return this.httpClient.delete(this.url + `/center/delete/${id}`);
  }

  likeCenter(id: number) {
    return this.httpClient.put(this.url + `/center/like/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

}

