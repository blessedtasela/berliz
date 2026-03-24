import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerReview } from 'src/app/models/trainers.interface';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { StateService } from 'src/app/services/state.service';
import { Clients } from "src/app/models/clients.interface";

@Component({
  selector: 'app-trainer-review',
  templateUrl: './trainer-review.component.html',
  styleUrls: ['./trainer-review.component.css']
})
export class TrainerReviewComponent {
  trainerReviews: TrainerReview[] = [];
  showAllReviews: boolean = false;

  constructor(private stateService: StateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private newsletterStateService: NewsletterStateService,) {
    this.trainerReviews = [{
      id: 1,
      frontBefore: 'assets/trainers/t3.jpg',
      frontAfter: 'assets/trainers/t18.jpg',
      sideBefore: 'assets/trainers/t18.jpg',
      sideAfter: 'assets/trainers/t3.jpg',
      backBefore: 'assets/trainers/t18.jpg',
      backAfter: 'assets/trainers/t3.jpg',
      review: 'Delighted in his work',
      likes: 0,
      date: new Date,
      lastUpdate: new Date(),
      status: 'active'
    },
    {
      id: 2,
      frontBefore: 'assets/trainers/t18.jpg',
      frontAfter: 'assets/trainers/t3.jpg',
      sideBefore: 'assets/trainers/t18.jpg',
      sideAfter: 'assets/trainers/t3.jpg',
      backBefore: 'assets/trainers/t3.jpg',
      backAfter: 'assets/trainers/t18.jpg',
      review: 'What a awesome coach',
      likes: 0,
      date: new Date,
      lastUpdate: new Date(),
      status: 'pending'
    },
    ];
  }

  ngOnInit(): void {
    this.handleEmitEvent()
  }

  handleEmitEvent() {
  
  }

  allReviews() {
    this.showAllReviews = !this.showAllReviews;
  }
}
