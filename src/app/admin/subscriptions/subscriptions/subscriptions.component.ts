import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { loadSubscriptions } from 'src/app/state/subscription/subscription.actions';
import { selectSubscriptions } from 'src/app/state/subscription/subscription.selectors';

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
  subscriptions: Subscription[] = [];

  constructor(private ngxService: NgxUiLoaderService,
    private store: Store) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.ngxService.start()
    this.store.dispatch(loadSubscriptions());
    this.subscriptions.push(
      this.store.select(selectSubscriptions).subscribe((allSubscriptions) => {
        this.subscriptionsData = allSubscriptions;
        this.totalSubscriptions = allSubscriptions.length
        this.subscriptionsLength = allSubscriptions.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Subscriptions[]): void {
    this.subscriptionsData = results;
    this.totalSubscriptions = results.length;
  }

}
