import { Component, Input } from '@angular/core';
import { Clients } from 'src/app/models/clients.interface';
import { AddClientModalComponent } from '../add-client-modal/add-client-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { take } from 'rxjs';
import { Store } from '@ngrx/store';
import { loadClients } from 'src/app/state/client/client.actions';
import { selectClients } from 'src/app/state/client/client.selectors';

@Component({
  selector: 'app-clients-header',
  templateUrl: './clients-header.component.html',
  styleUrls: ['./clients-header.component.css']
})
export class ClientsHeaderComponent {
  responseMessage: any;
  showFullData: boolean = false;
  selectedSortOption: string = 'date';
  @Input() clientsData: Clients[] = [];
  @Input() totalClients: number = 0;
  @Input() clientsLength: number = 0;

  constructor(private dialog: MatDialog,
    private store: Store,
    private rxStompService: RxStompService) {
  }

  ngOnInit() {
    this.watchDeleteClient()
    this.watchGetClientFromMap()
  }

  handleEmitEvent() {
    this.store.dispatch(loadClients());
    this.store.select(selectClients).subscribe((clients) => {
      this.clientsData = clients;
      this.totalClients = this.clientsData.length
      this.clientsLength = this.clientsData.length
    });
  }

  sortClientssData() {
    switch (this.selectedSortOption) {
      case 'date':
        this.clientsData.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'mode':
        this.clientsData.sort((a, b) => {
          return a.mode.localeCompare(b.mode);
        });
        break;
        case 'email':
          this.clientsData.sort((a, b) => {
            return a.user.email.localeCompare(b.user.email);
          });
          break;
      case 'id':
        this.clientsData.sort((a, b) => {
          return a.id - b.id;
        });
        break;
      case 'category':
        this.clientsData.sort((a, b) => {
          const nameA = (a.subscriptions[0]?.categories[0]?.name || '').toLowerCase();
          const nameB = (b.subscriptions[0]?.categories[0]?.name || '').toLowerCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        break;
      case 'lastUpdate':
        this.clientsData.sort((a, b) => {
          const dateA = new Date(a.lastUpdate);
          const dateB = new Date(b.lastUpdate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      default:
        break;
    }
  }

  onSortOptionChange(event: any) {
    this.selectedSortOption = event.target.value;
    this.sortClientssData();
  }

  toggleData() {
    this.showFullData = !this.showFullData;
  }

  openAddClient() {
    const dialogRef = this.dialog.open(AddClientModalComponent, {
      width: '720px',
      maxWidth: '95vw',
      panelClass: 'mat-dialog-height',
      disableClose: true,
    });
    const childComponentInstance = dialogRef.componentInstance as AddClientModalComponent;
    childComponentInstance.onAddClientEmit.subscribe(() => {
      this.handleEmitEvent()
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(`Dialog result: ${result}`);
      } else {
        console.log('Dialog closed without adding a category');
      }
    });
  }

  watchDeleteClient() {
    this.rxStompService.watch('/topic/deleteClient').pipe(take(1)).subscribe((message) => {
      const receivedClients: Clients = JSON.parse(message.body);
      this.clientsData = this.clientsData.filter(category => category.id !== receivedClients.id);
      this.clientsLength = this.clientsData.length;
      this.totalClients = this.clientsData.length
    });
  }

  watchGetClientFromMap() {
    this.rxStompService.watch('/topic/getClientFromMap').pipe(take(1)).subscribe((message) => {
      const receivedClients: Clients = JSON.parse(message.body);
      this.clientsData.push(receivedClients);
      this.clientsLength = this.clientsData.length;
      this.totalClients = this.clientsData.length
    });
  }
}
