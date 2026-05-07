import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TodoList } from 'src/app/models/todoList.interface';

@Component({
  selector: 'app-my-todo-list-form-edit-modal',
  templateUrl: './my-todo-list-form-edit-modal.component.html',
  styleUrls: ['./my-todo-list-form-edit-modal.component.css']
})
export class MyTodoListFormEditModalComponent {
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TodoList,
    private dialogRef: MatDialogRef<MyTodoListFormEditModalComponent>,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      task: [this.data.task, [Validators.required, Validators.minLength(20)]],
      dueDate: [this.data.dueDate, Validators.required],
      priority: [this.data.priority, Validators.required]
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}
