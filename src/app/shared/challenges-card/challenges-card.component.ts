import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { CHALLENGE_METRICS, ChallengeResponse } from 'src/app/models/challenge.interface';
import { ChallengeService } from 'src/app/services/challenge.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { CreateChallengeModalComponent } from './create-challenge-modal.component';
import { ChallengeDetailModalComponent } from './challenge-detail-modal.component';

/**
 * Dashboard card: challenges you've joined (with a progress bar) and a few
 * open ones to join. "New" and each row's detail open modals.
 */
@Component({
  selector: 'app-challenges-card',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './challenges-card.component.html',
})
export class ChallengesCardComponent implements OnInit {
  challenges: ChallengeResponse[] = [];
  loading = true;
  joiningId: number | null = null;

  constructor(
    private challengeService: ChallengeService,
    private snackBar: SnackBarService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.challengeService.list().pipe(take(1)).subscribe({
      next: res => { this.loading = false; this.challenges = res.data ?? []; },
      error: () => { this.loading = false; },
    });
  }

  get mine(): ChallengeResponse[] {
    return this.challenges.filter(c => c.joined);
  }

  get discover(): ChallengeResponse[] {
    return this.challenges.filter(c => !c.joined && c.active).slice(0, 4);
  }

  pct(c: ChallengeResponse): number {
    return c.goal > 0 ? Math.min(100, Math.round((c.myProgress / c.goal) * 100)) : 0;
  }

  unit(c: ChallengeResponse): string {
    return CHALLENGE_METRICS.find(m => m.value === c.metric)?.unit ?? '';
  }

  join(c: ChallengeResponse, ev: Event): void {
    ev.stopPropagation();
    if (this.joiningId === c.id) return;
    this.joiningId = c.id;
    this.challengeService.join(c.id).pipe(take(1)).subscribe({
      next: () => { this.joiningId = null; this.snackBar.openSnackBar('Joined', ''); this.load(); },
      error: () => { this.joiningId = null; this.snackBar.openSnackBar('Could not join', 'error'); },
    });
  }

  open(c: ChallengeResponse): void {
    this.dialog.open(ChallengeDetailModalComponent, { width: '440px', maxWidth: '95vw', data: { id: c.id } })
      .afterClosed().subscribe(changed => { if (changed) this.load(); });
  }

  create(): void {
    this.dialog.open(CreateChallengeModalComponent, { width: '360px', maxWidth: '95vw' })
      .afterClosed().subscribe(created => { if (created) this.load(); });
  }
}
