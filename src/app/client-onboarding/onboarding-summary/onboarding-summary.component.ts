import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { ClientOnboarding } from 'src/app/models/client-onboarding.model';
import {
  DAYS, DIET_PATTERNS, EQUIPMENT, GOALS, LEVELS, LOCATION_TYPES, SUPPLEMENTS, SUPPLEMENT_GUIDANCE, TIMES,
  TRAINER_GENDER_PREFS, TRAINER_MODE_PREFS, TRAINING_MODES, labelOf, labelsOf,
} from '../client-onboarding.options';

interface Row { label: string; value: string }
interface Section { title: string; rows: Row[]; health?: boolean }

/**
 * Read-only view of a client's onboarding answers, section by section. Used on the trainer's full view
 * (`/dashboard/clients/:id/onboarding`) and the client's own review. Empty answers are left out rather than shown as
 * blanks, so a half-filled profile reads as short, not broken.
 */
@Component({
  selector: 'app-onboarding-summary',
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-4" data-testid="onboarding-summary">
      <div *ngFor="let s of sections" class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col gap-3">
        <h3 class="text-xs font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          {{ s.title }}
          <span *ngIf="s.health" class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900">Private</span>
        </h3>
        <dl class="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-4 gap-y-2">
          <ng-container *ngFor="let r of s.rows">
            <dt class="text-[11px] text-gray-400 dark:text-gray-500">{{ r.label }}</dt>
            <dd class="text-xs text-gray-800 dark:text-gray-100 whitespace-pre-line break-words">{{ r.value }}</dd>
          </ng-container>
        </dl>
      </div>
      <p *ngIf="!sections.length" class="text-xs text-gray-400 dark:text-gray-500">No answers yet.</p>
    </div>
  `,
})
export class OnboardingSummaryComponent {
  sections: Section[] = [];

  @Input() set data(value: ClientOnboarding | null | undefined) {
    this.sections = value ? buildSections(value) : [];
  }
}

/** The sections to show for a profile; exported so the chat card and tests share the same wording. */
export function buildSections(o: ClientOnboarding): Section[] {
  const out: Section[] = [];
  const add = (title: string, rows: (Row | null)[], health = false) => {
    const kept = rows.filter((r): r is Row => !!r);
    if (kept.length) out.push({ title, rows: kept, health });
  };
  const row = (label: string, value: string | null | undefined): Row | null => {
    const v = (value ?? '').toString().trim();
    return v ? { label, value: v } : null;
  };
  const list = (label: string, values: string[]): Row | null => (values.length ? { label, value: values.join(', ') } : null);

  const place = o.locationType === 'center'
    ? (o.centerName || 'A center on Berliz')
    : o.locationType === 'other_gym'
      ? [o.gymName, o.gymCity].filter(Boolean).join(', ') || 'Another gym'
      : labelOf(LOCATION_TYPES, o.locationType);

  add('Training setup', [
    row('Where they train', place),
    row('How they train', labelOf(TRAINING_MODES, o.trainingMode)),
    list('Equipment', labelsOf(EQUIPMENT, o.equipment)),
    row('Other equipment', o.equipmentOther),
  ]);
  add('Fitness level and history', [
    row('Level', labelOf(LEVELS, o.fitnessLevel)),
    row('Years training', o.yearsTraining),
    row('Sports', o.sportsPlayed),
    row('A normal week', o.weeklyActivity),
    row('Benchmarks', o.benchmarks),
  ]);
  add('Goals', [
    list('Main goals', labelsOf(GOALS, o.goals)),
    row('Target date', o.targetDate ? formatDay(o.targetDate) : ''),
    row('Success looks like', o.successText),
  ]);
  add('Health and safety', [
    row('Injuries and limits', o.injuries),
    row('Medical conditions', o.medicalConditions),
    row('Doctor clearance', o.doctorClearance),
  ], true);
  add('Nutrition and supplements', [
    list('Supplements', labelsOf(SUPPLEMENTS, o.supplements)),
    row('Other supplements', o.supplementsOther),
    row('Diet', labelOf(DIET_PATTERNS, o.dietPattern)),
    row('Diet notes', o.dietNotes),
    row('Allergies', o.allergies),
    row('Supplement guidance', labelOf(SUPPLEMENT_GUIDANCE, o.supplementGuidance)),
  ]);
  add('Schedule and preferences', [
    list('Days', labelsOf(DAYS, o.availableDays)),
    list('Times', labelsOf(TIMES, o.availableTimes)),
    row('Session length', o.sessionMinutes ? `${o.sessionMinutes} minutes` : ''),
    row('Training style', labelOf(TRAINER_MODE_PREFS, o.trainerModePref)),
    row('Trainer', labelOf(TRAINER_GENDER_PREFS, o.trainerGenderPref)),
    row('Language', o.languagePref),
    row('Check-ins', o.checkInPref),
  ]);
  add('Emergency contact and more', [
    row('Emergency contact', o.emergencyContactName),
    row('Emergency phone', o.emergencyContactPhone),
    row('Found Berliz through', o.heardFrom),
  ]);
  return out;
}

function formatDay(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
