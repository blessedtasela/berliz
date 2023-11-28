import { Component, HostListener, OnInit } from '@angular/core';
import { Promotions } from '../../models/promotion.model';
import { Offers } from '../../models/offers.model';
import { StateService } from 'src/app/services/state.service';
import { MatDialog } from '@angular/material/dialog';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AddNewsletterModalComponent } from 'src/app/admin/newsletters/add-newsletter-modal/add-newsletter-modal.component';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})

export class LandingPageComponent implements OnInit {
  promotions: Promotions[] = [];
  offers: Offers[] = [];

  constructor(private stateService: StateService,
    private dialog: MatDialog, private ngxService: NgxUiLoaderService,
    private newsletterStateService: NewsletterStateService,) {
    this.promotions = this.stateService.promotions;
    this.offers = this.stateService.offers;
  }

  ngOnInit(): void {
    const showNewsletter = this.stateService.getShowNewsletter();
    if (!showNewsletter) {
      setTimeout(() => {
        this.openAddNewsletter();
        this.stateService.setShowNewsletter(true);
      }, 5000);
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
  }

  handleEmitEvent() {
    this.newsletterStateService.getAllNewsletters().subscribe((newsletter) => {
      this.ngxService.start()
      this.newsletterStateService.setAllNewsletterSubject(newsletter);
      this.ngxService.stop()
    });
  }

  openAddNewsletter() {
    const dialogRef = this.dialog.open(AddNewsletterModalComponent, {
      width: '600px',
      height: '600px',
    });
    const childComponentInstance = dialogRef.componentInstance as AddNewsletterModalComponent;
    childComponentInstance.onAddNewsletter.subscribe(() => {
      this.handleEmitEvent();
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a newsletter');
      }
    });
  }
}
