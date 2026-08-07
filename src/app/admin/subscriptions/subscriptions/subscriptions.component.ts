import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { loadSubscriptions } from 'src/app/state/subscription/subscription.actions';
import { selectSubscriptions } from 'src/app/state/subscription/subscription.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

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

  readonly selectSubscriptions = selectSubscriptions;
  readonly subscriptionSearchFields: AdminSearchField<Subscriptions>[] = [
    { value: 'user', label: 'User email', accessor: s => s.user?.email },
    { value: 'trainer', label: 'Trainer', accessor: s => s.trainer?.name },
    { value: 'center', label: 'Center', accessor: s => s.center?.name },
    { value: 'plan', label: 'Plan', accessor: s => s.plan },
    { value: 'mode', label: 'Mode', accessor: s => s.mode },
    { value: 'status', label: 'Status', accessor: s => s.status },
    { value: 'id', label: 'Subscription id', accessor: s => s.id?.toString() },
  ];

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
