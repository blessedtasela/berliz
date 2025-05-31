import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerSubscription } from 'src/app/models/trainers.interface';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-trainer-subscriptions',
  templateUrl: './trainer-subscriptions.component.html',
  styleUrls: ['./trainer-subscriptions.component.css']
})
export class TrainerSubscriptionsComponent {
trainerSubscriptions: TrainerSubscription[] = [];
  showAllReviews: boolean = false;

  constructor(private stateService: StateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private newsletterStateService: NewsletterStateService,) {
    this.trainerSubscriptions = [{
      id: 1,
     // trainer: ,
      // client: ,
      // categories: []
      plan: "3 Months",
      mode: "Online",
      date: new Date(),
      lastUpdate: new Date(),
    },
    {
      id: 1,
      // trainer: ,
      // client: ,
      // categories: []
      plan: "6 Months",
      mode: "Hybrid",
      date: new Date(),
      lastUpdate: new Date(),
    },
    ];
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


