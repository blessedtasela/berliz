import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { ProfileVisibility, PublicDirectoryEntry, PublicUserProfile, SidebarDisplay, Users } from '../models/users.interface';
import { AuthResponse } from '../models/Auth.interface';
import { ApiResponse } from '../models/Api.interface';
import { AuthRedirectService } from './auth-redirect.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  signUpFormIndex: number = 1;
  url = environment.api;
  partnerFormIndex: number = 0;

  constructor(private httpClient: HttpClient,
    private authRedirect: AuthRedirectService) { }

  signup(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(
      this.url + "/user/signup",
      data
    );
  }

  quickAdd(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(
      this.url + "/user/quickAdd",
      data,
      {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      }
    );
  }

  sendActivationToken(email: string): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(
      this.url + `/user/sendActivationToken/${email}`,
      null
    );
  }

  login(data: any): Observable<ApiResponse<AuthResponse>> {

    return this.httpClient.post<ApiResponse<AuthResponse>>(
      this.url + "/user/login",
      data,
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
      }
    );

  }

  refreshToken(
    token: any
  ): Observable<ApiResponse<AuthResponse>> {

    return this.httpClient.post<ApiResponse<AuthResponse>>(
      this.url + "/user/refreshToken",
      token
    );

  }

  /**
   * Verifies a Google ID token (obtained client-side via Google Identity Services)
   * server-side and logs the user in, creating an account on first sign-in. Issues the
   * same JWT pair as {@link login}.
   */
  loginWithGoogle(idToken: string): Observable<ApiResponse<AuthResponse>> {
    return this.httpClient.post<ApiResponse<AuthResponse>>(
      this.url + "/auth/google",
      { token: idToken },
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
      }
    );
  }

  /**
   * Verifies a Facebook user access token (obtained client-side via the Facebook JS
   * SDK) server-side and logs the user in, creating an account on first sign-in.
   * Issues the same JWT pair as {@link login}.
   */
  loginWithFacebook(accessToken: string): Observable<ApiResponse<AuthResponse>> {
    return this.httpClient.post<ApiResponse<AuthResponse>>(
      this.url + "/auth/facebook",
      { token: accessToken },
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
      }
    );
  }

  validateEmail(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/validateEmail",
      data
    );
  }

  updateEmail(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateEmail",
      data
    );
  }

  updateUser(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/update",
      data
    );
  }

  updateSuperUser(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateSuperUser",
      data
    );
  }

  updateBio(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateBio",
      data
    );
  }

  updateProfilePhoto(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateProfilePhoto",
      data
    );
  }

  updateProfilePhotoAdmin(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateProfilePhotoAdmin",
      data
    );
  }

  removePhoto(id: number): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + `/user/removePhoto/${id}`,
      null
    );
  }

  forgotPassword(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(
      this.url + "/user/forgotPassword",
      data
    );
  }

  resetPassword(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/resetPassword",
      data
    );
  }

  changePassword(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/changePassword",
      data
    );
  }

  activateAccount(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/activateAccount",
      data
    );
  }

  deactivateAccount(): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/deactivateAccount",
      {}
    );
  }

  updateStatus(id: number): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + `/user/updateUserStatus/${id}`,
      null
    );
  }

  updateUserRole(data: any): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateRole",
      data
    );
  }

  checkToken(): Observable<ApiResponse<string>> {
    return this.httpClient.get<ApiResponse<string>>(
      this.url + "/user/checkToken"
    );
  }

  getUser(): Observable<ApiResponse<Users>> {
    return this.httpClient.get<ApiResponse<Users>>(
      this.url + "/user/getUser"
    );
  }

  /**
   * Public, unauthenticated. Always resolves for an existing user — a private
   * profile comes back with `isPrivate: true` and the gated fields omitted,
   * not as an error.
   */
  getPublicProfile(id: number): Observable<ApiResponse<PublicUserProfile>> {
    return this.httpClient.get<ApiResponse<PublicUserProfile>>(
      this.url + `/user/getPublicProfile/${id}`
    );
  }

  /** Same as getPublicProfile(id), resolved by username -- what profile pages actually call now that /user/:id routes use it. */
  getPublicProfileByUsername(username: string): Observable<ApiResponse<PublicUserProfile>> {
    return this.httpClient.get<ApiResponse<PublicUserProfile>>(
      this.url + `/user/getPublicProfile/username/${username}`
    );
  }

  /** Authenticated. 3-30 chars, lowercase letters/digits/underscore, must be unique. Applies to the caller only. */
  updateUsername(username: string): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + `/user/updateUsername`,
      { username }
    );
  }

  /** Flips the signed-in user's own profile between "public" and "private". */
  updateProfileVisibility(profileVisibility: ProfileVisibility): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateProfileVisibility",
      { profileVisibility }
    );
  }

  /** Sets the signed-in user's own default sidebar display mode. */
  updateSidebarDisplay(sidebarDisplay: SidebarDisplay): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateSidebarDisplay",
      { sidebarDisplay }
    );
  }

  /** Turns the floating message popup widget on/off for the signed-in user. */
  updateMessagePopupEnabled(enabled: boolean): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + "/user/updateMessagePopupEnabled",
      { messagePopupEnabled: String(enabled) }
    );
  }

  /**
   * Public, unauthenticated member directory. Only users with profileVisibility
   * "public" are ever returned. `search` matches first/last name substring;
   * `role` is an exact (case-insensitive) match. Both optional.
   */
  getPublicDirectory(search?: string | null, role?: string | null): Observable<ApiResponse<PublicDirectoryEntry[]>> {
    let params = new HttpParams();
    if (search) { params = params.set('search', search); }
    if (role) { params = params.set('role', role); }

    return this.httpClient.get<ApiResponse<PublicDirectoryEntry[]>>(
      this.url + "/user/getPublicDirectory",
      { params }
    );
  }

  getAllUsers(): Observable<ApiResponse<Users[]>> {
    return this.httpClient.get<ApiResponse<Users[]>>(
      this.url + "/user/getAllUsers"
    );
  }

  getActiveUsers(): Observable<ApiResponse<Users[]>> {
    return this.httpClient.get<ApiResponse<Users[]>>(
      this.url + "/user/getActiveUsers"
    );
  }

  deleteUser(id: number): Observable<ApiResponse<string>> {
    return this.httpClient.delete<ApiResponse<string>>(
      this.url + `/user/delete/${id}`
    );
  }

  forcePasswordChange(id: number, password: string): Observable<ApiResponse<string>> {
    return this.httpClient.put<ApiResponse<string>>(
      this.url + `/user/forcePasswordChange/${id}`,
      { password }
    );
  }

  setSignupFormIndex(index: number) {
    this.signUpFormIndex = index;
    localStorage.setItem("signUpFormIndex", index.toString());
    console.log('current index:', this.signUpFormIndex);
  }

  removeSignupFormIndex(index: number) {
    this.signUpFormIndex = index;
    localStorage.removeItem("signUpFormIndex");
    console.log('current index:', this.signUpFormIndex);
  }


  clearLogOutLocalStorage() {
    localStorage.removeItem('todaysTodo');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }

  logout(): any {
    this.clearLogOutLocalStorage();
    this.authRedirect.goToLogin();
  }

  setPartnerFormIndex(index: number) {
    this.partnerFormIndex = index;
    localStorage.setItem("partnerFormIndex", index.toString());
    console.log('current index:', this.signUpFormIndex);
  }

  startRefreshTokenTimer() {
    // 59 minutes = 59 * 60 * 1000 ms
    const refreshInterval = 59 * 60 * 1000;

    setTimeout(() => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        this.refreshToken({ token: refreshToken }).subscribe({
          next: (response: any) => {
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
          },
          error: (err) => {
            console.error('Token refresh failed:', err);
            // Handle: redirect to login, show modal, etc.
          }
        });
      }
    }, refreshInterval);
  }
}
