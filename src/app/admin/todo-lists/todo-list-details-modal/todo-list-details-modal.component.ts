import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-todo-list-details-modal',
  templateUrl: './todo-list-details-modal.component.html',
  styleUrls: ['./todo-list-details-modal.component.css']
})
export class TodoListDetailsModalComponent {
  todoData!: TodoList;
  responseMessage: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<TodoListDetailsModalComponent>,
    private datePipe: DatePipe) {
    this.todoData = this.data.todoData;
  }

  ngOnInit(): void {

  }

  closeDialog() {
    this.dialogRef.close("Dialog closed successfully");
  }

  formatDate(dateString: any): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

}
