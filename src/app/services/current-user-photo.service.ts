import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { UserService } from './user.service';

/**
 * The signed-in viewer's own profile photo (as a data: URI, or the fallback
 * icon), fetched once and cached for the session -- used anywhere a compose
 * box needs "your avatar" (e.g. PostCommentsComponent's add-comment row)
 * without every instance on the page firing its own GET /user/getUser.
 */
@Injectable({
  providedIn: 'root'
})
export class CurrentUserPhotoService {
  private static readonly FALLBACK = '../../../assets/icons/user.png';

  private photo$: Observable<string> | null = null;

  constructor(private userService: UserService) {}

  get(): Observable<string> {
    if (!this.photo$) {
      this.photo$ = this.userService.getUser().pipe(
        map(res => res.data?.profilePhoto ? 'data:image/*;base64,' + res.data.profilePhoto : CurrentUserPhotoService.FALLBACK),
        catchError(() => of(CurrentUserPhotoService.FALLBACK)),
        shareReplay(1),
      );
    }
    return this.photo$;
  }
}
