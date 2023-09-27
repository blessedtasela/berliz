import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminModule } from './admin/admin.module';
import { CenterModule } from './center/center.module';
import { ClientModule } from './client/client.module';
import { DriverModule } from './driver/driver.module';
import { PartnerModule } from './partner/partner.module';
import { StoreModule } from './store/store.module';
import { TrainerModule } from './trainer/trainer.module';
import { UserModule } from './user/user.module';
import { IconsModule } from '../icons/icons.module';
import { FeatherModule } from 'angular-feather';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardDetailsComponent } from './dashboard-details/dashboard-details.component';
import { RouterModule } from '@angular/router';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';



@NgModule({
  declarations: [
    DashboardComponent,
    DashboardDetailsComponent
  ],
  imports: [
    CommonModule,
    AdminModule,
    CenterModule,
    ClientModule,
    DriverModule,
    StoreModule,
    PartnerModule,
    TrainerModule,
    UserModule,
    IconsModule,
    FeatherModule,
    RouterModule,
    NavbarModule,
    FooterModule
  ]
})
export class DashboardModule { }
