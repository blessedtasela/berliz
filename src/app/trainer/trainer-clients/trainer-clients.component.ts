import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TrainerClients, TrainerReview } from 'src/app/models/trainers.interface';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-trainer-clients',
  templateUrl: './trainer-clients.component.html',
  styleUrls: ['./trainer-clients.component.css']
})
export class TrainerClientsComponent {
 trainerClients: TrainerClients[] = [];
  showAllReviews: boolean = false;

  constructor(private stateService: StateService,
    private dialog: MatDialog,
    private ngxService: NgxUiLoaderService,
    private newsletterStateService: NewsletterStateService,) {
    this.trainerClients = [{
      id: 1,
      // trainer: ,
      // client: [{}],
    },
    {
      id: 1,
      // trainer: ,
      // client: [{}],
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

