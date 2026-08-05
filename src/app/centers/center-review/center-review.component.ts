import { Component, Input } from '@angular/core';
import { CenterReviews } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-review',
  templateUrl: './center-review.component.html',
  styleUrls: ['./center-review.component.css']
})
export class CenterReviewComponent {
  @Input() centerReviews: CenterReviews[] = [];
  showAllReviews: boolean = false;

  allReviews() {
    this.showAllReviews = !this.showAllReviews;
  }
}
