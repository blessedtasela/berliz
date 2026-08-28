import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientsComponent } from './clients/clients.component';
import { AddClientModalComponent } from './add-client-modal/add-client-modal.component';
import { UpdateClientModalComponent } from './update-client-modal/update-client-modal.component';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ClientsHeaderComponent } from './clients-header/clients-header.component';
import { ClientsDetailsModalComponent } from './clients-details-modal/clients-details-modal.component';
import { ClientDetailPageComponent } from './client-detail-page/client-detail-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { UserHoverCardComponent } from 'src/app/shared/user-hover-card/user-hover-card.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';



@NgModule({
  declarations: [
    ClientsComponent,
    AddClientModalComponent,
    UpdateClientModalComponent,
    ClientsListComponent,
    ClientsHeaderComponent,
    ClientsDetailsModalComponent,
    ClientDetailPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FeatherModule,
    IconsModule,
    ReactiveFormsModule,
    NavbarModule,
    FooterModule,
    UserHoverCardComponent,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: ClientsComponent },
      { path: ':id', component: ClientDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Client Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class ClientsModule { }
