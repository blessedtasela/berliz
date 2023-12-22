import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  signUpFormIndex: number = 1;
  url = environment.apiUrl;
  partnerFormIndex: number = 0;

  constructor(private httpClient: HttpClient,
    private router: Router) { }

  signup(data: any) {
    return this.httpClient.post(this.url + "/user/signup", data);
  }

  login(data: any) {
    return this.httpClient.post(this.url + "/user/login", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  refreshToken(token: any) {
    return this.httpClient.post(this.url + "/user/refreshToken", token);
  }

  updateUser(data: any) {
    return this.httpClient.put(this.url + "/user/update", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateSuperUser(data: any) {
    return this.httpClient.put(this.url + "/user/updateSuperUser", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateBio(data: any) {
    return this.httpClient.put(this.url + "/user/updateBio", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    })
  }

  updateProfilePhoto(data: any) {
    return this.httpClient.put(this.url + "/user/updateProfilePhoto", data);
  }

  updateProfilePhotoAdmin(data: any) {
    return this.httpClient.put(this.url + "/user/updateProfilePhotoAdmin", data);
  }


  forgotPassword(data: any) {
    return this.httpClient.post(this.url + "/user/forgotPassword", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  validatePasswordToken(data: any) {
    return this.httpClient.post(this.url + "/user/validatePasswordToken", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  resetPassword(data: any) {
    return this.httpClient.put(this.url + "/user/resetPassword", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  changePassword(data: any) {
    return this.httpClient.put(this.url + "/user/changePassword", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  activateAccount(data: any) {
    return this.httpClient.put(this.url + "/user/activateAccount", data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  deactivateAccount() {
    return this.httpClient.put(this.url + "/user/deactivateAccount", {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateStatus(id: number) {
    return this.httpClient.put(this.url + `/user/updateStatus/${id}`, null, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  updateUserRole(data: any) {
    return this.httpClient.put(this.url + `/user/updateRole`, data, {
      headers: new HttpHeaders().set('Content-Type', 'application/json')
    });
  }

  checkToken() {
    return this.httpClient.get(this.url + '/user/checkToken');
  }

  getUser() {
    return this.httpClient.get(this.url + "/user/getUser")
  }

  getAllUsers() {
    return this.httpClient.get(this.url + "/user/get")
  }

  getActiveUsers() {
    return this.httpClient.get(this.url + "/user/getActiveUsers")
  }

  deleteUser(id: number) {
    return this.httpClient.delete(this.url + `/user/delete/${id}`);
  }

  setLoginFormIndex(index: number) {
    this.signUpFormIndex = index;
    localStorage.setItem("signUpFormIndex", index.toString());
    console.log('current index:', this.signUpFormIndex);
  }

  logout(): any {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      this.router.navigate(['/login']);
  }

  setPartnerFormIndex(index: number) {
    this.partnerFormIndex = index;
    localStorage.setItem("partnerFormIndex", index.toString());
    console.log('current index:', this.signUpFormIndex);
  }

}
