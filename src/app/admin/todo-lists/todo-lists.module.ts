import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { FooterModule } from 'src/app/footer/footer.module';
import { IconsModule } from 'src/app/icons/icons.module';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { AddTodoModalComponent } from './add-todo-modal/add-todo-modal.component';
import { TodoListHeaderComponent } from './todo-list-header/todo-list-header.component';
import { TodoListListComponent } from './todo-list-list/todo-list-list.component';
import { TodoListsComponent } from './todo-lists/todo-lists.component';
import { UpdateTodoModalComponent } from './update-todo-modal/update-todo-modal.component';
import { TodoListDetailsModalComponent } from './todo-list-details-modal/todo-list-details-modal.component';
import { TodoListDetailPageComponent } from './todo-list-detail-page/todo-list-detail-page.component';
import { AdminSearchModule } from 'src/app/shared/admin-search/admin-search.module';
import { UserHoverCardComponent } from 'src/app/shared/user-hover-card/user-hover-card.component';
import { AuthGuard } from 'src/app/services/auth.guard';



@NgModule({
  declarations: [
    AddTodoModalComponent,
    TodoListHeaderComponent,
    TodoListListComponent,
    TodoListsComponent,
    UpdateTodoModalComponent,
    TodoListDetailsModalComponent,
    TodoListDetailPageComponent
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule,
    AdminSearchModule,
    UserHoverCardComponent,
    RouterModule.forChild([
      { path: '', component: TodoListsComponent },
      { path: ':id', component: TodoListDetailPageComponent, canActivate: [AuthGuard], data: { breadcrumb: 'To-do Details', expectedRole: ['admin'] } },
    ])
  ]
})
export class TodoListsModule { }
