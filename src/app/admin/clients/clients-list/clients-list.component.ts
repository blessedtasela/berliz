import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ClientService } from 'src/app/services/client.service';
import { Store } from '@ngrx/store';
import { loadClients } from 'src/app/state/client/client.actions';
import { selectClients } from 'src/app/state/client/client.selectors';
import { RxStompService } from 'src/app/services/rx-stomp.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { PromptModalComponent } from 'src/app/shared/prompt-modal/prompt-modal.component';
import { genericError } from 'src/validators/form-validators.module';
import { Clients } from 'src/app/models/clients.interface';
import { UpdateClientModalComponent } from '../update-client-modal/update-client-modal.component';
import { ClientsDetailsModalComponent } from '../clients-details-modal/clients-details-modal.component';
import { Subscription, take } from 'rxjs';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.css']
})
export class ClientsListComponent implements OnDestroy {
  responseMessage: any;
  showFullData: boolean = false;
  @Input() clientsData: Clients[] = [];
  @Input() totalClients: number = 0;

  // Both watchers below already use take(1), so they self-unsubscribe after
  // their first message -- but tracking them here still lets ngOnDestroy
  // clean up an in-flight one if the page is left before any message arrives.
  private subscriptions: Subscription[] = [];

  constructor(private datePipe: DatePipe,
    private clientService: ClientService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
    private dialog: MatDialog,
    private rxStompService: RxStompService,
    private store: Store,
    private router: Router) {
  }

  ngOnInit() {
    this.watchUpdateClient()
    this.watchUpdateStatus()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleEmitEvent() {
    this.store.dispatch(loadClients());
    this.store.select(selectClients).subscribe((clients) => {
      this.clientsData = clients;
      this.totalClients = this.clientsData.length
    });
  }

  openUpdateClient(id: number) {
    try {
      const client = this.clientsData.find(client => client.id === id);
      if (client) {
        const dialogRef = this.dialog.open(UpdateClientModalComponent, {
          width: '720px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          disableClose: true,
          data: {
            clientData: client,
          }
        });
        const childComponentInstance = dialogRef.componentInstance as UpdateClientModalComponent;
        childComponentInstance.onUpdateClientEmit.subscribe(() => {
          this.handleEmitEvent()
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without adding a client');
            }
          });
        });
      } else {
        this.snackbarService.openSnackBar('client not found for id: ' + id, 'error');
      }
    } catch (error) {
      this.snackbarService.openSnackBar("An error occurred. Check client status", 'error');
    }
  }

  openClientDetailsModal(id: number) {
    this.router.navigate(['/dashboard/clients', id]);
  }

  updateClientStatus(id: number) {
    const dialogConfig = new MatDialogConfig();
    const client = this.clientsData.find(client => client.id === id);
    const message = client?.status === 'false'
      ? 'activate this client?'
      : 'deactivate this client?';

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.clientService.updateStatus(id)
        .subscribe((response: any) => {
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          this.ngxService.stop();
          dialogRef.close('client status updated successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without updating client status');
            }
          })
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    });
  }

  deleteClient(id: number) {
    const dialogConfig = new MatDialogConfig();
    const message = "delete this client? This is irreversible.";

    dialogConfig.data = {
      message: message,
      confirmation: true,
      disableClose: true,
    };
    const dialogRef = this.dialog.open(PromptModalComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe((res: any) => {
      this.ngxService.start();
      this.clientService.deleteClient(id)
        .subscribe((response: any) => {
          this.ngxService.stop();
          this.responseMessage = response.message;
          this.snackbarService.openSnackBar(this.responseMessage, '');
          this.handleEmitEvent()
          dialogRef.close('client deleted successfully')
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              console.log(`Dialog result: ${result}`);
            } else {
              console.log('Dialog closed without deleting client');
            }
          })
        }, (error) => {
          this.ngxService.stop();
          this.snackbarService.openSnackBar(error, 'error');
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, 'error');
        });
    })
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  watchUpdateClient() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updateClient').pipe(take(1)).subscribe((message) => {
        const receivedClients: Clients = JSON.parse(message.body);
        const ClientId = this.clientsData.findIndex(client => client.id === receivedClients.id)
        this.clientsData[ClientId] = receivedClients
      })
    );
  }

  watchUpdateStatus() {
    this.subscriptions.push(
      this.rxStompService.watch('/topic/updateClientStatus').pipe(take(1)).subscribe((message) => {
        const receivedClients: Clients = JSON.parse(message.body);
        const ClientId = this.clientsData.findIndex(client => client.id === receivedClients.id)
        this.clientsData[ClientId] = receivedClients
      })
    );
  }

}

