import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { CHALLENGE_METRICS, ChallengeMetric, ChallengeScope } from 'src/app/models/challenge.interface';
import { ChallengeService } from 'src/app/services/challenge.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

@Component({
  selector: 'app-create-challenge-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[85vh]">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">New challenge</h2>
        <button type="button" (click)="dialogRef.close(false)"
          class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition text-gray-400">
          <i-feather name="x" style="width:14px;height:14px;"></i-feather>
        </button>
      </div>

      <div class="p-4 flex flex-col gap-3 overflow-y-auto">
        <input [(ngModel)]="title" placeholder="Title" maxlength="120"
          class="text-xs rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:border-sky-400 focus:ring-sky-400/30" />
        <textarea [(ngModel)]="description" rows="2" placeholder="Description (optional)" maxlength="500"
          class="text-xs rounded-lg px-3 py-2 border border-gray-200 resize-none focus:outline-none focus:ring-1 focus:border-sky-400 focus:ring-sky-400/30"></textarea>

        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Metric</label>
            <select [(ngModel)]="metric"
              class="text-xs rounded-lg px-2.5 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:border-sky-400">
              <option *ngFor="let m of metrics" [ngValue]="m.value">{{ m.label }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Goal</label>
            <input type="number" [(ngModel)]="goal" min="1"
              class="text-xs rounded-lg px-3 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:border-sky-400" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Starts</label>
            <input type="date" [(ngModel)]="startsAt"
              class="text-xs rounded-lg px-2.5 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:border-sky-400" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-bold uppercase tracking-wide text-gray-400">Ends</label>
            <input type="date" [(ngModel)]="endsAt"
              class="text-xs rounded-lg px-2.5 py-2 border border-gray-200 focus:outline-none focus:ring-1 focus:border-sky-400" />
          </div>
        </div>

        <label class="flex items-center gap-2 text-[11px] text-gray-600">
          <input type="checkbox" [(ngModel)]="connectionsOnly" />
          Connections only
        </label>
      </div>

      <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100">
        <button type="button" (click)="dialogRef.close(false)"
          class="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
        <button type="button" (click)="submit()" [disabled]="saving || !valid"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition disabled:opacity-40">
          {{ saving ? 'Creating…' : 'Create' }}
        </button>
      </div>
    </div>
  `,
})
export class CreateChallengeModalComponent {
  readonly metrics = CHALLENGE_METRICS;

  title = '';
  description = '';
  metric: ChallengeMetric = 'SESSIONS';
  goal: number | null = 10;
  startsAt = new Date().toISOString().slice(0, 10);
  endsAt = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
  connectionsOnly = false;
  saving = false;

  constructor(
    public dialogRef: MatDialogRef<CreateChallengeModalComponent>,
    private challengeService: ChallengeService,
    private snackBar: SnackBarService,
  ) {}

  get valid(): boolean {
    return !!this.title.trim() && !!this.goal && this.goal > 0 && !!this.startsAt && !!this.endsAt
      && this.endsAt > this.startsAt;
  }

  submit(): void {
    if (this.saving || !this.valid) return;
    this.saving = true;
    const scope: ChallengeScope = this.connectionsOnly ? 'CONNECTIONS' : 'OPEN';
    this.challengeService.create({
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      metric: this.metric,
      goal: this.goal!,
      scope,
      startsAt: new Date(this.startsAt).toISOString(),
      endsAt: new Date(this.endsAt + 'T23:59:59').toISOString(),
    }).pipe(take(1)).subscribe({
      next: () => { this.saving = false; this.snackBar.openSnackBar('Challenge created', ''); this.dialogRef.close(true); },
      error: err => { this.saving = false; this.snackBar.openSnackBar(err?.error?.message || 'Could not create', 'error'); },
    });
  }
}
