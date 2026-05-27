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
import { CategoriesComponent } from './categories/categories/categories.component';
import { AboutUsComponent } from './about-us/about-us/about-us.component';
import { ActivateAccountComponent } from './dashboard/user/activate-account/activate-account.component';
import { ResetPasswordComponent } from './dashboard/user/reset-password/reset-password.component';
import { CategoryComponent } from './admin/categories/category/category.component';
import { AdminContactUsComponent } from './admin/contact-us/admin-contact-us/admin-contact-us.component';
import { UsersComponent } from './admin/users/users/users.component';
import { TagsComponent } from './admin/tags/tags/tags.component';
import { NewslettersComponent } from './admin/newsletters/newsletters/newsletters.component';
import { PartnersComponent } from './admin/partners/partners/partners.component';
import { MuscleGroupsComponent } from './admin/muscle-groups/muscle-groups/muscle-groups.component';
import { ExercisesComponent } from './admin/exercises/exercises/exercises.component';
import { TasksComponent } from './admin/tasks/tasks/tasks.component';
import { MyNotificationsPageComponent } from './my-notifications/my-notifications-page/my-notifications-page.component';
import { MyFaqsPageComponent } from './my-faqs/my-faqs-page/my-faqs-page.component';
import { MyTasksPageComponent } from './my-tasks/my-tasks-page/my-tasks-page.component';
import { TrainersComponent } from './admin/trainers/trainers/trainers.component';
import { LoginComponent } from './login/login/login.component';
import { CentersComponent } from './admin/centers/centers/centers.component';
import { ClientsComponent } from './admin/clients/clients/clients.component';
import { SignupComponent } from './login/signup/signup.component';
import { SubscriptionsComponent } from './admin/subscriptions/subscriptions/subscriptions.component';
import { TrainerPricingComponent } from './admin/trainer-pricing/trainer-pricing/trainer-pricing.component';
import { QuickSignupComponent } from './login/quick-signup/quick-signup.component';
import { BreadcrumbService } from 'xng-breadcrumb';
import { PartnerComponent } from './partner/partner/partner.component';
import { TrainerDetailsComponent } from './trainer/trainer-details/trainer-details.component';
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
import { TodoListsComponent } from './admin/todo-lists/todo-lists/todo-lists.component';



export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: LandingPageComponent, data: { breadcrumb: 'Home' } },
  { path: 'contact', component: ContactUsPageComponent, data: { breadcrumb: 'Contact' } },
  { path: 'contact-us', redirectTo: 'contact' },
  { path: 'about', component: AboutUsComponent, data: { breadcrumb: 'About' } },
  { path: 'login', component: LoginComponent, data: { breadcrumb: 'Login' } },
  { path: 'sign-up', component: SignupComponent, data: { breadcrumb: 'Sign Up' } },
  { path: 'quick-sign-up', component: QuickSignupComponent, data: { breadcrumb: 'Quick Sign Up' } },
  { path: 'trainers', component: TrainersPageComponent, data: { breadcrumb: 'Trainers' } },
  { path: 'trainers/:id/:name', component: TrainersDetailsComponent, canActivate: [TrainerGuard], data: { breadcrumb: { alias: 'trainerName' } } },
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
          { path: 'trainer-details', component: TrainerDetailsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Details', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } }
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

          // Admin hub routes
          { path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Users', expectedRole: ['admin'] } },
          { path: 'newsletters', component: NewslettersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Newsletters', expectedRole: ['admin'] } },
          { path: 'partners', component: PartnersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Partners', expectedRole: ['admin'] } },
          { path: 'contact-us', component: AdminContactUsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Contact Us', expectedRole: ['admin'] } },
          { path: 'trainers', component: TrainersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainers', expectedRole: ['admin'] } },
          { path: 'centers', component: CentersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Centers', expectedRole: ['admin'] } },
          { path: 'tags', component: TagsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Tags', expectedRole: ['admin'] } },
          { path: 'todo-lists', component: TodoListsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Todo Lists', expectedRole: ['admin'] } },
          { path: 'muscle-groups', component: MuscleGroupsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Muscle Groups', expectedRole: ['admin'] } },
          { path: 'exercises', component: ExercisesComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Exercises', expectedRole: ['admin'] } },
          { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Tasks', expectedRole: ['admin'] } },
          { path: 'services', component: CategoryComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Services', expectedRole: ['admin'] } },
          { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Clients', expectedRole: ['admin'] } },
          { path: 'subscriptions', component: SubscriptionsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Subscriptions', expectedRole: ['admin'] } },
          { path: 'trainer-pricing', component: TrainerPricingComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Pricing', expectedRole: ['admin'] } },
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
              { path: 'trainer-details', component: TrainerDetailsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Details', expectedRole: ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'] } }
            ]
          }
        ]
      },

      // ── ADMIN (direct dashboard children) ────────────
      { path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Users', expectedRole: ['admin'] } },
      { path: 'newsletters', component: NewslettersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Newsletters', expectedRole: ['admin'] } },
      { path: 'partners', component: PartnersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Partners', expectedRole: ['admin'] } },
      { path: 'contact-us', component: AdminContactUsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Contact Us', expectedRole: ['admin'] } },
      { path: 'trainers', component: TrainersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainers', expectedRole: ['admin'] } },
      { path: 'centers', component: CentersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Centers', expectedRole: ['admin'] } },
      { path: 'tags', component: TagsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Tags', expectedRole: ['admin'] } },
      { path: 'todo-lists', component: TodoListsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Todo Lists', expectedRole: ['admin'] } },
      { path: 'muscle-groups', component: MuscleGroupsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Muscle Groups', expectedRole: ['admin'] } },
      { path: 'exercises', component: ExercisesComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Exercises', expectedRole: ['admin'] } },
      { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Tasks', expectedRole: ['admin'] } },
      { path: 'services', component: CategoryComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Services', expectedRole: ['admin'] } },
      { path: 'clients', component: ClientsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Clients', expectedRole: ['admin'] } },
      { path: 'subscriptions', component: SubscriptionsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Subscriptions', expectedRole: ['admin'] } },
      { path: 'trainer-pricing', component: TrainerPricingComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Pricing', expectedRole: ['admin'] } },
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
    ProductsModule
  ],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }

