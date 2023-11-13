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
import { CategoryComponent } from './dashboard/admin/categories/category/category.component';
import { AdminContactUsComponent } from './dashboard/admin/contact-us/admin-contact-us/admin-contact-us.component';
import { AdminNewsletterComponent } from './dashboard/admin/newsletters/admin-newsletter/admin-newsletter.component';
import { PartnerComponent } from './dashboard/admin/partners/partner/partner.component';
import { TagComponent } from './dashboard/admin/tags/tag/tag.component';
import { UserComponent } from './dashboard/admin/users/user/user.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { PartnerApplicationComponent } from './dashboard/partner/partner-application/partner-application.component';
import { ActivateAccountComponent } from './dashboard/user/activate-account/activate-account.component';
import { LoginComponent } from './dashboard/user/login/login.component';
import { ProgressPageComponent } from './dashboard/user/progress/progress-page/progress-page.component';
import { ResetPasswordComponent } from './dashboard/user/reset-password/reset-password.component';
import { RunNowPageComponent } from './dashboard/user/run-now/run-now-page/run-now-page.component';
import { CenterComponent } from './dashboard/admin/centers/center/center.component';
import { PartnerPageComponent } from './dashboard/partner/partner-page/partner-page.component';
import { TrainerComponent } from './dashboard/admin/trainers/trainer/trainer.component';
import { ProfilePageComponent } from './dashboard/user/profile-page/profile-page.component';
import { ProfileSettingsComponent } from './dashboard/user/profile-settings/profile-settings.component';
import { TaskPageComponent } from './dashboard/tasks/task-page/task-page.component';
import { SubscriptionPageComponent } from './dashboard/subscriptions/subscription-page/subscription-page.component';
import { NotificationPageComponent } from './dashboard/notifications/notification-page/notification-page.component';
import { FaqPageComponent } from './dashboard/faqs/faq-page/faq-page.component';


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
    path: 'dashboard/users', component: UserComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'dashboard/newsletters', component: AdminNewsletterComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'dashboard/categories', component: CategoryComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'dashboard/partners', component: PartnerComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'dashboard/contact-us', component: AdminContactUsComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'dashboard/trainers', component: TrainerComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'dashboard/centers', component: CenterComponent, canActivate: [RouteGuardService],
    data: {
      expectedRole: ['admin']
    }
  },
  {
    path: 'dashboard/tags', component: TagComponent, canActivate: [RouteGuardService],
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
    path: 'dashboard/partnership', component: PartnerPageComponent,
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
