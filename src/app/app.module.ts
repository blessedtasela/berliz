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
import { RouterModule } from '@angular/router';
import { ContactUsModule } from './contact-us/contact-us.module';
import { AppRoutingModule } from './app-routing.module';
import { CentersModule } from './centers/centers.module';
import { TrainersModule } from './trainers/trainers.module';
import { TestimonialModule } from './testimonial/testimonial.module';
import { LandingPageModule } from './landing/landing-page.module';
import { CategoriesModule } from './categories/categories.module';
import { AboutUsModule } from './about-us/about-us.module';
import { BlessedTaselaComponent } from './blessed-tasela/blessed-tasela.component';


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

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    ExamplePdfViewerComponent,
    BlessedTaselaComponent,
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
    RouterModule,
    AppRoutingModule,
    ContactUsModule,
    CentersModule,
    TrainersModule,
    TestimonialModule,
    LandingPageModule,
    CategoriesModule,
    AboutUsModule
  ],
  exports: [],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorInterceptor, multi: true },
    DatePipe
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
