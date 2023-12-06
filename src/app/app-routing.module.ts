import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CenterPageComponent } from './centers/center-page/center-page.component';
import { LandingPageComponent } from './landing/landing-page/landing-page.component';
import { TrainersPageComponent } from './trainers/trainers-page/trainers-page.component';
import { ContactUsPageComponent } from './contact-us/contact-us-page/contact-us-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { TestimonialPageComponent } from './testimonial/testimonial-page/testimonial-page.component';
import { ProductsPageComponent } from './products/products-page/products-page.component';
import { EquipmentPageComponent } from './equipments/equipment-page/equipment-page.component';
import { ReportProblemPageComponent } from './report-problem/report-problem-page/report-problem-page.component';
import { TrainersDetailsComponent } from './trainers/trainers-details/trainers-details.component';
import { TrainerGuard } from './guards/trainer.guard';
import { ProductsModule, productChildRoutes } from './products/products.module';
import { CenterDetailComponent } from './centers/center-detail/center-detail.component';
import { CenterGuard } from './guards/center.guard';
import { CategoryDetailsComponent } from './categories/category-details/category-details.component';
import { CategoryGuard } from './guards/category.guard';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RouteGuardService } from './services/route-guard.service';
import { CategoriesComponent } from './categories/categories/categories.component';
import { AboutUsComponent } from './about-us/about-us/about-us.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { PartnerApplicationComponent } from './dashboard/partner/partner-application/partner-application.component';
import { ActivateAccountComponent } from './dashboard/user/activate-account/activate-account.component';
import { LoginComponent } from './dashboard/user/login/login.component';
import { ProgressPageComponent } from './dashboard/user/progress/progress-page/progress-page.component';
import { ResetPasswordComponent } from './dashboard/user/reset-password/reset-password.component';
import { RunNowPageComponent } from './dashboard/user/run-now/run-now-page/run-now-page.component';
import { PartnerPageComponent } from './dashboard/partner/partner-page/partner-page.component';
import { ProfilePageComponent } from './dashboard/user/profile-page/profile-page.component';
import { ProfileSettingsComponent } from './dashboard/user/profile-settings/profile-settings.component';
import { TaskPageComponent } from './dashboard/tasks/task-page/task-page.component';
import { SubscriptionPageComponent } from './dashboard/subscriptions/subscription-page/subscription-page.component';
import { NotificationPageComponent } from './dashboard/notifications/notification-page/notification-page.component';
import { FaqPageComponent } from './dashboard/faqs/faq-page/faq-page.component';
import { MyTodosComponent } from './dashboard/todo-lists/my-todos/my-todos.component';
import { CategoryComponent } from './admin/categories/category/category.component';
import { AdminContactUsComponent } from './admin/contact-us/admin-contact-us/admin-contact-us.component';
import { UsersComponent } from './admin/users/users/users.component';
import { CenterComponent } from './dashboard/partner/center/center.component';
import { TrainerComponent } from './dashboard/partner/trainer/trainer.component';
import { TagsComponent } from './admin/tags/tags/tags.component';
import { NewslettersComponent } from './admin/newsletters/newsletters/newsletters.component';
import { PartnersComponent } from './admin/partners/partners/partners.component';
import { TodoListsComponent } from './admin/todo-lists/todo-lists/todo-lists.component';
import { MuscleGroupsComponent } from './admin/muscle-groups/muscle-groups/muscle-groups.component';
import { ExercisesComponent } from './admin/exercises/exercises/exercises.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: LandingPageComponent },
  { path: 'contact', component: ContactUsPageComponent },
  { path: 'contact-us', redirectTo: 'contact' },
  { path: 'about', component: AboutUsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'trainers', component: TrainersPageComponent },
  { path: 'trainers/:id/:name', component: TrainersDetailsComponent, canActivate: [TrainerGuard] },
  { path: 'centers', component: CenterPageComponent },
  { path: 'centers/:id/:name', component: CenterDetailComponent, canActivate: [CenterGuard] },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:id/:name', component: CategoryDetailsComponent, canActivate: [CategoryGuard] },
  { path: 'testimonials', component: TestimonialPageComponent },
  { path: 'equipments', component: EquipmentPageComponent },
  { path: 'report-problem', component: ReportProblemPageComponent },
  { path: 'login/reset-password', component: ResetPasswordComponent },
  { path: 'login/activate-account', component: ActivateAccountComponent },

  // admin components #protected
  {
    path: 'users-list', component: UsersComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'newsletters-list', component: NewslettersComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'categories-list', component: CategoryComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'partners-list', component: PartnersComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'contact-us-list', component: AdminContactUsComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'trainers-list', component: TrainerComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'centers-list', component: CenterComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'tags-list', component: TagsComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'todo-list-list', component: TodoListsComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'muscle-groups-list', component: MuscleGroupsComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'exercises-list', component: ExercisesComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },


  // nested components
  {
    path: 'products', component: ProductsPageComponent, children: productChildRoutes
  },

  // protected components
  {
    path: 'dashboard', component: DashboardComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },

  // user components
  {
    path: 'profile', component: ProfilePageComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'partnership', component: PartnerPageComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'settings', component: ProfileSettingsComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'run-now', component: RunNowPageComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'progress', component: ProgressPageComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'notifications', component: NotificationPageComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'tasks', component: TaskPageComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'subscriptions', component: SubscriptionPageComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'faqs', component: FaqPageComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },
  {
    path: 'my-todos', component: MyTodosComponent,
    canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',]
    }
  },

  //handles other exceptions
  { path: '**', component: PageNotFoundComponent },
]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Restore the last scroll position
      scrollPositionRestoration: "enabled",

      // Enable scrolling to anchors
      anchorScrolling: "enabled",
    }
    ),
    ProductsModule,
    ScrollingModule,
  ],
  exports: [
    RouterModule
  ],
  providers: [
    RouteGuardService,
  ]
})
export class AppRoutingModule { }
