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
import { TasksComponent } from './admin/tasks/tasks/tasks.component';
import { MyNotificationsPageComponent } from './my-notifications/my-notifications-page/my-notifications-page.component';
import { MySubscriptionsPageComponent } from './my-subscriptions/my-subscriptions-page/my-subscriptions-page.component';
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
  { path: 'services', component: CategoriesComponent },
  { path: 'services/:id/:name', component: CategoryDetailsComponent, canActivate: [CategoryGuard] },
  { path: 'testimonials', component: TestimonialPageComponent },
  { path: 'equipments', component: EquipmentPageComponent },
  { path: 'exercises', component: ExercisesPageComponent },
  { path: 'report-problem', component: ReportProblemPageComponent },
  { path: 'faqs', component: FaqsPageComponent },
  { path: 'help-center', component: HelpCenterPageComponent },
  { path: 'terms', component: TermsPageComponent },
  { path: 'privacy', component: PrivacyPageComponent },
  { path: 'login/reset-password', component: ResetPasswordComponent },
  { path: 'login/activate-account', component: ActivateAccountComponent },

  // dashboard protected components
  {
    path: 'dashboard', component: DashboardRouteComponent,
    canActivate: [AuthGuard],
    data: {
      expectedRole: ['admin', 'user', 'partner', 'trainer',
        'center', 'driver', 'store', 'client',],
    },
    children: [
      // users components
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
      {
        path: '', component: DashboardMainComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        },
      },

      // Dashboard Hub components #protected
      {
        path: 'hub', component: HubRouteComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        },
        children: [
          // hub components #protected
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full',
          },
          {
            path: '', component: HubMainComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            },
          },
          {
            path: 'users', component: UsersComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'newsletters', component: NewslettersComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'partners', component: PartnersComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'contact-us', component: AdminContactUsComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'trainers', component: TrainersComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'centers', component: CentersComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'tags', component: TagsComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'todo-lists', component: TodoListsComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'muscle-groups', component: MuscleGroupsComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'exercises', component: ExercisesComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'tasks', component: TasksComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            }
          },
          {
            path: 'services', component: CategoryComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            },
          },
          {
            path: 'clients', component: ClientsComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            },
          },
          {
            path: 'subscriptions', component: SubscriptionsComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            },
          },
          {
            path: 'trainer-pricing', component: TrainerPricingComponent, canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin']
            },
          },
          {
            // hub components #protected
            path: 'partnership', component: PartnerRouteComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            },
            children: [
              {
                path: '',
                redirectTo: '',
                pathMatch: 'full',
              },
              {
                path: '', component: PartnerComponent,
                canActivate: [AuthGuard],
                data: {
                  expectedRole: ['admin', 'user', 'partner', 'trainer',
                    'center', 'driver', 'store', 'client',]
                },
              },
              {
                path: 'trainer-details', component: TrainerDetailsComponent,
                canActivate: [AuthGuard],
                data: {
                  expectedRole: ['admin', 'user', 'partner', 'trainer',
                    'center', 'driver', 'store', 'client',]
                },
              },
            ],
          },
          // users protected routes


          // User profile and settings #protected
          {
            path: 'settings', component: UserProfileSettingsComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },

          {
            path: 'my-notifications', component: MyNotificationsPageComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
          {
            path: 'my-tasks', component: MyTasksPageComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
          {
            path: 'my-subscriptions', component: MySubscriptionsPageComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
          {
            path: 'my-faqs', component: MyFaqsPageComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
          {
            path: 'my-todos', component: MyTodosComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
        ],
      },
      // User profile and settings routes #protected
      {

        path: '', component: UserRouteComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        },
        children: [
          // profile components #protected
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full',
          },
          {
            path: '', component: UserProfileComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            },
          },
          {
            path: 'profile', component: UserProfileComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            },
          },
          {
            path: 'settings', component: UserProfileSettingsComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            }
          },
        ],
      },

      // users protected routes
      {
        path: 'profile', component: UserProfileComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        // partnership components #protected
        path: 'partnership', component: PartnerRouteComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        },
        children: [
          {
            path: '',
            redirectTo: '',
            pathMatch: 'full',
          },
          {
            path: '', component: PartnerComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            },
          },
          {
            path: 'trainer-details', component: TrainerDetailsComponent,
            canActivate: [AuthGuard],
            data: {
              expectedRole: ['admin', 'user', 'partner', 'trainer',
                'center', 'driver', 'store', 'client',]
            },
          },
        ],
      },
      {
        path: 'settings', component: UserProfileSettingsComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        path: 'my-notifications', component: NotificationMainComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        path: 'my-tasks', component: MyTasksPageComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        path: 'my-subscriptions', component: MySubscriptionsPageComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        path: 'my-faqs', component: MyFaqsPageComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },
      {
        path: 'my-todos', component: MyTodosComponent,
        canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin', 'user', 'partner', 'trainer',
            'center', 'driver', 'store', 'client',]
        }
      },

      // admin components #protected
      {
        path: 'users', component: UsersComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'newsletters', component: NewslettersComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'partners', component: PartnersComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'contact-us', component: AdminContactUsComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'trainers', component: TrainersComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'centers', component: CentersComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'tags', component: TagsComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'todo-lists', component: TodoListsComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'muscle-groups', component: MuscleGroupsComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'exercises', component: ExercisesComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'tasks', component: TasksComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        }
      },
      {
        path: 'services', component: CategoryComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        },
      },
      {
        path: 'clients', component: ClientsComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        },
      },
      {
        path: 'subscriptions', component: SubscriptionsComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        },
      },
      {
        path: 'trainer-pricing', component: TrainerPricingComponent, canActivate: [AuthGuard],
        data: {
          expectedRole: ['admin']
        },
      },
    ],
  },

  // nested components
  {
    path: 'shop', component: ProductsPageComponent, children: productChildRoutes
  },

  //handles other exceptions
  { path: '**', component: PageNotFoundComponent },

]

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // Restore the last scroll position
      scrollPositionRestoration: 'enabled',

      // Enable scrolling to anchors
      anchorScrolling: "enabled",
    }
    ),
    ProductsModule,
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AuthGuard,
  ]
})
export class AppRoutingModule { }
