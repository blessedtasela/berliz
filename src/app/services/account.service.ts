import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { AccountDeletionResult } from '../models/account.model';

/** Self-service account management -- mirrors `AccountRest` on the backend. */
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  url = environment.api;

  constructor(private httpClient: HttpClient) { }

  /**
   * Permanently deletes the signed-in user's account (personal data scrubbed, account deactivated). A password
   * is only needed for accounts that sign in with one; Google / Facebook / Apple accounts send none.
   *
   * The backend answers HTTP 200 for a refusal too (`success: false`, with the reason in `message`), so callers
   * must check `success`, not just the HTTP status.
   */
  deleteMyAccount(password?: string): Observable<ApiResponse<AccountDeletionResult>> {
    return this.httpClient.post<ApiResponse<AccountDeletionResult>>(
      this.url + '/account/delete',
      password ? { password } : {}
    );
  }
}
