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
    { label: "Due", value: "due" },
    { label: "Completed", value: "completed" }
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

    // Handle disabling of dueDate when completed
    this.updateTodoForm.get('status')?.valueChanges.subscribe(status => {
      const dueDateControl = this.updateTodoForm.get('dueDate');
      status === 'completed' ? dueDateControl?.disable() : dueDateControl?.enable();
    });
  }

  // ---------------------------------------------------------
  // FORM INITIALIZATION
  // ---------------------------------------------------------
  initForm() {
    this.updateTodoForm = this.fb.group({
      id: [this.data.id],
      task: [this.data.task, [Validators.required, Validators.minLength(3)]],
      status: [this.data.status, Validators.required],

      // Use local YYYY-MM-DD for <input type="date">
      dueDate: [
        { value: this.formatDate(this.data.dueDate), disabled: this.data.status === 'completed' }
      ],

      checked: [this.data.checked]
    });
  }

  // ---------------------------------------------------------
  // DATE HELPERS (timezone safe)
  // ---------------------------------------------------------
  private toLocalDate(dateInput: any): Date {
    if (!dateInput) return new Date(); // fallback today

    if (dateInput instanceof Date) return dateInput; // already a Date

    if (typeof dateInput === 'string') {
      // strip time if present in ISO string
      const [year, month, day] = dateInput.split('T')[0].split('-').map(Number);
      return new Date(year, month - 1, day); // local date, no timezone shift
    }

    if (typeof dateInput === 'number') return new Date(dateInput); // timestamp

    return new Date(dateInput); // fallback for other formats
  }

  formatDate(date: any): string {
    const d = this.toLocalDate(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  }

  formatFullDate(date: any): string {
    const d = this.toLocalDate(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  // ---------------------------------------------------------
  // STATUS + DUE DATE LOGIC
  // ---------------------------------------------------------
  isDueNow(todo: TodoList): boolean {
    if (!todo.dueDate) return false;
    const now = new Date();
    const due = this.toLocalDate(todo.dueDate);
    return due <= now;
  }

  isDueSoon(todo: TodoList): boolean {
    if (!todo.dueDate) return false;
    const now = new Date();
    const due = this.toLocalDate(todo.dueDate);
    const diff = due.getTime() - now.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 3;
  }

  getDueLabel(todo: TodoList): string {
    if (!todo.dueDate) return 'No due date';

    const now = new Date();
    const due = this.toLocalDate(todo.dueDate);
    const diff = due.getTime() - now.getTime();

    if (diff <= 0) return 'Now';

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);

    if (seconds < 60) return `In ${seconds}s`;
    if (minutes < 60) return `In ${minutes}m`;
    if (hours < 24) return `In ${hours}h`;
    if (days < 7) return `In ${days}d`;
    return `In ${weeks}w`;
  }

  isCompleted(): boolean {
    return this.updateTodoForm.get('status')?.value === 'completed';
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

    const formValue = this.updateTodoForm.value;

    const payload = {
      ...formValue,

      // Convert local YYYY-MM-DD to ISO string (no timezone shift)
      dueDate:
        formValue.status === "completed"
          ? new Date(this.data.dueDate).toISOString()
          : new Date(formValue.dueDate + "T00:00:00").toISOString()
    };

    this.todoService.updateTodoList(payload)
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

          this.responseMessage = error.error?.message || genericError;
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