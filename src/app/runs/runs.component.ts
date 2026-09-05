import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { RunEventResponse, RunLogResponse } from 'src/app/models/run.interface';
import { RunService } from 'src/app/services/run.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { AuthService } from 'src/app/services/auth.service';
import { WhatsNewService } from 'src/app/services/whats-new.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { selectUser } from 'src/app/state/user/user.selector';

import { CreateRunModalComponent } from './create-run-modal/create-run-modal.component';
import { LogRunModalComponent } from './log-run-modal/log-run-modal.component';
import { InviteRunnerModalComponent } from './invite-runner-modal/invite-runner-modal.component';

type RunsTab = 'discover' | 'mine' | 'history';

interface RunStats {
  totalRuns: number;
  totalDurationSeconds: number;
  totalDistanceKm: number;
  weekStreak: number;
  bestPaceMinPerKm: number | null;
}

/**
 * Scheduled runs — `/dashboard/runs`. Three tabs:
 *  - Discover: public group runs in a city, request to join.
 *  - My Runs: runs you created or are involved in — respond to invites,
 *    approve/decline join requests (creator), invite connections, cancel.
 *  - History: your own logged times — stats + past runs, independent of
 *    whether they were ever tied to a scheduled event (a solo, ad-hoc run
 *    logs exactly the same way).
 *
 * Standalone + direct service calls, same pattern as WorkoutHistoryComponent.
 */
@Component({
  selector: 'app-runs',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, IconsModule, SharedModule],
  templateUrl: './runs.component.html',
})
export class RunsComponent implements OnInit {

  activeTab: RunsTab = 'discover';

  city = '';
  discoverable: RunEventResponse[] = [];
  discoverLoading = false;
  private discoverRequested = false;

  myRuns: RunEventResponse[] = [];
  myRunsLoading = false;

  runLogs: RunLogResponse[] = [];
  historyLoading = false;

  busyEventId: number | null = null;

  constructor(
    private runService: RunService,
    private dialog: MatDialog,
    private snackbar: SnackBarService,
    private authService: AuthService,
    private whatsNew: WhatsNewService,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.whatsNew.markSeen('scheduled-runs');
    this.store.select(selectUser).pipe(take(1)).subscribe(user => {
      this.city = user?.city || '';
      this.refreshDiscover();
    });
    this.refreshMyRuns();
    this.refreshHistory();
  }

  setTab(tab: RunsTab): void {
    this.activeTab = tab;
  }

  // ── Discover ─────────────────────────────────────────────────────────────

  refreshDiscover(): void {
    if (!this.city.trim()) { this.discoverable = []; return; }
    this.discoverRequested = true;
    this.discoverLoading = true;
    this.runService.discoverRunEvents(this.city.trim())
      .pipe(take(1))
      .subscribe({
        next: (res) => { this.discoverable = res?.data ?? []; this.discoverLoading = false; },
        error: () => { this.discoverable = []; this.discoverLoading = false; },
      });
  }

  get hasSearchedDiscover(): boolean {
    return this.discoverRequested;
  }

  requestToJoin(event: RunEventResponse): void {
    if (this.busyEventId) return;
    this.busyEventId = event.id;
    this.runService.requestToJoin(event.id)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busyEventId = null;
          this.snackbar.openSnackBar(res?.message || 'Request sent', '');
          if (res?.data) this.discoverable = this.discoverable.map(e => e.id === res.data.id ? res.data : e);
          this.refreshMyRuns();
        },
        error: (err) => {
          this.busyEventId = null;
          this.snackbar.openSnackBar(err?.error?.message || 'Could not send request', 'error');
        },
      });
  }

  // ── My Runs ──────────────────────────────────────────────────────────────

  refreshMyRuns(): void {
    this.myRunsLoading = true;
    this.runService.getMyRunEvents()
      .pipe(take(1))
      .subscribe({
        next: (res) => { this.myRuns = res?.data ?? []; this.myRunsLoading = false; },
        error: () => { this.myRuns = []; this.myRunsLoading = false; },
      });
  }

  isCreator(event: RunEventResponse): boolean {
    return event.creatorId === this.authService.getCurrentUserId();
  }

  /** Confirmed roster -- creator included. */
  confirmedParticipants(event: RunEventResponse) {
    return (event.participants ?? []).filter(p => p.status === 'ACCEPTED');
  }

  pendingRequests(event: RunEventResponse) {
    return (event.participants ?? []).filter(p => p.status === 'REQUESTED');
  }

  createRun(): void {
    const ref = this.dialog.open(CreateRunModalComponent, { width: '460px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(saved => {
      if (saved) {
        this.snackbar.openSnackBar('Run scheduled', '');
        this.refreshMyRuns();
        this.refreshDiscover();
      }
    });
  }

  editRun(event: RunEventResponse): void {
    const ref = this.dialog.open(CreateRunModalComponent, { width: '460px', maxWidth: '95vw', data: { event } });
    ref.afterClosed().subscribe(saved => {
      if (saved) {
        this.snackbar.openSnackBar('Run updated', '');
        this.refreshMyRuns();
        this.refreshDiscover();
      }
    });
  }

  cancelRun(event: RunEventResponse): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: { message: `cancel "${event.title || 'this run'}"? This is irreversible.`, confirmation: true, disableClose: true },
    });
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.runService.cancelRunEvent(event.id).pipe(take(1)).subscribe(() => {
        this.snackbar.openSnackBar('Run cancelled', '');
        this.refreshMyRuns();
      });
      dialogRef.close();
    });
  }

  inviteRunner(event: RunEventResponse): void {
    const ref = this.dialog.open(InviteRunnerModalComponent, { width: '420px', maxWidth: '95vw', data: { event } });
    ref.afterClosed().subscribe((updated: RunEventResponse | undefined) => {
      if (updated) this.myRuns = this.myRuns.map(e => e.id === updated.id ? updated : e);
    });
  }

  /** The current user accepting/declining their own invite or request. */
  respond(event: RunEventResponse, accept: boolean): void {
    if (this.busyEventId) return;
    this.busyEventId = event.id;
    this.runService.respondToParticipation(event.id, accept)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busyEventId = null;
          this.snackbar.openSnackBar(res?.message || (accept ? "You're in" : 'Declined'), '');
          this.refreshMyRuns();
        },
        error: (err) => {
          this.busyEventId = null;
          this.snackbar.openSnackBar(err?.error?.message || 'Could not respond', 'error');
        },
      });
  }

  /** Creator accepting/declining someone else's join request. */
  respondToRunner(event: RunEventResponse, userId: number, accept: boolean): void {
    this.runService.respondToRequest(event.id, userId, accept)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.snackbar.openSnackBar(res?.message || (accept ? 'Runner confirmed' : 'Declined'), '');
          if (res?.data) this.myRuns = this.myRuns.map(e => e.id === res.data.id ? res.data : e);
        },
        error: (err) => this.snackbar.openSnackBar(err?.error?.message || 'Could not respond', 'error'),
      });
  }

  // ── History / stats ──────────────────────────────────────────────────────

  refreshHistory(): void {
    this.historyLoading = true;
    this.runService.getMyRunLogs()
      .pipe(take(1))
      .subscribe({
        next: (res) => { this.runLogs = res?.data ?? []; this.historyLoading = false; },
        error: () => { this.runLogs = []; this.historyLoading = false; },
      });
  }

  get stats(): RunStats {
    const totalRuns = this.runLogs.length;
    const totalDurationSeconds = this.runLogs.reduce((sum, r) => sum + (r.durationSeconds || 0), 0);
    const totalDistanceKm = this.runLogs.reduce((sum, r) => sum + (r.distanceKm || 0), 0);

    const paced = this.runLogs.filter(r => r.distanceKm && r.distanceKm > 0);
    const bestPaceMinPerKm = paced.length
      ? Math.min(...paced.map(r => (r.durationSeconds / 60) / (r.distanceKm as number)))
      : null;

    return { totalRuns, totalDurationSeconds, totalDistanceKm, weekStreak: this.weekStreak(), bestPaceMinPerKm };
  }

  /** Same forgiving weekly-streak logic as WorkoutHistoryComponent — see that class for the full rationale. */
  private weekStreak(): number {
    if (!this.runLogs.length) return 0;
    const weekKeys = new Set(this.runLogs.map(r => this.isoWeekKey(new Date(r.ranAt))));
    const cursor = new Date();
    let streak = weekKeys.has(this.isoWeekKey(cursor)) ? 1 : 0;
    cursor.setDate(cursor.getDate() - 7);
    while (weekKeys.has(this.isoWeekKey(cursor))) {
      streak++;
      cursor.setDate(cursor.getDate() - 7);
    }
    return streak;
  }

  private isoWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
  }

  formatDuration(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }

  formatPace(minPerKm: number): string {
    const min = Math.floor(minPerKm);
    const sec = Math.round((minPerKm - min) * 60);
    return `${min}:${sec.toString().padStart(2, '0')} /km`;
  }

  paceFor(log: RunLogResponse): string | null {
    if (!log.distanceKm || log.distanceKm <= 0) return null;
    return this.formatPace((log.durationSeconds / 60) / log.distanceKm);
  }

  logRun(): void {
    const ref = this.dialog.open(LogRunModalComponent, { width: '420px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(saved => {
      if (saved) { this.snackbar.openSnackBar('Run logged', ''); this.refreshHistory(); }
    });
  }

  editLog(entry: RunLogResponse): void {
    const ref = this.dialog.open(LogRunModalComponent, { width: '420px', maxWidth: '95vw', data: { log: entry } });
    ref.afterClosed().subscribe(saved => {
      if (saved) { this.snackbar.openSnackBar('Run updated', ''); this.refreshHistory(); }
    });
  }

  deleteLog(entry: RunLogResponse): void {
    const dialogRef = this.dialog.open(PromptModalComponent, {
      data: { message: 'delete this logged run? This is irreversible.', confirmation: true, disableClose: true },
    });
    dialogRef.componentInstance.onEmitStatusChange.subscribe(() => {
      this.runService.deleteRunLog(entry.id).pipe(take(1)).subscribe(() => {
        this.snackbar.openSnackBar('Run deleted', '');
        this.refreshHistory();
      });
      dialogRef.close();
    });
  }

  trackByEventId(_: number, event: RunEventResponse): number {
    return event.id;
  }

  trackByLogId(_: number, entry: RunLogResponse): number {
    return entry.id;
  }

  trackByUserId(_: number, item: { userId: number }): number {
    return item.userId;
  }
}
