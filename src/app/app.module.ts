import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScrollModule } from './scroll/scroll.module';
import { NgxUiLoaderConfig, SPINNER, NgxUiLoaderModule } from 'ngx-ui-loader';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TokenInterceptorInterceptor } from './services/token-interceptor.interceptor';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { ExamplePdfViewerComponent } from './example-pdf-viewer/example-pdf-viewer.component';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SharedModule } from './shared/shared.module';
import { FeatherModule } from 'angular-feather';
import { DashboardModule } from './dashboard/dashboard.module';
import { RouterModule, UrlSerializer } from '@angular/router';
import { ContactUsModule } from './contact-us/contact-us.module';
import { AppRoutingModule } from './app-routing.module';
import { CentersModule } from './centers/centers.module';
import { TrainersModule } from './trainers/trainers.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { LandingPageModule } from './landing/landing-page.module';
import { CategoriesModule } from './categories/categories.module';
import { AboutUsModule } from './about-us/about-us.module';
import { RxStompService } from './services/rx-stomp.service';
import { rxStompServiceFactory } from './rx-stomp-service-factory';
import { DBConfig } from 'ngx-indexed-db';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { AdminModule } from './admin/admin.module';
import { MyTasksModule } from './my-tasks/my-tasks.module';
import { MySubscriptionsModule } from './my-subscriptions/my-subscriptions.module';
import { MyNotificationsModule } from './my-notifications/my-notifications.module';
import { MyFaqsModule } from './my-faqs/my-faqs.module';
import { RefreshTokenOverlayComponent } from './refresh-token-overlay/refresh-token-overlay.component';
import { ResfreshTokenModalComponent } from './resfresh-token-modal/resfresh-token-modal.component';
import { NavbarModule } from './navbar/navbar.module';
import { FooterModule } from './footer/footer.module';
import { LoginModule } from './login/login.module';
import { RouterBreadcrumbComponent } from './router-breadcrumb/router-breadcrumb.component';
import { BreadcrumbModule, BreadcrumbService } from 'xng-breadcrumb';
import { PartnerModule } from './partner/partner.module';
import { TrainerModule } from './trainer/trainer.module';
import { UrlLowerCaseSerializer } from 'url-lower-case-serializer';
import { NgxFileDropModule } from 'ngx-file-drop';

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  text: "Loading....",
  textColor: "#FFFFFF",
  textPosition: "center-center",
  bgsColor: "gray",
  fgsColor: "gray",
  fgsType: SPINNER.squareJellyBox,
  fgsSize: 100,
  hasProgressBar: false
}

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
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ScrollModule,
    HttpClientModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    MatSnackBarModule,
    FormsModule,
    MatDialogModule,
    NgxExtendedPdfViewerModule,
    SharedModule,
    FeatherModule,
    DashboardModule,
    PartnerModule,
    TrainerModule,
    RouterModule,
    AppRoutingModule,
    ContactUsModule,
    CentersModule,
    TrainersModule,
    TestimonialModule,
    LandingPageModule,
    CategoriesModule,
    AboutUsModule,
    AdminModule,
    MyTasksModule,
    MySubscriptionsModule,
    MyNotificationsModule,
    MyFaqsModule,
    NavbarModule,
    FooterModule,
    LoginModule,
    BreadcrumbModule,
    NgxIndexedDBModule.forRoot(dbConfig),
    NgxFileDropModule,
  ],
  exports: [],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorInterceptor,
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
    BreadcrumbService,
    DatePipe,

  ],

  bootstrap: [AppComponent],
})
export class AppModule { }
