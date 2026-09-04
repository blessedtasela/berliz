import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { Connection } from 'src/app/models/connection.model';
import { WorkoutLogResponse } from 'src/app/models/workout.interface';
import { AuthService } from 'src/app/services/auth.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { loadMyConnections } from 'src/app/state/connection/connection.actions';
import { selectMyConnections } from 'src/app/state/connection/connection.selectors';

/**
 * Adds/removes collaborators on a shared training session — anyone added can
 * view and edit it, and whoever last saves it is shown as "last edited by"
 * on the history card. Only the session's owner (or an admin) can manage who
 * has access; a collaborator can still remove their own access ("leave").
 * Sharing is restricted server-side to the owner's accepted connections.
 */
@Component({
  selector: 'app-share-workout-log-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, IconsModule],
  templateUrl: './share-workout-log-modal.component.html',
})
export class ShareWorkoutLogModalComponent implements OnInit, OnDestroy {

  log: WorkoutLogResponse;
  connections: Connection[] = [];
  searchTerm = '';
  busyUserId: number | null = null;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { log: WorkoutLogResponse },
    public dialogRef: MatDialogRef<ShareWorkoutLogModalComponent>,
    private store: Store,
    private workoutService: WorkoutService,
    private authService: AuthService,
  ) {
    this.log = data.log;
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

  get isOwner(): boolean {
    return this.log.userId === this.authService.getCurrentUserId();
  }

  get shareableConnections(): Connection[] {
    const term = this.searchTerm.trim().toLowerCase();
    const alreadyShared = new Set((this.log.collaborators ?? []).map(c => c.userId));
    return this.connections
      .filter(c => c.status === 'accepted' && !alreadyShared.has(c.otherUserId))
      .filter(c => !term || c.otherUserName.toLowerCase().includes(term));
  }

  share(connection: Connection): void {
    if (this.busyUserId) return;
    this.busyUserId = connection.otherUserId;
    this.error = null;

    this.workoutService.shareWorkoutLog(this.log.id, connection.otherUserId)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busyUserId = null;
          if (res?.data) this.log = res.data;
        },
        error: (err) => {
          this.busyUserId = null;
          this.error = err?.error?.message || 'Could not share this session.';
        },
      });
  }

  remove(userId: number): void {
    if (this.busyUserId) return;
    this.busyUserId = userId;
    this.error = null;

    this.workoutService.unshareWorkoutLog(this.log.id, userId)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busyUserId = null;
          if (res?.data) this.log = res.data;
        },
        error: (err) => {
          this.busyUserId = null;
          this.error = err?.error?.message || 'Could not remove access.';
        },
      });
  }

  close(): void {
    // Pass the (possibly updated) log back so the list behind this modal can refresh.
    this.dialogRef.close(this.log);
  }

  trackByUserId(_: number, item: Connection | { userId: number }): number {
    return 'otherUserId' in item ? item.otherUserId : item.userId;
  }
}
