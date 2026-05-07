import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TodoList } from 'src/app/models/todoList.interface';
import { TodoDetailsModalComponent } from 'src/app/shared/todo-details-modal/todo-details-modal.component';

@Component({
  selector: 'app-my-todo-list-detail-modal',
  templateUrl: './my-todo-list-detail-modal.component.html',
  styleUrls: ['./my-todo-list-detail-modal.component.css']
})
export class MyTodoListDetailModalComponent {
 constructor(
    @Inject(MAT_DIALOG_DATA) public data: TodoList,
    private dialogRef: MatDialogRef<TodoDetailsModalComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
