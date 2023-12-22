import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientsComponent } from './clients/clients.component';
import { AddClientModalComponent } from './add-client-modal/add-client-modal.component';
import { UpdateClientModalComponent } from './update-client-modal/update-client-modal.component';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientsHeaderComponent } from './clients-header/clients-header.component';
import { ClientsDetailsModalComponent } from './clients-details-modal/clients-details-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FooterModule } from 'src/app/footer/footer.module';



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
    CommonModule,
    FormsModule,
    FeatherModule,
    IconsModule,
    ReactiveFormsModule,
    NavbarModule,
    FooterModule
  ]
})
export class ClientsModule { }
