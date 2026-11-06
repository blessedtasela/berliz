import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable, catchError, forkJoin, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { GroupPack } from 'src/app/models/group-pack.model';
import { GroupSession } from 'src/app/models/group-session.model';
import { GroupPackService } from 'src/app/services/group-pack.service';
import { GroupSessionService } from 'src/app/services/group-session.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';
import { groupPackStatusText } from 'src/app/booking/group-packs-list/group-packs-list.component';

/** A group's status as the trainer reads it. */
export function trainerGroupStatusText(g: Pick<GroupSession, 'status' | 'slotsLeft'>): string {
  switch (g.status) {
    case 'OPEN': return `Filling up: ${g.slotsLeft} ${g.slotsLeft === 1 ? 'place' : 'places'} still to take. It is cancelled 24 hours before the start if it is not full.`;
    case 'FULL': return 'Full: every place is taken. Confirm it and each member gets 24 hours to pay their share.';
    case 'CONFIRMED': return 'Confirmed: mark it done once it has been held.';
    case 'COMPLETED': return 'Done';
    case 'CANCELLED': return 'Cancelled';
    default: return g.status;
  }
}

/**
 * A trainer's own group sessions and group packs: who is in each, and the controls only the trainer has. A full group
 * waits for the trainer to confirm it (every member's booking is confirmed together); a confirmed one is marked done
 * after it is held; and a group or a pack that is not going ahead can be cancelled, which refunds everyone in full.
 * Shows nothing at all when the trainer has no groups, so it never adds noise to the requests page.
 */
@Component({
    selector: 'app-provider-groups',
    imports: [CommonModule, IconsModule],
    template: `
    <section *ngIf="visible" class="flex flex-col gap-3" data-testid="provider-groups">
      <div>
        <h2 class="text-sm font-bold text-gray-900 dark:text-gray-100">Your groups</h2>
        <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Group sessions and group packs your clients booked together.</p>
      </div>

      <div *ngIf="liveGroups.length > 0" class="flex flex-col gap-2" data-testid="trainer-groups">
        <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Group sessions</p>
        <div *ngFor="let g of liveGroups" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 flex flex-col gap-2" data-testid="trainer-group">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ g.scheduledAt | date:'EEEE, MMM d · h:mm a' }} · {{ g.durationMinutes }} min</p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">
                {{ g.slotsTaken }} of {{ g.size }} places taken ·
                <span *ngIf="g.groupPackId">covered by a group pack</span><span *ngIf="!g.groupPackId">{{ g.pricePerSlot | currency:'CAD':'symbol':'1.2-2' }} a place</span>
              </p>
            </div>
            <span class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              [ngClass]="g.status === 'CONFIRMED' || g.status === 'FULL' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'">
              {{ g.status | lowercase }}
            </span>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ groupText(g) }}</p>
          <ul *ngIf="g.members?.length" class="text-[11px] text-gray-600 dark:text-gray-300 flex flex-col gap-0.5" data-testid="group-members">
            <li *ngFor="let m of g.members">
              {{ m.name }} · {{ m.slots }} {{ m.slots === 1 ? 'place' : 'places' }}
              <span *ngIf="m.paymentStatus" class="text-gray-400 dark:text-gray-500">· {{ paymentWord(m.paymentStatus) }}</span>
            </li>
          </ul>

          <div class="flex flex-wrap items-center gap-3">
            <button *ngIf="g.status === 'FULL'" type="button" (click)="confirm(g)" [disabled]="busyKey !== null" data-testid="confirm-group"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60">
              {{ busyKey === 'g' + g.id ? 'Confirming…' : 'Confirm this group' }}
            </button>
            <button *ngIf="g.status === 'CONFIRMED'" type="button" (click)="complete(g)" [disabled]="busyKey !== null" data-testid="complete-group"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition disabled:opacity-60">
              {{ busyKey === 'g' + g.id ? 'Saving…' : 'Mark as done' }}
            </button>
            <ng-container *ngIf="g.status !== 'COMPLETED'">
              <button *ngIf="askingCancel !== 'g' + g.id" type="button" (click)="askingCancel = 'g' + g.id" data-testid="cancel-group"
                class="text-[11px] font-semibold text-red-600 hover:text-red-700">Cancel this group</button>
              <span *ngIf="askingCancel === 'g' + g.id" class="flex items-center gap-2 text-[11px]" data-testid="cancel-group-confirm">
                <span class="text-gray-600 dark:text-gray-300">Everyone is refunded in full. Cancel it?</span>
                <button type="button" (click)="cancelGroup(g)" [disabled]="busyKey !== null" class="font-semibold text-red-600 hover:text-red-700" data-testid="cancel-group-yes">Yes, cancel</button>
                <button type="button" (click)="askingCancel = null" class="font-semibold text-gray-500 hover:text-gray-700">Keep it</button>
              </span>
            </ng-container>
          </div>
        </div>
      </div>

      <div *ngIf="livePacks.length > 0" class="flex flex-col gap-2" data-testid="trainer-packs">
        <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Group packs</p>
        <div *ngFor="let p of livePacks" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 flex flex-col gap-2" data-testid="trainer-pack">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ p.packageName }} · {{ p.sessionsTotal }} sessions</p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ p.slotsTaken }} of {{ p.size }} places taken · {{ p.totalPrice | currency:'CAD':'symbol':'1.2-2' }} in all</p>
            </div>
            <span class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              [ngClass]="p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'">
              {{ p.status | lowercase }}
            </span>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ packText(p) }}.</p>
          <ul *ngIf="p.members?.length" class="text-[11px] text-gray-600 dark:text-gray-300 flex flex-col gap-0.5" data-testid="pack-members">
            <li *ngFor="let m of p.members">
              {{ m.name }} · {{ m.slots }} {{ m.slots === 1 ? 'place' : 'places' }}
              <span *ngIf="m.amount != null" class="text-gray-400 dark:text-gray-500">· {{ m.amount | currency:'CAD':'symbol':'1.2-2' }} {{ m.paid ? 'paid' : 'not paid yet' }}</span>
            </li>
          </ul>
          <div *ngIf="p.status === 'FORMING' || p.status === 'FULL'" class="flex flex-wrap items-center gap-3">
            <button *ngIf="askingCancel !== 'p' + p.id" type="button" (click)="askingCancel = 'p' + p.id" data-testid="cancel-pack"
              class="text-[11px] font-semibold text-red-600 hover:text-red-700">Cancel this pack</button>
            <span *ngIf="askingCancel === 'p' + p.id" class="flex items-center gap-2 text-[11px]" data-testid="cancel-pack-confirm">
              <span class="text-gray-600 dark:text-gray-300">Anyone who paid is refunded. Cancel it?</span>
              <button type="button" (click)="cancelPack(p)" [disabled]="busyKey !== null" class="font-semibold text-red-600 hover:text-red-700" data-testid="cancel-pack-yes">Yes, cancel</button>
              <button type="button" (click)="askingCancel = null" class="font-semibold text-gray-500 hover:text-gray-700">Keep it</button>
            </span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ProviderGroupsComponent implements OnInit {
  groups: GroupSession[] = [];
  packs: GroupPack[] = [];
  /** Which action is running ('g' or 'p' + id), so the buttons lock while it does. */
  busyKey: string | null = null;
  /** Which group or pack is waiting for "Yes, cancel". */
  askingCancel: string | null = null;

  readonly groupText = trainerGroupStatusText;
  readonly packText = groupPackStatusText;

  constructor(private groupService: GroupSessionService, private packService: GroupPackService, private snackBar: SnackBarService) {}

  ngOnInit(): void { this.load(); }

  /** Finished and cancelled ones are history, not something to act on. */
  get liveGroups(): GroupSession[] {
    return this.groups.filter(g => g.status !== 'CANCELLED' && g.status !== 'COMPLETED');
  }

  get livePacks(): GroupPack[] {
    return this.packs.filter(p => p.status !== 'CANCELLED' && p.status !== 'EXPIRED' && p.status !== 'EXHAUSTED');
  }

  get visible(): boolean {
    return this.liveGroups.length > 0 || this.livePacks.length > 0;
  }

  paymentWord(status: string | null | undefined): string {
    switch (status) {
      case 'PAID': return 'paid';
      case 'UNPAID': return 'not paid yet';
      case 'NOT_REQUIRED': return 'covered by the pack';
      case 'REFUNDED': return 'refunded';
      default: return (status ?? '').toLowerCase();
    }
  }

  confirm(g: GroupSession): void {
    this.act('g' + g.id, () => this.groupService.confirm(g.id), 'The group is confirmed. Each member has 24 hours to pay.');
  }

  complete(g: GroupSession): void {
    this.act('g' + g.id, () => this.groupService.complete(g.id), 'The group session is marked as done.');
  }

  cancelGroup(g: GroupSession): void {
    this.act('g' + g.id, () => this.groupService.cancel(g.id), 'The group is cancelled and every member is refunded.');
  }

  cancelPack(p: GroupPack): void {
    this.act('p' + p.id, () => this.packService.cancel(p.id), 'The group pack is cancelled. Anyone who had paid is refunded.');
  }

  private act(key: string, call: () => Observable<any>, fallback: string): void {
    if (this.busyKey !== null) return;
    this.busyKey = key;
    this.askingCancel = null;
    call().pipe(take(1)).subscribe({
      next: (res: any) => {
        this.busyKey = null;
        this.snackBar.openSnackBar(res?.data?.message || res?.message || fallback, '');
        this.load();
      },
      error: (err: any) => {
        this.busyKey = null;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        this.load();
      },
    });
  }

  private load(): void {
    forkJoin({
      groups: this.groupService.getForMyTrainerProfile().pipe(take(1), catchError(() => of(null))),
      packs: this.packService.getForMyTrainerProfile().pipe(take(1), catchError(() => of(null))),
    }).subscribe(({ groups, packs }) => {
      this.groups = groups?.data ?? [];
      this.packs = packs?.data ?? [];
    });
  }
}
