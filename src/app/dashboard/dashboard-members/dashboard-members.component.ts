import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { PublicDirectoryEntry } from 'src/app/models/users.interface';
import { Connection } from 'src/app/models/connection.model';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadPublicDirectory } from 'src/app/state/user-profile/user-profile.actions';
import {
  selectPublicDirectory,
  selectPublicDirectoryError,
  selectPublicDirectoryLoading,
} from 'src/app/state/user-profile/user-profile.selector';
import {
  cancelConnectionRequest,
  loadMyConnections,
  loadPendingRequests,
  respondToConnectionRequest,
  sendConnectionRequest,
} from 'src/app/state/connection/connection.actions';
import { selectConnectionError, selectMyConnections, selectPendingRequests } from 'src/app/state/connection/connection.selectors';

type ConnectStatus = 'self' | 'none' | 'incoming' | 'outgoing' | 'connected';

interface RoleOption {
  label: string;
  value: string | null;
}

/**
 * Dashboard-native member directory — /dashboard/member-directory. Same
 * data/logic as the public /members page, but light dashboard theme and no
 * link out to /user/:id (no dashboard-native profile page exists yet, so
 * cards show info + connection actions only, no "view profile" link, rather
 * than sending a signed-in user back out to a public page).
 */
@Component({
  selector: 'app-dashboard-members',
  templateUrl: './dashboard-members.component.html',
})
export class DashboardMembersComponent implements OnInit, OnDestroy {

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

  myConnections: Connection[] = [];
  pendingRequests: Connection[] = [];
  private currentUserId: number | null = null;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private subs: Subscription[] = [];

  constructor(
    private store: Store,
    private authService: AuthService,
    private router: Router,
    private snackBar: SnackBarService,
  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.dispatchLoad(this.searchTerm, this.activeRole);
    this.store.dispatch(loadMyConnections());
    this.store.dispatch(loadPendingRequests());

    this.subs.push(
      this.store.select(selectPublicDirectory).pipe(takeUntil(this.destroy$)).subscribe(list => this.members = list ?? []),
      this.store.select(selectPublicDirectoryLoading).pipe(takeUntil(this.destroy$)).subscribe(loading => this.loading = loading),
      this.store.select(selectPublicDirectoryError).pipe(takeUntil(this.destroy$)).subscribe(error => this.error = error),
      this.store.select(selectMyConnections).pipe(takeUntil(this.destroy$)).subscribe(list => this.myConnections = list ?? []),
      this.store.select(selectPendingRequests).pipe(takeUntil(this.destroy$)).subscribe(list => this.pendingRequests = list ?? []),
      this.store.select(selectConnectionError).pipe(takeUntil(this.destroy$)).subscribe(error => {
        if (error) this.snackBar.openSnackBar(error, 'error');
      }),

      this.search$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      ).subscribe(term => this.dispatchLoad(term, this.activeRole)),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subs.forEach(s => s.unsubscribe());
  }

  refresh(): void {
    this.dispatchLoad(this.searchTerm, this.activeRole);
    this.store.dispatch(loadMyConnections());
    this.store.dispatch(loadPendingRequests());
  }

  // ── Connections ──────────────────────────────────────────────────────────

  connectStatus(member: PublicDirectoryEntry): ConnectStatus {
    if (this.currentUserId != null && member.id === this.currentUserId) return 'self';
    if (this.myConnections.some(c => c.otherUserId === member.id)) return 'connected';
    const pending = this.pendingRequests.find(c => c.otherUserId === member.id);
    if (pending) return pending.direction === 'incoming' ? 'incoming' : 'outgoing';
    return 'none';
  }

  private pendingRequestFor(member: PublicDirectoryEntry): Connection | undefined {
    return this.pendingRequests.find(c => c.otherUserId === member.id);
  }

  connect(member: PublicDirectoryEntry): void {
    this.store.dispatch(sendConnectionRequest({ recipientId: member.id }));
  }

  cancelRequest(member: PublicDirectoryEntry): void {
    const request = this.pendingRequestFor(member);
    if (request) this.store.dispatch(cancelConnectionRequest({ id: request.id }));
  }

  acceptRequest(member: PublicDirectoryEntry): void {
    const request = this.pendingRequestFor(member);
    if (request) this.store.dispatch(respondToConnectionRequest({ id: request.id, status: 'accepted' }));
  }

  declineRequest(member: PublicDirectoryEntry): void {
    const request = this.pendingRequestFor(member);
    if (request) this.store.dispatch(respondToConnectionRequest({ id: request.id, status: 'rejected' }));
  }

  messageMember(): void {
    this.router.navigate(['/dashboard/messages']);
  }

  // ── Filters ──────────────────────────────────────────────────────────────

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.search$.next(term);
  }

  selectRole(role: string | null): void {
    if (role === this.activeRole) return;
    this.activeRole = role;
    this.dispatchLoad(this.searchTerm, role);
  }

  private dispatchLoad(search: string, role: string | null): void {
    this.store.dispatch(loadPublicDirectory({ search: search?.trim() || null, role }));
  }

  get isFiltered(): boolean {
    return !!this.searchTerm.trim() || !!this.activeRole;
  }

  get friendlyError(): string {
    return "We couldn't load members right now. Try refreshing.";
  }

  fullName(member: PublicDirectoryEntry): string {
    return `${member.firstname ?? ''} ${member.lastname ?? ''}`.trim();
  }

  photoSrc(member: PublicDirectoryEntry): string {
    return member.profilePhoto ? 'data:image/*;base64,' + member.profilePhoto : 'assets/avatar.png';
  }

  location(member: PublicDirectoryEntry): string | null {
    const parts = [member.city, member.country].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }

  trackById(_: number, member: PublicDirectoryEntry): number {
    return member.id;
  }
}
