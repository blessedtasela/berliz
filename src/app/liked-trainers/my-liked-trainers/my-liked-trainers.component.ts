import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { take } from 'rxjs';

import { IconsModule } from 'src/app/icons/icons.module';
import { TrainerService } from 'src/app/services/trainer.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerLikes } from 'src/app/models/trainers.interface';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Dashboard-native "Liked Trainers" list — what the hub tile now links to
 * instead of dumping the user on the public /trainers marketing grid (which
 * has no concept of "liked", just every trainer on the platform). Unliking
 * reuses the same toggle endpoint the heart button on a trainer's public
 * profile calls — liking again from there just adds the row back.
 */
@Component({
  selector: 'app-my-liked-trainers',
  standalone: true,
  imports: [CommonModule, RouterModule, IconsModule],
  providers: [DatePipe],
  templateUrl: './my-liked-trainers.component.html',
  styleUrls: ['./my-liked-trainers.component.css']
})
export class MyLikedTrainersComponent implements OnInit {

  likes: TrainerLikes[] = [];
  loading = true;
  /** trainerId currently mid-unlike, so its row can show a disabled/pending state. */
  removingId: number | null = null;

  constructor(
    private trainerService: TrainerService,
    private snackBar: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.trainerService.getMyLikedTrainers()
      .pipe(take(1))
      .subscribe({
        next: (res: any) => {
          this.likes = res?.data ?? [];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.openSnackBar(genericError, 'error');
        }
      });
  }

  /** Trainer profile route slug — matches TrainersSearchResultComponent's formatUrl(). */
  slugFor(name: string): string {
    return name?.replace(/ /g, '-') ?? '';
  }

  unlike(trainerId: number): void {
    this.removingId = trainerId;
    this.trainerService.likeTrainer(trainerId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.likes = this.likes.filter(l => l.trainerId !== trainerId);
          this.removingId = null;
        },
        error: (err: any) => {
          this.removingId = null;
          this.snackBar.openSnackBar(err?.error?.message || genericError, 'error');
        }
      });
  }
}
