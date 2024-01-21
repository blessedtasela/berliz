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
import { ActivateAccountComponent } from './dashboard/user/activate-account/activate-account.component';
import { ProgressPageComponent } from './dashboard/user/progress/progress-page/progress-page.component';
import { ResetPasswordComponent } from './dashboard/user/reset-password/reset-password.component';
import { RunNowPageComponent } from './dashboard/user/run-now/run-now-page/run-now-page.component';
import { PartnerPageComponent } from './dashboard/partner/partner-page/partner-page.component';
import { ProfilePageComponent } from './dashboard/user/profile-page/profile-page.component';
import { ProfileSettingsComponent } from './dashboard/user/profile-settings/profile-settings.component';
import { MyTodosComponent } from './dashboard/todo-lists/my-todos/my-todos.component';
import { CategoryComponent } from './admin/categories/category/category.component';
import { AdminContactUsComponent } from './admin/contact-us/admin-contact-us/admin-contact-us.component';
import { UsersComponent } from './admin/users/users/users.component';
import { TagsComponent } from './admin/tags/tags/tags.component';
import { NewslettersComponent } from './admin/newsletters/newsletters/newsletters.component';
import { PartnersComponent } from './admin/partners/partners/partners.component';
import { TodoListsComponent } from './admin/todo-lists/todo-lists/todo-lists.component';
import { MuscleGroupsComponent } from './admin/muscle-groups/muscle-groups/muscle-groups.component';
import { ExercisesComponent } from './admin/exercises/exercises/exercises.component';
import { WorkspaceComponent } from './dashboard/workspace/workspace.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { TasksComponent } from './admin/tasks/tasks/tasks.component';
import { MyNotificationsPageComponent } from './my-notifications/my-notifications-page/my-notifications-page.component';
import { MySubscriptionsPageComponent } from './my-subscriptions/my-subscriptions-page/my-subscriptions-page.component';
import { MyFaqsPageComponent } from './my-faqs/my-faqs-page/my-faqs-page.component';
import { MyTasksPageComponent } from './my-tasks/my-tasks-page/my-tasks-page.component';
import { TrainersComponent } from './admin/trainers/trainers/trainers.component';
import { LoginComponent } from './login/login/login.component';
import { MainComponent } from './dashboard/main/main.component';
import { CentersComponent } from './admin/centers/centers/centers.component';
import { ClientsComponent } from './admin/clients/clients/clients.component';
import { WorkspaceRouteComponent } from './dashboard/workspace-route/workspace-route.component';
import { SignupComponent } from './login/signup/signup.component';
import { SubscriptionsComponent } from './admin/subscriptions/subscriptions/subscriptions.component';
import { TrainerPricingComponent } from './admin/trainer-pricing/trainer-pricing/trainer-pricing.component';
import { QuickSignupComponent } from './login/quick-signup/quick-signup.component';
import { BreadcrumbService } from 'xng-breadcrumb';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: LandingPageComponent },
  { path: 'contact', component: ContactUsPageComponent },
  { path: 'contact-us', redirectTo: 'contact' },
  { path: 'about', component: AboutUsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignupComponent },
  { path: 'quick-sign-up', component: QuickSignupComponent },
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
        'center', 'driver', 'store', 'client',],
    },
    children: [
      // user components
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: '', component: MainComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        },
      },
      {
        path: 'workspace', component: WorkspaceRouteComponent,
        canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        },
        children: [
          // admin components #protected
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full',
          },
          {
            path: '', component: WorkspaceComponent,
            canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            },
          },
          {
            path: 'users', component: UsersComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'newsletters', component: NewslettersComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'partners', component: PartnersComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'contact-us', component: AdminContactUsComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'trainers', component: TrainersComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'centers', component: CentersComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'tags', component: TagsComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'todo-lists', component: TodoListsComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'muscle-groups', component: MuscleGroupsComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'exercises', component: ExercisesComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'tasks', component: TasksComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'categories', component: CategoryComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            },
          },
          {
            path: 'clients', component: ClientsComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            },
          },
          {
            path: 'subscriptions', component: SubscriptionsComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            },
          },
          {
            path: 'trainer-pricing', component: TrainerPricingComponent, canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin']
            },
          },

          // users protected routes
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
            path: 'my-notifications', component: MyNotificationsPageComponent,
            canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
          {
            path: 'my-tasks', component: MyTasksPageComponent,
            canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
          {
            path: 'my-subscriptions', component: MySubscriptionsPageComponent,
            canActivate: [RouteGuardService],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
          {
            path: 'my-faqs', component: MyFaqsPageComponent,
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
        ],
      },

      // users protected routes
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
        path: 'my-notifications', component: MyNotificationsPageComponent,
        canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        path: 'my-tasks', component: MyTasksPageComponent,
        canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        path: 'my-subscriptions', component: MySubscriptionsPageComponent,
        canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        path: 'my-faqs', component: MyFaqsPageComponent,
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

      // admin components #protected
      {
        path: 'users', component: UsersComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'newsletters', component: NewslettersComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'partners', component: PartnersComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'contact-us', component: AdminContactUsComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'trainers', component: TrainersComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'centers', component: CentersComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'tags', component: TagsComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'todo-lists', component: TodoListsComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'muscle-groups', component: MuscleGroupsComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'exercises', component: ExercisesComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'tasks', component: TasksComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'categories', component: CategoryComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        },
      },
      {
        path: 'clients', component: ClientsComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        },
      },
      {
        path: 'subscriptions', component: SubscriptionsComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        },
      },
      {
        path: 'trainer-pricing', component: TrainerPricingComponent, canActivate: [RouteGuardService],
        data: {
          expectedRole: ['admin']
        },
      },
    ],
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
