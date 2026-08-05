import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';

import { TrainerClients } from 'src/app/models/trainers.interface';
import { WorkoutResponse } from 'src/app/models/workout.interface';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

import { loadTrainerClients } from 'src/app/state/trainer/trainer.actions';
import { selectTrainerClients } from 'src/app/state/trainer/trainer.selector';
import {
  assignWorkout,
  assignWorkoutFailure,
  assignWorkoutSuccess,
} from 'src/app/state/workout/workout.actions';

type AssignMode = 'trainer' | 'self' | 'blocked';

@Component({
  selector: 'app-assign-workout-modal',
  templateUrl: './assign-workout-modal.component.html'
})
export class AssignWorkoutModalComponent implements OnInit, OnDestroy {

  assignForm!: FormGroup;

  role: string | null = null;
  mode: AssignMode = 'blocked';

  trainerClients: TrainerClients[] = [];
  searchTerm = '';
  selectedClientUserId: number | null = null;

  submitting = false;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public workout: WorkoutResponse,
    public dialogRef: MatDialogRef<AssignWorkoutModalComponent>,
    private fb: FormBuilder,
    private store: Store,
    private actions$: Actions,
    private authService: AuthService,
    private snackbar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.assignForm = this.fb.group({ scheduledDate: [''] });

    this.role = (this.authService.getCurrentUserRole() ?? '').toLowerCase();
    this.mode = this.resolveMode(this.role);

    // Only trainers get a client picker — dispatch AND select together.
    if (this.mode === 'trainer') {
      this.store.dispatch(loadTrainerClients());
      this.subscriptions.push(
        this.store.select(selectTrainerClients).subscribe(clients => this.trainerClients = clients ?? [])
      );
    }

    this.subscriptions.push(
      this.actions$.pipe(ofType(assignWorkoutSuccess)).subscribe(() => {
        this.submitting = false;
        this.snackbar.openSnackBar('Workout assigned', '');
        this.dialogRef.close(true);
      }),
      this.actions$.pipe(ofType(assignWorkoutFailure)).subscribe(({ error }) => {
        this.submitting = false;
        this.error = error;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  // ── Role resolution ───────────────────────────────────────────────────────
  // Backend rules: a trainer assigns to one of their own clients, a user/client
  // may only self-assign, a center account cannot assign at all (yet).
  private resolveMode(role: string | null): AssignMode {
    switch (role) {
      case 'trainer': return 'trainer';
      case 'user':
      case 'client': return 'self';
      default: return 'blocked';
    }
  }

  get isTrainerMode(): boolean { return this.mode === 'trainer'; }
  get isSelfMode(): boolean { return this.mode === 'self'; }
  get isBlocked(): boolean { return this.mode === 'blocked'; }

  get blockedMessage(): string {
    return this.role === 'center'
      ? "Assigning workouts to center members isn't available yet."
      : 'Your account type cannot assign workouts yet.';
  }

  // ── Client picker ─────────────────────────────────────────────────────────

  get filteredClients(): TrainerClients[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.trainerClients;
    return this.trainerClients.filter(c =>
      `${c.firstname ?? ''} ${c.lastname ?? ''}`.toLowerCase().includes(term) ||
      (c.email ?? '').toLowerCase().includes(term)
    );
  }

  selectClient(client: TrainerClients): void {
    this.selectedClientUserId = client.userId;
    this.error = null;
  }

  clientName(client: TrainerClients): string {
    const name = `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim();
    return name || client.email || `Client #${client.userId}`;
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  get canSubmit(): boolean {
    if (this.submitting || this.isBlocked) return false;
    if (this.isTrainerMode) return this.selectedClientUserId !== null;
    return true;
  }

  assign(): void {
    if (this.isBlocked) return;

    const assignedToUserId = this.isTrainerMode
      ? this.selectedClientUserId
      : this.authService.getCurrentUserId();

    if (!assignedToUserId) {
      this.error = this.isTrainerMode
        ? 'Please select a client to assign this workout to.'
        : 'Could not resolve your account. Please sign in again.';
      return;
    }

    this.error = null;
    this.submitting = true;

    const scheduledDate = this.assignForm.get('scheduledDate')?.value;

    this.store.dispatch(assignWorkout({
      data: {
        workoutId: this.workout?.id,
        assignedToUserId,
        scheduledDate: scheduledDate || null,
      }
    }));
  }

  close(): void {
    this.dialogRef.close(false);
  }

  trackByClientId(_: number, client: TrainerClients): number {
    return client.id;
  }
}
