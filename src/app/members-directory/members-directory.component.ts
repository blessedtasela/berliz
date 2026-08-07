import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { PublicDirectoryEntry } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { loadPublicDirectory } from 'src/app/state/user-profile/user-profile.actions';
import {
  selectPublicDirectory,
  selectPublicDirectoryError,
  selectPublicDirectoryLoading,
} from 'src/app/state/user-profile/user-profile.selector';

interface RoleOption {
  label: string;
  value: string | null;
}

/**
 * Member directory — `/members`, no route guard: anonymous visitors can land
 * on the page itself, but the backend requires sign-in for the actual list
 * (SecurityConfig), so we don't even try the network call when logged out —
 * `needsLogin` drives a "log in to view members" prompt in the template
 * instead of firing a request that would just 401.
 *
 * Backed by GET /user/getPublicDirectory (capped at 100 rows server-side), so this
 * stays a simple filtered list rather than a full pagination UI.
 */
@Component({
  selector: 'app-members-directory',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconsModule],
  templateUrl: './members-directory.component.html'
})
export class MembersDirectoryComponent implements OnInit, OnDestroy {

  readonly roleOptions: RoleOption[] = [
    { label: 'All', value: null },
    { label: 'Users', value: 'user' },
    { label: 'Clients', value: 'client' },
    { label: 'Trainers', value: 'trainer' },
    { label: 'Centers', value: 'center' },
    { label: 'Members', value: 'member' },
  ];

  members: PublicDirectoryEntry[] = [];
  loading = false;
  error: string | null = null;

  searchTerm = '';
  activeRole: string | null = null;

  needsLogin = true;

  private search$ = new Subject<string>();
  private subs: Subscription[] = [];

  constructor(private store: Store, private authService: AuthService) {
    this.needsLogin = !this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    if (this.needsLogin) { return; }

    this.store.dispatch(loadPublicDirectory({ search: null, role: null }));

    this.subs.push(
      this.store.select(selectPublicDirectory).subscribe(list => this.members = list ?? []),
      this.store.select(selectPublicDirectoryLoading).subscribe(loading => this.loading = loading),
      this.store.select(selectPublicDirectoryError).subscribe(error => this.error = error),

      this.search$.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(term => this.dispatchLoad(term, this.activeRole))
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── Filters ──────────────────────────────────────────────────────────────

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.search$.next(term);
  }

  selectRole(role: string | null): void {
    if (role === this.activeRole) { return; }
    this.activeRole = role;
    this.dispatchLoad(this.searchTerm, role);
  }

  private dispatchLoad(search: string, role: string | null): void {
    this.store.dispatch(loadPublicDirectory({ search: search?.trim() || null, role }));
  }

  // ── View helpers ─────────────────────────────────────────────────────────

  get isFiltered(): boolean {
    return !!this.searchTerm.trim() || !!this.activeRole;
  }

  // The raw error can be a backend/network message (e.g. "Full authentication
  // is required to access this resource") that means nothing to a visitor and
  // isn't even accurate here — this page needs no login. Always show one
  // plain, non-technical sentence instead of whatever the server said.
  get friendlyError(): string {
    return "We couldn't load members right now. Please refresh the page or try again in a moment.";
  }

  fullName(member: PublicDirectoryEntry): string {
    return `${member.firstname ?? ''} ${member.lastname ?? ''}`.trim();
  }

  photoSrc(member: PublicDirectoryEntry): string {
    return member.profilePhoto
      ? 'data:image/*;base64,' + member.profilePhoto
      : '../../assets/icons/user.png';
  }

  location(member: PublicDirectoryEntry): string | null {
    const parts = [member.city, member.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }

  trackById(_: number, member: PublicDirectoryEntry): number {
    return member.id;
  }
}
