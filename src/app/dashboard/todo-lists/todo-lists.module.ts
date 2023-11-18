import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodoListPageComponent } from './todo-list-page/todo-list-page.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { EditTodoComponent } from './edit-todo/edit-todo.component';



@NgModule({
  declarations: [
    TodoListPageComponent,
    TodoListComponent,
    TodoFormComponent,
    EditTodoComponent
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
