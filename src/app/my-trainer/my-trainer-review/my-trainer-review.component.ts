import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription, take } from 'rxjs';
import { TrainerReview } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { TrainerService } from 'src/app/services/trainer.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-my-trainer-review',
  templateUrl: './my-trainer-review.component.html',
  styleUrls: ['./my-trainer-review.component.css']
})
export class MyTrainerReviewComponent {

  @Input() trainerReviews: TrainerReview[] = [];
  @Output() emitEvent = new EventEmitter();

  showAll = false;
  visibleCount = 4;
  private subscriptions: Subscription[] = [];

  constructor(
    private trainerService: TrainerService,
    private trainerStateService: TrainerStateService,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadReviews(): void {
    this.subscriptions.push(
      this.trainerStateService.getMyTrainerReviews().subscribe(reviews => {
        this.trainerReviews = reviews || [];
        this.trainerStateService.setMyTrainerReviewsSubject(reviews);
      })
    );
  }

  get visibleReviews(): TrainerReview[] {
    return this.showAll ? this.trainerReviews : this.trainerReviews.slice(0, this.visibleCount);
  }

  toggleStatus(review: TrainerReview): void {
    this.loader.start();
    this.trainerService.updateTrainerReviewStatus(review.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.snackbar.openSnackBar('Review status updated', '');
          this.loadReviews();
          this.emitEvent.emit();
          this.loader.stop();
        },
        error: (err: any) => {
          this.snackbar.openSnackBar(err?.error?.message || genericError, 'error');
          this.loader.stop();
        }
      });
  }

  formatDate(date: any): string {
    return this.datePipe.transform(new Date(date), 'dd/MM/yyyy') ?? '';
  }
}