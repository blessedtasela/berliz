import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Connection } from 'src/app/models/connection.model';
import { PublicDirectoryEntry } from 'src/app/models/users.interface';
import * as ConnectionActions from 'src/app/state/connection/connection.actions';
import * as MessageActions from 'src/app/state/message/message.actions';
import {
  selectConnectionError,
  selectConnectionLoading,
  selectIncomingRequests,
  selectMyConnections,
  selectOutgoingRequests,
  selectPendingRequests,
} from 'src/app/state/connection/connection.selectors';
import { loadPublicDirectory } from 'src/app/state/user-profile/user-profile.actions';
import {
  selectPublicDirectory,
  selectPublicDirectoryLoading,
} from 'src/app/state/user-profile/user-profile.selector';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AuthService } from 'src/app/services/auth.service';
import { PhotoLightboxService } from 'src/app/services/photo-lightbox.service';
import { genericError } from 'src/validators/form-validators.module';
import { ProposeSessionModalComponent } from 'src/app/peer-sessions/propose-session-modal/propose-session-modal.component';

type ConnectStatus = 'self' | 'none' | 'incoming' | 'outgoing' | 'connected';

/**
 * Manage connection requests: incoming (accept/decline), sent (cancel), and
 * accepted connections (jump into Messages) -- plus a "Find people" search
 * to actually send new requests, inlined here instead of sending users out
 * to the public /members directory (dashboard routes should stay in the
 * dashboard for a signed-in user).
 */
@Component({
  selector: 'app-connections-main',
  templateUrl: './connections-main.component.html',
  styleUrls: ['./connections-main.component.css']
})
export class ConnectionsMainComponent implements OnInit, OnDestroy {

  incoming: Connection[] = [];
  outgoing: Connection[] = [];
  connections: Connection[] = [];
  loading = true;

  // ── Find people ──────────────────────────────────────────────────────────
  searchTerm = '';
  searchResults: PublicDirectoryEntry[] = [];
  searchLoading = false;
  pendingRequests: Connection[] = [];
  private currentUserId: number | null = null;
  private search$ = new Subject<string>();

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private snackBar: SnackBarService,
    private authService: AuthService,
    public lightbox: PhotoLightboxService,

    private dialog: MatDialog,

  ) {
    this.currentUserId = this.authService.getCurrentUserId();
  }

  ngOnInit(): void {
    this.store.dispatch(ConnectionActions.loadPendingRequests());
    this.store.dispatch(ConnectionActions.loadMyConnections());

    this.subscriptions.push(
      this.store.select(selectIncomingRequests).pipe(takeUntil(this.destroy$)).subscribe(l => this.incoming = l),
      this.store.select(selectOutgoingRequests).pipe(takeUntil(this.destroy$)).subscribe(l => this.outgoing = l),
      this.store.select(selectMyConnections).pipe(takeUntil(this.destroy$)).subscribe(l => this.connections = l),
      this.store.select(selectPendingRequests).pipe(takeUntil(this.destroy$)).subscribe(l => this.pendingRequests = l),
      this.store.select(selectConnectionLoading).pipe(takeUntil(this.destroy$)).subscribe(l => this.loading = l),
      this.store.select(selectConnectionError).pipe(takeUntil(this.destroy$)).subscribe(error => {
        if (error) this.snackBar.openSnackBar(error || genericError, 'error');
      }),

      this.store.select(selectPublicDirectory).pipe(takeUntil(this.destroy$)).subscribe(l => this.searchResults = l ?? []),
      this.store.select(selectPublicDirectoryLoading).pipe(takeUntil(this.destroy$)).subscribe(l => this.searchLoading = l),

      this.search$.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      ).subscribe(term => this.store.dispatch(loadPublicDirectory({ search: term?.trim() || null, role: null }))),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  refresh(): void {
    this.store.dispatch(ConnectionActions.loadPendingRequests());
    this.store.dispatch(ConnectionActions.loadMyConnections());
  }

  accept(request: Connection): void {
    this.store.dispatch(ConnectionActions.respondToConnectionRequest({ id: request.id, status: 'accepted' }));
  }

  decline(request: Connection): void {
    this.store.dispatch(ConnectionActions.respondToConnectionRequest({ id: request.id, status: 'rejected' }));
  }

  cancel(request: Connection): void {
    this.store.dispatch(ConnectionActions.cancelConnectionRequest({ id: request.id }));
  }

  /**
   * Was just navigating to /dashboard/messages with no indication of who to
   * talk to -- the user landed on the plain inbox and had to go hunt for the
   * same person again in "start a conversation" there. Dispatching
   * loadConversation first sets activeConversationUserId synchronously (see
   * message.reducer.ts), so by the time MessagesMainComponent mounts and
   * reads that same store slice, this thread is already open.
   */
  message(connection: Connection): void {
    this.store.dispatch(MessageActions.loadConversation({ otherUserId: connection.otherUserId }));
    this.store.dispatch(MessageActions.markConversationRead({ otherUserId: connection.otherUserId }));
    this.router.navigate(['/dashboard/messages']);
    this.router.navigate(['/dashboard/messages'], { queryParams: { userId: connection.otherUserId } });
  }

  proposeSession(connection: Connection): void {
    this.dialog.open(ProposeSessionModalComponent, {
      width: '420px',
      maxWidth: '95vw',
      data: { participantId: connection.otherUserId, participantName: connection.otherUserName },
    });
  }

  // ── Find people ──────────────────────────────────────────────────────────

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.search$.next(term);
  }

  connectStatus(member: PublicDirectoryEntry): ConnectStatus {
    if (this.currentUserId != null && member.id === this.currentUserId) return 'self';
    if (this.connections.some(c => c.otherUserId === member.id)) return 'connected';
    const pending = this.pendingRequests.find(c => c.otherUserId === member.id);
    if (pending) return pending.direction === 'incoming' ? 'incoming' : 'outgoing';
    return 'none';
  }

  private pendingRequestFor(member: PublicDirectoryEntry): Connection | undefined {
    return this.pendingRequests.find(c => c.otherUserId === member.id);
  }

  sendRequest(member: PublicDirectoryEntry): void {
    this.store.dispatch(ConnectionActions.sendConnectionRequest({ recipientId: member.id }));
  }

  cancelSearchRequest(member: PublicDirectoryEntry): void {
    const request = this.pendingRequestFor(member);
    if (request) this.cancel(request);
  }

  acceptSearchRequest(member: PublicDirectoryEntry): void {
    const request = this.pendingRequestFor(member);
    if (request) this.accept(request);
  }

  fullName(member: PublicDirectoryEntry): string {
    return `${member.firstname ?? ''} ${member.lastname ?? ''}`.trim();
  }

  photoSrc(member: PublicDirectoryEntry): string {
    return member.profilePhoto ? 'data:image/*;base64,' + member.profilePhoto : 'assets/avatar.png';
  }

  /** Incoming/Sent/Connections rows only ever rendered a static icon -- ConnectionResponse had no photo field until now. */
  connectionPhotoSrc(c: Connection): string | null {
    return c.otherUserPhoto ? 'data:image/*;base64,' + c.otherUserPhoto : null;
  }
}
