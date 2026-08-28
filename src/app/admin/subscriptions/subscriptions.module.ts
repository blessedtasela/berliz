import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AddSubscriptionsModalComponent } from './add-subscriptions-modal/add-subscriptions-modal.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { SubscriptionsListComponent } from './subscriptions-list/subscriptions-list.component';
import { UpdateSubscriptionsModalComponent } from './update-subscriptions-modal/update-subscriptions-modal.component';
import { SubscriptionDetailsModalComponent } from './subscription-details-modal/subscription-details-modal.component';
import { SubscriptionDetailPageComponent } from './subscription-detail-page/subscription-detail-page.component';
import { SubscriptionsHeaderComponent } from './subscriptions-header/subscriptions-header.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { UserHoverCardComponent } from 'src/app/shared/user-hover-card/user-hover-card.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';



@NgModule({
  declarations: [
    AddSubscriptionsModalComponent,
    SubscriptionsComponent,
    SubscriptionsListComponent,
    UpdateSubscriptionsModalComponent,
    SubscriptionDetailsModalComponent,
    SubscriptionDetailPageComponent,
    SubscriptionsHeaderComponent
  ],
  imports: [
    CommonModule,
    FooterModule,
    NavbarModule,
    ReactiveFormsModule,
    FormsModule,
    IconsModule,
    UserHoverCardComponent,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: SubscriptionsComponent },
      { path: ':id', component: SubscriptionDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Subscription Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class SubscriptionsModule { }
