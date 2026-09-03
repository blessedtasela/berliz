import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { PeerSessionService } from 'src/app/services/peer-session.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { PeerSession } from 'src/app/models/peer-session.model';
import { genericError } from 'src/validators/form-validators.module';

/**
 * User-to-user workout session proposals — the "book/plan a workout with
 * another member" counterpart to /dashboard/my-bookings (which is always
 * against a trainer/center). Sessions can only be proposed with an existing
 * connection — see /dashboard/connections.
 */
@Component({
  selector: 'app-my-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './my-sessions.component.html',
  styleUrls: ['./my-sessions.component.css']
})
export class MySessionsComponent implements OnInit {

  sessions: PeerSession[] = [];
  loading = true;

  constructor(
    private peerSessionService: PeerSessionService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  refresh(): void {
    this.load();
  }

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
}
