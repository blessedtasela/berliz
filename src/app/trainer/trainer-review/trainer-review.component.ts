import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerReview } from 'src/app/models/trainers.interface';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { StateService } from 'src/app/services/state.service';
import { MediaOwnerType } from 'src/app/models/Media.enum';

@Component({
  selector: 'app-trainer-review',
  templateUrl: './trainer-review.component.html',
  styleUrls: ['./trainer-review.component.css']
})
export class TrainerReviewComponent {

  trainerReviews: TrainerReview[] = [];
  showAllReviews: boolean = false;

  constructor(
    private stateService: StateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private newsletterStateService: NewsletterStateService,
  ) {

    this.trainerReviews = [
      {
        id: 1,
        trainerId: 101,
        trainerName: 'John Trainer',
        clientId: 201,
        clientName: 'Mike Client',

        photoFrontBefore: {
          id: 1,
          photoUrl: 'assets/trainers/t3.jpg',
          strapiId: 1,
          name: 'before-front',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 1,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoFrontAfter: {
          id: 2,
          photoUrl: 'assets/trainers/t18.jpg',
          strapiId: 2,
          name: 'after-front',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 1,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoSideBefore: {
          id: 3,
          photoUrl: 'assets/trainers/t18.jpg',
          strapiId: 3,
          name: 'side-before',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 1,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoSideAfter: {
          id: 4,
          photoUrl: 'assets/trainers/t3.jpg',
          strapiId: 4,
          name: 'side-after',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 1,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoBackBefore: {
          id: 5,
          photoUrl: 'assets/trainers/t18.jpg',
          strapiId: 5,
          name: 'back-before',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 1,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoBackAfter: {
          id: 6,
          photoUrl: 'assets/trainers/t3.jpg',
          strapiId: 6,
          name: 'back-after',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 1,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },

        review: 'Delighted in his work',
        likes: 0,
        date: new Date(),
        lastUpdate: new Date(),
        status: 'active'
      },
      {
        id: 2,
        trainerId: 102,
        trainerName: 'Sarah Coach',
        clientId: 202,
        clientName: 'Anna Client',

        photoFrontBefore: {
          id: 7,
          photoUrl: 'assets/trainers/t18.jpg',
          strapiId: 7,
          name: 'before-front',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 2,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoFrontAfter: {
          id: 8,
          photoUrl: 'assets/trainers/t3.jpg',
          strapiId: 8,
          name: 'after-front',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 2,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoSideBefore: {
          id: 9,
          photoUrl: 'assets/trainers/t18.jpg',
          strapiId: 9,
          name: 'side-before',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 2,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoSideAfter: {
          id: 10,
          photoUrl: 'assets/trainers/t3.jpg',
          strapiId: 10,
          name: 'side-after',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 2,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoBackBefore: {
          id: 11,
          photoUrl: 'assets/trainers/t3.jpg',
          strapiId: 11,
          name: 'back-before',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 2,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },
        photoBackAfter: {
          id: 12,
          photoUrl: 'assets/trainers/t18.jpg',
          strapiId: 12,
          name: 'back-after',
          byteSize: 12345,
          mimeType: 'image/jpeg',
          ownerId: 2,
          mediaOwnerType: MediaOwnerType.TRAINER_REVIEW
        },

        review: 'What an awesome coach',
        likes: 0,
        date: new Date(),
        lastUpdate: new Date(),
        status: 'pending'
      }
    ];
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  handleEmitEvent() {}

  allReviews() {
    this.showAllReviews = !this.showAllReviews;
  }
}