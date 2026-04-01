import { Component, Inject, OnInit, EventEmitter, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TodoList, TodoStatus } from 'src/app/models/todoList.interface';
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

  statusOptions: { label: string; value: TodoStatus }[] = [
    { label: "Not Started", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TodoList,
    private dialogRef: MatDialogRef<TodoDetailsModalComponent>,
    private fb: FormBuilder,
    private todoService: TodoService,
    private snackbar: SnackBarService,
    private ngxService: NgxUiLoaderService
  ) { }

  ngOnInit() {
    this.initForm();

    if (this.data.status === 'cancelled') {
      this.updateTodoForm.disable();
    }

    this.updateTodoForm.get('status')?.valueChanges.subscribe(status => {
      const dueDateControl = this.updateTodoForm.get('dueDate');
      status === 'completed' ? dueDateControl?.disable() : dueDateControl?.enable();
    });
  }

  initForm() {
    this.updateTodoForm = this.fb.group({
      id: [this.data.id],
      task: [this.data.task, [Validators.required, Validators.minLength(20)]],
      status: [this.data.status, Validators.required],
      dueDate: [
        { value: this.formatDate(this.data.dueDate), disabled: this.data.status === 'completed' }
      ],
      checked: [this.data.checked]
    });
  }

  formatDate(date: any): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  blockIfCancelled(): boolean {
    if (this.data.status === 'cancelled') {
      this.snackbar.openSnackBar("This task has been cancelled and cannot be edited.", "error");
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------
  // DUE ENGINE
  // ---------------------------------------------------------

  isDueNow(todo: TodoList): boolean {
    if (todo.status === 'completed' || todo.status === 'cancelled') return false;

    const now = new Date();
    const due = new Date(todo.dueDate);

    return due <= now;
  }

  isDueSoon(todo: TodoList): boolean {
    if (todo.status === 'completed' || todo.status === 'cancelled') return false;

    const now = new Date();
    const due = new Date(todo.dueDate);

    const diff = due.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    return days > 0 && days <= 7;
  }

  getDueLabel(todo: TodoList): string {
    const now = new Date();
    const due = new Date(todo.dueDate);

    if (todo.status === 'completed') return "Completed";
    if (todo.status === 'cancelled') return "Cancelled";

    const diff = due.getTime() - now.getTime();
    const absDiff = Math.abs(diff);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(absDiff / (1000 * 60));
    const hours = Math.floor(absDiff / (1000 * 60 * 60));
    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (diff <= 0) {
      if (hours < 24) return "Due today";
      if (days === 1) return "Overdue by 1 day";
      if (days < 7) return `Overdue by ${days} days`;
      if (weeks < 4) return `Overdue by ${weeks} weeks`;
      if (months < 12) return `Overdue by ${months} months`;
      return `Overdue by ${years} years`;
    }

    if (seconds < 60) return `Due in ${seconds}s`;
    if (minutes < 60) return `Due in ${minutes}m`;
    if (hours < 24) return `Due in ${hours}h`;
    if (days < 7) return `Due in ${days}d`;
    if (weeks < 4) return `Due in ${weeks}w`;
    if (months < 12) return `Due in ${months} months`;
    return `Due in ${years} years`;
  }

  getDueColor(todo: TodoList): string {
    if (todo.status === 'completed') return 'text-green-600';
    if (todo.status === 'cancelled') return 'text-gray-500';
    if (this.isDueNow(todo)) return 'text-red-700';
    if (todo.status === 'in-progress') return 'text-yellow-600';
    if (todo.status === 'pending') return 'text-black';

    return 'text-gray-500';
  }

  // ---------------------------------------------------------
  // UPDATE TODO
  // ---------------------------------------------------------

  updateTodo(): void {
    if (this.data.status === 'cancelled') {
      this.snackbar.openSnackBar("Cancelled tasks cannot be updated.", "error");
      return;
    }

    if (this.updateTodoForm.invalid) {
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections.";
      this.snackbar.openSnackBar(this.responseMessage, "error");
      return;
    }

    this.ngxService.start();

    const formValue = this.updateTodoForm.value;

    const rawDueDate = formValue.dueDate ?? this.formatDate(this.data.dueDate);

    const payload = {
      ...formValue,
      dueDate: new Date(rawDueDate + "T00:00:00").toISOString()
    };

    this.todoService.updateTodoList(payload).subscribe({
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
        this.responseMessage = error.error?.message || genericError;
        this.snackbar.openSnackBar(this.responseMessage, "error");
      }
    });
  }

  markComplete() {
    if (this.blockIfCancelled()) return;
    this.updateTodoForm.patchValue({ status: 'completed', checked: true });

    this.updateTodo();
  }

  restartTask() {
    this.updateTodoForm.enable();
    this.data.status = 'pending'
    this.updateTodoForm.patchValue({ status: 'pending', checked: false });
    this.updateTodo();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
