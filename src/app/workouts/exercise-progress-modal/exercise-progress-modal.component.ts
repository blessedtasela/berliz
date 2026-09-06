import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { ExerciseProgressPoint } from 'src/app/models/workout.interface';
import { WorkoutService } from 'src/app/services/workout.service';

/**
 * "5lbs → 7lbs" trend view for a single catalog exercise — every session it
 * appears in, oldest first, with the change in best weight vs. the previous
 * session called out so progress (or a plateau) is obvious at a glance.
 */
@Component({
  selector: 'app-exercise-progress-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, IconsModule],
  templateUrl: './exercise-progress-modal.component.html',
})
export class ExerciseProgressModalComponent implements OnInit {

  points: ExerciseProgressPoint[] = [];
  loading = true;

  private readonly chartWidth = 380;
  private readonly chartHeight = 100;
  private readonly chartPad = 10;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { exerciseId: number; exerciseName: string },
    public dialogRef: MatDialogRef<ExerciseProgressModalComponent>,
    private workoutService: WorkoutService,
  ) { }

  ngOnInit(): void {
    this.workoutService.getExerciseProgress(this.data.exerciseId)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.points = res?.data ?? [];
          this.loading = false;
        },
        error: () => {
          this.points = [];
          this.loading = false;
        },
      });
  }

  /** Newest first for display, even though the trend math below reads oldest-first. */
  get displayPoints(): ExerciseProgressPoint[] {
    return [...this.points].reverse();
  }

  // ── Trend chart (inline SVG — chronological, oldest-first) ───────────────
  // Only sessions with a recorded weight plot on the line; bodyweight-only
  // sessions (bestWeight null) are skipped here but still show in the list.

  private get chartablePoints(): { point: ExerciseProgressPoint; weight: number }[] {
    return this.points
      .filter((p): p is ExerciseProgressPoint & { bestWeight: number } => p.bestWeight != null)
      .map(point => ({ point, weight: point.bestWeight as number }));
  }

  get hasChart(): boolean {
    return this.chartablePoints.length >= 2;
  }

  get chartCoords(): { x: number; y: number; weight: number; isRecord: boolean }[] {
    const entries = this.chartablePoints;
    if (entries.length === 0) return [];

    const weights = entries.map(e => e.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const range = max - min || 1;
    const stepX = entries.length > 1 ? (this.chartWidth - this.chartPad * 2) / (entries.length - 1) : 0;

    return entries.map((e, i) => ({
      x: this.chartPad + i * stepX,
      y: this.chartPad + (this.chartHeight - this.chartPad * 2) * (1 - (e.weight - min) / range),
      weight: e.weight,
      isRecord: e.weight === max,
    }));
  }

  get chartLinePath(): string {
    return this.chartCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
  }

  get chartViewBox(): string {
    return `0 0 ${this.chartWidth} ${this.chartHeight}`;
  }

  /** Change in bestWeight vs. the session right before this one (chronologically). */
  weightDelta(point: ExerciseProgressPoint): number | null {
    const index = this.points.indexOf(point);
    if (index <= 0) return null;
    const prev = this.points[index - 1];
    if (point.bestWeight == null || prev.bestWeight == null) return null;
    return point.bestWeight - prev.bestWeight;
  }

  deltaLabel(point: ExerciseProgressPoint): string | null {
    const delta = this.weightDelta(point);
    if (delta == null) return null;
    if (delta === 0) return 'Same as last time';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta} vs last time`;
  }

  deltaClass(point: ExerciseProgressPoint): string {
    const delta = this.weightDelta(point);
    if (delta == null) return 'text-gray-400 bg-gray-50 border-gray-200';
    if (delta > 0) return 'text-green-700 bg-green-50 border-green-100';
    if (delta < 0) return 'text-amber-700 bg-amber-50 border-amber-100';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  }

  setsSummary(point: ExerciseProgressPoint): string {
    return (point.sets ?? [])
      .map(s => `${s.reps ?? '—'}×${s.weight ?? 0}${s.weightUnit ?? 'lbs'}${s.setType && s.setType !== 'NORMAL' ? ` (${s.setType.toLowerCase()})` : ''}`)
      .join(', ');
  }

  close(): void {
    this.dialogRef.close();
  }

  trackByWorkoutLogId(_: number, point: ExerciseProgressPoint): number {
    return point.workoutLogId;
  }

  trackByIndex(i: number): number {
    return i;
  }
}
