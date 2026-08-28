import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TestimonialsComponent } from './testimonials/testimonials.component';
import { TestimonialsListComponent } from './testimonials-list/testimonials-list.component';
import { TestimonialsHeaderComponent } from './testimonials-header/testimonials-header.component';
import { TestimonialDetailsModalComponent } from './testimonial-details-modal/testimonial-details-modal.component';
import { TestimonialDetailPageComponent } from './testimonial-detail-page/testimonial-detail-page.component';
import { AddTestimonialsModalComponent } from './add-testimonials-modal/add-testimonials-modal.component';
import { UpdateTestimonialsModalComponent } from './update-testimonials-modal/update-testimonials-modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { UserHoverCardComponent } from 'src/app/shared/user-hover-card/user-hover-card.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { AuthGuard } from 'src/app/services/auth.guard';
import { RoleGuard } from 'src/app/services/role.guard';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';



@NgModule({
  declarations: [
    TestimonialsComponent,
    TestimonialsListComponent,
    TestimonialsHeaderComponent,
    TestimonialDetailsModalComponent,
    TestimonialDetailPageComponent,
    AddTestimonialsModalComponent,
    UpdateTestimonialsModalComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    FooterModule,
    NavbarModule,
    ReactiveFormsModule,
    FormsModule,
    IconsModule,
    UserHoverCardComponent,
    AdminSearchModule,
    RouterModule.forChild([
      { path: '', component: TestimonialsComponent },
      { path: ':id', component: TestimonialDetailPageComponent, canActivate: [AuthGuard, RoleGuard], data: { breadcrumb: 'Testimonial Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class TestimonialsModule { }
