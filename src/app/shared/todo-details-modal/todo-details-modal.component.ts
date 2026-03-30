import { Component, Inject, OnInit, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TodoList } from 'src/app/models/todoList.interface';
import { TodoService } from 'src/app/services/todo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-todo-details-modal',
  templateUrl: './todo-details-modal.component.html',
  styleUrls: ['./todo-details-modal.component.css']
})
export class TodoDetailsModalComponent implements OnInit {

  @Output() emitEvent = new EventEmitter();
  @Output() onUpdateTodo = new EventEmitter();

  updateTodoForm!: FormGroup;
  invalidForm = false;
  responseMessage: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TodoList,
    private dialogRef: MatDialogRef<TodoDetailsModalComponent>,
    private fb: FormBuilder,
    private todoService: TodoService,
    private snackbar: SnackBarService,
    private ngxService: NgxUiLoaderService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  // ---------------------------------------------------------
  // FORM INITIALIZATION
  // ---------------------------------------------------------
  initForm() {
    this.updateTodoForm = this.fb.group({
      id: [this.data.id],
      task: [this.data.task, [Validators.required, Validators.minLength(3)]],
      status: [this.data.status, Validators.required],
      dueDate: [this.data.dueDate ? new Date(this.data.dueDate) : null],
      checked: [this.data.checked]
    });
  }

  // ---------------------------------------------------------
  // STATUS + DUE DATE LOGIC
  // ---------------------------------------------------------
  isDueNow(todo: TodoList): boolean {
    if (!todo.dueDate) return false;
    const now = new Date();
    const due = new Date(todo.dueDate);
    return due <= now;
  }

  isDueSoon(todo: TodoList): boolean {
    if (!todo.dueDate) return false;
    const now = new Date();
    const due = new Date(todo.dueDate);
    const diff = due.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 3;
  }

  getDueLabel(todo: TodoList): string {
    if (!todo.dueDate) return 'No due date';

    const now = new Date();
    const due = new Date(todo.dueDate);
    const diff = due.getTime() - now.getTime();

    if (diff <= 0) return 'Due now';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);

    if (seconds < 60) return `Due in ${seconds}s`;
    if (minutes < 60) return `Due in ${minutes}m`;
    if (hours < 24) return `Due in ${hours}h`;
    if (days < 7) return `Due in ${days}d`;
    return `Due in ${weeks}w`;
  }

  // ---------------------------------------------------------
  // UPDATE TODO (BACKEND API)
  // ---------------------------------------------------------
  updateTodo(): void {
    if (this.updateTodoForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackbar.openSnackBar(this.responseMessage, "error");
      return;
    }

    this.ngxService.start();

    this.todoService.updateTodoList(this.updateTodoForm.value)
      .subscribe({
        next: (response: any) => {
          this.updateTodoForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;

          this.emitEvent.emit();
          this.onUpdateTodo.emit();

          this.dialogRef.close("task updated successfully");
          this.snackbar.openSnackBar(this.responseMessage, "");

          this.ngxService.stop();
        },
        error: (error: any) => {
          this.ngxService.stop();

          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }

          this.snackbar.openSnackBar(this.responseMessage, "error");
        }
      });
  }

  // ---------------------------------------------------------
  // MARK COMPLETE
  // ---------------------------------------------------------
  markComplete() {
    this.updateTodoForm.patchValue({ status: 'completed', checked: true });
    this.updateTodo();
  }

  // ---------------------------------------------------------
  // CLOSE MODAL
  // ---------------------------------------------------------
  closeDialog() {
    this.dialogRef.close();
  }
}