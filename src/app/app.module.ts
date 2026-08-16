import { ErrorHandler, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollModule } from './scroll/scroll.module';
import { NgxUiLoaderConfig, SPINNER, NgxUiLoaderModule } from 'ngx-ui-loader';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ExamplePdfViewerComponent } from './example-pdf-viewer/example-pdf-viewer.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SharedModule } from './shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { DashboardModule } from './dashboard/dashboard.module';
import { RouterModule, UrlSerializer } from '@angular/router';
import { ContactUsModule } from './contact-us/contact-us.module';
import { AppRoutingModule, routes } from './app-routing.module';
import { CentersModule } from './centers/centers.module';
import { TrainersModule } from './trainers/trainers.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { BookingModule } from './booking/booking.module';
import { MyBookingsModule } from './bookings/bookings.module';
import { ClientIntakeModule } from './client-intake/client-intake.module';
import { EquipmentsModule } from './equipments/equipments.module';
import { LandingPageModule } from './landing/landing-page.module';
import { CategoriesModule } from './categories/categories.module';
import { AboutUsModule } from './about-us/about-us.module';
import { RxStompService } from './services/rx-stomp.service';
import { rxStompServiceFactory } from './rx-stomp-service-factory';
import { DBConfig } from 'ngx-indexed-db';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { MyTasksModule } from './my-tasks/my-tasks.module';
import { MySubscriptionsModule } from './my-subscriptions/my-subscriptions.module';
import { MyNotificationsModule } from './my-notifications/my-notifications.module';
import { MyFaqsModule } from './my-faqs/my-faqs.module';
import { FaqsModule } from './faqs/faqs.module';
import { HelpCenterModule } from './help-center/help-center.module';
import { ReportProblemModule } from './report-problem/report-problem.module';
import { RefreshTokenOverlayComponent } from './refresh-token-overlay/refresh-token-overlay.component';
import { ResfreshTokenModalComponent } from './resfresh-token-modal/resfresh-token-modal.component';
import { NavbarModule } from './navbar/navbar.module';
import { FooterModule } from './footer/footer.module';
import { LoginModule } from './login/login.module';
import { RouterBreadcrumbComponent } from './router-breadcrumb/router-breadcrumb.component';
import { BreadcrumbModule, BreadcrumbService } from 'xng-breadcrumb';
import { PartnerModule } from './partner/partner.module';
import { UrlLowerCaseSerializer } from 'url-lower-case-serializer';
import { NgxFileDropModule } from 'ngx-file-drop';
import { UnderConstructionPageComponent } from './under-construction-page/under-construction-page.component';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';
import { TimeAgoPipe } from './shared/pipes/time-ago.pipe';
import { AuthInterceptor } from './services/auth.interceptor';
import { HubModule } from './hub/hub.module';
import { UserModule } from './user/user.module';
import { MyTodoListModule } from './my-todo-list/my-todo-list.module';
import { MyTrainerModule } from './my-trainer/my-trainer.module';
import { GlobalErrorHandlerService } from './services/global-error-handler.service';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { WebSocketService } from './services/web-socket.service';
import * as fromTrainer from './state/trainer/trainer.reducer';
import { TrainerEffects } from './state/trainer/trainer.effects';
import { ProductsModule } from './products/products.module';
import { userFeatureKey, userReducer } from './state/user/user.reducer';
import { categoryFeatureKey, categoryReducer } from './state/category/category.reducer';
import { trainerFeatureKey, trainerReducer } from './state/trainer/trainer.reducer';
import { centerFeatureKey, centerReducer } from './state/center/center.reducer';
import { notificationFeatureKey, notificationReducer } from './state/notification/notification.reducer';
import { CategoryEffects } from './state/category/category.effects';
import { CenterEffects } from './state/center/center.effects';
import { NotificationEffects } from './state/notification/notification.effects';
import { UserEffects } from './state/user/user.effects';
import { partnerFeatureKey, partnerReducer } from './state/partner/partner.reducer';
import { PartnerEffects } from './state/partner/partner.effects';
import { subscriptionFeatureKey, subscriptionReducer } from './state/subscription/subscription.reducer';
import { SubscriptionEffects } from './state/subscription/subscription.effects';
import { taskFeatureKey, taskReducer } from './state/task/task.reducer';
import { TaskEffects } from './state/task/task.effects';
import { todoFeatureKey, todoReducer } from './state/todo/todo.reducer';
import { TodoEffects } from './state/todo/todo.effects';
import { exerciseFeatureKey, exerciseReducer } from './state/exercise/exercise.reducer';
import { ExerciseEffects } from './state/exercise/exercise.effects';
import { muscleGroupFeatureKey, muscleGroupReducer } from './state/muscle-group/muscle-group.reducer';
import { MuscleGroupEffects } from './state/muscle-group/muscle-group.effects';
import { newsletterFeatureKey, newsletterReducer } from './state/newsletter/newsletter.reducer';
import { NewsletterEffects } from './state/newsletter/newsletter.effects';
import { tagFeatureKey, tagReducer } from './state/tag/tag.reducer';
import { TagEffects } from './state/tag/tag.effects';
import { contactUsFeatureKey, contactUsReducer } from './state/contact-us/contact-us.reducer';
import { ContactUsEffects } from './state/contact-us/contact-us.effects';
import { clientFeatureKey, clientReducer } from './state/client/client.reducer';
import { ClientEffects } from './state/client/client.effects';
import { dashboardFeatureKey, dashboardReducer } from './state/dashboard/dashboard.reducer';
import { DashboardEffects } from './state/dashboard/dashboard.effects';
import { testimonialFeatureKey, testimonialReducer } from './state/testimonial/testimonial.reducer';
import { TestimonialEffects } from './state/testimonial/testimonial.effects';
import { bookingFeatureKey, bookingReducer } from './state/booking/booking.reducer';
import { BookingEffects } from './state/booking/booking.effects';
import { availabilityFeatureKey, availabilityReducer } from './state/availability/availability.reducer';
import { AvailabilityEffects } from './state/availability/availability.effects';
import { faqFeatureKey, faqReducer } from './state/faq/faq.reducer';
import { FaqEffects } from './state/faq/faq.effects';
import { planFeatureKey, planReducer } from './state/plan/plan.reducer';
import { PlanEffects } from './state/plan/plan.effects';
import { paymentFeatureKey, paymentReducer } from './state/payment/payment.reducer';
import { PaymentEffects } from './state/payment/payment.effects';
import { memberFeatureKey, memberReducer } from './state/member/member.reducer';
import { MemberEffects } from './state/member/member.effects';
import { workoutFeatureKey, workoutReducer } from './state/workout/workout.reducer';
import { WorkoutEffects } from './state/workout/workout.effects';
import { userProfileFeatureKey, userProfileReducer } from './state/user-profile/user-profile.reducer';
import { UserProfileEffects } from './state/user-profile/user-profile.effects';
import { analyticsFeatureKey, analyticsReducer } from './state/analytics/analytics.reducer';
import { AnalyticsEffects } from './state/analytics/analytics.effects';
import { progressShareFeatureKey, progressShareReducer } from './state/progress-share/progress-share.reducer';
import { ProgressShareEffects } from './state/progress-share/progress-share.effects';
import { payoutFeatureKey, payoutReducer } from './state/payout/payout.reducer';
import { PayoutEffects } from './state/payout/payout.effects';
import { clientIntakeFeatureKey, clientIntakeReducer } from './state/client-intake/client-intake.reducer';
import { ClientIntakeEffects } from './state/client-intake/client-intake.effects';
import { WorkoutsModule } from './workouts/workouts.module';


export const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  text: 'Loading...',
  textColor: 'white',
  textPosition: 'center-center',

  // Foreground spinner — soft warm white, not red
  fgsColor: 'white',
  fgsType: SPINNER.squareJellyBox,
  fgsSize: 52,

  // No background spinner
  bgsColor: 'transparent',
  bgsOpacity: 0,

  // Overlay — dark gray, subtle blur (not heavy)
  overlayColor: 'rgba(32, 32, 34, 0.45)',   // gray-900 / 45% — lighter than before
  overlayBorderRadius: '0',

  hasProgressBar: false,
  blur: 2,          // was 4 — reduced to stay subtle
  gap: 20,
  fastFadeOut: true,
};

const dbConfig: DBConfig = {
  name: 'BerlizClient',
  version: 1,
  objectStoresMeta: [{
    store: 'notifications',
    storeConfig: { keyPath: 'id', autoIncrement: true },
    storeSchema: [
      { name: 'message', keypath: 'name', options: { unique: false } },
      { name: 'email', keypath: 'email', options: { unique: false } },
      { name: 'role', keypath: 'role', options: { unique: false } },
      { name: 'date', keypath: 'date', options: { unique: false } },
    ]
  }]
};


@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    ExamplePdfViewerComponent,
    RefreshTokenOverlayComponent,
    ResfreshTokenModalComponent,
    RouterBreadcrumbComponent,
    UnderConstructionPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ScrollModule,
    HttpClientModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    MatSnackBarModule,
    FormsModule,
    ProductsModule,
    MatDialogModule,
    NgxExtendedPdfViewerModule,
    SharedModule,
    FeatherModule,
    DashboardModule,
    PartnerModule,
    RouterModule,
    AppRoutingModule,
    ContactUsModule,
    CentersModule,
    TrainersModule,
    TestimonialModule,
    BookingModule,
    MyBookingsModule,
    ClientIntakeModule,
    EquipmentsModule,
    LandingPageModule,
    CategoriesModule,
    AboutUsModule,
    MyTasksModule,
    MySubscriptionsModule,
    MyNotificationsModule,
    MyFaqsModule,
    FaqsModule,
    HelpCenterModule,
    ReportProblemModule,
    NavbarModule,
    FooterModule,
    LoginModule,
    BreadcrumbModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    NgxFileDropModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    HubModule,
    UserModule,
    MyTodoListModule,
    MySubscriptionsModule,
    MyTrainerModule,
    WorkoutsModule,

    // Store and Effects Modules for NgRx
    StoreModule.forRoot({}),
    EffectsModule.forRoot([UserEffects, CategoryEffects, TrainerEffects, CenterEffects, NotificationEffects, PartnerEffects, SubscriptionEffects, TaskEffects, TodoEffects, ExerciseEffects, MuscleGroupEffects, NewsletterEffects, TagEffects, ContactUsEffects, ClientEffects, DashboardEffects, TestimonialEffects, PaymentEffects, MemberEffects, WorkoutEffects, AnalyticsEffects, UserProfileEffects, FaqEffects, BookingEffects, AvailabilityEffects, PlanEffects, ProgressShareEffects, PayoutEffects, ClientIntakeEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: !isDevMode(),
    }),
    StoreModule.forFeature(userFeatureKey, userReducer),
    StoreModule.forFeature(categoryFeatureKey, categoryReducer),
    StoreModule.forFeature(trainerFeatureKey, trainerReducer),
    StoreModule.forFeature(centerFeatureKey, centerReducer),
    StoreModule.forFeature(notificationFeatureKey, notificationReducer),
    StoreModule.forFeature(partnerFeatureKey, partnerReducer),
    StoreModule.forFeature(subscriptionFeatureKey, subscriptionReducer),
    StoreModule.forFeature(taskFeatureKey, taskReducer),
    StoreModule.forFeature(todoFeatureKey, todoReducer),
    StoreModule.forFeature(exerciseFeatureKey, exerciseReducer),
    StoreModule.forFeature(muscleGroupFeatureKey, muscleGroupReducer),
    StoreModule.forFeature(newsletterFeatureKey, newsletterReducer),
    StoreModule.forFeature(tagFeatureKey, tagReducer),
    StoreModule.forFeature(contactUsFeatureKey, contactUsReducer),
    StoreModule.forFeature(clientFeatureKey, clientReducer),
    StoreModule.forFeature(dashboardFeatureKey, dashboardReducer),
    StoreModule.forFeature(testimonialFeatureKey, testimonialReducer),
    StoreModule.forFeature(bookingFeatureKey, bookingReducer),
    StoreModule.forFeature(availabilityFeatureKey, availabilityReducer),
    StoreModule.forFeature(faqFeatureKey, faqReducer),
    StoreModule.forFeature(planFeatureKey, planReducer),
    StoreModule.forFeature(paymentFeatureKey, paymentReducer),
    StoreModule.forFeature(memberFeatureKey, memberReducer),
    StoreModule.forFeature(workoutFeatureKey, workoutReducer),
    StoreModule.forFeature(userProfileFeatureKey, userProfileReducer),
    StoreModule.forFeature(analyticsFeatureKey, analyticsReducer),
    StoreModule.forFeature(progressShareFeatureKey, progressShareReducer),
    StoreModule.forFeature(payoutFeatureKey, payoutReducer),
    StoreModule.forFeature(clientIntakeFeatureKey, clientIntakeReducer),

  ],
  exports: [],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: RxStompService,
      useFactory: rxStompServiceFactory,
    },
    {
      provide: UrlSerializer,
      useClass: UrlLowerCaseSerializer
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandlerService
    },
    BreadcrumbService,
    DatePipe,
    WebSocketService,
  ],

  bootstrap: [AppComponent],
})
export class AppModule { }
