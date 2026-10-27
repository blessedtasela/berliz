import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, catchError, debounceTime, of, switchMap, take, takeUntil, tap } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { DateStripComponent } from 'src/app/shared/date-strip/date-strip.component';
import { TimePickerComponent } from 'src/app/shared/time-picker/time-picker.component';
import { BookingLocationPickerComponent, BookingLocationSelection, locationPayload } from '../booking-location-picker/booking-location-picker.component';
import { ProviderKind, providerSlug, resolveProviderBySlug } from '../resolve-provider';

import { AuthRedirectService } from 'src/app/services/auth-redirect.service';
import { BookingService } from 'src/app/services/booking.service';
import { CenterService } from 'src/app/services/center.service';
import { PromotionService } from 'src/app/services/promotion.service';
import { SeoService } from 'src/app/services/seo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';

import { BookingPlanPreview, BookingPlanPreviewItem, BookingPlanRequest } from 'src/app/models/booking.model';
import { PromoOffer } from 'src/app/models/promo-offer.model';
import { Users } from 'src/app/models/users.interface';
import {
  PlanPattern, PlanSession, ROTATION_PRESETS, RotationStep, WEEKDAY_LABELS, WEEKDAY_PRESETS, Weekday,
  addDays, daysBetween, describePattern, formatDate, formatTime12, generateSessions, parseDate, weekdayOf
} from 'src/app/utils/plan-schedule.util';
import { environment } from 'src/environments/environment';
import { genericError } from 'src/validators/form-validators.module';

export type PatternKind = PlanPattern['kind'];

/** One row of the review step: a session plus what the server said about it. */
export interface ReviewRow {
  date: string;
  time: string;
  durationMinutes: number;
  /** null until the server has checked it (guests, or while checking). */
  available: boolean | null;
  reason: string | null;
  price: number | null;
}

interface CalendarCell {
  date: string;
  day: number;
  inPeriod: boolean;
  selected: boolean;
}

const DRAFT_KEY = (kind: string, id: number | null) => `berliz.planDraft.${kind}.${id}`;
const DRAFT_MAX_AGE_MS = 2 * 60 * 60 * 1000;

/**
 * Plan a month (or more) of sessions in one go: `/trainers/:name/plan` and `/centers/:name/plan`.
 *
 * The client says WHEN (a start date and how long), HOW they like to train (the same time on chosen weekdays, a
 * different time per weekday, a rotation such as "2 on, 1 off", or hand-picked dates), then reviews the exact
 * sessions. The server checks every one against the provider's real availability and prices the plan: the total,
 * with any offer applied, is split equally and each session is paid as it comes up. The provider accepts or
 * declines the whole plan once.
 */
@Component({
  selector: 'app-booking-plan-page',
  imports: [CommonModule, FormsModule, RouterModule, IconsModule, DateStripComponent, TimePickerComponent, BookingLocationPickerComponent],
  templateUrl: './booking-plan-page.component.html'
})
export class BookingPlanPageComponent implements OnInit, OnDestroy {

  kind: ProviderKind = 'trainer';
  providerId: number | null = null;
  providerName = '';
  providerPhotoUrl: string | null = null;
  resolving = true;
  notFound = false;
  user: Users | null = null;

  // ── When ──
  startDate = addDays(formatDate(new Date()), 1);
  readonly periodOptions = [
    { weeks: 2, label: '2 weeks' },
    { weeks: 4, label: '1 month' },
    { weeks: 8, label: '2 months' },
    { weeks: 12, label: '3 months' },
  ];
  periodWeeks = 4;
  readonly durationOptions = [30, 45, 60, 90, 120];
  durationMinutes = 60;

  // ── How ──
  readonly patternTabs: ReadonlyArray<{ kind: PatternKind; label: string; hint: string }> = [
    { kind: 'weekly', label: 'Same time', hint: 'The same time on the days you pick' },
    { kind: 'weeklyCustom', label: 'Different times', hint: 'A time of its own for each day' },
    { kind: 'rotation', label: 'Days on / off', hint: 'e.g. 2 days on, 1 off, repeating' },
    { kind: 'dates', label: 'Pick dates', hint: 'Tap the exact days on a calendar' },
  ];
  patternKind: PatternKind = 'weekly';
  readonly weekdayLabels = WEEKDAY_LABELS;
  readonly weekdayPresets = WEEKDAY_PRESETS;
  readonly rotationPresets = ROTATION_PRESETS;

  weekdays: Weekday[] = [1, 3, 5];
  weeklyTime = '18:00';
  customTimes: Partial<Record<Weekday, string>> = { 1: '18:00', 3: '18:00', 5: '18:00' };
  rotationSteps: RotationStep[] = [{ on: 2, off: 1 }];
  rotationTime = '18:00';
  pickedDates: string[] = [];
  datesTime = '18:00';
  calendarMonth = formatDate(new Date()).slice(0, 7); // YYYY-MM

  // ── Review ──
  /** Sessions the client took out of the generated list. */
  removed = new Set<string>();
  /** A one-off time for a single date, set from the review list. */
  timeOverrides: Record<string, string> = {};
  editingDate: string | null = null;

  preview: BookingPlanPreview | null = null;
  previewLoading = false;
  previewError: string | null = null;

  offers: PromoOffer[] = [];
  promotionId: number | null = null;
  notes = '';
  locationSelection: BookingLocationSelection | null = null;

  submitting = false;
  submitError: string | null = null;

  private recompute$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store,
    private bookingService: BookingService,
    private trainerService: TrainerService,
    private centerService: CenterService,
    private promotionService: PromotionService,
    private authRedirect: AuthRedirectService,
    private snackBar: SnackBarService,
    private seo: SeoService,
  ) { }

  ngOnInit(): void {
    this.kind = (this.route.snapshot.data['kind'] as ProviderKind) ?? 'trainer';
    this.recalc();

    // Set up before anything can ask for a check: the provider can resolve synchronously.
    // Debounced so dragging through options does not fire a check per tap.
    this.recompute$.pipe(
      debounceTime(350),
      tap(() => { this.previewLoading = !!this.user?.email && this.sessions.length >= 2; this.previewError = null; this.recalc(); }),
      switchMap(() => {
        if (!this.user?.email || !this.providerId || this.sessions.length < 2) return of(null);
        return this.bookingService.previewPlan(this.buildRequest()).pipe(
          catchError(err => {
            this.previewError = err?.error?.message || 'We could not check these times. Please try again.';
            return of(null);
          })
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe(res => {
      this.previewLoading = false;
      this.preview = res?.data ?? null;
      this.recalc();
    });

    this.store.dispatch(loadUser());
    this.store.select(selectUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      const arrived = !this.user?.email && !!user?.email;
      this.user = user;
      if (arrived && this.providerId) {
        this.restoreDraft();
        this.requestPreview();
      }
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => this.resolveProvider(params.get('name')));

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resolveProvider(name: string | null): void {
    this.resolving = true;
    this.notFound = false;
    resolveProviderBySlug(this.kind, name, this.trainerService, this.centerService).pipe(take(1)).subscribe(provider => {
      this.resolving = false;
      if (!provider) {
        this.notFound = true;
        return;
      }
      this.providerId = provider.id;
      this.providerName = provider.name;
      this.providerPhotoUrl = provider.photoUrl;
      this.seo.updatePageData({
        title: `Plan sessions with ${provider.name} | Berliz`,
        description: `Book a month of sessions with ${provider.name} in one go: pick your days and times and pay as you go.`,
        imageUrl: provider.photoUrl || '',
      }, `${environment.baseUrl}/${this.kind === 'trainer' ? 'trainers' : 'centers'}/${providerSlug(provider.name)}/plan`);
      this.loadOffers();
      this.restoreDraft();
      this.requestPreview();
    });
  }

  private loadOffers(): void {
    if (!this.providerId) return;
    const offers$ = this.kind === 'trainer'
      ? this.promotionService.getPublicForTrainer(this.providerId)
      : this.promotionService.getPublicForCenter(this.providerId);
    offers$.pipe(take(1), catchError(() => of(null))).subscribe(res => {
      this.offers = (res?.data ?? []).filter(o => o.live && ['percentage', 'fixed', 'free_session'].includes(o.type));
    });
  }

  // ── Schedule ─────────────────────────────────────────────────────────────

  get endDate(): string {
    return addDays(this.startDate, this.periodWeeks * 7 - 1);
  }

  get pattern(): PlanPattern {
    switch (this.patternKind) {
      case 'weekly': return { kind: 'weekly', weekdays: this.weekdays, time: this.weeklyTime };
      case 'weeklyCustom': {
        const times: Partial<Record<Weekday, string>> = {};
        for (const d of this.weekdays) if (this.customTimes[d]) times[d] = this.customTimes[d];
        return { kind: 'weeklyCustom', times };
      }
      case 'rotation': return { kind: 'rotation', steps: this.rotationSteps, time: this.rotationTime };
      case 'dates': return { kind: 'dates', dates: this.pickedDates, time: this.datesTime };
    }
  }

  // These are computed once per change (see recalc), never in a getter: a getter that builds a new array on every
  // change-detection pass makes *ngFor rebuild its DOM each time.
  sessions: PlanSession[] = [];
  weeks: Array<{ label: string; rows: ReviewRow[] }> = [];
  calendarCells: Array<CalendarCell | null> = [];
  unavailableCount = 0;
  private allRowsChecked = false;

  /** What the pattern produces, minus anything the client removed, with one-off time changes applied. */
  private computeSessions(): PlanSession[] {
    return generateSessions(this.pattern, this.startDate, this.endDate, this.durationMinutes)
      .filter(s => !this.removed.has(s.date))
      .map(s => this.timeOverrides[s.date] ? { ...s, time: this.timeOverrides[s.date] } : s);
  }

  get patternHint(): string {
    return this.patternTabs.find(t => t.kind === this.patternKind)?.hint ?? '';
  }

  get patternSummary(): string {
    return describePattern(this.pattern);
  }

  /** The sessions joined with what the server said about them, grouped by week for the review list. */
  private computeWeeks(): Array<{ label: string; rows: ReviewRow[] }> {
    const byKey = new Map<string, BookingPlanPreviewItem>();
    for (const item of this.preview?.sessions ?? []) byKey.set(item.localDate, item);

    const groups = new Map<string, ReviewRow[]>();
    for (const s of this.sessions) {
      const checked = byKey.get(s.date);
      const stale = checked && checked.localTime.slice(0, 5) !== s.time;
      const row: ReviewRow = {
        date: s.date, time: s.time, durationMinutes: s.durationMinutes,
        available: checked && !stale ? checked.available : null,
        reason: checked && !stale ? checked.reason : null,
        price: checked && !stale ? checked.price : null,
      };
      const monday = this.weekStart(s.date);
      groups.set(monday, [...(groups.get(monday) ?? []), row]);
    }
    return [...groups.entries()].map(([monday, rows]) => ({ label: `Week of ${this.dayLabel(monday)}`, rows }));
  }

  private weekStart(date: string): string {
    const day = weekdayOf(date);
    return addDays(date, -((day + 6) % 7)); // back to Monday
  }

  dayLabel(date: string): string {
    return parseDate(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  longDayLabel(date: string): string {
    return parseDate(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  time12(time: string): string {
    return formatTime12(time);
  }

  /** Refreshes everything the template shows that is derived from the inputs. Call after any change. */
  private recalc(): void {
    this.sessions = this.computeSessions();
    this.weeks = this.computeWeeks();
    this.calendarCells = this.computeCells();
    this.unavailableCount = (this.preview?.sessions ?? []).filter(p => !p.available && this.sessions.some(x => x.date === p.localDate)).length;
    this.allRowsChecked = this.weeks.every(w => w.rows.every(r => r.available !== null));
  }

  get checked(): boolean {
    return !!this.preview && !this.previewLoading && this.allRowsChecked;
  }

  get canSubmit(): boolean {
    if (this.submitting || this.sessions.length < 2) return false;
    if (this.user?.email && !(this.checked && this.preview!.allAvailable)) return false;
    return !this.locationSelection?.incomplete;
  }

  // ── Changes ──────────────────────────────────────────────────────────────

  /** Any input that changes the schedule or its price goes through here. */
  changed(): void {
    this.recalc();
    this.submitError = null;
    this.saveDraftSoon();
    this.recompute$.next();
  }

  private requestPreview(): void {
    this.recompute$.next();
  }

  chooseStart(date: string): void {
    this.startDate = date;
    this.removed.clear();
    this.timeOverrides = {};
    this.pickedDates = this.pickedDates.filter(d => d >= this.startDate && d <= this.endDate);
    this.calendarMonth = date.slice(0, 7);
    this.changed();
  }

  choosePeriod(weeks: number): void {
    this.periodWeeks = weeks;
    this.pickedDates = this.pickedDates.filter(d => d >= this.startDate && d <= this.endDate);
    this.changed();
  }

  choosePattern(kind: PatternKind): void {
    this.patternKind = kind;
    this.removed.clear();
    this.timeOverrides = {};
    this.changed();
  }

  toggleWeekday(day: Weekday): void {
    this.weekdays = this.weekdays.includes(day) ? this.weekdays.filter(d => d !== day) : [...this.weekdays, day];
    if (this.weekdays.includes(day) && !this.customTimes[day]) this.customTimes = { ...this.customTimes, [day]: this.weeklyTime };
    this.changed();
  }

  isWeekdayOn(day: Weekday): boolean {
    return this.weekdays.includes(day);
  }

  applyWeekdayPreset(days: Weekday[]): void {
    this.weekdays = [...days];
    for (const d of days) if (!this.customTimes[d]) this.customTimes = { ...this.customTimes, [d]: this.weeklyTime };
    this.changed();
  }

  setCustomTime(day: Weekday, time: string | null): void {
    this.customTimes = { ...this.customTimes, [day]: time ?? '' };
    this.changed();
  }

  applyRotationPreset(steps: RotationStep[]): void {
    this.rotationSteps = steps.map(s => ({ ...s }));
    this.changed();
  }

  addRotationStep(): void {
    this.rotationSteps = [...this.rotationSteps, { on: 2, off: 1 }];
    this.changed();
  }

  removeRotationStep(index: number): void {
    if (this.rotationSteps.length <= 1) return;
    this.rotationSteps = this.rotationSteps.filter((_, i) => i !== index);
    this.changed();
  }

  stepRotation(index: number, field: 'on' | 'off', delta: number): void {
    const limit = field === 'on' ? { min: 1, max: 14 } : { min: 0, max: 14 };
    this.rotationSteps = this.rotationSteps.map((s, i) =>
      i === index ? { ...s, [field]: Math.min(limit.max, Math.max(limit.min, s[field] + delta)) } : s);
    this.changed();
  }

  removeSession(date: string): void {
    this.removed.add(date);
    this.editingDate = null;
    this.changed();
  }

  restoreRemoved(): void {
    this.removed.clear();
    this.changed();
  }

  /** Drops every session the server said cannot be booked. */
  removeUnavailable(): void {
    for (const item of this.preview?.sessions ?? []) if (!item.available) this.removed.add(item.localDate);
    this.changed();
  }

  editTime(date: string): void {
    this.editingDate = this.editingDate === date ? null : date;
  }

  setSessionTime(date: string, time: string | null): void {
    if (time) this.timeOverrides = { ...this.timeOverrides, [date]: time };
    this.editingDate = null;
    this.changed();
  }

  // ── Pick-dates calendar ──────────────────────────────────────────────────

  get calendarTitle(): string {
    return parseDate(`${this.calendarMonth}-01`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }

  private computeCells(): Array<CalendarCell | null> {
    const first = `${this.calendarMonth}-01`;
    const lead = (weekdayOf(first) + 6) % 7; // Monday first
    const cells: Array<CalendarCell | null> = Array(lead).fill(null);
    const month = this.calendarMonth;
    for (let d = 1; d <= 31; d++) {
      const date = `${month}-${String(d).padStart(2, '0')}`;
      if (!date.startsWith(month) || parseDate(date).getMonth() !== parseDate(first).getMonth()) break;
      cells.push({
        date, day: d,
        inPeriod: date >= this.startDate && date <= this.endDate,
        selected: this.pickedDates.includes(date),
      });
    }
    return cells;
  }

  stepMonth(delta: number): void {
    const [y, m] = this.calendarMonth.split('-').map(Number);
    const next = new Date(y, m - 1 + delta, 1);
    this.calendarMonth = formatDate(next).slice(0, 7);
    this.recalc();
  }

  toggleDate(cell: CalendarCell): void {
    if (!cell.inPeriod) return;
    this.pickedDates = cell.selected ? this.pickedDates.filter(d => d !== cell.date) : [...this.pickedDates, cell.date];
    this.changed();
  }

  // ── Money ────────────────────────────────────────────────────────────────

  get offerChoices(): PromoOffer[] {
    return this.offers;
  }

  offerLabel(offer: PromoOffer): string {
    switch (offer.type) {
      case 'percentage': return `${offer.value}% off the whole plan`;
      case 'fixed': return `$${offer.value} off the whole plan`;
      case 'free_session': return 'One session free';
      default: return offer.title;
    }
  }

  // ── Send ─────────────────────────────────────────────────────────────────

  private buildRequest(): BookingPlanRequest {
    return {
      ...(this.kind === 'trainer' ? { trainerId: this.providerId! } : { centerId: this.providerId! }),
      sessions: this.sessions.map(s => ({ localDate: s.date, localTime: s.time, durationMinutes: s.durationMinutes })),
      promotionId: this.promotionId,
      notes: this.notes.trim() || undefined,
      ...locationPayload(this.locationSelection),
    };
  }

  signIn(): void {
    this.saveDraft();
    this.authRedirect.goToLogin();
  }

  send(): void {
    if (!this.canSubmit) return;
    if (!this.user?.email) {
      this.signIn();
      return;
    }

    this.submitting = true;
    this.submitError = null;
    this.bookingService.createPlan(this.buildRequest()).pipe(take(1)).subscribe({
      next: res => {
        this.submitting = false;
        this.clearDraft();
        this.snackBar.openSnackBar(res?.data?.message || res?.message || 'Your plan request has been sent.', '');
        this.router.navigate(['/dashboard/my-bookings']);
      },
      error: err => {
        this.submitting = false;
        this.submitError = err?.error?.message || genericError;
        this.requestPreview(); // show which sessions are the problem
      },
    });
  }

  // ── Draft (a guest who signs in comes back to what they built) ───────────

  private draftTimer: ReturnType<typeof setTimeout> | null = null;

  private saveDraftSoon(): void {
    if (this.draftTimer) clearTimeout(this.draftTimer);
    this.draftTimer = setTimeout(() => this.saveDraft(), 500);
  }

  private saveDraft(): void {
    if (!this.providerId) return;
    try {
      sessionStorage.setItem(DRAFT_KEY(this.kind, this.providerId), JSON.stringify({
        at: Date.now(),
        startDate: this.startDate, periodWeeks: this.periodWeeks, durationMinutes: this.durationMinutes,
        patternKind: this.patternKind, weekdays: this.weekdays, weeklyTime: this.weeklyTime, customTimes: this.customTimes,
        rotationSteps: this.rotationSteps, rotationTime: this.rotationTime, pickedDates: this.pickedDates, datesTime: this.datesTime,
        removed: [...this.removed], timeOverrides: this.timeOverrides, promotionId: this.promotionId, notes: this.notes,
      }));
    } catch { /* storage unavailable: the draft is a convenience */ }
  }

  private restoreDraft(): void {
    if (!this.providerId) return;
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY(this.kind, this.providerId));
      if (!raw) return;
      const d = JSON.parse(raw);
      if (!d || Date.now() - d.at > DRAFT_MAX_AGE_MS) return;
      if (d.startDate && daysBetween(formatDate(new Date()), d.startDate) < 1) return; // that day has come and gone
      Object.assign(this, {
        startDate: d.startDate, periodWeeks: d.periodWeeks, durationMinutes: d.durationMinutes, patternKind: d.patternKind,
        weekdays: d.weekdays, weeklyTime: d.weeklyTime, customTimes: d.customTimes, rotationSteps: d.rotationSteps,
        rotationTime: d.rotationTime, pickedDates: d.pickedDates, datesTime: d.datesTime,
        removed: new Set<string>(d.removed ?? []), timeOverrides: d.timeOverrides ?? {}, promotionId: d.promotionId ?? null,
        notes: d.notes ?? '',
      });
      this.calendarMonth = this.startDate.slice(0, 7);
      this.recalc();
    } catch { /* ignore a corrupt draft */ }
  }

  private clearDraft(): void {
    try {
      sessionStorage.removeItem(DRAFT_KEY(this.kind, this.providerId));
    } catch { /* nothing to clear */ }
  }

  trackByDate(_: number, row: ReviewRow): string {
    return row.date;
  }
}
