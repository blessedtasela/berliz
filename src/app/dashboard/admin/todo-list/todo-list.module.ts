import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListComponent } from './todo-list/todo-list.component';
import { AddTodoComponent } from './add-todo/add-todo.component';
import { UpdateTodoComponent } from './update-todo/update-todo.component';
import { UpdateTodoStatusComponent } from './update-todo-status/update-todo-status.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Icons } from 'angular-feather/lib/icons.provider';
import { IconsModule } from 'src/app/icons/icons.module';



@NgModule({
  declarations: [
    TodoListComponent,
    AddTodoComponent,
    UpdateTodoComponent,
    UpdateTodoStatusComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconsModule
  ]
})
export class TodoListModule { }
