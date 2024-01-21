import { Component, Input } from '@angular/core';
import { TrainerReview } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-client-review',
  templateUrl: './trainer-client-review.component.html',
  styleUrls: ['./trainer-client-review.component.css']
})
export class TrainerClientReviewComponent {
  showAllReviews: boolean = false;
  @Input() trainerReview: TrainerReview[] = [];

  constructor() {

  }

  allReviews() {
    this.showAllReviews = !this.showAllReviews;
  }
}
