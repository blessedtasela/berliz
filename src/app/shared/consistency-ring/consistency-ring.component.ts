import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { StreakResponse } from 'src/app/models/streak.interface';
import { StreakService } from 'src/app/services/streak.service';

/**
 * Training-consistency card: the current streak with a flame, this week's
 * seven days as filled/empty dots, and the all-time best. Self-fetches from
 * `GET /streak/me`; renders nothing until it has data (no layout jump on an
 * empty account -- a 0 streak still shows, that's the nudge).
 */
@Component({
  selector: 'app-consistency-ring',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './consistency-ring.component.html',
})
export class ConsistencyRingComponent implements OnInit {
  streak?: StreakResponse;
  loading = true;
  failed = false;

  constructor(private streakService: StreakService) {}

  ngOnInit(): void {
    this.streakService.getMyStreak().pipe(take(1)).subscribe({
      next: res => {
        this.loading = false;
        this.streak = res.data;
      },
      error: () => {
        this.loading = false;
        this.failed = true;
      },
    });
  }

  get headline(): string {
    const n = this.streak?.currentStreak ?? 0;
    if (n === 0) return this.streak?.activeToday ? 'Logged today' : 'Start a streak today';
    return `${n} day${n === 1 ? '' : 's'} in a row`;
  }
}
