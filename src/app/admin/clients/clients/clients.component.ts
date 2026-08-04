import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Clients } from 'src/app/models/clients.interface';
import { loadClients } from 'src/app/state/client/client.actions';
import { selectClients } from 'src/app/state/client/client.selectors';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent {
  clientsData: Clients[] = [];
  totalClients: number = 0;
  clientsLength: number = 0;
  searchComponent: string = 'client'
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
    this.store.dispatch(loadClients());
    this.subscriptions.push(
      this.store.select(selectClients).subscribe((clients) => {
        this.clientsData = clients;
        this.totalClients = clients.length
        this.clientsLength = clients.length
        this.ngxService.stop()
      })
    );
  }

  handleSearchResults(results: Clients[]): void {
    this.clientsData = results;
    this.totalClients = results.length;
  }

}
