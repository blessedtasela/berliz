import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { SubscriptionStateService } from 'src/app/services/subscription-state.service';

@Component({
  selector: 'app-subscriptions',
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css']
})
export class SubscriptionsComponent {
  subscriptionsData: Subscriptions[] = [];
  totalSubscriptions: number = 0;
  subscriptionsLength: number = 0;
  searchComponent: string = 'category'
  isSearch: boolean = true;

  constructor(private ngxService: NgxUiLoaderService,
    public subscriptionStateService: SubscriptionStateService) {
  }

  ngOnInit(): void {
    this.subscriptionStateService.allSubscriptionsData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent()
      } else {
        this.subscriptionsData = cachedData;
        this.totalSubscriptions = cachedData.length
        this.subscriptionsLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.subscriptionStateService.getAllSubscriptions().subscribe((allSubscriptions) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.subscriptionsData = allSubscriptions;
      this.totalSubscriptions = allSubscriptions.length
      this.subscriptionsLength = allSubscriptions.length
      this.subscriptionStateService.setAllSubscriptionsSubject(this.subscriptionsData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Subscriptions[]): void {
    this.subscriptionsData = results;
    this.totalSubscriptions = results.length;
  }

}
