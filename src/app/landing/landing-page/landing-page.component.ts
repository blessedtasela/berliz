import { Component, HostListener, OnInit } from '@angular/core';
import { Promotions } from '../../models/promotion.model';
import { BERLIZ_SERVICES } from 'src/app/berliz-services/berliz-services';
import { Offers } from '../../models/offers.model';
import { StateService } from 'src/app/services/state.service';

@Component({
    selector: 'app-landing-page',
    templateUrl: './landing-page.component.html',
    styleUrls: ['./landing-page.component.css'],
    standalone: false
})

export class LandingPageComponent implements OnInit {
  promotions: Promotions[] = [];
  offers: Offers[] = BERLIZ_SERVICES.filter(s => !s.comingSoon).map((s, i) => ({
    id: i + 1, title: s.title, description: s.tagline, subTitle: '', iconUrl: s.icon, slug: s.slug,
  }));

  constructor(private stateService: StateService) {
    this.promotions = this.stateService.promotions;
    // offers: the real services (see berliz-services.ts), not an empty state-service list.
  }

  ngOnInit(): void {
    // The newsletter popup is no longer triggered from here. Triggering is
    // global and lives in AppComponent + NewsletterTriggerService, so it can
    // fire on any public page and repeat based on time + activity.
  }

  @HostListener('window:scroll', [])
  onWindowScroll() { }

}
