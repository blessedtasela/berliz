import {
  Component,
  Inject,
  OnInit,
  EventEmitter,
  Output
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef
} from '@angular/material/dialog';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import {
  TodoList,
  TodoPriority,
  TodoStatus
} from 'src/app/models/todoList.interface';

import { TodoService } from 'src/app/services/todo.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';

import { genericError } from 'src/validators/form-validators.module';
import { PromptModalComponent } from '../prompt-modal/prompt-modal.component';

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

  originalValue: any;

  statusOptions: { label: string; value: TodoStatus }[] = [
    { label: 'Not Started', value: 'pending' },
    { label: 'In Progress', value: 'in-progress' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TodoList,
    private dialogRef: MatDialogRef<TodoDetailsModalComponent>,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private todoService: TodoService,
    private snackbar: SnackBarService,
    private ngxService: NgxUiLoaderService
  ) { }

  ngOnInit(): void {

    this.initForm();
    this.originalValue = this.updateTodoForm.getRawValue();
    this.handleReadonlyStates();
    this.listenToStatusChanges();
  }

  // =========================================================
  // FORM
  // =========================================================

  initForm(): void {
    this.updateTodoForm = this.fb.group({
      id: [this.data.id],

      task: [
        this.data.task,
        [Validators.required, Validators.minLength(20)]
      ],
      status: [this.data.status, Validators.required],
      dueDate: [this.formatDate(this.data.dueDate), Validators.required],
      priority: [
        this.data.priority ?? TodoPriority.NORMAL,
        Validators.required
      ],
      checked: [this.data.checked]
    });

    this.applyReadonlyRules();
  }

  private applyReadonlyRules(status: string = this.data.status): void {
    const dueDate = this.updateTodoForm.get('dueDate');

    if (status === 'completed' || status === 'cancelled') {
      this.updateTodoForm.get('task')?.disable({ emitEvent: false });
      this.updateTodoForm.get('priority')?.disable({ emitEvent: false });
      this.updateTodoForm.get('status')?.disable({ emitEvent: false });
      dueDate?.disable({ emitEvent: false });
    } else {
      this.updateTodoForm.get('task')?.enable({ emitEvent: false });
      this.updateTodoForm.get('priority')?.enable({ emitEvent: false });
      this.updateTodoForm.get('status')?.enable({ emitEvent: false });
      dueDate?.enable({ emitEvent: false });
    }
  }

  private setupStatusRules(): void {
    this.updateTodoForm.get('status')?.valueChanges.subscribe(status => {
      this.applyReadonlyRules(status);
    });

    this.applyReadonlyRules(this.data.status);
  }


  handleReadonlyStates(): void {

    // COMPLETED OR CANCELLED
    if (
      this.data.status === 'completed' ||
      this.data.status === 'cancelled'
    ) {

      this.updateTodoForm.disable();

      // allow restart only
      this.updateTodoForm.get('id')?.enable();
      this.updateTodoForm.get('status')?.enable();
    }
  }

  listenToStatusChanges(): void {

    this.updateTodoForm
      .get('status')
      ?.valueChanges.subscribe(status => {

        const dueDateControl =
          this.updateTodoForm.get('dueDate');

        if (status === 'completed') {
          dueDateControl?.disable();
        } else {
          dueDateControl?.enable();
        }
      });
  }

  // =========================================================
  // HELPERS
  // =========================================================

  formatDate(date: any): string {

    if (!date) return '';

    const d = new Date(date);

    const year = d.getFullYear();

    const month = String(
      d.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      d.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  isInvalid(controlName: string): boolean {

    const control =
      this.updateTodoForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (
        control.touched ||
        control.dirty ||
        this.invalidForm
      )
    );
  }

  setPriority(priority: string): void {

    if (this.isReadonlyTask()) {
      return;
    }

    this.updateTodoForm.patchValue({
      priority
    });

    this.updateTodoForm
      .get('priority')
      ?.markAsTouched();
  }

  isReadonlyTask(): boolean {

    return (
      this.data.status === 'completed' ||
      this.data.status === 'cancelled'
    );
  }

  hasChanges(): boolean {

    const current =
      JSON.stringify(
        this.updateTodoForm.getRawValue()
      );

    const original =
      JSON.stringify(this.originalValue);

    return current !== original;
  }

  // =========================================================
  // DUE ENGINE
  // =========================================================

  isDueNow(todo: TodoList): boolean {

    if (
      todo.status === 'completed' ||
      todo.status === 'cancelled'
    ) {
      return false;
    }

    return new Date(todo.dueDate) <= new Date();
  }

  isDueSoon(todo: TodoList): boolean {

    if (
      todo.status === 'completed' ||
      todo.status === 'cancelled'
    ) {
      return false;
    }

    const now = new Date();
    const due = new Date(todo.dueDate);

    const diff =
      due.getTime() - now.getTime();

    const days =
      diff / (1000 * 60 * 60 * 24);

    return days > 0 && days <= 7;
  }


  getDueColor(todo: TodoList): string {

    if (todo.status === 'completed') {
      if (this.isCompletedOnTime(todo)) {
        return 'text-green-600';
      } else {
        return 'text-red-600';
      }
    }

    if (todo.status === 'cancelled') {
      return 'text-gray-500';
    }

    if (this.isDueNow(todo)) {
      return 'text-red-600';
    }

    if (todo.status === 'in-progress') {
      return 'text-yellow-600';
    }

    return 'text-gray-700';
  }

  getDueLabel(todo: any): string {

    if (todo.status === 'completed') {

      return this.isCompletedOnTime(todo)
        ? 'Completed on time'
        : 'Completed late';
    }

    // keep your existing logic below...
    const now = new Date();
    const due = new Date(todo.dueDate);

    const diff = due.getTime() - now.getTime();

    if (diff <= 0) return 'Overdue';

    return 'On track';
  }

  // =========================================================
  // UPDATE
  // =========================================================

  updateTodo(): void {

    if (this.isReadonlyTask()) {

      this.snackbar.openSnackBar(
        'Completed or cancelled tasks must be restarted before editing.',
        'error'
      );

      return;
    }

    if (!this.hasChanges()) {

      this.snackbar.openSnackBar(
        'No changes detected.',
        'error'
      );

      return;
    }

    if (this.updateTodoForm.invalid) {

      this.invalidForm = true;

      this.updateTodoForm.markAllAsTouched();

      this.snackbar.openSnackBar(
        'Invalid form. Please complete all sections.',
        'error'
      );

      return;
    }

    this.ngxService.start();

    const formValue =
      this.updateTodoForm.getRawValue();

    const rawDueDate =
      formValue.dueDate ||
      this.formatDate(this.data.dueDate);

    const payload = {

      id: formValue.id,

      task: formValue.task,

      status: formValue.status,

      priority: formValue.priority,

      dueDate: new Date(
        rawDueDate + 'T00:00:00'
      ).toISOString()
    };

    this.todoService
      .updateTodoList(payload)
      .subscribe({

        next: (response: any) => {

          this.ngxService.stop();

          this.invalidForm = false;

          this.responseMessage =
            response?.message;

          this.emitEvent.emit();

          this.onUpdateTodo.emit();

          this.snackbar.openSnackBar(
            this.responseMessage,
            ''
          );

          this.dialogRef.close(payload);
        },

        error: (error: any) => {

          this.ngxService.stop();

          this.responseMessage =
            error.error?.message ||
            genericError;

          this.snackbar.openSnackBar(
            this.responseMessage,
            'error'
          );
        }
      });
  }

  // =========================================================
  // ACTIONS
  // =========================================================

  markComplete(): void {


    if (this.data.status === 'completed') {
      return;
    }

    const dialogRef = this.dialog.open(PromptModalComponent, {
      width: '400px',
      data: {
        message: `co this task?`,
        confirmation: true,
        disableClose: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result !== true) return; // STRICT CHECK

      this.ngxService.start();

      const payload = {
        id: this.data.id,
        status: 'completed',
        checked: false,
        task: this.data.task,
        priority: this.data.priority,
        dueDate: this.data.dueDate
      };

      this.todoService.updateTodoList(payload).subscribe({
        next: () => {

          this.data.status = 'completed';

          this.updateTodoForm.enable();

          this.updateTodoForm.patchValue({
            status: 'completed',
            checked: false
          });

          this.originalValue = this.updateTodoForm.getRawValue();
          this.snackbar.openSnackBar('Task completed successfully', 'success');
          this.dialogRef.close({
            action: 'restarted',
            data: this.data
          });
          this.ngxService.stop();
        },

        error: () => {
          this.ngxService.stop();
          this.snackbar.openSnackBar('Failed to restart task', 'error');
        }
      });
    });

  }

  restartTask(): void {

    if (this.data.status !== 'cancelled' && this.data.status !== 'completed') {
      return;
    }

    const dialogRef = this.dialog.open(PromptModalComponent, {
      width: '400px',
      data: {
        message: `restart this task?`,
        confirmation: true,
        disableClose: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {

      if (result !== true) return; // STRICT CHECK

      this.ngxService.start();

      const formValue = this.updateTodoForm.getRawValue();

      const rawDueDate =
        formValue.dueDate ||
        this.formatDate(this.data.dueDate);

      const payload = {
        id: this.data.id,
        task: formValue.task,
        status: 'pending',
        priority: formValue.priority as TodoPriority,
        dueDate: new Date(rawDueDate + 'T00:00:00').toISOString()
      };

      this.todoService.updateTodoList(payload).subscribe({
        next: () => {

          this.data.status = 'pending';

          this.updateTodoForm.enable();

          this.updateTodoForm.patchValue({
            status: 'pending',
            checked: false
          });

          this.originalValue = this.updateTodoForm.getRawValue();
          this.snackbar.openSnackBar('Task restarted successfully', 'success');
          this.dialogRef.close({
            action: 'restarted',
            data: this.data
          });
          this.ngxService.stop();
        },

        error: () => {
          this.ngxService.stop();
          this.snackbar.openSnackBar('Failed to restart task', 'error');
        }
      });
    });

  }

  isCompletedOnTime(todo: any): boolean {
    if (!todo?.dueDate || !todo?.lastUpdate) return true;

    const due = new Date(todo.dueDate).getTime();
    const completed = new Date(todo.lastUpdate).getTime();

    return completed <= due;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}