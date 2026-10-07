import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Subscriptions } from 'src/app/models/subscriptions.interface';
import { loadSubscriptions, loadSubscriptionsFailure, loadSubscriptionsSuccess } from 'src/app/state/subscription/subscription.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectSubscriptions } from 'src/app/state/subscription/subscription.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-subscriptions',
    templateUrl: './subscriptions.component.html',
    styleUrls: ['./subscriptions.component.css'],
    standalone: false
})
export class SubscriptionsComponent {
  subscriptionsData: Subscriptions[] = [];
  totalSubscriptions: number = 0;
  subscriptionsLength: number = 0;
  searchComponent: string = 'category'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

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

  constructor(private store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.handleEmitEvent();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEmitEvent() {
    this.subscriptions.push(watchLoadError(this.actions$, loadSubscriptionsFailure, [loadSubscriptions, loadSubscriptionsSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadSubscriptions());
    this.subscriptions.push(
      this.store.select(selectSubscriptions).subscribe((allSubscriptions) => {
        this.subscriptionsData = allSubscriptions;
        this.totalSubscriptions = allSubscriptions.length
        this.subscriptionsLength = allSubscriptions.length
      })
    );
  }

  handleSearchResults(results: Subscriptions[]): void {
    this.subscriptionsData = results;
    this.totalSubscriptions = results.length;
  }


  retryLoad(): void {
    this.store.dispatch(loadSubscriptions());
  }
}
