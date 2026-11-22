import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { AuthService } from 'src/app/services/auth.service';
import { WorkoutService } from 'src/app/services/workout.service';
import { WorkoutResponse } from 'src/app/models/workout.interface';

/**
 * "Recommended workouts" strip on the feed, next to Recommended trainers -- the admin-curated public
 * template library (WorkoutServiceImplement#getTemplates, already shipped and already powering the
 * workout builder's "start from a template" flow), sorted by how many times each has been cloned so the
 * most-used templates lead. No new backend work: this is the same /workout/getTemplates every other
 * template-picker in the app already calls.
 */
@Component({
  selector: 'app-recommended-workouts',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './recommended-workouts.component.html',
})
export class RecommendedWorkoutsComponent implements OnInit {
  visible = false;
  loading = true;
  workouts: WorkoutResponse[] = [];

  constructor(private authService: AuthService, private workoutService: WorkoutService) { }

  ngOnInit(): void {
    this.visible = this.authService.hasSession();
    if (!this.visible) return;

    this.workoutService.getTemplates().pipe(catchError(() => of({ data: [] } as any))).subscribe(res => {
      this.workouts = (res.data ?? [])
        .slice()
        .sort((a: WorkoutResponse, b: WorkoutResponse) => (b.cloneCount ?? 0) - (a.cloneCount ?? 0))
        .slice(0, 8);
      this.loading = false;
    });
  }
}
