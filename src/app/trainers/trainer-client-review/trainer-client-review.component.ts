import { Component, Input } from '@angular/core';
import { TrainerClientReview } from 'src/app/models/trainers.interface';

@Component({
  selector: 'app-trainer-client-review',
  templateUrl: './trainer-client-review.component.html',
  styleUrls: ['./trainer-client-review.component.css']
})
export class TrainerClientReviewComponent {
  showAllReviews: boolean = false;
 @Input() trainerClientReview: TrainerClientReview | undefined;

 constructor() {

}

allReviews(){
  this.showAllReviews = !this.showAllReviews;
}
}
