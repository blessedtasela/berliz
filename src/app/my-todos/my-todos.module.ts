import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyTodosComponent } from './my-todos/my-todos.component';
import { EditMyTodosComponent } from './edit-my-todos/edit-my-todos.component';
import { MyTodosFormComponent } from './my-todos-form/my-todos-form.component';
import { SearchMyTodosComponent } from './search-my-todos/search-my-todos.component';
import { MyTodosListComponent } from './my-todos-list/my-todos-list.component';



@NgModule({
  declarations: [
    MyTodosComponent,
    EditMyTodosComponent,
    MyTodosFormComponent,
    SearchMyTodosComponent,
    MyTodosListComponent
  ],
  imports: [
    CommonModule
  ]
})
export class MyTodosModule { }
