import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CenterPageComponent } from './centers/center-page/center-page.component';
import { LandingPageComponent } from './landing/landing-page/landing-page.component';
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
import { CategoriesComponent } from './categories/categories/categories.component';
import { AboutUsComponent } from './about-us/about-us/about-us.component';
import { ActivateAccountComponent } from './dashboard/user/activate-account/activate-account.component';
import { ResetPasswordComponent } from './dashboard/user/reset-password/reset-password.component';
import { MyNotificationsPageComponent } from './my-notifications/my-notifications-page/my-notifications-page.component';
import { MyFaqsPageComponent } from './my-faqs/my-faqs-page/my-faqs-page.component';
import { MyTasksPageComponent } from './my-tasks/my-tasks-page/my-tasks-page.component';
import { LoginComponent } from './login/login/login.component';
import { SignupComponent } from './login/signup/signup.component';
import { QuickSignupComponent } from './login/quick-signup/quick-signup.component';
import { BreadcrumbService } from 'xng-breadcrumb';
import { PartnerComponent } from './partner/partner/partner.component';
import { PartnerRouteComponent } from './partner/partner-route/partner-route.component';
import { ExercisesPageComponent } from './exercises/exercises-page/exercises-page.component';
import { FaqsPageComponent } from './faqs/faqs-page/faqs-page.component';
import { HelpCenterPageComponent } from './help-center/help-center-page/help-center-page.component';
import { TermsPageComponent } from './terms/terms-page/terms-page.component';
import { PrivacyPageComponent } from './privacy/privacy-page/privacy-page.component';
import { AuthGuard } from './services/auth.guard';
import { NotificationMainComponent } from './my-notifications/notification-main/notification-main.component';
import { HubRouteComponent } from './hub/hub-route/hub-route.component';
import { HubMainComponent } from './hub/hub-main/hub-main.component';
import { UserRouteComponent } from './user/user-route/user-route.component';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { UserProfileSettingsComponent } from './user/user-profile-settings/user-profile-settings.component';
import { DashboardMainComponent } from './dashboard/dashboard-main/dashboard-main.component';
import { DashboardRouteComponent } from './dashboard/dashboard-route/dashboard-route.component';
import { MySubscriptionsMainComponent } from './my-subscriptions/my-subscriptions-main/my-subscriptions-main.component';
import { MyTodoListMainComponent } from './my-todo-list/my-todo-list-main/my-todo-list-main.component';
import { MyTrainerMainComponent } from './my-trainer/my-trainer-main/my-trainer-main.component';
import { TrainersMainComponent } from './trainers/trainers-main/trainers-main.component';
import { LegalMainComponent } from './legal/legal-main/legal-main.component';
import { MyWorkoutsComponent } from './workouts/my-workouts/my-workouts.component';
import { WorkoutBuilderComponent } from './workouts/workout-builder/workout-builder.component';
import { MyAssignedWorkoutsComponent } from './workouts/my-assigned-workouts/my-assigned-workouts.component';
import { DashboardExercisesComponent } from './dashboard/exercises/dashboard-exercises.component';



export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: LandingPageComponent, data: { breadcrumb: 'Home' } },
  { path: 'contact', component: ContactUsPageComponent, data: { breadcrumb: 'Contact' } },
  { path: 'contact-us', redirectTo: 'contact' },
  { path: 'about', component: AboutUsComponent, data: { breadcrumb: 'About' } },
  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Login' } },
  { path: 'sign-up', component: SignupComponent, data: { breadcrumb: 'Sign Up' } },
  { path: 'quick-sign-up', component: QuickSignupComponent, data: { breadcrumb: 'Quick Sign Up' } },
  { path: 'trainers', component: TrainersMainComponent, data: { breadcrumb: 'Trainers' } },
  { path: 'trainers/:name', component: TrainersDetailsComponent, canActivate: [TrainerGuard], data: { breadcrumb: { alias: 'trainerName' } } },
  { path: 'centers', component: CenterPageComponent, data: { breadcrumb: 'Centers' } },
  { path: 'centers/:id/:name', component: CenterDetailComponent, canActivate: [CenterGuard], data: { breadcrumb: { alias: 'centerName' } } },
  { path: 'services', component: CategoriesComponent, data: { breadcrumb: 'Services' } },
  { path: 'services/:id/:name', component: CategoryDetailsComponent, canActivate: [CategoryGuard], data: { breadcrumb: { alias: 'serviceName' } } },
  { path: 'testimonials', component: TestimonialPageComponent, data: { breadcrumb: 'Testimonials' } },
  { path: 'equipments', component: EquipmentPageComponent, data: { breadcrumb: 'Equipment' } },
  { path: 'exercises', component: ExercisesPageComponent, data: { breadcrumb: 'Exercises' } },
  { path: 'report-problem', component: ReportProblemPageComponent, data: { breadcrumb: 'Report Problem' } },
  { path: 'faqs', component: FaqsPageComponent, data: { breadcrumb: 'FAQs' } },
  { path: 'help-center', component: HelpCenterPageComponent, data: { breadcrumb: 'Help Center' } },
  { path: 'terms', component: TermsPageComponent, data: { breadcrumb: 'Terms' } },
  { path: 'legal-terms', component: LegalMainComponent, children: productChildRoutes, data: { breadcrumb: 'legal terms' } },
  { path: 'privacy', component: PrivacyPageComponent, data: { breadcrumb: 'Privacy' } },
  { path: 'login/reset-password', component: ResetPasswordComponent, data: { breadcrumb: 'Reset Password' } },
  { path: 'login/activate-account', component: ActivateAccountComponent, data: { breadcrumb: 'Activate Account' } },
  { path: 'shop', component: ProductsPageComponent, children: productChildRoutes, data: { breadcrumb: 'Shop' } },


  // ── DASHBOARD ──────────────────────────────────────────
  {
    path: 'dashboard',
    component: DashboardRouteComponent,
    canActivate: [AuthGuard],
    data: {
      breadcrumb: 'Dashboard',
      expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
    },
    children: [

      // Dashboard home
      {
        path: '',
        component: DashboardMainComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: null, // don't double up on "Dashboard"
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Profile
      {
        path: 'profile',
        component: UserProfileComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Profile',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Settings
      {
        path: 'settings',
        component: UserProfileSettingsComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Settings',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Notifications
      {
        path: 'my-notifications',
        component: NotificationMainComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Notifications',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Tasks
      {
        path: 'my-tasks',
        component: MyTasksPageComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Tasks',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Subscriptions
      {
        path: 'my-subscriptions',
        component: MySubscriptionsMainComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Subscriptions',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // FAQs
      {
        path: 'my-faqs',
        component: MyFaqsPageComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'FAQs',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Todos
      {
        path: 'my-todos',
        component: MyTodoListMainComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'To-do List',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Workouts — anyone can build a workout
      {
        path: 'workouts',
        component: MyWorkoutsComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Workouts',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },
      {
        path: 'workouts/builder',
        component: WorkoutBuilderComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Workout Builder',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },
      {
        path: 'workouts/builder/:id',
        component: WorkoutBuilderComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Workout Builder',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Exercise library — read-only browsing for any signed-in user
      {
        path: 'exercises',
        component: DashboardExercisesComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Exercises',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Workouts assigned to me
      {
        path: 'my-assigned-workouts',
        component: MyAssignedWorkoutsComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Assigned Workouts',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        }
      },

      // Partnership
      {
        path: 'partnership',
        component: PartnerRouteComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Partnership',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        },
        children: [
          { path: '', component: PartnerComponent, canActivate: [AuthGuard], data: { breadcrumb: null, expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },
          { path: 'trainer-details', component: MyTrainerMainComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Details', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } }
        ]
      },

      // ── HUB ──────────────────────────────────────────
      {
        path: 'hub',
        component: HubRouteComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Hub',
          expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client']
        },
        children: [
          { path: '', component: HubMainComponent, canActivate: [AuthGuard], data: { breadcrumb: null, expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },

          // Admin hub routes (lazy-loaded)
          { path: 'users', loadChildren: () => import('./admin/users/users.module').then(m => m.UsersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Users', expectedRole: ['admin'] } },
          { path: 'newsletters', loadChildren: () => import('./admin/newsletters/newsletters.module').then(m => m.NewslettersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Newsletters', expectedRole: ['admin'] } },
          { path: 'partners', loadChildren: () => import('./admin/partners/partners.module').then(m => m.PartnersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Partners', expectedRole: ['admin'] } },
          { path: 'contact-us', loadChildren: () => import('./admin/contact-us/contact-us.module').then(m => m.ContactUsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Contact Us', expectedRole: ['admin'] } },
          { path: 'trainers', loadChildren: () => import('./admin/trainers/trainers.module').then(m => m.TrainersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Trainers', expectedRole: ['admin'] } },
          { path: 'centers', loadChildren: () => import('./admin/centers/centers.module').then(m => m.CentersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Centers', expectedRole: ['admin'] } },
          { path: 'tags', loadChildren: () => import('./admin/tags/tags.module').then(m => m.TagsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Tags', expectedRole: ['admin'] } },
          { path: 'todo-lists', loadChildren: () => import('./admin/todo-lists/todo-lists.module').then(m => m.TodoListsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Todo Lists', expectedRole: ['admin'] } },
          { path: 'muscle-groups', loadChildren: () => import('./admin/muscle-groups/muscle-groups.module').then(m => m.MuscleGroupsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Muscle Groups', expectedRole: ['admin'] } },
          { path: 'exercises', loadChildren: () => import('./admin/exercises/exercises.module').then(m => m.ExercisesModule), canActivate: [AuthGuard], data: { breadcrumb: 'Exercises', expectedRole: ['admin'] } },
          { path: 'tasks', loadChildren: () => import('./admin/tasks/tasks.module').then(m => m.TasksModule), canActivate: [AuthGuard], data: { breadcrumb: 'Tasks', expectedRole: ['admin'] } },
          { path: 'services', loadChildren: () => import('./admin/categories/categories.module').then(m => m.CategoriesModule), canActivate: [AuthGuard], data: { breadcrumb: 'Services', expectedRole: ['admin'] } },
          { path: 'clients', loadChildren: () => import('./admin/clients/clients.module').then(m => m.ClientsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Clients', expectedRole: ['admin'] } },
          { path: 'subscriptions', loadChildren: () => import('./admin/subscriptions/subscriptions.module').then(m => m.SubscriptionsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Subscriptions', expectedRole: ['admin'] } },
          { path: 'trainer-pricing', loadChildren: () => import('./admin/trainer-pricing/trainer-pricing.module').then(m => m.TrainerPricingModule), canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Pricing', expectedRole: ['admin'] } },
          { path: 'testimonials', loadChildren: () => import('./admin/testimonials/testimonials.module').then(m => m.TestimonialsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Testimonials', expectedRole: ['admin'] } },
          { path: 'members', loadChildren: () => import('./admin/members/members.module').then(m => m.MembersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Members', expectedRole: ['admin'] } },
          { path: 'payments', loadChildren: () => import('./admin/payments/payments.module').then(m => m.PaymentsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Payments', expectedRole: ['admin'] } },
          { path: 'settings', component: UserProfileSettingsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Settings', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },
          { path: 'my-notifications', component: MyNotificationsPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Notifications', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },
          { path: 'my-tasks', component: MyTasksPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Tasks', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },
          { path: 'my-subscriptions', component: MySubscriptionsMainComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Subscriptions', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },
          { path: 'my-faqs', component: MyFaqsPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'FAQs', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },
          { path: 'my-todos', component: MyTodoListMainComponent, canActivate: [AuthGuard], data: { breadcrumb: 'To-do List', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },

          {
            path: 'partnership',
            component: PartnerRouteComponent,
            canActivate: [AuthGuard],
            data: { breadcrumb: 'Partnership', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] },
            children: [
              { path: '', component: PartnerComponent, canActivate: [AuthGuard], data: { breadcrumb: null, expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } },
              { path: 'trainer-details', component: MyTrainerMainComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Details', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } }
            ]
          }
        ]
      },

      // ── ADMIN (direct dashboard children, lazy-loaded) ────────────
      { path: 'users', loadChildren: () => import('./admin/users/users.module').then(m => m.UsersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Users', expectedRole: ['admin'] } },
      { path: 'newsletters', loadChildren: () => import('./admin/newsletters/newsletters.module').then(m => m.NewslettersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Newsletters', expectedRole: ['admin'] } },
      { path: 'partners', loadChildren: () => import('./admin/partners/partners.module').then(m => m.PartnersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Partners', expectedRole: ['admin'] } },
      { path: 'contact-us', loadChildren: () => import('./admin/contact-us/contact-us.module').then(m => m.ContactUsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Contact Us', expectedRole: ['admin'] } },
      { path: 'trainers', loadChildren: () => import('./admin/trainers/trainers.module').then(m => m.TrainersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Trainers', expectedRole: ['admin'] } },
      { path: 'centers', loadChildren: () => import('./admin/centers/centers.module').then(m => m.CentersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Centers', expectedRole: ['admin'] } },
      { path: 'tags', loadChildren: () => import('./admin/tags/tags.module').then(m => m.TagsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Tags', expectedRole: ['admin'] } },
      { path: 'todo-lists', loadChildren: () => import('./admin/todo-lists/todo-lists.module').then(m => m.TodoListsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Todo Lists', expectedRole: ['admin'] } },
      { path: 'muscle-groups', loadChildren: () => import('./admin/muscle-groups/muscle-groups.module').then(m => m.MuscleGroupsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Muscle Groups', expectedRole: ['admin'] } },
      // NOTE: `/dashboard/exercises` is now the read-only exercise library for
      // every signed-in user (see the DashboardExercisesComponent route above).
      // Admin exercise CRUD stays at `/dashboard/hub/exercises`, which is where
      // the hub cards link to — the duplicate direct child that used to sit here
      // was unlinked and would have been shadowed anyway.
      { path: 'tasks', loadChildren: () => import('./admin/tasks/tasks.module').then(m => m.TasksModule), canActivate: [AuthGuard], data: { breadcrumb: 'Tasks', expectedRole: ['admin'] } },
      { path: 'services', loadChildren: () => import('./admin/categories/categories.module').then(m => m.CategoriesModule), canActivate: [AuthGuard], data: { breadcrumb: 'Services', expectedRole: ['admin'] } },
      { path: 'clients', loadChildren: () => import('./admin/clients/clients.module').then(m => m.ClientsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Clients', expectedRole: ['admin'] } },
      { path: 'subscriptions', loadChildren: () => import('./admin/subscriptions/subscriptions.module').then(m => m.SubscriptionsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Subscriptions', expectedRole: ['admin'] } },
      { path: 'trainer-pricing', loadChildren: () => import('./admin/trainer-pricing/trainer-pricing.module').then(m => m.TrainerPricingModule), canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Pricing', expectedRole: ['admin'] } },
      { path: 'testimonials', loadChildren: () => import('./admin/testimonials/testimonials.module').then(m => m.TestimonialsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Testimonials', expectedRole: ['admin'] } },
      { path: 'members', loadChildren: () => import('./admin/members/members.module').then(m => m.MembersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Members', expectedRole: ['admin'] } },
      { path: 'payments', loadChildren: () => import('./admin/payments/payments.module').then(m => m.PaymentsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Payments', expectedRole: ['admin'] } },
    ]
  },

  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled'
    }),

  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }

