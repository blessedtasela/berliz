import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BookingsComponent } from './bookings/bookings.component';
import { BookingsHeaderComponent } from './bookings-header/bookings-header.component';
import { BookingsListComponent } from './bookings-list/bookings-list.component';

import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { UserHoverCardComponent } from 'src/app/shared/user-hover-card/user-hover-card.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

@NgModule({
  declarations: [
    BookingsComponent,
    BookingsHeaderComponent,
    BookingsListComponent
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
    RouterModule.forChild([{ path: '', component: BookingsComponent }])
  ]
})
export class BookingsModule { }
