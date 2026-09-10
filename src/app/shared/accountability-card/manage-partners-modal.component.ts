import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { Connection } from 'src/app/models/connection.model';
import { AccountabilityService } from 'src/app/services/accountability.service';
import { ConnectionService } from 'src/app/services/connection.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';

const MAX = 3;

/** Pick up to 3 accepted connections as accountability partners. */
@Component({
  selector: 'app-manage-partners-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[75vh]">
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 class="text-sm font-bold text-gray-900">Accountability partners</h2>
        <button type="button" (click)="dialogRef.close(false)"
          class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition text-gray-400">
          <i-feather name="x" style="width:14px;height:14px;"></i-feather>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3">
        <div *ngIf="loading" class="flex items-center justify-center py-10">
          <i-feather name="loader" class="animate-spin text-gray-300" style="width:18px;height:18px;"></i-feather>
        </div>

        <p *ngIf="!loading && !connections.length" class="text-center text-xs text-gray-400 py-10">
          Connect with people first — partners come from your connections.
        </p>

        <p *ngIf="!loading && connections.length" class="text-[11px] text-gray-400 px-1 pb-2">
          Choose up to {{ max }}. They'll be nudged if your streak slips.
        </p>

        <button *ngFor="let c of connections" type="button" (click)="toggle(c.otherUserId)"
          class="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition text-left">
          <span class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
            [class.bg-sky-600]="selected.has(c.otherUserId)" [class.border-sky-600]="selected.has(c.otherUserId)"
            [class.border-gray-300]="!selected.has(c.otherUserId)">
            <i-feather *ngIf="selected.has(c.otherUserId)" name="check" class="text-white" style="width:12px;height:12px;"></i-feather>
          </span>
          <span class="text-xs font-bold text-gray-900 capitalize truncate">{{ c.otherUserName }}</span>
        </button>
      </div>

      <div class="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-100">
        <button type="button" (click)="dialogRef.close(false)"
          class="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-100 transition">Cancel</button>
        <button type="button" (click)="save()" [disabled]="saving"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white transition disabled:opacity-40">
          {{ saving ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  `,
})
export class ManagePartnersModalComponent {
  connections: Connection[] = [];
  selected = new Set<number>();
  loading = true;
  saving = false;
  readonly max = MAX;

  constructor(
    public dialogRef: MatDialogRef<ManagePartnersModalComponent>,
    private connectionService: ConnectionService,
    private accountability: AccountabilityService,
    private snackBar: SnackBarService,
  ) {
    forkJoin({
      conns: this.connectionService.getMyConnections().pipe(take(1)),
      partners: this.accountability.getPartners().pipe(take(1)),
    }).subscribe({
      next: ({ conns, partners }) => {
        this.loading = false;
        this.connections = conns.data ?? [];
        (partners.data ?? []).forEach(p => this.selected.add(p.userId));
      },
      error: () => { this.loading = false; },
    });
  }

  toggle(id: number): void {
    if (this.selected.has(id)) { this.selected.delete(id); return; }
    if (this.selected.size >= this.max) {
      this.snackBar.openSnackBar(`Up to ${this.max} partners`, '');
      return;
    }
    this.selected.add(id);
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.accountability.setPartners([...this.selected]).pipe(take(1)).subscribe({
      next: () => { this.saving = false; this.snackBar.openSnackBar('Partners updated', ''); this.dialogRef.close(true); },
      error: err => { this.saving = false; this.snackBar.openSnackBar(err?.error?.message || 'Could not save', 'error'); },
    });
  }
}
