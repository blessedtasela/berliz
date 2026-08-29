import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { WorkoutExerciseResponse, WorkoutResponse } from 'src/app/models/workout.interface';
import { WorkoutService } from 'src/app/services/workout.service';
import { SharedModule } from 'src/app/shared/shared.module';

/**
 * Read-only "what's actually in this workout" view — `/dashboard/workouts/:id`.
 * Every exercise gets its own step-by-step card: sets/reps/rest, which muscles
 * it targets, why it's in the program (benefit), how to perform it safely,
 * and a rough difficulty level. This is the page a "View details" link on a
 * workout card (My Workouts or Templates) lands on; editing stays on the
 * existing workout-builder route.
 *
 * Standalone + a direct service call rather than NgRx: this is a single,
 * read-only fetch with no other consumer of the same state, same pattern as
 * DashboardUserProfileComponent earlier this session.
 */
@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, SharedModule],
  templateUrl: './workout-detail.component.html'
})
export class WorkoutDetailComponent implements OnInit {

  workout: WorkoutResponse | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private workoutService: WorkoutService,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (!id || Number.isNaN(id)) return;
      this.load(id);
    });
  }

  refresh(): void {
    if (this.workout?.id) this.load(this.workout.id);
  }

  private load(id: number): void {
    this.loading = true;
    this.workoutService.getWorkout(id)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.workout = res?.data ?? null;
          this.loading = false;
        },
        error: () => {
          this.workout = null;
          this.loading = false;
        }
      });
  }

  get notFound(): boolean {
    return !this.loading && !this.workout;
  }

  get sortedExercises(): WorkoutExerciseResponse[] {
    return [...(this.workout?.exercises ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  // ── Per-exercise display helpers ─────────────────────────────────────────

  howToSteps(exercise: WorkoutExerciseResponse): string[] {
    return (exercise.exerciseHowToPerform ?? '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  }

  restLabel(seconds: number | null | undefined): string {
    if (!seconds) return 'No rest specified';
    if (seconds < 60) return `${seconds}s rest`;
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return remainder ? `${minutes}m ${remainder}s rest` : `${minutes}m rest`;
  }

  difficultyLabel(level: string | undefined): string {
    switch ((level ?? '').toUpperCase()) {
      case 'BEGINNER': return 'Beginner';
      case 'INTERMEDIATE': return 'Intermediate';
      case 'ADVANCED': return 'Advanced';
      default: return '';
    }
  }

  difficultyClass(level: string | undefined): string {
    switch ((level ?? '').toUpperCase()) {
      case 'BEGINNER': return 'bg-green-50 text-green-700 border-green-100';
      case 'INTERMEDIATE': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'ADVANCED': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  }

  /** A qualitative scaling tip since we don't yet track per-user body metrics —
   *  points the reader at what to adjust rather than computing it for them. */
  scalingTip(level: string | undefined): string {
    switch ((level ?? '').toUpperCase()) {
      case 'BEGINNER':
        return 'New to this movement? Start with fewer reps and rest a little longer between sets — form first, load later.';
      case 'ADVANCED':
        return 'Comfortable with this movement? Add load, reduce rest slightly, or increase reps to keep progressing.';
      default:
        return 'Adjust reps and rest to match your current fitness level — this is a guide, not a fixed prescription.';
    }
  }

  trackByExerciseId(_: number, exercise: WorkoutExerciseResponse): number {
    return exercise.id;
  }
}
