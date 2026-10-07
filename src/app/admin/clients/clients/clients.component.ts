import { Actions } from '@ngrx/effects';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Clients } from 'src/app/models/clients.interface';
import { loadClients, loadClientsFailure, loadClientsSuccess } from 'src/app/state/client/client.actions';
import { watchLoadError } from 'src/app/shared/load-error/load-error-tracker';
import { selectClients } from 'src/app/state/client/client.selectors';
import { AdminSearchField } from 'src/app/shared/admin-search/admin-search-field.interface';

@Component({
    selector: 'app-clients',
    templateUrl: './clients.component.html',
    styleUrls: ['./clients.component.css'],
    standalone: false
})
export class ClientsComponent {
  clientsData: Clients[] = [];
  totalClients: number = 0;
  clientsLength: number = 0;
  searchComponent: string = 'client'
  isSearch: boolean = true;
  subscriptions: Subscription[] = [];
  /** Why the list couldn't be loaded -- so a failed load never reads as an empty table. */
  loadError: string | null = null;

  readonly selectClients = selectClients;
  readonly clientSearchFields: AdminSearchField<Clients>[] = [
    { value: 'email', label: 'Email', accessor: c => c.user?.email },
    { value: 'mode', label: 'Mode', accessor: c => c.mode },
    { value: 'id', label: 'Client id', accessor: c => c.id?.toString() },
    { value: 'category', label: 'Category', accessor: c => c.subscriptions?.[0]?.categories?.[0]?.name },
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
    this.subscriptions.push(watchLoadError(this.actions$, loadClientsFailure, [loadClients, loadClientsSuccess], null, m => this.loadError = m));
    this.store.dispatch(loadClients());
    this.subscriptions.push(
      this.store.select(selectClients).subscribe((clients) => {
        this.clientsData = clients;
        this.totalClients = clients.length
        this.clientsLength = clients.length
      })
    );
  }

  handleSearchResults(results: Clients[]): void {
    this.clientsData = results;
    this.totalClients = results.length;
  }


  retryLoad(): void {
    this.store.dispatch(loadClients());
  }
}
