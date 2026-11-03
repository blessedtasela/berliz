import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, of, take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { GroupPack, isGroupPackage } from 'src/app/models/group-pack.model';
import { ProviderPackage } from 'src/app/models/provider-package.model';
import { GroupPackService } from 'src/app/services/group-pack.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/** What a group pack's status means to the person looking at it. */
export function groupPackStatusText(pack: GroupPack): string {
  switch (pack.status) {
    case 'FORMING': return 'Filling up: nobody is charged until every place is taken';
    case 'FULL': return pack.myPaid ? 'Your share is paid: waiting for the others to pay theirs' : 'Full: pay your share to keep your place';
    case 'ACTIVE': return `${pack.sessionsRemaining} of ${pack.sessionsTotal} sessions left, shared by the group`;
    case 'EXHAUSTED': return 'All sessions used';
    case 'EXPIRED': return 'Expired';
    case 'CANCELLED': return 'Cancelled';
    default: return pack.status;
  }
}

/**
 * The group packs with one trainer: the ones the signed-in person is in (pay a share, leave, or book a session with an
 * active one), the open ones anyone can join, and the group packages a new one can be started from. A pack is bought
 * together: each person takes one or more places and pays their own share, and it only activates once every share is paid.
 */
@Component({
    selector: 'app-group-packs-list',
    imports: [CommonModule, FormsModule, IconsModule],
    template: `
    <div class="flex flex-col gap-3" data-testid="group-packs">

      <div *ngIf="mine.length > 0" class="flex flex-col gap-2" data-testid="my-packs">
        <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{{ allTrainers ? 'Your group packs' : 'Your group packs with ' + providerName }}</p>
        <div *ngFor="let p of mine" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 flex flex-col gap-1.5" data-testid="my-pack">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ p.packageName }}<span *ngIf="allTrainers"> · with {{ p.trainerName }}</span></p>
              <p class="text-[11px] text-gray-500 dark:text-gray-400">
                {{ p.slotsTaken }} of {{ p.size }} places taken · you have {{ p.mySlots }}
                <span *ngIf="p.myAmount != null"> · your share {{ p.myAmount | currency:'CAD':'symbol':'1.2-2' }}</span>
              </p>
            </div>
            <span class="shrink-0 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
              [ngClass]="p.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : p.status === 'FORMING' || p.status === 'FULL' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'">
              {{ p.status | lowercase }}
            </span>
          </div>
          <p class="text-[11px] text-gray-500 dark:text-gray-400">{{ statusText(p) }}.</p>
          <p *ngIf="p.status === 'FORMING' && p.slotsLeft > 0" class="text-[11px] text-gray-500 dark:text-gray-400">
            {{ p.slotsLeft }} {{ p.slotsLeft === 1 ? 'place' : 'places' }} still to fill. Share this page's link so friends can join. If it is not full by {{ p.formingDeadline | date:'MMM d' }} it is cancelled.
          </p>
          <p *ngIf="p.status === 'FULL' && !p.myPaid && p.payDeadline" class="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
            Pay by {{ p.payDeadline | date:'EEE MMM d, h:mm a' }} or your place is released.
          </p>
          <p *ngIf="p.status === 'ACTIVE' && p.expiresAt" class="text-[11px] text-gray-500 dark:text-gray-400">Valid until {{ p.expiresAt | date:'MMM d' }}.</p>

          <div class="flex flex-wrap items-center gap-3">
            <button *ngIf="p.status === 'FULL' && !p.myPaid" type="button" (click)="pay(p)" [disabled]="busyId === p.id" data-testid="pay-share"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60">
              {{ busyId === p.id ? 'Opening payment…' : 'Pay my share · ' + (p.myAmount | currency:'CAD':'symbol':'1.2-2') }}
            </button>
            <button *ngIf="p.status === 'ACTIVE' && p.sessionsRemaining > 0" type="button" (click)="usePack.emit(p)" [disabled]="!canBook" data-testid="use-pack"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60">
              Book the time I picked with this pack
            </button>
            <span *ngIf="p.status === 'ACTIVE' && p.sessionsRemaining > 0 && !canBook" class="text-[11px] text-gray-400 dark:text-gray-500">Pick a day and time above first.</span>
            <button *ngIf="(p.status === 'FORMING' || p.status === 'FULL') && !p.myPaid" type="button" (click)="leave(p)" [disabled]="busyId === p.id" data-testid="leave-pack"
              class="text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-60">
              Leave this pack
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!allTrainers" class="flex flex-col gap-2" data-testid="open-packs">
        <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Group packs to join with {{ providerName }}</p>

        <div *ngIf="loading" class="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs py-2">
          <i-feather name="loader" class="animate-spin" style="width:13px;height:13px;"></i-feather> Loading group packs...
        </div>

        <p *ngIf="!loading && open.length === 0" class="text-[11px] text-gray-400 dark:text-gray-500" data-testid="no-open-packs">
          No group packs are filling right now.<span *ngIf="startable.length > 0"> Start one below and invite your friends.</span>
        </p>

        <div *ngFor="let p of open" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 flex flex-col gap-2" data-testid="open-pack">
          <div class="min-w-0">
            <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ p.packageName }} · {{ p.sessionsTotal }} sessions</p>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">
              {{ p.slotsLeft }} of {{ p.size }} places left · about {{ p.pricePerSlot | currency:'CAD':'symbol':'1.2-2' }} a place
            </p>
          </div>
          <div class="flex items-center gap-2">
            <select [ngModel]="slotsFor(p)" (ngModelChange)="wanted['join' + p.id] = $event" [attr.aria-label]="'Places to take in ' + p.packageName"
              class="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100">
              <option *ngFor="let n of placeOptions(p.slotsLeft)" [ngValue]="n">{{ n }} {{ n === 1 ? 'place' : 'places' }} · about {{ p.pricePerSlot * n | currency:'CAD':'symbol':'1.2-2' }}</option>
            </select>
            <button type="button" (click)="join(p)" [disabled]="busyId === p.id" data-testid="join-pack"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-60">
              {{ busyId === p.id ? 'Joining…' : 'Join this pack' }}
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!allTrainers && startable.length > 0" class="flex flex-col gap-2" data-testid="start-pack">
        <p class="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide">Start a group pack</p>
        <div *ngFor="let pkg of startable" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 flex flex-col gap-2" data-testid="startable-package">
          <div class="min-w-0">
            <p class="text-xs font-semibold text-gray-900 dark:text-gray-100">{{ pkg.name }}</p>
            <p class="text-[11px] text-gray-500 dark:text-gray-400">
              {{ pkg.sessionCount }} sessions for {{ pkg.groupSize }} people · {{ pkg.price | currency:'CAD':'symbol':'1.2-2' }} in all, about {{ pkg.price / pkg.groupSize | currency:'CAD':'symbol':'1.2-2' }} a place
              <span *ngIf="pkg.durationDays"> · valid {{ pkg.durationDays }} days once active</span>
            </p>
          </div>
          <div class="flex items-center gap-2">
            <select [ngModel]="startSlots(pkg)" (ngModelChange)="wanted['start' + pkg.id] = $event" [attr.aria-label]="'Places you take in ' + pkg.name"
              class="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100">
              <option *ngFor="let n of placeOptions(pkg.groupSize)" [ngValue]="n">{{ n }} {{ n === 1 ? 'place' : 'places' }} · about {{ pkg.price / pkg.groupSize * n | currency:'CAD':'symbol':'1.2-2' }}</option>
            </select>
            <button type="button" (click)="start(pkg)" [disabled]="busyId === -pkg.id" data-testid="start-pack-button"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 transition disabled:opacity-60">
              {{ busyId === -pkg.id ? 'Starting…' : 'Start this pack' }}
            </button>
          </div>
        </div>
      </div>

      <ul *ngIf="startable.length > 0 || open.length > 0 || mine.length > 0" class="text-[11px] text-gray-400 dark:text-gray-500 flex flex-col gap-1 list-disc pl-4" data-testid="pack-rules">
        <li>A group pack is bought together: each person takes one or more places and pays their own share. Nobody is charged until every place is taken.</li>
        <li>Once it is full, each person has 24 hours to pay their share. Anyone who has not paid then loses their place, and the pack fills up again.</li>
        <li>It only becomes active once every share is paid. Its sessions are then shared by the group: one session is used each time the group trains, whoever is there.</li>
        <li>If it is not full within 14 days it is cancelled, and anyone who had paid is refunded. Sessions not used before it expires are refunded in proportion to what each person paid.</li>
        <li>The person who starts a pack is responsible for filling it. If they leave, it passes to the next person.</li>
      </ul>
    </div>
  `
})
export class GroupPacksListComponent implements OnInit, OnChanges {
  @Input() trainerId: number | null | undefined = null;
  @Input() providerName = 'the trainer';
  /** Signed in: only then can the person's own packs be read, or one started or joined. */
  @Input() signedIn = false;
  /** Show all of the signed-in person's live packs, with any trainer (the My Bookings page), instead of one trainer's. */
  @Input() allTrainers = false;
  /** The trainer's packages: the ones that are group packages can be started as a group pack. */
  @Input() packages: ProviderPackage[] = [];
  /** A day and time are picked on the page, so an active pack can be used for them. */
  @Input() canBook = false;
  /** Bump to reload. */
  @Input() refreshKey = 0;
  /** A visitor tried to start or join: the page shows its sign-in choice. */
  @Output() signInRequired = new EventEmitter<void>();
  /** The person wants to book the picked time with this active pack. */
  @Output() usePack = new EventEmitter<GroupPack>();
  @Output() changed = new EventEmitter<void>();

  open: GroupPack[] = [];
  mine: GroupPack[] = [];
  loading = false;
  /** The pack being acted on (negative: the package being started). */
  busyId: number | null = null;
  /** Places wanted, per pack to join ('join' + id) or package to start ('start' + id). */
  wanted: Record<string, number> = {};

  readonly statusText = groupPackStatusText;

  constructor(private packsApi: GroupPackService, private snackBar: SnackBarService) {}

  ngOnInit(): void { this.load(); }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['trainerId']?.firstChange || changes['refreshKey'] || changes['signedIn']) this.load();
  }

  /** The packages a group pack can be started from. */
  get startable(): ProviderPackage[] {
    return (this.packages ?? []).filter(p => isGroupPackage(p));
  }

  placeOptions(n: number): number[] {
    return Array.from({ length: Math.max(n, 1) }, (_, i) => i + 1);
  }

  slotsFor(p: GroupPack): number {
    return Math.min(this.wanted['join' + p.id] ?? 1, p.slotsLeft || 1);
  }

  startSlots(pkg: ProviderPackage): number {
    return Math.min(this.wanted['start' + pkg.id] ?? 1, pkg.groupSize);
  }

  start(pkg: ProviderPackage): void {
    if (!this.signedIn) { this.signInRequired.emit(); return; }
    if (this.busyId != null) return;
    this.busyId = -pkg.id;
    this.packsApi.start(pkg.id, this.startSlots(pkg)).pipe(take(1)).subscribe({
      next: res => this.done(res?.data?.message || res?.message || 'Your group pack is started.'),
      error: err => this.failed(err),
    });
  }

  join(p: GroupPack): void {
    if (!this.signedIn) { this.signInRequired.emit(); return; }
    if (this.busyId != null) return;
    this.busyId = p.id;
    this.packsApi.join(p.id, this.slotsFor(p)).pipe(take(1)).subscribe({
      next: res => this.done(res?.data?.message || res?.message || 'You joined the group pack.'),
      error: err => this.failed(err),
    });
  }

  leave(p: GroupPack): void {
    if (this.busyId != null) return;
    this.busyId = p.id;
    this.packsApi.leave(p.id).pipe(take(1)).subscribe({
      next: res => this.done(res?.data?.message || res?.message || 'You left the group pack.'),
      error: err => this.failed(err),
    });
  }

  /** Sends the person to Stripe to pay their own share; the amount is whatever the server fixed for them. */
  pay(p: GroupPack): void {
    if (this.busyId != null) return;
    this.busyId = p.id;
    this.packsApi.checkout(p.id).pipe(take(1)).subscribe({
      next: res => {
        const url = res?.data?.checkoutUrl;
        if (!url) {
          this.busyId = null;
          this.snackBar.openSnackBar(res?.message || genericError, 'error');
          return;
        }
        this.redirect(url);
      },
      error: err => this.failed(err),
    });
  }

  /** Split out so a spec can observe it without leaving the page. */
  redirect(url: string): void {
    window.location.href = url;
  }

  private done(message: string): void {
    this.busyId = null;
    this.snackBar.openSnackBar(message, '');
    this.load();
    this.changed.emit();
  }

  private failed(err: any): void {
    this.busyId = null;
    this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
    this.load();
  }

  private load(): void {
    if (this.allTrainers) {
      this.open = [];
      if (!this.signedIn) { this.mine = []; return; }
      this.packsApi.getMine().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        this.mine = (res?.data ?? []).filter(p => this.isLive(p));
      });
      return;
    }
    if (!this.trainerId) { this.open = []; this.mine = []; return; }
    const trainerId = this.trainerId;
    this.loading = true;
    this.packsApi.getOpenForTrainer(trainerId).pipe(take(1), catchError(() => of(null))).subscribe(res => {
      this.open = res?.data ?? [];
      this.loading = false;
      this.dropMine();
    });
    if (this.signedIn) {
      this.packsApi.getMine().pipe(take(1), catchError(() => of(null))).subscribe(res => {
        // Only the live packs with this trainer: finished and cancelled ones are history, not something to act on.
        this.mine = (res?.data ?? []).filter(p => p.trainerId === trainerId && this.isLive(p));
        this.dropMine();
      });
    } else {
      this.mine = [];
    }
  }

  private isLive(p: GroupPack): boolean {
    return p.status !== 'CANCELLED' && p.status !== 'EXPIRED' && p.status !== 'EXHAUSTED';
  }

  /** A pack the person is already in is shown under "Your group packs", not offered to join again. */
  private dropMine(): void {
    const ids = new Set(this.mine.map(p => p.id));
    this.open = this.open.filter(p => !ids.has(p.id));
  }
}
