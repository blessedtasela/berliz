import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import { SavedItemRef, SavedItemsResponse, SavedTargetType } from '../models/saved.interface';
import { AuthService } from './auth.service';
import { SnackBarService } from './snack-bar.service';

/**
 * Bookmarks. Holds the set of everything the current user has saved (as
 * `"POST:12"` keys) so any card can render its state and toggle without its
 * own request bookkeeping. `refresh()` is cheap (one call) and safe to call
 * whenever a bookmarked-aware surface loads.
 */
@Injectable({ providedIn: 'root' })
export class SavedService {
  private url = environment.api;
  private saved = new Set<string>();
  private loaded = false;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private snackBar: SnackBarService,
  ) {}

  private key(type: SavedTargetType, id: number): string {
    return `${type}:${id}`;
  }

  isSaved(type: SavedTargetType, id: number): boolean {
    return this.saved.has(this.key(type, id));
  }

  /** Loads the saved-set once; call again with force to re-sync after external changes. */
  refresh(force = false): void {
    if ((this.loaded && !force) || !this.auth.isAuthenticated()) return;
    this.http.get<ApiResponse<SavedItemRef[]>>(this.url + '/saved/refs').pipe(take(1)).subscribe({
      next: res => {
        this.saved = new Set((res.data ?? []).map(r => this.key(r.targetType, r.targetId)));
        this.loaded = true;
      },
      error: () => { /* leave the set as-is */ },
    });
  }

  /** Optimistic toggle; reverts + toasts on failure. */
  toggle(type: SavedTargetType, id: number): void {
    const k = this.key(type, id);
    const wasSaved = this.saved.has(k);
    if (wasSaved) this.saved.delete(k); else this.saved.add(k);

    const req$ = wasSaved
      ? this.http.delete<ApiResponse<void>>(`${this.url}/saved/${type}/${id}`)
      : this.http.post<ApiResponse<void>>(`${this.url}/saved`, { targetType: type, targetId: id });

    req$.pipe(take(1)).subscribe({
      next: () => this.snackBar.openSnackBar(wasSaved ? 'Removed from saved' : 'Saved', ''),
      error: () => {
        if (wasSaved) this.saved.add(k); else this.saved.delete(k);
        this.snackBar.openSnackBar('Could not update saved items', 'error');
      },
    });
  }

  /** Hydrated posts + workouts for the "Saved" view. */
  list(): Observable<ApiResponse<SavedItemsResponse>> {
    return this.http.get<ApiResponse<SavedItemsResponse>>(this.url + '/saved');
  }
}
