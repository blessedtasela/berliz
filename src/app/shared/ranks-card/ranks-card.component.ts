import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { take } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { DisciplineRankResponse } from 'src/app/models/rank.interface';
import { RankService } from 'src/app/services/rank.service';

/**
 * "Ranks" panel for a profile: each discipline's current belt/rank, since
 * when, and an expandable promotion history. Renders nothing until it has at
 * least one rank, so it's invisible for users who don't train a ranked art.
 * The parent can bump `refreshKey` to re-fetch after awarding a rank.
 */
@Component({
  selector: 'app-ranks-card',
  standalone: true,
  imports: [CommonModule, IconsModule],
  templateUrl: './ranks-card.component.html',
})
export class RanksCardComponent implements OnChanges {
  @Input() userId!: number;
  /** Change this (e.g. Date.now()) to force a re-fetch. */
  @Input() refreshKey?: unknown;
  /** Dark palette for the public profile page. */
  @Input() dark = false;

  disciplines: DisciplineRankResponse[] = [];
  loading = false;
  expanded = new Set<string>();

  constructor(private rankService: RankService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['userId'] || changes['refreshKey']) && this.userId) this.load();
  }

  private load(): void {
    this.loading = true;
    this.rankService.getUserRanks(this.userId).pipe(take(1)).subscribe({
      next: res => {
        this.loading = false;
        this.disciplines = res.data ?? [];
      },
      error: () => { this.loading = false; this.disciplines = []; },
    });
  }

  toggle(d: string): void {
    if (this.expanded.has(d)) this.expanded.delete(d); else this.expanded.add(d);
  }
}
