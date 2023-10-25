import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from 'src/app/icons/icons.module';
import { PartnersModule } from './partners/partners.module';
import { CategoriesModule } from './categories/categories.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { TagsModule } from './tags/tags.module';
import { UsersModule } from './users/users.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { TrainersModule } from './trainers/trainers.module';
import { CentersModule } from './centers/centers.module';
@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    PartnersModule,
    CategoriesModule,
    ContactUsModule,
    NewslettersModule,
    TagsModule,
    UsersModule,
    TrainersModule,
    CentersModule
  ],
  providers: [DatePipe,]
})
export class AdminModule { }
