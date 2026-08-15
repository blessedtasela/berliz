import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject, takeUntil } from 'rxjs';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { MyTrainerSummary } from 'src/app/models/progress-share.model';
import { loadMyTrainers } from 'src/app/state/booking/booking.actions';
import { selectMyTrainersLoading, selectMyTrainersOnly } from 'src/app/state/booking/booking.selectors';
import {
  grantProgressShare,
  grantProgressShareFailure,
  grantProgressShareSuccess,
  loadMyGrants,
  revokeProgressShare,
  revokeProgressShareFailure,
  revokeProgressShareSuccess,
} from 'src/app/state/progress-share/progress-share.actions';
import { selectMyGrants, selectProgressShareLoading } from 'src/app/state/progress-share/progress-share.selectors';

/**
 * Client-side "who can see my progress" panel — lives in the account settings
 * area alongside public-profile visibility. Access is opt-in per trainer,
 * mirroring the profileVisibility convention: nothing is shared until the
 * client explicitly flips a trainer's switch on.
 */
@Component({
  selector: 'app-progress-sharing-settings',
  templateUrl: './progress-sharing-settings.component.html',
  styleUrls: ['./progress-sharing-settings.component.css']
})
export class ProgressSharingSettingsComponent implements OnInit, OnDestroy {

  /** Trainers this client has a booking relationship with — the only valid grant targets. */
  trainers: MyTrainerSummary[] = [];
  loadingTrainers = false;

  /** trainerId -> active grant, from selectMyGrants. */
  private grantedTrainerIds = new Set<number>();
  grantsLoading = false;

  /** Set only while a grant/revoke call for this specific trainer is in flight. */
  savingTrainerId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
    private snackBarService: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.store.dispatch(loadMyTrainers());
    this.store.dispatch(loadMyGrants());

    this.store.select(selectMyTrainersOnly)
      .pipe(takeUntil(this.destroy$))
      .subscribe(trainers => this.trainers = trainers);

    this.store.select(selectMyTrainersLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingTrainers = loading);

    this.store.select(selectMyGrants)
      .pipe(takeUntil(this.destroy$))
      .subscribe(grants => {
        this.grantedTrainerIds = new Set(grants.filter(g => g.isActive).map(g => g.trainerId));
      });

    this.store.select(selectProgressShareLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.grantsLoading = loading);

    this.actions$.pipe(ofType(grantProgressShareSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.savingTrainerId = null;
        this.snackBarService.openSnackBar(response?.message || 'Access granted', '');
      });

    this.actions$.pipe(ofType(grantProgressShareFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.savingTrainerId = null;
        this.snackBarService.openSnackBar(error, 'error');
      });

    this.actions$.pipe(ofType(revokeProgressShareSuccess), takeUntil(this.destroy$))
      .subscribe(({ response }) => {
        this.savingTrainerId = null;
        this.snackBarService.openSnackBar(response?.message || 'Access revoked', '');
      });

    this.actions$.pipe(ofType(revokeProgressShareFailure), takeUntil(this.destroy$))
      .subscribe(({ error }) => {
        this.savingTrainerId = null;
        this.snackBarService.openSnackBar(error, 'error');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isShared(trainerId: number): boolean {
    return this.grantedTrainerIds.has(trainerId);
  }

  isSaving(trainerId: number): boolean {
    return this.savingTrainerId === trainerId;
  }

  toggleSharing(trainer: MyTrainerSummary): void {
    if (this.savingTrainerId !== null) return;

    this.savingTrainerId = trainer.id;
    if (this.isShared(trainer.id)) {
      this.store.dispatch(revokeProgressShare({ trainerId: trainer.id }));
    } else {
      this.store.dispatch(grantProgressShare({ trainerId: trainer.id }));
    }
  }
}
