import { Component, Input } from '@angular/core';
import { CenterReview } from 'src/app/models/centers.interface';

@Component({
  selector: 'app-center-review',
  templateUrl: './center-review.component.html',
  styleUrls: ['./center-review.component.css']
})
export class CenterReviewComponent {
  @Input() centerReviews: CenterReview | undefined;
  showAllReviews: boolean = false;

  constructor() {

  }
  
  // format the trainer's name for the URL
  formatCenterName(name: string): string {
    return name.replace(/\s+/g, '-').toLowerCase();
  }

  allReviews(){
    this.showAllReviews = !this.showAllReviews;
  }
}
