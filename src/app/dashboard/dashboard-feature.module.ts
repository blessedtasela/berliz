import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../services/auth.guard';
import { RoleGuard } from '../services/role.guard';

import { DashboardModule } from './dashboard.module';
import { DashboardMainComponent } from './dashboard-main/dashboard-main.component';
import { DashboardRouteComponent } from './dashboard-route/dashboard-route.component';
import { DashboardExercisesComponent } from './exercises/dashboard-exercises.component';
import { ProfileSettingsToggleComponent } from './profile-settings-toggle/profile-settings-toggle.component';
import { FindProvidersComponent } from './find-providers/find-providers.component';
import { DashboardTrainerDetailComponent } from './dashboard-trainer-detail/dashboard-trainer-detail.component';
import { TrainerGuard } from '../guards/trainer.guard';
import { CenterGuard } from '../guards/center.guard';
import { DashboardCenterDetailComponent } from './dashboard-center-detail/dashboard-center-detail.component';
import { DashboardMembersComponent } from './dashboard-members/dashboard-members.component';
import { DashboardCategoryDetailComponent } from './dashboard-category-detail/dashboard-category-detail.component';

import { UserModule } from '../user/user.module';
import { UserProfileComponent } from '../user/user-profile/user-profile.component';
import { UserProfileSettingsComponent } from '../user/user-profile-settings/user-profile-settings.component';
import { UserProgressComponent } from '../user/user-progress/user-progress.component';

import { MessagesModule } from '../messages/messages.module';
import { MessagesMainComponent } from '../messages/messages-main/messages-main.component';

import { ConnectionsModule } from '../connections/connections.module';
import { ConnectionsMainComponent } from '../connections/connections-main/connections-main.component';

import { MyNotificationsModule } from '../my-notifications/my-notifications.module';
import { NotificationMainComponent } from '../my-notifications/notification-main/notification-main.component';
import { MyNotificationsPageComponent } from '../my-notifications/my-notifications-page/my-notifications-page.component';

import { MyTasksModule } from '../my-tasks/my-tasks.module';
import { MyTasksPageComponent } from '../my-tasks/my-tasks-page/my-tasks-page.component';

import { MySubscriptionsModule } from '../my-subscriptions/my-subscriptions.module';
import { MySubscriptionsMainComponent } from '../my-subscriptions/my-subscriptions-main/my-subscriptions-main.component';

import { MyFaqsModule } from '../my-faqs/my-faqs.module';
import { MyFaqsPageComponent } from '../my-faqs/my-faqs-page/my-faqs-page.component';

import { MyBookingsModule } from '../bookings/bookings.module';
import { ManageBookingsComponent } from '../bookings/manage-bookings/manage-bookings.component';
import { ProviderBookingsMainComponent } from '../bookings/provider-bookings-main/provider-bookings-main.component';

import { MyLikedTrainersComponent } from '../liked-trainers/my-liked-trainers/my-liked-trainers.component';
import { MyTestimonialsPageComponent } from '../my-testimonials/my-testimonials-page/my-testimonials-page.component';

import { ClientIntakeModule } from '../client-intake/client-intake.module';
import { ClientIntakeFormComponent } from '../client-intake/client-intake-form/client-intake-form.component';
import { MyClientIntakesComponent } from '../client-intake/my-client-intakes/my-client-intakes.component';

import { MyTodoListModule } from '../my-todo-list/my-todo-list.module';
import { MyTodoListMainComponent } from '../my-todo-list/my-todo-list-main/my-todo-list-main.component';

import { WorkoutsModule } from '../workouts/workouts.module';
import { MyWorkoutsComponent } from '../workouts/my-workouts/my-workouts.component';
import { WorkoutBuilderComponent } from '../workouts/workout-builder/workout-builder.component';
import { MyAssignedWorkoutsComponent } from '../workouts/my-assigned-workouts/my-assigned-workouts.component';

import { PartnerModule } from '../partner/partner.module';
import { PartnerRouteComponent } from '../partner/partner-route/partner-route.component';
import { PartnerComponent } from '../partner/partner/partner.component';

import { MyTrainerModule } from '../my-trainer/my-trainer.module';
import { MyTrainerMainComponent } from '../my-trainer/my-trainer-main/my-trainer-main.component';

import { HubModule } from '../hub/hub.module';
import { HubRouteComponent } from '../hub/hub-route/hub-route.component';
import { HubMainComponent } from '../hub/hub-main/hub-main.component';

const expectedRoleAll = ['admin', 'user', 'partner', 'trainer', 'center', 'driver', 'store', 'client'];

/**
 * Everything that used to sit directly under the top-level `dashboard` route
 * in app-routing.module.ts now lives here, mounted as ONE lazy-loaded chunk
 * via the `loadChildren` entry for `path: 'dashboard'` in that file. This is
 * the single biggest win for the initial bundle: every module imported below
 * (dashboard, user, notifications, tasks, subscriptions, faqs, bookings,
 * client-intake, todo-list, workouts, partner, my-trainer, hub) previously
 * loaded EAGERLY for every visitor via AppModule's import graph, even an
 * anonymous person who only ever sees the homepage.
 *
 * Route paths, guards, and data are unchanged from before — the only
 * structural change is `path: 'dashboard'` became `path: ''` here, since the
 * `dashboard` path segment is now supplied by the loadChildren route entry
 * in app-routing.module.ts instead of being hardcoded in this array. Admin
 * sub-routes (inside `hub` and as direct children) keep using their own
 * existing `loadChildren`/`loadComponent` lazy imports into ./admin/* exactly
 * as before — those are nested lazy boundaries INSIDE this now-also-lazy
 * boundary, which Angular supports natively.
 */
const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardRouteComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      breadcrumb: 'Dashboard',
      expectedRole: expectedRoleAll
    },
    children: [

      // Dashboard home
      {
        path: '',
        component: DashboardMainComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: null, // don't double up on "Dashboard"
          expectedRole: expectedRoleAll
        }
      },

      // Profile + Settings — one sidebar entry, toggled via child routes.
      // /dashboard/settings kept as a redirect so old links/bookmarks still work.
      {
        path: 'profile',
        component: ProfileSettingsToggleComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Profile',
          expectedRole: expectedRoleAll
        },
        children: [
          { path: '', redirectTo: 'view', pathMatch: 'full' },
          { path: 'view', component: UserProfileComponent, data: { breadcrumb: null, expectedRole: expectedRoleAll } },
          { path: 'edit', component: UserProfileSettingsComponent, data: { breadcrumb: 'Settings', expectedRole: expectedRoleAll } },
        ]
      },
      { path: 'settings', redirectTo: 'profile/edit' },

      // My Progress — weight/body-fat/photo check-ins over time
      {
        path: 'my-progress',
        component: UserProgressComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'My Progress',
          expectedRole: expectedRoleAll
        }
      },

      // Messages — direct trainer<->client messaging
      {
        path: 'messages',
        component: MessagesMainComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Messages',
          expectedRole: expectedRoleAll
        }
      },

      // Connections — request/accept flow that unlocks messaging beyond bookings
      {
        path: 'connections',
        component: ConnectionsMainComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Connections',
          expectedRole: expectedRoleAll
        }
      },

      // Peer sessions — user-to-user workout sessions, proposed from an
      // existing connection (see ConnectionsMainComponent.proposeSession).
      {
        path: 'my-sessions',
        loadComponent: () => import('../peer-sessions/my-sessions/my-sessions.component').then(m => m.MySessionsComponent),
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'My Sessions',
          expectedRole: expectedRoleAll
        }
      },

      // Notifications
      {
        path: 'my-notifications',
        component: NotificationMainComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Notifications',
          expectedRole: expectedRoleAll
        }
      },

      // Tasks — has its own internal toggle already, kept separate from To-do list.
      {
        path: 'my-tasks',
        component: MyTasksPageComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Tasks',
          expectedRole: expectedRoleAll
        }
      },

      // To-do list
      {
        path: 'my-todos',
        component: MyTodoListMainComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'To-do List',
          expectedRole: expectedRoleAll
        }
      },

      // Subscriptions
      {
        path: 'my-subscriptions',
        component: MySubscriptionsMainComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Subscriptions',
          expectedRole: expectedRoleAll
        }
      },

      // FAQs
      {
        path: 'my-faqs',
        component: MyFaqsPageComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'FAQs',
          expectedRole: expectedRoleAll
        }
      },

      // Bookings — everyone's own booking history, plus (for a trainer/center)
      // a toggle to the requests-from-clients view. Previously the client-made
      // view and the provider-side view were two separate routes, and the
      // provider one had no sidebar entry at all — see ManageBookingsComponent.
      {
        path: 'my-bookings',
        component: MyBookingsMainComponent,
        canActivate: [AuthGuard, RoleGuard],
        component: ManageBookingsComponent,
        canActivate: [AuthGuard],
        data: {
          breadcrumb: 'Bookings',
          expectedRole: expectedRoleAll
        }
      },

      // Bookings made WITH the current trainer/center.
      {
        path: 'my-provider-bookings',
        component: ProviderBookingsMainComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Bookings',
          expectedRole: ['trainer', 'center']
        }
      },

      // Liked trainers — dashboard-native list (vs the public /trainers grid).
      {
        path: 'liked-trainers',
        component: MyLikedTrainersComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Liked Trainers',
          expectedRole: expectedRoleAll
        }
      },

      // My testimonials — dashboard-native list (vs the public /services page).
      {
        path: 'my-testimonials',
        component: MyTestimonialsPageComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'My Testimonials',
          expectedRole: expectedRoleAll
        }
      },

      // Client intake — trainer initiates for a specific client (clientId
      // route param); client or the assigned trainer can view/edit
      // afterwards (id route param). Access is enforced server-side.
      {
        path: 'client-intake/new/:clientId',
        component: ClientIntakeFormComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'New Client Intake',
          expectedRole: ['trainer']
        }
      },
      {
        path: 'client-intake/:id',
        component: ClientIntakeFormComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Client Intake',
          expectedRole: expectedRoleAll
        }
      },
      {
        path: 'my-client-intakes',
        component: MyClientIntakesComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Client Intakes',
          expectedRole: ['trainer']
        }
      },

      // Workouts — anyone can build a workout
      {
        path: 'workouts',
        component: MyWorkoutsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Workouts',
          expectedRole: expectedRoleAll
        }
      },
      {
        path: 'workouts/builder',
        component: WorkoutBuilderComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Workout Builder',
          expectedRole: expectedRoleAll
        }
      },
      {
        path: 'workouts/builder/:id',
        component: WorkoutBuilderComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Workout Builder',
          expectedRole: expectedRoleAll
        }
      },
      // Step-by-step workout detail view — must stay AFTER the 'builder'
      // static-segment routes above, since ':id' would otherwise greedily
      // match '/dashboard/workouts/builder' as an id.
      {
        path: 'workouts/:id',
        loadComponent: () => import('../workouts/workout-detail/workout-detail.component').then(m => m.WorkoutDetailComponent),
        canActivate: [AuthGuard],
        data: {
          breadcrumb: { alias: 'workoutName' },
          expectedRole: expectedRoleAll
        }
      },

      // Exercise library — read-only browsing for any signed-in user
      {
        path: 'exercises',
        component: DashboardExercisesComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Exercises',
          expectedRole: expectedRoleAll
        }
      },

      // Exercise detail — placed after the static 'exercises' segment above,
      // same reasoning as workouts/:id vs workouts/builder.
      {
        path: 'exercises/:id',
        loadComponent: () => import('../dashboard/exercise-detail/exercise-detail.component').then(m => m.ExerciseDetailComponent),
        canActivate: [AuthGuard],
        data: {
          breadcrumb: { alias: 'exerciseName' },
          expectedRole: expectedRoleAll
        }
      },

      // Workouts assigned to me — now also the "Workouts" tab on
      // /dashboard/my-tasks. Kept as a standalone route because
      // my-workouts.component.html still deep-links here (and old bookmarks).
      {
        path: 'my-assigned-workouts',
        component: MyAssignedWorkoutsComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Assigned Workouts',
          expectedRole: expectedRoleAll
        }
      },

      // Partnership
      {
        path: 'partnership',
        component: PartnerRouteComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Partnership',
          expectedRole: expectedRoleAll
        },
        children: [
          { path: '', component: PartnerComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: null, expectedRole: expectedRoleAll } },
          { path: 'trainer-details', component: MyTrainerMainComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Trainer Details', expectedRole: expectedRoleAll } }
        ]
      },

      // ── HUB ──────────────────────────────────────────
      {
        path: 'hub',
        component: HubRouteComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: {
          breadcrumb: 'Hub',
          expectedRole: expectedRoleAll
        },
        children: [
          { path: '', component: HubMainComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: null, expectedRole: expectedRoleAll } },

          { path: 'users', loadChildren: () => import('../admin/users/users.module').then(m => m.UsersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Users', expectedRole: ['admin'] } },
          { path: 'newsletters', loadChildren: () => import('../admin/newsletters/newsletters.module').then(m => m.NewslettersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Newsletters', expectedRole: ['admin'] } },
          { path: 'partners', loadChildren: () => import('../admin/partners/partners.module').then(m => m.PartnersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Partners', expectedRole: ['admin'] } },
          { path: 'contact-us', loadChildren: () => import('../admin/contact-us/contact-us.module').then(m => m.ContactUsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Contact Us', expectedRole: ['admin'] } },
          { path: 'problem-reports', loadChildren: () => import('../admin/problem-reports/problem-reports.module').then(m => m.ProblemReportsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Problem Reports', expectedRole: ['admin'] } },
          { path: 'content-reports', loadChildren: () => import('../admin/content-reports/content-reports.module').then(m => m.ContentReportsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Content Reports', expectedRole: ['admin'] } },
          { path: 'trainers', loadChildren: () => import('../admin/trainers/trainers.module').then(m => m.TrainersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Trainers', expectedRole: ['admin'] } },
          { path: 'centers', loadChildren: () => import('../admin/centers/centers.module').then(m => m.CentersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Centers', expectedRole: ['admin'] } },
          { path: 'tags', loadChildren: () => import('../admin/tags/tags.module').then(m => m.TagsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Tags', expectedRole: ['admin'] } },
          { path: 'todo-lists', loadChildren: () => import('../admin/todo-lists/todo-lists.module').then(m => m.TodoListsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Todo Lists', expectedRole: ['admin'] } },
          { path: 'muscle-groups', loadChildren: () => import('../admin/muscle-groups/muscle-groups.module').then(m => m.MuscleGroupsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Muscle Groups', expectedRole: ['admin'] } },
          { path: 'exercises', loadChildren: () => import('../admin/exercises/exercises.module').then(m => m.ExercisesModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Exercises', expectedRole: ['admin'] } },
          { path: 'tasks', loadChildren: () => import('../admin/tasks/tasks.module').then(m => m.TasksModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Tasks', expectedRole: ['admin'] } },
          { path: 'sub-tasks', loadChildren: () => import('../admin/sub-tasks/sub-tasks.module').then(m => m.SubTasksModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Sub Tasks', expectedRole: ['admin'] } },
          { path: 'categories', loadChildren: () => import('../admin/categories/categories.module').then(m => m.CategoriesModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Categories', expectedRole: ['admin'] } },
          { path: 'clients', loadChildren: () => import('../admin/clients/clients.module').then(m => m.ClientsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Clients', expectedRole: ['admin'] } },
          { path: 'subscriptions', loadChildren: () => import('../admin/subscriptions/subscriptions.module').then(m => m.SubscriptionsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Subscriptions', expectedRole: ['admin'] } },
          { path: 'trainer-pricing', loadChildren: () => import('../admin/trainer-pricing/trainer-pricing.module').then(m => m.TrainerPricingModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Trainer Pricing', expectedRole: ['admin'] } },
          { path: 'center-pricing', loadChildren: () => import('../admin/center-pricing/center-pricing.module').then(m => m.CenterPricingModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Center Pricing', expectedRole: ['admin'] } },
          { path: 'equipments', loadComponent: () => import('../admin/equipment/equipment-page/equipment-page.component').then(m => m.EquipmentPageComponent), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Equipment', expectedRole: ['admin'] } },
          { path: 'testimonials', loadChildren: () => import('../admin/testimonials/testimonials.module').then(m => m.TestimonialsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Testimonials', expectedRole: ['admin'] } },
          { path: 'faqs', loadChildren: () => import('../admin/faqs/faqs.module').then(m => m.FaqsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'FAQs', expectedRole: ['admin'] } },
          { path: 'members', loadChildren: () => import('../admin/members/members.module').then(m => m.MembersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Members', expectedRole: ['admin'] } },
          { path: 'payments', loadChildren: () => import('../admin/payments/payments.module').then(m => m.PaymentsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Payments', expectedRole: ['admin'] } },
          { path: 'bookings', loadChildren: () => import('../admin/bookings/bookings.module').then(m => m.BookingsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Bookings', expectedRole: ['admin'] } },
          { path: 'settings', component: UserProfileSettingsComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Settings', expectedRole: expectedRoleAll } },
          { path: 'my-notifications', component: MyNotificationsPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Notifications', expectedRole: expectedRoleAll } },
          { path: 'my-tasks', component: MyTasksPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Tasks', expectedRole: expectedRoleAll } },
          { path: 'my-subscriptions', component: MySubscriptionsMainComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Subscriptions', expectedRole: expectedRoleAll } },
          { path: 'my-faqs', component: MyFaqsPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'FAQs', expectedRole: expectedRoleAll } },
          { path: 'my-todos', component: MyTodoListMainComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'To-do List', expectedRole: expectedRoleAll } },
          { path: 'my-bookings', component: MyBookingsMainComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'My Bookings', expectedRole: expectedRoleAll } },
          { path: 'my-provider-bookings', component: ProviderBookingsMainComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Bookings', expectedRole: ['trainer', 'center'] } },
          { path: 'liked-trainers', component: MyLikedTrainersComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Liked Trainers', expectedRole: expectedRoleAll } },
          { path: 'my-testimonials', component: MyTestimonialsPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'My Testimonials', expectedRole: expectedRoleAll } },
          { path: 'client-intake/new/:clientId', component: ClientIntakeFormComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'New Client Intake', expectedRole: ['trainer'] } },
          { path: 'client-intake/:id', component: ClientIntakeFormComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Client Intake', expectedRole: expectedRoleAll } },
          { path: 'my-client-intakes', component: MyClientIntakesComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Client Intakes', expectedRole: ['trainer'] } },

          { path: 'users', loadChildren: () => import('../admin/users/users.module').then(m => m.UsersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Users', expectedRole: ['admin'] } },
          { path: 'newsletters', loadChildren: () => import('../admin/newsletters/newsletters.module').then(m => m.NewslettersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Newsletters', expectedRole: ['admin'] } },
          { path: 'partners', loadChildren: () => import('../admin/partners/partners.module').then(m => m.PartnersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Partners', expectedRole: ['admin'] } },
          { path: 'contact-us', loadChildren: () => import('../admin/contact-us/contact-us.module').then(m => m.ContactUsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Contact Us', expectedRole: ['admin'] } },
          { path: 'problem-reports', loadChildren: () => import('../admin/problem-reports/problem-reports.module').then(m => m.ProblemReportsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Problem Reports', expectedRole: ['admin'] } },
          { path: 'trainers', loadChildren: () => import('../admin/trainers/trainers.module').then(m => m.TrainersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Trainers', expectedRole: ['admin'] } },
          { path: 'centers', loadChildren: () => import('../admin/centers/centers.module').then(m => m.CentersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Centers', expectedRole: ['admin'] } },
          { path: 'tags', loadChildren: () => import('../admin/tags/tags.module').then(m => m.TagsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Tags', expectedRole: ['admin'] } },
          { path: 'todo-lists', loadChildren: () => import('../admin/todo-lists/todo-lists.module').then(m => m.TodoListsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Todo Lists', expectedRole: ['admin'] } },
          { path: 'muscle-groups', loadChildren: () => import('../admin/muscle-groups/muscle-groups.module').then(m => m.MuscleGroupsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Muscle Groups', expectedRole: ['admin'] } },
          { path: 'exercises', loadChildren: () => import('../admin/exercises/exercises.module').then(m => m.ExercisesModule), canActivate: [AuthGuard], data: { breadcrumb: 'Exercises', expectedRole: ['admin'] } },
          { path: 'tasks', loadChildren: () => import('../admin/tasks/tasks.module').then(m => m.TasksModule), canActivate: [AuthGuard], data: { breadcrumb: 'Tasks', expectedRole: ['admin'] } },
          { path: 'sub-tasks', loadChildren: () => import('../admin/sub-tasks/sub-tasks.module').then(m => m.SubTasksModule), canActivate: [AuthGuard], data: { breadcrumb: 'Sub Tasks', expectedRole: ['admin'] } },
          { path: 'categories', loadChildren: () => import('../admin/categories/categories.module').then(m => m.CategoriesModule), canActivate: [AuthGuard], data: { breadcrumb: 'Categories', expectedRole: ['admin'] } },
          { path: 'clients', loadChildren: () => import('../admin/clients/clients.module').then(m => m.ClientsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Clients', expectedRole: ['admin'] } },
          { path: 'subscriptions', loadChildren: () => import('../admin/subscriptions/subscriptions.module').then(m => m.SubscriptionsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Subscriptions', expectedRole: ['admin'] } },
          { path: 'trainer-pricing', loadChildren: () => import('../admin/trainer-pricing/trainer-pricing.module').then(m => m.TrainerPricingModule), canActivate: [AuthGuard], data: { breadcrumb: 'Trainer Pricing', expectedRole: ['admin'] } },
          { path: 'center-pricing', loadChildren: () => import('../admin/center-pricing/center-pricing.module').then(m => m.CenterPricingModule), canActivate: [AuthGuard], data: { breadcrumb: 'Center Pricing', expectedRole: ['admin'] } },
          { path: 'equipments', loadComponent: () => import('../admin/equipment/equipment-page/equipment-page.component').then(m => m.EquipmentPageComponent), canActivate: [AuthGuard], data: { breadcrumb: 'Equipment', expectedRole: ['admin'] } },
          { path: 'testimonials', loadChildren: () => import('../admin/testimonials/testimonials.module').then(m => m.TestimonialsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Testimonials', expectedRole: ['admin'] } },
          { path: 'faqs', loadChildren: () => import('../admin/faqs/faqs.module').then(m => m.FaqsModule), canActivate: [AuthGuard], data: { breadcrumb: 'FAQs', expectedRole: ['admin'] } },
          { path: 'members', loadChildren: () => import('../admin/members/members.module').then(m => m.MembersModule), canActivate: [AuthGuard], data: { breadcrumb: 'Members', expectedRole: ['admin'] } },
          { path: 'payments', loadChildren: () => import('../admin/payments/payments.module').then(m => m.PaymentsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Payments', expectedRole: ['admin'] } },
          { path: 'bookings', loadChildren: () => import('../admin/bookings/bookings.module').then(m => m.BookingsModule), canActivate: [AuthGuard], data: { breadcrumb: 'Bookings', expectedRole: ['admin'] } },
          { path: 'settings', component: UserProfileSettingsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Settings', expectedRole: expectedRoleAll } },
          { path: 'my-notifications', component: MyNotificationsPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Notifications', expectedRole: expectedRoleAll } },
          { path: 'my-tasks', component: MyTasksPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Tasks', expectedRole: expectedRoleAll } },
          { path: 'my-subscriptions', component: MySubscriptionsMainComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Subscriptions', expectedRole: expectedRoleAll } },
          { path: 'my-faqs', component: MyFaqsPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'FAQs', expectedRole: expectedRoleAll } },
          { path: 'my-todos', component: MyTodoListMainComponent, canActivate: [AuthGuard], data: { breadcrumb: 'To-do List', expectedRole: expectedRoleAll } },
          { path: 'my-bookings', component: ManageBookingsComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Bookings', expectedRole: expectedRoleAll } },
          { path: 'my-provider-bookings', component: ProviderBookingsMainComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Bookings', expectedRole: ['trainer', 'center'] } },
          { path: 'liked-trainers', component: MyLikedTrainersComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Liked Trainers', expectedRole: expectedRoleAll } },
          { path: 'my-testimonials', component: MyTestimonialsPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'My Testimonials', expectedRole: expectedRoleAll } },
          { path: 'client-intake/new/:clientId', component: ClientIntakeFormComponent, canActivate: [AuthGuard], data: { breadcrumb: 'New Client Intake', expectedRole: ['trainer'] } },
          { path: 'client-intake/:id', component: ClientIntakeFormComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Client Intake', expectedRole: expectedRoleAll } },
          { path: 'my-client-intakes', component: MyClientIntakesComponent, canActivate: [AuthGuard], data: { breadcrumb: 'Client Intakes', expectedRole: ['trainer'] } },

          {
            path: 'partnership',
            component: PartnerRouteComponent,
            canActivate: [AuthGuard, RoleGuard],
            data: { breadcrumb: 'Partnership', expectedRole: expectedRoleAll },
            children: [
              { path: '', component: PartnerComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: null, expectedRole: expectedRoleAll } },
              { path: 'trainer-details', component: MyTrainerMainComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Trainer Details', expectedRole: expectedRoleAll } }
            ]
          }
        ]
      },

      // ── ADMIN (direct dashboard children, lazy-loaded) ────────────
      { path: 'users', loadChildren: () => import('../admin/users/users.module').then(m => m.UsersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Users', expectedRole: ['admin'] } },
      { path: 'newsletters', loadChildren: () => import('../admin/newsletters/newsletters.module').then(m => m.NewslettersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Newsletters', expectedRole: ['admin'] } },
      { path: 'partners', loadChildren: () => import('../admin/partners/partners.module').then(m => m.PartnersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Partners', expectedRole: ['admin'] } },
      { path: 'contact-us', loadChildren: () => import('../admin/contact-us/contact-us.module').then(m => m.ContactUsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Contact Us', expectedRole: ['admin'] } },
      { path: 'problem-reports', loadChildren: () => import('../admin/problem-reports/problem-reports.module').then(m => m.ProblemReportsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Problem Reports', expectedRole: ['admin'] } },
      { path: 'trainers', loadChildren: () => import('../admin/trainers/trainers.module').then(m => m.TrainersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Trainers', expectedRole: ['admin'] } },
      { path: 'centers', loadChildren: () => import('../admin/centers/centers.module').then(m => m.CentersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Centers', expectedRole: ['admin'] } },
      { path: 'tags', loadChildren: () => import('../admin/tags/tags.module').then(m => m.TagsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Tags', expectedRole: ['admin'] } },
      { path: 'todo-lists', loadChildren: () => import('../admin/todo-lists/todo-lists.module').then(m => m.TodoListsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Todo Lists', expectedRole: ['admin'] } },
      { path: 'muscle-groups', loadChildren: () => import('../admin/muscle-groups/muscle-groups.module').then(m => m.MuscleGroupsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Muscle Groups', expectedRole: ['admin'] } },
      // NOTE: `/dashboard/exercises` is now the read-only exercise library for
      // every signed-in user (see the DashboardExercisesComponent route above).
      // Admin exercise CRUD stays at `/dashboard/hub/exercises`, which is where
      // the hub cards link to — the duplicate direct child that used to sit here
      // was unlinked and would have been shadowed anyway.
      { path: 'tasks', loadChildren: () => import('../admin/tasks/tasks.module').then(m => m.TasksModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Tasks', expectedRole: ['admin'] } },
      { path: 'sub-tasks', loadChildren: () => import('../admin/sub-tasks/sub-tasks.module').then(m => m.SubTasksModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Sub Tasks', expectedRole: ['admin'] } },
      { path: 'categories', loadChildren: () => import('../admin/categories/categories.module').then(m => m.CategoriesModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Categories', expectedRole: ['admin'] } },
      { path: 'clients', loadChildren: () => import('../admin/clients/clients.module').then(m => m.ClientsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Clients', expectedRole: ['admin'] } },
      { path: 'subscriptions', loadChildren: () => import('../admin/subscriptions/subscriptions.module').then(m => m.SubscriptionsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Subscriptions', expectedRole: ['admin'] } },
      { path: 'trainer-pricing', loadChildren: () => import('../admin/trainer-pricing/trainer-pricing.module').then(m => m.TrainerPricingModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Trainer Pricing', expectedRole: ['admin'] } },
      { path: 'center-pricing', loadChildren: () => import('../admin/center-pricing/center-pricing.module').then(m => m.CenterPricingModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Center Pricing', expectedRole: ['admin'] } },
      { path: 'equipments', loadComponent: () => import('../admin/equipment/equipment-page/equipment-page.component').then(m => m.EquipmentPageComponent), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Equipment', expectedRole: ['admin'] } },
      { path: 'testimonials', loadChildren: () => import('../admin/testimonials/testimonials.module').then(m => m.TestimonialsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Testimonials', expectedRole: ['admin'] } },
      { path: 'faqs', loadChildren: () => import('../admin/faqs/faqs.module').then(m => m.FaqsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'FAQs', expectedRole: ['admin'] } },
      { path: 'members', loadChildren: () => import('../admin/members/members.module').then(m => m.MembersModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Members', expectedRole: ['admin'] } },
      { path: 'payments', loadChildren: () => import('../admin/payments/payments.module').then(m => m.PaymentsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Payments', expectedRole: ['admin'] } },
      { path: 'bookings', loadChildren: () => import('../admin/bookings/bookings.module').then(m => m.BookingsModule), canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Bookings', expectedRole: ['admin'] } },

      // Browse trainers/centers WITHOUT leaving the dashboard shell — any
      // signed-in user. Named distinctly from `trainers`/`centers` above,
      // which are the admin CRUD modules. Reuses the exact same public
      // feature modules (search + details) mounted at a second path; since
      // app.component.ts picks 'sidebar' layout for anything not matching
      // its topbar allowlist, this renders inside the dashboard chrome
      // automatically — no separate wrapper components needed.
      { path: 'find-providers', component: FindProvidersComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Find a Provider', expectedRole: expectedRoleAll } },
      { path: 'member-directory', component: DashboardMembersComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Members', expectedRole: expectedRoleAll } },
      { path: 'find-providers/category/:id/:name', component: DashboardCategoryDetailComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: { alias: 'categoryName' }, expectedRole: expectedRoleAll } },
      { path: 'find-trainers/:name', component: DashboardTrainerDetailComponent, canActivate: [AuthGuard, TrainerGuard], data: { breadcrumb: { alias: 'trainerName' }, expectedRole: expectedRoleAll } },
      { path: 'find-centers/:id/:name', component: DashboardCenterDetailComponent, canActivate: [AuthGuard, CenterGuard], data: { breadcrumb: { alias: 'centerName' }, expectedRole: expectedRoleAll } },

      // View another member's profile + timeline — dashboard-native
      // replacement for the public /user/:id page, linked from Members and
      // Connections so a signed-in user never has to leave the dashboard.
      {
        path: 'user/:username',
        loadComponent: () => import('./dashboard-user-profile/dashboard-user-profile.component').then(m => m.DashboardUserProfileComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { breadcrumb: 'Profile', expectedRole: expectedRoleAll }
      },

      // Timeline — compose box + Feed/My Timeline toggle (defaults to Feed).
      {
        path: 'timeline',
        loadComponent: () => import('./dashboard-timeline/dashboard-timeline.component').then(m => m.DashboardTimelineComponent),
        canActivate: [AuthGuard, RoleGuard],
        data: { breadcrumb: 'Timeline', expectedRole: expectedRoleAll }
      },
    ]
  }
];

@NgModule({
  imports: [
    DashboardModule,
    UserModule,
    MyNotificationsModule,
    MyTasksModule,
    MySubscriptionsModule,
    MyFaqsModule,
    MyBookingsModule,
    ClientIntakeModule,
    MyTodoListModule,
    WorkoutsModule,
    PartnerModule,
    MyTrainerModule,
    HubModule,
    MessagesModule,
    ConnectionsModule,
    RouterModule.forChild(dashboardRoutes),
  ]
})
export class DashboardFeatureModule { }
