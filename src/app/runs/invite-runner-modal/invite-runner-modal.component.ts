import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Connection } from 'src/app/models/connection.model';
import { RunEventResponse } from 'src/app/models/run.interface';
import { RunService } from 'src/app/services/run.service';
import { loadMyConnections } from 'src/app/state/connection/connection.actions';
import { selectMyConnections } from 'src/app/state/connection/connection.selectors';

/** Invite one of your connections to a group run — server-side restricted to
 *  accepted connections only, same rule as sharing a workout-history session. */
@Component({
  selector: 'app-invite-runner-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, IconsModule],
  templateUrl: './invite-runner-modal.component.html',
})
export class InviteRunnerModalComponent implements OnInit, OnDestroy {

  event: RunEventResponse;
  connections: Connection[] = [];
  searchTerm = '';
  busyUserId: number | null = null;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { event: RunEventResponse },
    public dialogRef: MatDialogRef<InviteRunnerModalComponent>,
    private store: Store,
    private runService: RunService,
  ) {
    this.event = data.event;
  }

  ngOnInit(): void {
    this.store.dispatch(loadMyConnections());
    this.subscriptions.push(
      this.store.select(selectMyConnections).subscribe(c => this.connections = c ?? [])
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  get invitableConnections(): Connection[] {
    const term = this.searchTerm.trim().toLowerCase();
    const alreadyInvolved = new Set((this.event.participants ?? []).map(p => p.userId));
    return this.connections
      .filter(c => c.status === 'accepted' && !alreadyInvolved.has(c.otherUserId))
      .filter(c => !term || c.otherUserName.toLowerCase().includes(term));
  }

  invite(connection: Connection): void {
    if (this.busyUserId) return;
    this.busyUserId = connection.otherUserId;
    this.error = null;

    this.runService.inviteConnection(this.event.id, connection.otherUserId)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busyUserId = null;
          if (res?.data) this.event = res.data;
        },
        error: (err) => {
          this.busyUserId = null;
          this.error = err?.error?.message || 'Could not invite this connection.';
        },
      });
  }

  close(): void {
    this.dialogRef.close(this.event);
  }

  trackByUserId(_: number, connection: Connection): number {
    return connection.otherUserId;
  }
}
