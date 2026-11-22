import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { IconsModule } from 'src/app/icons/icons.module';
import { StrapiUrlPipe } from 'src/app/shared/pipes/strapi-url.pipe';
import { ProviderCardMetaComponent } from 'src/app/shared/provider-profile/provider-card-meta.component';
import { AuthService } from 'src/app/services/auth.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { FollowService } from 'src/app/services/follow.service';
import { Trainers } from 'src/app/models/trainers.interface';
import { nameSlug } from 'src/app/utils/closest-slug';

/**
 * "Recommended for you" strip on the feed -- GN-75 Phase 2. V1 is deliberately honest about what it is:
 * the public trainer listing's own featured/promoted ordering (TrainerServiceImplement#getActiveTrainers,
 * a real subscription-tier-driven ranking, not a placeholder), minus anyone the viewer already follows.
 * True personalization (matching the profile quiz's "how do you prefer to train?" answer against a
 * trainer's serviceMode, or a discipline/category match) is a clean near-term follow-up once that's
 * worth doing carefully -- not faked here with a brittle string-match against freely-editable quiz option
 * text. Hidden for a trainer/center themselves (recommending trainers to a trainer doesn't apply) and for
 * anyone signed out.
 */
@Component({
  selector: 'app-recommended-trainers',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule, StrapiUrlPipe, ProviderCardMetaComponent],
  templateUrl: './recommended-trainers.component.html',
})
export class RecommendedTrainersComponent implements OnInit {
  visible = false;
  loading = true;
  trainers: Trainers[] = [];
  readonly nameSlug = nameSlug;

  constructor(
    private authService: AuthService,
    private trainerService: TrainerService,
    private followService: FollowService,
  ) { }

  ngOnInit(): void {
    this.visible = this.authService.hasSession() && !this.authService.isTrainer() && !this.authService.isCenter();
    if (!this.visible) return;

    forkJoin({
      trainers: this.trainerService.getActiveTrainers().pipe(catchError(() => of({ data: [] } as any))),
      following: this.followService.getFollowing().pipe(catchError(() => of({ data: [] } as any))),
    }).subscribe(({ trainers, following }) => {
      const followedIds = new Set((following.data ?? []).map((f: { userId: number }) => f.userId));
      this.trainers = (trainers.data ?? []).filter((t: Trainers) => !followedIds.has(t.userId)).slice(0, 8);
      this.loading = false;
    });
  }
}
