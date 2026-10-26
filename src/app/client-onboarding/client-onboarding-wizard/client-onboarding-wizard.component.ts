import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { ClientOnboarding, ClientOnboardingSave } from 'src/app/models/client-onboarding.model';
import { CenterService } from 'src/app/services/center.service';
import { ClientOnboardingService } from 'src/app/services/client-onboarding.service';
import { PageHeaderComponent } from 'src/app/shared/page-header/page-header.component';
import {
  DAYS, DIET_PATTERNS, EQUIPMENT, GOALS, LEVELS, LOCATION_TYPES, ONBOARDING_STEPS, Option, SESSION_MINUTES,
  SUPPLEMENTS, SUPPLEMENT_GUIDANCE, TIMES, TRAINER_GENDER_PREFS, TRAINER_MODE_PREFS, TRAINING_MODES, emptyOnboarding,
} from '../client-onboarding.options';

/** The words the wizard shows when a required answer is missing, by the step's field. */
const REQUIRED_MESSAGES: Record<string, string> = {
  locationType: 'Choose where you train.',
  trainingMode: 'Choose how you train.',
  fitnessLevel: 'Choose the level that fits you best.',
  goals: 'Pick one or two goals.',
  injuries: 'Tell us about injuries or limits. "None" is a fine answer.',
  availableDays: 'Pick at least one day you can train.',
};

/**
 * The client onboarding wizard -- `/dashboard/onboarding`. Seven short steps (training setup, level, goals, health,
 * nutrition, schedule, a few last things); only the first six hold required answers (6 in all, see the backend
 * ClientOnboardingServiceImplement) and the whole thing takes under five minutes. Each step is saved as soon as the
 * client moves on, so closing the page and coming back resumes at the step they reached; the answers can be edited
 * any time from the same page. There is deliberately no payment step anywhere in it.
 */
@Component({
  selector: 'app-client-onboarding-wizard',
  imports: [CommonModule, FormsModule, RouterModule, IconsModule, PageHeaderComponent],
  templateUrl: './client-onboarding-wizard.component.html',
})
export class ClientOnboardingWizardComponent implements OnInit {

  readonly steps = ONBOARDING_STEPS;
  readonly locationTypes = LOCATION_TYPES;
  readonly trainingModes = TRAINING_MODES;
  readonly equipment = EQUIPMENT;
  readonly levels = LEVELS;
  readonly goalOptions = GOALS;
  readonly supplementOptions = SUPPLEMENTS;
  readonly dietPatterns = DIET_PATTERNS;
  readonly guidanceOptions = SUPPLEMENT_GUIDANCE;
  readonly days = DAYS;
  readonly times = TIMES;
  readonly sessionMinutes = SESSION_MINUTES;
  readonly trainerModePrefs = TRAINER_MODE_PREFS;
  readonly trainerGenderPrefs = TRAINER_GENDER_PREFS;

  draft: ClientOnboarding = emptyOnboarding();
  step = 1;
  loading = true;
  loadFailed = false;
  saving = false;
  finished = false;
  errors: Record<string, string> = {};
  saveError: string | null = null;
  confirmingHealthDelete = false;

  centers: { id: number; name: string }[] = [];
  centerQuery = '';
  noInjuries = false;

  constructor(
    private service: ClientOnboardingService,
    private centerService: CenterService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadFailed = false;
    this.service.getMine().pipe(take(1)).subscribe({
      next: (o) => {
        this.draft = o;
        this.noInjuries = (o.injuries ?? '').trim().toLowerCase() === 'none';
        const asked = Number(this.route.snapshot.queryParamMap.get('step'));
        // A finished profile opens at the first step (it is an edit), an unfinished one where the client left off.
        this.step = asked >= 1 && asked <= 7 ? asked : (o.complete ? 1 : o.currentStep);
        this.loading = false;
        if (this.draft.locationType === 'center') this.loadCenters();
      },
      error: () => {
        this.loadFailed = true;
        this.loading = false;
      },
    });
  }

  get current() {
    return this.steps[this.step - 1];
  }

  get isRequiredStep(): boolean {
    return this.step <= 6 && this.step !== 5;
  }

  get progressPct(): number {
    return Math.round(((this.step - 1) / this.steps.length) * 100);
  }

  // ── selection helpers ────────────────────────────────────────────────────

  has(list: string[] | null | undefined, value: string): boolean {
    return !!list && list.includes(value);
  }

  toggle(list: 'equipment' | 'supplements' | 'availableDays' | 'availableTimes', value: string): void {
    const current = this.draft[list];
    this.draft[list] = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    delete this.errors[list];
  }

  /** At most two goals: choosing a third replaces nothing, it is simply refused with a hint. */
  toggleGoal(value: string): void {
    const goals = this.draft.goals;
    if (goals.includes(value)) {
      this.draft.goals = goals.filter(g => g !== value);
    } else if (goals.length >= 2) {
      this.errors['goals'] = 'You can pick up to 2 goals. Tap one you have picked to swap it.';
      return;
    } else {
      this.draft.goals = [...goals, value];
    }
    delete this.errors['goals'];
  }

  pick(field: 'locationType' | 'trainingMode' | 'fitnessLevel' | 'dietPattern' | 'supplementGuidance' | 'trainerModePref' | 'trainerGenderPref', value: string): void {
    this.draft[field] = this.draft[field] === value && !['locationType', 'trainingMode', 'fitnessLevel'].includes(field) ? '' : value;
    delete this.errors[field];
    if (field === 'locationType' && value === 'center') this.loadCenters();
  }

  setNoInjuries(checked: boolean): void {
    this.noInjuries = checked;
    this.draft.injuries = checked ? 'None' : '';
    delete this.errors['injuries'];
  }

  onInjuriesTyped(): void {
    this.noInjuries = (this.draft.injuries ?? '').trim().toLowerCase() === 'none';
    delete this.errors['injuries'];
  }

  setSessionMinutes(minutes: number): void {
    this.draft.sessionMinutes = this.draft.sessionMinutes === minutes ? null : minutes;
  }

  // ── centers ──────────────────────────────────────────────────────────────

  private loadCenters(): void {
    if (this.centers.length) return;
    this.centerService.getActiveCenters().pipe(take(1)).subscribe({
      next: (res) => { this.centers = (res.data ?? []).map(c => ({ id: c.id, name: c.name })); },
      error: () => { this.centers = []; },
    });
  }

  get centerMatches(): { id: number; name: string }[] {
    const q = this.centerQuery.trim().toLowerCase();
    if (!q) return [];
    return this.centers.filter(c => c.name.toLowerCase().includes(q)).slice(0, 6);
  }

  chooseCenter(c: { id: number; name: string }): void {
    this.draft.centerId = c.id;
    this.draft.centerName = c.name;
    this.centerQuery = '';
  }

  clearCenter(): void {
    this.draft.centerId = null;
    this.draft.centerName = null;
  }

  // ── navigation ───────────────────────────────────────────────────────────

  validate(n: number): Record<string, string> {
    const e: Record<string, string> = {};
    const need = (key: string, ok: boolean) => { if (!ok) e[key] = REQUIRED_MESSAGES[key]; };
    if (n === 1) {
      need('locationType', !!this.draft.locationType);
      need('trainingMode', !!this.draft.trainingMode);
    }
    if (n === 2) need('fitnessLevel', !!this.draft.fitnessLevel);
    if (n === 3) need('goals', this.draft.goals.length >= 1);
    if (n === 4) need('injuries', !!(this.draft.injuries ?? '').trim());
    if (n === 6) need('availableDays', this.draft.availableDays.length >= 1);
    return e;
  }

  next(): void {
    if (this.saving) return;
    this.errors = this.validate(this.step);
    if (Object.keys(this.errors).length) return;
    this.save(this.payload(this.step));
  }

  /** Optional steps can be skipped: nothing about them is saved, only where to resume. */
  skip(): void {
    if (this.saving || this.isRequiredStep) return;
    this.save({ currentStep: Math.min(7, this.step + 1) });
  }

  back(): void {
    if (this.step > 1) {
      this.step--;
      this.errors = {};
      this.saveError = null;
    }
  }

  goToStep(n: number): void {
    // Moving back is free; moving forward goes through Next so required answers are checked and saved.
    if (n < this.step) {
      this.step = n;
      this.errors = {};
      this.saveError = null;
    }
  }

  private save(body: ClientOnboardingSave): void {
    this.saving = true;
    this.saveError = null;
    const wasLast = this.step === 7;
    this.service.saveMine(body).pipe(take(1)).subscribe({
      next: (o) => {
        this.saving = false;
        this.draft = { ...o, centerName: o.centerName ?? this.draft.centerName };
        if (wasLast) {
          this.finished = true;
        } else {
          this.step = this.step + 1;
        }
        if (this.draft.locationType === 'center') this.loadCenters();
      },
      error: (err: HttpErrorResponse) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'We could not save that. Check your connection and try again.';
      },
    });
  }

  /** The answers of one step, as the server wants them: cleared answers as '' / [] / the clear flags. */
  payload(n: number): ClientOnboardingSave {
    const d = this.draft;
    const currentStep = Math.min(7, n + 1);
    const text = (v: string | null | undefined) => (v ?? '').trim();
    switch (n) {
      case 1: {
        const center = d.locationType === 'center';
        const gym = d.locationType === 'other_gym';
        return {
          currentStep,
          locationType: d.locationType ?? '',
          centerId: center && d.centerId ? d.centerId : undefined,
          clearCenter: !(center && d.centerId),
          gymName: gym ? text(d.gymName) : '',
          gymCity: gym ? text(d.gymCity) : '',
          trainingMode: d.trainingMode ?? '',
          equipment: d.equipment,
          equipmentOther: text(d.equipmentOther),
        };
      }
      case 2:
        return {
          currentStep,
          fitnessLevel: d.fitnessLevel ?? '',
          yearsTraining: text(d.yearsTraining),
          sportsPlayed: text(d.sportsPlayed),
          weeklyActivity: text(d.weeklyActivity),
          benchmarks: text(d.benchmarks),
        };
      case 3:
        return {
          currentStep,
          goals: d.goals,
          targetDate: d.targetDate || undefined,
          clearTargetDate: !d.targetDate,
          successText: text(d.successText),
        };
      case 4:
        return {
          currentStep,
          injuries: text(d.injuries),
          medicalConditions: text(d.medicalConditions),
          doctorClearance: text(d.doctorClearance),
        };
      case 5:
        return {
          currentStep,
          supplements: d.supplements,
          supplementsOther: text(d.supplementsOther),
          dietPattern: d.dietPattern ?? '',
          dietNotes: text(d.dietNotes),
          allergies: text(d.allergies),
          supplementGuidance: d.supplementGuidance ?? '',
        };
      case 6:
        return {
          currentStep,
          availableDays: d.availableDays,
          availableTimes: d.availableTimes,
          sessionMinutes: d.sessionMinutes ?? 0,
          trainerModePref: d.trainerModePref ?? '',
          languagePref: text(d.languagePref),
          trainerGenderPref: d.trainerGenderPref ?? '',
          checkInPref: text(d.checkInPref),
        };
      default:
        return {
          currentStep,
          emergencyContactName: text(d.emergencyContactName),
          emergencyContactPhone: text(d.emergencyContactPhone),
          heardFrom: text(d.heardFrom),
        };
    }
  }

  // ── health answers ───────────────────────────────────────────────────────

  get hasSavedHealthAnswers(): boolean {
    return this.draft.started && !!(this.draft.injuries || this.draft.medicalConditions || this.draft.doctorClearance);
  }

  deleteHealthAnswers(): void {
    this.service.deleteMyHealthAnswers().pipe(take(1)).subscribe({
      next: (o) => {
        this.draft = { ...this.draft, injuries: o.injuries, medicalConditions: o.medicalConditions, doctorClearance: o.doctorClearance, complete: o.complete, completionPercent: o.completionPercent, missingRequired: o.missingRequired };
        this.noInjuries = false;
        this.confirmingHealthDelete = false;
        this.saveError = null;
      },
      error: () => {
        this.saveError = 'We could not delete your health answers. Please try again.';
        this.confirmingHealthDelete = false;
      },
    });
  }

  optionLabel(options: Option[], value: string | null | undefined): string {
    return options.find(o => o.value === value)?.label ?? '';
  }
}
