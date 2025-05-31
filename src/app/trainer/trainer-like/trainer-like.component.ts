import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerSubscription } from 'src/app/models/trainers.interface';
import { TrainerLike } from 'src/app/models/users.interface';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { StateService } from 'src/app/services/state.service';
import { TrainerStateService } from 'src/app/services/trainer-state.service';
import { UserStateService } from 'src/app/services/user-state.service';

@Component({
  selector: 'app-trainer-like',
  templateUrl: './trainer-like.component.html',
  styleUrls: ['./trainer-like.component.css']
})
export class TrainerLikeComponent {
  trainerLikes: TrainerLike[] = [];
  showAllReviews: boolean = false;

  constructor(private userStateService: UserStateService,
    private trainerStateService: TrainerStateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private newsletterStateService: NewsletterStateService,) {
    userStateService.getUser().subscribe(user => {
      trainerStateService.getTrainer().subscribe(trainer => {
        this.trainerLikes = [
          {
            id: 1,
            user: user, // Actual user object
            trainer: trainer, // Actual trainer object
            date: new Date(),
          },
          {
            id: 2,
            user: user, // Actual user object
            trainer: trainer, // Actual trainer object
            date: new Date(),
          },
        ];
      });
    });
  }

  ngOnInit(): void {
    this.handleEmitEvent()
  }

  handleEmitEvent() {
    this.newsletterStateService.getAllNewsletters().subscribe((newsletter) => {
      this.ngxService.start()
      this.newsletterStateService.setAllNewsletterSubject(newsletter);
      this.ngxService.stop()
    });
  }

  allReviews() {
    this.showAllReviews = !this.showAllReviews;
  }
}



