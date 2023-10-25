import { Component, HostListener, OnInit } from '@angular/core';
import { Promotions } from '../../models/promotion.model';
import { Offers } from '../../models/offers.model';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';
import { AddNewsletterComponent } from 'src/app/dashboard/admin/newsletters/add-newsletter/add-newsletter.component';
import { StateService } from 'src/app/services/state.service';
import { MatDialog } from '@angular/material/dialog';
import { NewsletterStateService } from 'src/app/services/newsletter-state.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

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
    const dialogRef = this.dialog.open(AddNewsletterComponent, {
      width: '600px',
      height: '400px',
    });
    const childComponentInstance = dialogRef.componentInstance as AddNewsletterComponent;
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
