import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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



@NgModule({
  declarations: [
    AddTodoModalComponent,
    TodoListHeaderComponent,
    TodoListListComponent,
    TodoListsComponent,
    UpdateTodoModalComponent
  ],

  imports: [
    CommonModule,
    IconsModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    FooterModule,
    NavbarModule
  ]
})
export class TodoListsModule { }
