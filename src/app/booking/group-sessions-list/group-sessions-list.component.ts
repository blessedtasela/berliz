import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { GroupSession } from 'src/app/models/group-session.model';
import { GroupSessionService } from 'src/app/services/group-session.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/** What a group's status means to the person looking at it. */
export function groupStatusText(status: string, mine: boolean): string {
  switch (status) {
    case 'OPEN': return mine ? 'Filling up: it only goes ahead once every place is taken' : 'Places left';
    case 'FULL': return 'Full: waiting for the trainer to confirm';
    case 'CONFIRMED': return 'Confirmed';
    case 'COMPLETED': return 'Done';
    case 'CANCELLED': return 'Cancelled';
    default: return status;
  }
}

/**
 * The groups with one trainer: the ones the signed-in person is in (with Leave), and the open ones anyone can join.
 * A group is booked together as one block: nobody is charged until it is full and the trainer confirms, and one that
 * is still short of people 24 hours before it starts is cancelled and everyone is told.
 */
@Component({
    selector: 'app-group-sessions-list',
    imports: [CommonModule, FormsModule, IconsModule],
    template: `
    <div class="flex flex-col gap-3" data-testid="group-sessions">

      <div *ngIf="mine.length > 0" class="flex flex-col gap-2" data-testid="my-groups">
        <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Your groups with {{ providerName }}</p>
        <div *ngFor="let g of mine" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 flex flex-col gap-1.5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ g.scheduledAt | date:'EEEE, MMM d · h:mm a' }} · {{ g.durationMinutes }} min</p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ g.slotsTaken }} of {{ g.size }} places taken · you have {{ g.mySlots }} · {{ g.pricePerSlot | currency:'CAD':'symbol':'1.2-2' }} a place</p>
            </div>
            <span class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              [ngClass]="g.status === 'CANCELLED' ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : g.status === 'CONFIRMED' || g.status === 'FULL' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'">
              {{ g.status | lowercase }}
            </span>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ statusText(g.status, true) }}.</p>
          <p *ngIf="g.status === 'OPEN' && g.organizerId && g.members?.length" class="text-[11px] text-gray-500 dark:text-gray-400">
            {{ g.slotsLeft }} {{ g.slotsLeft === 1 ? 'place' : 'places' }} still to fill. Share this page's link so friends can join.
          </p>
          <button *ngIf="g.status === 'OPEN' || g.status === 'FULL'" type="button" (click)="leave(g)" [disabled]="busyId === g.id"
            class="self-start text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-60" data-testid="leave-group">
            {{ busyId === g.id ? 'Leaving…' : 'Leave this group' }}
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-2" data-testid="open-groups">
        <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Open groups with {{ providerName }}</p>

        <div *ngIf="loading" class="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs py-2">
          <i-feather name="loader" class="animate-spin" style="width:13px;height:13px;"></i-feather> Loading groups...
        </div>

        <p *ngIf="!loading && open.length === 0" class="text-[11px] text-gray-400 dark:text-gray-500" data-testid="no-open-groups">
          No groups are open right now. Start one above, pick a time and invite your friends.
        </p>

        <div *ngFor="let g of open" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 flex flex-col gap-2">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ g.scheduledAt | date:'EEEE, MMM d · h:mm a' }} · {{ g.durationMinutes }} min</p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">
                {{ g.slotsLeft }} of {{ g.size }} places left · {{ g.pricePerSlot | currency:'CAD':'symbol':'1.2-2' }} a place<span *ngIf="g.locationLabel"> · {{ g.locationLabel }}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <select [ngModel]="slotsFor(g)" (ngModelChange)="wanted[g.id] = $event" [attr.aria-label]="'Places to take in the group on ' + (g.scheduledAt | date:'MMM d')"
              class="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100">
              <option *ngFor="let n of placeOptions(g)" [ngValue]="n">{{ n }} {{ n === 1 ? 'place' : 'places' }} · {{ g.pricePerSlot * n | currency:'CAD':'symbol':'1.2-2' }}</option>
            </select>
            <button type="button" (click)="join(g)" [disabled]="busyId === g.id" data-testid="join-group"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60">
              {{ busyId === g.id ? 'Joining…' : 'Join this group' }}
            </button>
          </div>
        </div>
      </div>

      <ul class="text-[11px] text-gray-400 dark:text-gray-500 flex flex-col gap-1 list-disc pl-4" data-testid="group-rules">
        <li>A group is booked together as one block, and only goes ahead once every place is taken.</li>
        <li>Nothing is charged until the group is full and {{ providerName }} confirms. Then each person pays for their own places.</li>
        <li>If it is still short of people 24 hours before it starts, it is cancelled and everyone is told. Nobody is charged.</li>
        <li>The person who starts a group is responsible for filling it. If they leave, the group passes to the next person.</li>
        <li>Cancelling or not turning up follows {{ providerName }}'s cancellation policy, the same as any session.</li>
      </ul>
    </div>
  `
})
export class GroupSessionsListComponent implements OnInit, OnChanges {
  @Input() trainerId: number | null | undefined = null;
  @Input() providerName = 'the trainer';
  /** Signed in: only then can the person's own groups be read, or a group joined. */
  @Input() signedIn = false;
  /** Bump to reload (e.g. after the page started a group). */
  @Input() refreshKey = 0;
  /** A visitor tried to join: the page shows its sign-in choice. */
  @Output() signInRequired = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  open: GroupSession[] = [];
  mine: GroupSession[] = [];
  loading = false;
  busyId: number | null = null;
  /** Places the visitor wants to take, per open group. */
  wanted: Record<number, number> = {};

  readonly statusText = groupStatusText;

  constructor(private groups: GroupSessionService, private snackBar: SnackBarService) {}

  ngOnInit(): void { this.load(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['trainerId']?.firstChange || changes['refreshKey'] || changes['signedIn']) this.load();
  }

  slotsFor(g: GroupSession): number {
    return Math.min(this.wanted[g.id] ?? 1, g.slotsLeft || 1);
  }

  placeOptions(g: GroupSession): number[] {
    return Array.from({ length: Math.max(g.slotsLeft, 1) }, (_, i) => i + 1);
  }

  join(g: GroupSession): void {
    if (!this.signedIn) { this.signInRequired.emit(); return; }
    if (this.busyId != null) return;
    this.busyId = g.id;
    this.groups.join(g.id, this.slotsFor(g)).pipe(take(1)).subscribe({
      next: res => {
        this.busyId = null;
        this.snackBar.openSnackBar(res?.data?.message || res?.message || 'You joined the group.', '');
        this.load();
        this.changed.emit();
      },
      error: err => {
        this.busyId = null;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        this.load();
      },
    });
  }

  leave(g: GroupSession): void {
    if (this.busyId != null) return;
    this.busyId = g.id;
    this.groups.leave(g.id).pipe(take(1)).subscribe({
      next: res => {
        this.busyId = null;
        this.snackBar.openSnackBar(res?.data?.message || res?.message || 'You left the group.', '');
        this.load();
        this.changed.emit();
      },
      error: err => {
        this.busyId = null;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }

  private load(): void {
    if (!this.trainerId) { this.open = []; this.mine = []; return; }
    const trainerId = this.trainerId;
    this.loading = true;
    this.groups.getOpenForTrainer(trainerId).pipe(take(1), catchError(() => of(null))).subscribe(res => {
      this.open = res?.data ?? [];
      this.loading = false;
      this.dropMine();
    });
    if (this.signedIn) {
      this.groups.getMine().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        // Only the live groups with this trainer: finished and cancelled ones are history, not something to act on.
        this.mine = (res?.data ?? []).filter(g => g.trainerId === trainerId && g.status !== 'CANCELLED' && g.status !== 'COMPLETED');
        this.dropMine();
      });
    } else {
      this.mine = [];
    }
  }

  /** A group the person is already in is shown under "Your groups", not offered to join again. */
  private dropMine(): void {
    const ids = new Set(this.mine.map(g => g.id));
    this.open = this.open.filter(g => !ids.has(g.id));
  }
}
