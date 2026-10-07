import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import {
  ACHIEVEMENT_DESCRIPTION_MAX, ACHIEVEMENT_NAME_MAX, ACHIEVEMENT_NAME_MIN,
  FitnessAchievement, FitnessAchievementRequest
} from 'src/app/models/fitness-achievement.model';
import { AchievementService } from 'src/app/services/achievement.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { StrapiService } from 'src/app/services/strapi.service';
import { resolveStrapiUrl } from 'src/app/utils/strapi-url.util';
import { genericError } from 'src/validators/form-validators.module';

export interface AchievementForm {
  name: string;
  description: string;
  /** YYYY-MM-DD, as an <input type="date"> holds it. */
  date: string;
  certificate: string | null;
}

/** An ISO timestamp as the YYYY-MM-DD an <input type="date"> wants (in the viewer's local calendar). */
export function toDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** What is wrong with the form, in words the user can act on; null when it can be saved. */
export function validateAchievement(form: AchievementForm, now: Date = new Date()): string | null {
  const name = form.name.trim();
  if (name.length < ACHIEVEMENT_NAME_MIN || name.length > ACHIEVEMENT_NAME_MAX) {
    return `Give the achievement a name of ${ACHIEVEMENT_NAME_MIN} to ${ACHIEVEMENT_NAME_MAX} characters.`;
  }
  if (form.description.trim().length > ACHIEVEMENT_DESCRIPTION_MAX) {
    return `The description can be at most ${ACHIEVEMENT_DESCRIPTION_MAX} characters.`;
  }
  if (form.date) {
    const picked = new Date(form.date + 'T00:00:00');
    if (isNaN(picked.getTime())) return 'That date is not valid.';
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (picked.getTime() > endOfToday.getTime()) return "An achievement can't be dated in the future.";
  }
  return null;
}

/** The request body for a form: trimmed text, an ISO date (noon local, so the calendar day survives any timezone), blanks as null. */
export function toRequest(form: AchievementForm, id?: number): FitnessAchievementRequest {
  return {
    ...(id != null ? { id } : {}),
    name: form.name.trim(),
    description: form.description.trim() || null,
    certificate: form.certificate || null,
    date: form.date ? new Date(form.date + 'T12:00:00').toISOString() : null,
  };
}

/**
 * "My Achievements" — a personal list of medals, certifications and milestones, each with an optional
 * certificate file. Private to the signed-in user.
 */
@Component({
    selector: 'app-my-achievements',
    imports: [CommonModule, FormsModule, IconsModule],
    templateUrl: './my-achievements.component.html'
})
export class MyAchievementsComponent implements OnInit {

  readonly nameMax = ACHIEVEMENT_NAME_MAX;
  readonly descriptionMax = ACHIEVEMENT_DESCRIPTION_MAX;

  achievements: FitnessAchievement[] = [];
  loading = true;
  loadError = false;

  /** null = the form is closed; 'new' = adding; an id = editing that achievement. */
  editing: 'new' | number | null = null;
  form: AchievementForm = this.blankForm();
  formError: string | null = null;
  saving = false;
  uploading = false;

  /** The achievement awaiting a delete confirmation, if any. */
  confirmingDeleteId: number | null = null;

  constructor(
    private achievementService: AchievementService,
    private strapiService: StrapiService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = false;
    this.achievementService.getMine().pipe(take(1)).subscribe({
      next: res => { this.achievements = res?.data ?? []; this.loading = false; },
      // A failed load must never read as "no achievements yet".
      error: () => { this.loading = false; this.loadError = true; },
    });
  }

  private blankForm(): AchievementForm {
    return { name: '', description: '', date: toDateInput(new Date().toISOString()), certificate: null };
  }

  openAdd(): void {
    this.form = this.blankForm();
    this.formError = null;
    this.editing = 'new';
  }

  openEdit(a: FitnessAchievement): void {
    this.form = { name: a.name, description: a.description ?? '', date: toDateInput(a.date), certificate: a.certificate ?? null };
    this.formError = null;
    this.editing = a.id;
  }

  cancelForm(): void {
    this.editing = null;
    this.formError = null;
  }

  certificateUrl(a: { certificate?: string | null }): string {
    return a.certificate ? resolveStrapiUrl(a.certificate) : '';
  }

  /** Uploads the chosen certificate file; the saved value is just its path, like every other uploaded media. */
  onCertificateChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.uploading) return;

    this.uploading = true;
    this.strapiService.uploadToStrapi(file).pipe(take(1)).subscribe({
      next: res => { this.form.certificate = res?.[0]?.url ?? null; this.uploading = false; },
      error: (err: any) => {
        this.uploading = false;
        this.snackBar.openSnackBar(err?.error?.message || 'Could not upload that file.', 'error');
      },
    });
  }

  removeCertificate(): void {
    this.form.certificate = null;
  }

  save(): void {
    if (this.saving || this.uploading) return;
    this.formError = validateAchievement(this.form);
    if (this.formError) return;

    this.saving = true;
    const editingId = typeof this.editing === 'number' ? this.editing : undefined;
    const request$ = editingId != null
      ? this.achievementService.update({ ...toRequest(this.form, editingId), id: editingId })
      : this.achievementService.add(toRequest(this.form));

    request$.pipe(take(1)).subscribe({
      next: res => {
        this.saving = false;
        this.snackBar.openSnackBar(res?.message || 'Saved', '');
        this.editing = null;
        this.load();
      },
      error: (err: any) => {
        this.saving = false;
        this.formError = err?.error?.message || genericError;
      },
    });
  }

  askDelete(a: FitnessAchievement): void {
    this.confirmingDeleteId = a.id;
  }

  confirmDelete(a: FitnessAchievement): void {
    this.achievementService.delete(a.id).pipe(take(1)).subscribe({
      next: () => {
        this.confirmingDeleteId = null;
        this.achievements = this.achievements.filter(x => x.id !== a.id);
        this.snackBar.openSnackBar('Achievement deleted', '');
      },
      error: (err: any) => {
        this.confirmingDeleteId = null;
        this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
      },
    });
  }
}
