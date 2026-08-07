import { Component, HostListener, OnInit } from '@angular/core';
import { Promotions } from '../../models/promotion.model';
import { Offers } from '../../models/offers.model';
import { StateService } from 'src/app/services/state.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})

export class LandingPageComponent implements OnInit {
  promotions: Promotions[] = [];
  offers: Offers[] = [];

  constructor(private stateService: StateService) {
    this.promotions = this.stateService.promotions;
    this.offers = this.stateService.offers;
  }

  ngOnInit(): void {
    // The newsletter popup is no longer triggered from here. Triggering is
    // global and lives in AppComponent + NewsletterTriggerService, so it can
    // fire on any public page and repeat based on time + activity.
  }

  @HostListener('window:scroll', [])
  onWindowScroll() { }

}
