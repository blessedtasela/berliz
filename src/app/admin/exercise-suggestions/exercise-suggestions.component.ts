import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { ExerciseSuggestionResponse, ExerciseSuggestionStatus } from 'src/app/models/exercise.interface';
import { ExerciseService } from 'src/app/services/exercise.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { WhatsNewService } from 'src/app/services/whats-new.service';
import { SharedModule } from 'src/app/shared/shared.module';

/**
 * Admin review queue for the crowdsourced exercise-catalog pipeline —
 * `/dashboard/hub/exercise-suggestions`. Every custom exercise name a user
 * types into a workout-history entry instead of picking from the catalog
 * (WorkoutLogExercise.customExerciseName) lands here, deduplicated and
 * ranked by how many separate sessions have used it, so real usage — not
 * just admin authorship — grows the catalog.
 *
 * Standalone + direct service calls, same pattern as WorkoutHistoryComponent:
 * a self-contained admin page with no other consumer of this data.
 */
@Component({
  selector: 'app-exercise-suggestions',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, SharedModule],
  templateUrl: './exercise-suggestions.component.html',
})
export class ExerciseSuggestionsComponent implements OnInit {

  suggestions: ExerciseSuggestionResponse[] = [];
  loading = false;
  busyId: number | null = null;
  activeTab: ExerciseSuggestionStatus = 'PENDING';

  constructor(
    private exerciseService: ExerciseService,
    private snackbar: SnackBarService,
    private whatsNew: WhatsNewService,
  ) { }

  ngOnInit(): void {
    this.whatsNew.markSeen('exercise-suggestions');
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.exerciseService.getExerciseSuggestions()
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.suggestions = res?.data ?? [];
          this.loading = false;
        },
        error: () => {
          this.suggestions = [];
          this.loading = false;
        },
      });
  }

  setTab(tab: ExerciseSuggestionStatus): void {
    this.activeTab = tab;
  }

  get filtered(): ExerciseSuggestionResponse[] {
    return this.suggestions.filter(s => s.status === this.activeTab);
  }

  countFor(status: ExerciseSuggestionStatus): number {
    return this.suggestions.filter(s => s.status === status).length;
  }

  approve(suggestion: ExerciseSuggestionResponse): void {
    if (this.busyId) return;
    this.busyId = suggestion.id;
    this.exerciseService.approveExerciseSuggestion(suggestion.id)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busyId = null;
          this.snackbar.openSnackBar(res?.message || `"${suggestion.name}" added to the catalog`, '');
          this.applyUpdate(res?.data);
        },
        error: (err) => {
          this.busyId = null;
          this.snackbar.openSnackBar(err?.error?.message || 'Could not approve this suggestion', 'error');
        },
      });
  }

  dismiss(suggestion: ExerciseSuggestionResponse): void {
    if (this.busyId) return;
    this.busyId = suggestion.id;
    this.exerciseService.dismissExerciseSuggestion(suggestion.id)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.busyId = null;
          this.snackbar.openSnackBar('Suggestion dismissed', '');
          this.applyUpdate(res?.data);
        },
        error: (err) => {
          this.busyId = null;
          this.snackbar.openSnackBar(err?.error?.message || 'Could not dismiss this suggestion', 'error');
        },
      });
  }

  private applyUpdate(updated: ExerciseSuggestionResponse | undefined): void {
    if (!updated) return;
    this.suggestions = this.suggestions.map(s => s.id === updated.id ? updated : s);
  }

  trackById(_: number, item: ExerciseSuggestionResponse): number {
    return item.id;
  }
}
