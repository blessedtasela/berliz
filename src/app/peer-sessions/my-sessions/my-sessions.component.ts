import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PeerSessionService } from 'src/app/services/peer-session.service';
import { RunService } from 'src/app/services/run.service';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { MyBookingsModule } from 'src/app/bookings/bookings.module';
import { PeerSession } from 'src/app/models/peer-session.model';
import { RunEventResponse } from 'src/app/models/run.interface';
import { genericError } from 'src/validators/form-validators.module';

type SessionsTab = 'client' | 'personal' | 'collaborations';

/**
 * "Sessions" hub — three kinds of session Berliz has, previously scattered
 * across separate pages with no single place to see them all:
 *  (a) Client sessions -- bookings with a trainer/center (embeds the same
 *      app-manage-bookings used at /dashboard/my-bookings, which already
 *      adapts to role: a trainer/center gets the requests-from-clients view
 *      with confirm/cancel, everyone else sees their own booking history).
 *  (b) Personal sessions -- the user-to-user workout proposals this page
 *      originally was, unchanged.
 *  (c) Collaborations -- group runs (RunEvent, solo: false) the viewer is
 *      involved in as creator or invited/requesting participant. Full
 *      creation/discovery/invite-management still lives at /dashboard/runs;
 *      this tab is "what needs my attention" plus a link out to that.
 *
 * A trainer/center defaults to the Client tab (that's where their incoming
 * requests are); everyone else defaults to Personal.
 */
@Component({
  selector: 'app-my-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, MyBookingsModule],
  templateUrl: './my-sessions.component.html',
  styleUrls: ['./my-sessions.component.css']
})
export class MySessionsComponent implements OnInit {

  activeTab: SessionsTab = 'personal';
  isProvider = false;

  // ── Personal sessions (user-to-user) ────────────────────────────────────
  sessions: PeerSession[] = [];
  loading = true;

  // ── Collaborations (group runs) ─────────────────────────────────────────
  runs: RunEventResponse[] = [];
  runsLoading = true;
  busyRunId: number | null = null;

  constructor(
    private peerSessionService: PeerSessionService,
    private runService: RunService,
    private authService: AuthService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.isProvider = this.authService.isTrainer() || this.authService.isCenter();
    this.activeTab = this.isProvider ? 'client' : 'personal';
    this.load();
    this.loadRuns();
  }

  setTab(tab: SessionsTab): void {
    this.activeTab = tab;
  }

  refresh(): void {
    this.load();
    this.loadRuns();
  }

  // ── Personal sessions ────────────────────────────────────────────────────

  private load(): void {
    this.loading = true;
    this.peerSessionService.getMySessions()
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.sessions = res?.data ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.openSnackBar(genericError, 'error');
        }
      });
  }

  get pending(): PeerSession[] {
    return this.sessions.filter(s => s.status === 'pending');
  }

  get confirmed(): PeerSession[] {
    return this.sessions.filter(s => s.status === 'confirmed');
  }

  get past(): PeerSession[] {
    return this.sessions.filter(s => s.status === 'completed' || s.status === 'declined' || s.status === 'cancelled');
  }

  respond(session: PeerSession, status: 'confirmed' | 'declined'): void {
    this.peerSessionService.respond(session.id, status)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.snackBar.openSnackBar(res?.message || 'Updated', '');
          this.load();
        },
        error: (err: any) => this.snackBar.openSnackBar(err?.error?.message || genericError, 'error')
      });
  }

  complete(session: PeerSession): void {
    this.peerSessionService.complete(session.id)
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.snackBar.openSnackBar(res?.message || 'Session marked complete', '');
          this.load();
        },
        error: (err: any) => this.snackBar.openSnackBar(err?.error?.message || genericError, 'error')
      });
  }

  cancel(session: PeerSession): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'cancel this session?',
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    dialogRef.componentInstance.onEmitStatusChange.pipe(take(1)).subscribe(() => {
      this.peerSessionService.cancel(session.id)
        .pipe(take(1))
        .subscribe({
          next: (res: any) => {
            this.snackBar.openSnackBar(res?.message || 'Session cancelled', '');
            dialogRef.close();
            this.load();
          },
          error: (err: any) => {
            this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
            dialogRef.close();
          }
        });
    });
  }

  // ── Collaborations (group runs) ──────────────────────────────────────────

  private loadRuns(): void {
    this.runsLoading = true;
    this.runService.getMyRunEvents()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.runs = (res?.data ?? []).filter(r => !r.solo);
          this.runsLoading = false;
        },
        error: () => { this.runs = []; this.runsLoading = false; },
      });
  }

  /** Needs the viewer's own response -- they were invited, or they asked to join and it's still open. */
  get collabAwaitingMe(): RunEventResponse[] {
    return this.runs.filter(r => r.myStatus === 'INVITED');
  }

  /** The viewer asked to join and is still waiting on the creator. */
  get collabAwaitingCreator(): RunEventResponse[] {
    return this.runs.filter(r => r.myStatus === 'REQUESTED');
  }

  get collabUpcoming(): RunEventResponse[] {
    return this.runs.filter(r => r.status === 'SCHEDULED' && r.myStatus === 'ACCEPTED');
  }

  get collabPast(): RunEventResponse[] {
    return this.runs.filter(r => r.status === 'COMPLETED' || r.status === 'CANCELLED');
  }

  /** Someone else's join request on a run the viewer created -- managed fully at /dashboard/runs, just surfaced here so it isn't missed. */
  pendingRequestCount(event: RunEventResponse): number {
    if (event.creatorId !== this.authService.getCurrentUserId()) return 0;
    return (event.participants ?? []).filter(p => p.status === 'REQUESTED').length;
  }

  /** The viewer accepting/declining their own invite or request. */
  respondToRun(event: RunEventResponse, accept: boolean): void {
    if (this.busyRunId) return;
    this.busyRunId = event.id;
    this.runService.respondToParticipation(event.id, accept)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busyRunId = null;
          this.snackBar.openSnackBar(res?.message || (accept ? "You're in" : 'Declined'), '');
          this.loadRuns();
        },
        error: (err) => {
          this.busyRunId = null;
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        },
      });
  }

  trackByRunId(_: number, event: RunEventResponse): number {
    return event.id;
  }
}
