import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarModule } from 'src/app/navbar/navbar.module';
import { FooterModule } from 'src/app/footer/footer.module';
import { TodoFormComponent } from './todo-form/todo-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IconsModule } from 'src/app/icons/icons.module';
import { EditTodoComponent } from './edit-todo/edit-todo.component';
import { SearchTodoComponent } from './search-todo/search-todo.component';
import { ClickablePhotoDirective } from 'src/app/shared/photo-lightbox/clickable-photo.directive';

@NgModule({
  declarations: [
    TodoFormComponent,
    EditTodoComponent,
    SearchTodoComponent
  ],
  imports: [
    ClickablePhotoDirective,
    CommonModule,
    NavbarModule,
    FooterModule,
    ReactiveFormsModule,
    FormsModule,
    IconsModule
  ]
})
export class TodoListsModule { }
