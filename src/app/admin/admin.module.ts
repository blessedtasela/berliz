import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriesModule } from './categories/categories.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IconsModule } from '../icons/icons.module';
import { CentersModule } from './centers/centers.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { MuscleGroupsModule } from './muscle-groups/muscle-groups.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { PartnersModule } from './partners/partners.module';
import { TagsModule } from './tags/tags.module';
import { TodoListsModule } from './todo-lists/todo-lists.module';
import { TrainersModule } from './trainers/trainers.module';
import { UsersModule } from './users/users.module';
import { NavbarModule } from '../navbar/navbar.module';
import { FooterModule } from '../footer/footer.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    CategoriesModule,
    CentersModule,
    ContactUsModule,
    MuscleGroupsModule,
    NewslettersModule,
    PartnersModule,
    TagsModule,
    TodoListsModule,
    TrainersModule,
    UsersModule,
    NavbarModule,
    FooterModule
  ]
})
export class AdminModule { }
