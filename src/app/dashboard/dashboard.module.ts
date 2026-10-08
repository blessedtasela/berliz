import { ProviderTermsComponent } from '../shared/provider-profile/provider-terms.component';
import { ProviderPackagesComponent } from '../shared/provider-profile/provider-packages.component';
import { ProviderAvailabilityComponent } from '../shared/provider-profile/provider-availability.component';
import { HowItWorksComponent } from '../shared/provider-profile/how-it-works.component';
import { ProviderFilterBarComponent } from '../shared/provider-profile/provider-filter-bar.component';
import { ProviderCardMetaComponent } from '../shared/provider-profile/provider-card-meta.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModule } from './user/user.module';
import { IconsModule } from '../icons/icons.module';
import { FeatherModule } from 'angular-feather';
import { RouterModule } from '@angular/router';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';
import { DashboardTodoListComponent } from './dashboard-todo-list/dashboard-todo-list.component';
import { DashboardLoginChartComponent } from './dashboard-login-chart/dashboard-login-chart.component';
import { DashboardNotificationComponent } from './dashboard-notification/dashboard-notification.component';
import { LoadErrorComponent } from 'src/app/shared/load-error/load-error.component';
import { DashboardActionComponent } from './dashboard-action/dashboard-action.component';
import { DashboardAppAnalyticsComponent } from './dashboard-app-analytics/dashboard-app-analytics.component';
import { TodoListsModule } from './todo-lists/todo-lists.module';
import { DashboardTopUsersComponent } from './dashboard-top-users/dashboard-top-users.component';
import { DashboardNowActiveComponent } from './dashboard-now-active/dashboard-now-active.component';
import { DashboardActivityChartComponent } from './dashboard-activity-chart/dashboard-activity-chart.component';
import { TodaysTodoModalComponent } from './todays-todo-modal/todays-todo-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LocationsMenuComponent } from '../shared/locations-menu/locations-menu.component';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { DashboardRouteComponent } from './dashboard-route/dashboard-route.component';
import { DashboardSubscriptionAnalyticsComponent } from './dashboard-subscription-analytics/dashboard-subscription-analytics.component';
import { DashboardExercisesComponent } from './exercises/dashboard-exercises.component';
import { DashboardTrendingExercisesComponent } from './dashboard-trending-exercises/dashboard-trending-exercises.component';
import { DashboardSuggestedComponent } from './dashboard-suggested/dashboard-suggested.component';
import { UserHoverCardComponent } from '../shared/user-hover-card/user-hover-card.component';
import { ProfileSettingsToggleComponent } from './profile-settings-toggle/profile-settings-toggle.component';
import { FindProvidersComponent } from './find-providers/find-providers.component';
import { DashboardTrainerDetailComponent } from './dashboard-trainer-detail/dashboard-trainer-detail.component';
import { DashboardCenterDetailComponent } from './dashboard-center-detail/dashboard-center-detail.component';
import { PromoBadgeListComponent } from '../promotions/promo-badge-list/promo-badge-list.component';
import { DashboardMembersComponent } from './dashboard-members/dashboard-members.component';
import { DashboardCategoryDetailComponent } from './dashboard-category-detail/dashboard-category-detail.component';
import { DashboardQuickLinksComponent } from './dashboard-quick-links/dashboard-quick-links.component';
import { DashboardTimelinePreviewComponent } from './dashboard-timeline-preview/dashboard-timeline-preview.component';
import { ConsistencyRingComponent } from '../shared/consistency-ring/consistency-ring.component';
import { AccountabilityCardComponent } from '../shared/accountability-card/accountability-card.component';
import { ChallengesCardComponent } from '../shared/challenges-card/challenges-card.component';
import { RecapCardComponent } from '../shared/recap/recap-card.component';
import { OnboardingChecklistComponent } from '../shared/onboarding-checklist/onboarding-checklist.component';



@NgModule({
  declarations: [
    DashboardTodoListComponent,
    DashboardLoginChartComponent,
    DashboardNotificationComponent,
    DashboardActionComponent,
    DashboardAppAnalyticsComponent,
    DashboardTopUsersComponent,
    DashboardNowActiveComponent,
    DashboardActivityChartComponent,
    TodaysTodoModalComponent,
    DashboardMainComponent,
    DashboardRouteComponent,
    DashboardSubscriptionAnalyticsComponent,
    DashboardExercisesComponent,
    DashboardTrendingExercisesComponent,
    DashboardSuggestedComponent,
    ProfileSettingsToggleComponent,
    FindProvidersComponent,
    DashboardTrainerDetailComponent,
    DashboardCenterDetailComponent,
    DashboardMembersComponent,
    DashboardCategoryDetailComponent,
    DashboardQuickLinksComponent
  ],
  imports: [
    CommonModule,
    TodoListsModule,
    UserModule,
    IconsModule,
    FeatherModule,
    RouterModule,
    NavbarModule,
    FooterModule,
    FormsModule,
    PromoBadgeListComponent,
    ReactiveFormsModule,
    SharedModule,
    LocationsMenuComponent,
    ProviderTermsComponent,
    ProviderPackagesComponent,
    ProviderAvailabilityComponent,
    HowItWorksComponent,
    ProviderFilterBarComponent,
    ProviderCardMetaComponent,
    UserHoverCardComponent,
    DashboardTimelinePreviewComponent,
    ConsistencyRingComponent,
    AccountabilityCardComponent,
    ChallengesCardComponent,
    RecapCardComponent,
    OnboardingChecklistComponent,
    LoadErrorComponent
  ]
})
export class DashboardModule { }
