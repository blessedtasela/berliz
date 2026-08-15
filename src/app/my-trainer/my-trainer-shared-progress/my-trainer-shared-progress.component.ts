import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ClientProgress, ProgressShare } from 'src/app/models/progress-share.model';
import { loadClientProgress, loadSharedWithMe, clearSelectedClientProgress } from 'src/app/state/progress-share/progress-share.actions';
import {
  selectLoadingClientProgress,
  selectProgressShareLoading,
  selectSelectedClientProgress,
  selectSharedWithMe,
} from 'src/app/state/progress-share/progress-share.selectors';

/**
 * Trainer-side "clients' progress" panel — lists clients who have opted this
 * trainer into seeing their workout/progress history, and lets the trainer
 * open one client's progress at a time. The backend re-checks the grant on
 * every getClientProgress call, so this list is display-only — it never
 * gates access itself.
 */
@Component({
  selector: 'app-my-trainer-shared-progress',
  templateUrl: './my-trainer-shared-progress.component.html',
  styleUrls: ['./my-trainer-shared-progress.component.css']
})
export class MyTrainerSharedProgressComponent implements OnInit, OnDestroy {

  sharedClients: ProgressShare[] = [];
  loading = false;

  selectedClientId: number | null = null;
  selectedProgress: ClientProgress | null = null;
  loadingProgress = false;

  private destroy$ = new Subject<void>();

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.dispatch(loadSharedWithMe());

    this.store.select(selectSharedWithMe)
      .pipe(takeUntil(this.destroy$))
      .subscribe(clients => this.sharedClients = clients);

    this.store.select(selectProgressShareLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.store.select(selectSelectedClientProgress)
      .pipe(takeUntil(this.destroy$))
      .subscribe(progress => this.selectedProgress = progress);

    this.store.select(selectLoadingClientProgress)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loadingProgress = loading);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(clearSelectedClientProgress());
  }

  viewProgress(share: ProgressShare): void {
    this.selectedClientId = share.clientId;
    this.store.dispatch(loadClientProgress({ clientId: share.clientId }));
  }

  closeProgress(): void {
    this.selectedClientId = null;
    this.store.dispatch(clearSelectedClientProgress());
  }
}
