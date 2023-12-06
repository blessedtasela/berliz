import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsComponent } from './clients/clients.component';
import { AddClientModalComponent } from './add-client-modal/add-client-modal.component';
import { UpdateClientModalComponent } from './update-client-modal/update-client-modal.component';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientsHeaderComponent } from './clients-header/clients-header.component';
import { ClientsDetailsModalComponent } from './clients-details-modal/clients-details-modal.component';



@NgModule({
  declarations: [
    ClientsComponent,
    AddClientModalComponent,
    UpdateClientModalComponent,
    ClientsListComponent,
    ClientsHeaderComponent,
    ClientsDetailsModalComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ClientsModule { }
