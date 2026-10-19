import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconsModule } from 'src/app/icons/icons.module';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';

import { BillingComponent } from './billing/billing.component';
import { BillingOverviewComponent } from './billing-overview/billing-overview.component';
import { PayoutsListComponent } from './payouts-list/payouts-list.component';
import { ConnectAccountsListComponent } from './connect-accounts-list/connect-accounts-list.component';

@NgModule({
  declarations: [
    BillingComponent,
    BillingOverviewComponent,
    PayoutsListComponent,
    ConnectAccountsListComponent,
  ],
  imports: [
    CommonModule,
    IconsModule,
    LoadErrorComponent,
    RouterModule.forChild([
      { path: '', component: BillingComponent },
    ])
  ]
})
export class BillingModule { }
