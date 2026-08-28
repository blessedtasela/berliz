import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Subscription, takeUntil } from 'rxjs';

import { Connection } from 'src/app/models/connection.model';
import * as ConnectionActions from 'src/app/state/connection/connection.actions';
import {
  selectConnectionError,
  selectConnectionLoading,
  selectIncomingRequests,
  selectMyConnections,
  selectOutgoingRequests,
} from 'src/app/state/connection/connection.selectors';

import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Manage connection requests: incoming (accept/decline), sent (cancel), and
 * accepted connections (jump into Messages). Sending a NEW request happens
 * from the member directory (/members) where people are actually discovered
 * -- this page is purely for managing requests once they exist.
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

  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(ConnectionActions.loadPendingRequests());
    this.store.dispatch(ConnectionActions.loadMyConnections());

    this.subscriptions.push(
      this.store.select(selectIncomingRequests).pipe(takeUntil(this.destroy$)).subscribe(l => this.incoming = l),
      this.store.select(selectOutgoingRequests).pipe(takeUntil(this.destroy$)).subscribe(l => this.outgoing = l),
      this.store.select(selectMyConnections).pipe(takeUntil(this.destroy$)).subscribe(l => this.connections = l),
      this.store.select(selectConnectionLoading).pipe(takeUntil(this.destroy$)).subscribe(l => this.loading = l),
      this.store.select(selectConnectionError).pipe(takeUntil(this.destroy$)).subscribe(error => {
        if (error) this.snackBar.openSnackBar(error || genericError, 'error');
      }),
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(s => s.unsubscribe());
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

  message(connection: Connection): void {
    this.router.navigate(['/dashboard/messages']);
  }
}
