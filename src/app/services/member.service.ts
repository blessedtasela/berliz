import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  addMember(data: any) {
    return this.httpClient.post(this.url + "/member/add", data);
  }

  updateMember(data: any) {
    return this.httpClient.put(this.url + "/member/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/member/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  getMember() {
    return this.httpClient.get(this.url + "/member/getMember")
  }

  getAllMembers() {
    return this.httpClient.get(this.url + "/member/get")
  }

  getActiveMembers() {
    return this.httpClient.get(this.url + "/member/getActiveMembers")
  }

  deleteMember(id: number) {
    return this.httpClient.delete(this.url + `/member/delete/${id}`);
  }

}

