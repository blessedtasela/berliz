import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Partner } from 'src/app/models/partners.interface';
import { loadPartners, loadPartnersFailure, loadPartnersSuccess } from 'src/app/state/partner/partner.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectPartners } from 'src/app/state/partner/partner.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-partners',
    templateUrl: './partners.component.html',
    styleUrls: ['./partners.component.css'],
    standalone: false
})
export class PartnersComponent {
  partnersData: Partner[] = [];
  totalPartners: number = 0;
  partnersLength: number = 0;
  searchComponent: string = 'partner'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectPartners = selectPartners;
  readonly partnerSearchFields: AdminSearchField<Partner>[] = [
    { value: 'name', label: 'Name', accessor: p => `${p.firstname || ''} ${p.lastname || ''}` },
    { value: 'email', label: 'Email', accessor: p => p.email },
    { value: 'id', label: 'Partner id', accessor: p => p.id?.toString() },
    { value: 'role', label: 'Role', accessor: p => p.role },
    { value: 'status', label: 'Status', accessor: p => p.status },
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
    this.subscriptions.push(watchLoadError(this.actions$, loadPartnersFailure, [loadPartners, loadPartnersSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadPartners());
    this.subscriptions.push(
      this.store.select(selectPartners).subscribe((allPartners) => {
        this.partnersData = allPartners;
        this.totalPartners = allPartners.length
        this.partnersLength = allPartners.length
      })
    );
  }

  handleSearchResults(results: Partner[]): void {
    this.partnersData = results;
    this.totalPartners = results.length;
  }


  retryLoad(): void {
    this.store.dispatch(loadPartners());
  }
}
