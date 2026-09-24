import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { RecapPeriod, RecapResponse } from 'src/app/models/recap.interface';
import { RecapService } from 'src/app/services/recap.service';
import { PostService } from 'src/app/services/post.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

const PERIODS: { key: RecapPeriod; label: string }[] = [
  { key: 'month', label: '30 days' },
  { key: 'quarter', label: '90 days' },
  { key: 'year', label: 'Year' },
  { key: 'all', label: 'All time' },
];

/**
 * "Your time in Berliz" recap, as a real dashboard route (/dashboard/recap)
 * instead of only reachable through a dialog opened from the dashboard card
 * -- gives it a real, bookmarkable/shareable URL. `?period=` preselects a
 * window the same way the old modal's dialog data did.
 */
@Component({
  selector: 'app-recap-page',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  templateUrl: './recap-page.component.html',
  styleUrls: ['./recap-page.component.css'],
})
export class RecapPageComponent implements OnInit {
  readonly periods = PERIODS;
  period: RecapPeriod = 'year';
  recap?: RecapResponse;
  loading = true;
  sharing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recapService: RecapService,
    private postService: PostService,
    private snackBar: SnackBarService,
  ) {}

  ngOnInit(): void {
    const requested = this.route.snapshot.queryParamMap.get('period') as RecapPeriod | null;
    if (requested && this.periods.some(p => p.key === requested)) this.period = requested;
    this.load();
  }

  setPeriod(p: RecapPeriod): void {
    if (p === this.period) return;
    this.period = p;
    // Keeps the URL a real deep link to this exact view, not just this page.
    this.router.navigate([], { relativeTo: this.route, queryParams: { period: p }, queryParamsHandling: 'merge' });
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.recapService.getMyRecap(this.period).pipe(take(1)).subscribe({
      next: res => { this.recap = res.data; this.loading = false; },
      error: () => { this.loading = false; this.snackBar.openSnackBar(genericError, 'error'); },
    });
  }

  shareAsPost(): void {
    if (!this.recap || this.sharing) return;
    this.sharing = true;
    this.postService.addPost({ content: this.recap.shareText, activityType: 'MILESTONE' })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.sharing = false;
          this.snackBar.openSnackBar('Recap shared to your timeline', '');
        },
        error: (err: any) => {
          this.sharing = false;
          // Surface the real reason instead of a generic "could not share" --
          // e.g. content-moderation rejection, auth expiry -- so it's actually
          // actionable instead of a dead end.
          this.snackBar.openSnackBar(err?.error?.message || 'Could not share the recap', 'error');
        },
      });
  }
}
