import { Component } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Categories } from 'src/app/models/categories.interface';
import { Clients } from 'src/app/models/clients.interface';
import { ClientStateService } from 'src/app/services/client-state.service';

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

  constructor(private ngxService: NgxUiLoaderService,
    public clientStateService: ClientStateService) {
  }

  ngOnInit(): void {
    this.clientStateService.allClientsData$.subscribe((cachedData) => {
      if (cachedData === null) {
        this.handleEmitEvent()
      } else {
        this.clientsData = cachedData;
        this.totalClients = cachedData.length
        this.clientsLength = cachedData.length
      }
    });
  }

  handleEmitEvent() {
    this.clientStateService.getAllClients().subscribe((clients) => {
      this.ngxService.start()
      console.log('isCachedData false')
      this.clientsData = clients;
      this.totalClients = clients.length
      this.clientsLength = clients.length
      this.clientStateService.setAllClientsSubject(this.clientsData);
      this.ngxService.stop()
    });
  }

  handleSearchResults(results: Clients[]): void {
    this.clientsData = results;
    this.totalClients = results.length;
  }

}
