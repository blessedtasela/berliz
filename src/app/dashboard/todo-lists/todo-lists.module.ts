import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListComponent } from './todo-list/todo-list.component';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { EditTodoComponent } from './edit-todo/edit-todo.component';
import { MyTodosComponent } from './my-todos/my-todos.component';

@NgModule({
  declarations: [
    TodoListComponent,
    TodoFormComponent,
    EditTodoComponent,
    MyTodosComponent
  ],
  imports: [
    CommonModule,
    NavbarModule,
    FooterModule,
    ReactiveFormsModule,
    FormsModule,
    IconsModule
  ]
})
export class TodoListsModule { }
