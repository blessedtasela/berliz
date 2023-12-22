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
import { ExercisesModule } from './exercises/exercises.module';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AdminPanelDetailsComponent } from './admin-panel-details/admin-panel-details.component';
import { ClientsModule } from './clients/clients.module';
import { MembersModule } from './members/members.module';
import { PaymentsModule } from './payments/payments.module';
import { SubTasksModule } from './sub-tasks/sub-tasks.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { TasksModule } from './tasks/tasks.module';
import { TestimonialsModule } from './testimonials/testimonials.module';



@NgModule({
  declarations: [
    AdminPanelComponent,
    AdminPanelDetailsComponent
  ],
  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    NavbarModule,
    FooterModule,
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
    ExercisesModule,
    ClientsModule,
    MembersModule,
    PaymentsModule,
    SubTasksModule,
    SubscriptionsModule,
    TasksModule,
    TestimonialsModule
  ]
})
export class AdminModule { }
