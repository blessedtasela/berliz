import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Observable } from 'rxjs';
import { TodoPriority } from 'src/app/models/todoList.interface';
import { Users } from 'src/app/models/users.interface';
import { AuthService } from 'src/app/services/auth.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';
import { selectUser } from 'src/app/state/user/user.selector';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-todays-todo-modal',
  templateUrl: './todays-todo-modal.component.html',
  styleUrls: ['./todays-todo-modal.component.css']
})
export class TodaysTodoModalComponent implements OnInit {

  invalidForm = false;
  responseMessage: any;
  addTodoForm!: FormGroup;

  @Output() emitEvent = new EventEmitter();

  email: any;
  user!: Users | null;

  constructor(
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TodaysTodoModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private todoService: TodoService,
    private authService: AuthService,
    private store: Store,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.email = this.authService.getCurrentUserEmail();

    this.addTodoForm = this.formBuilder.group({
      task: ['', [Validators.required, Validators.minLength(20)]],
      dueDate: ['', Validators.required],
      priority: ['NORMAL', Validators.required],
    });
    this.store.select(selectUser).subscribe(user => {
      this.user = user
    });
  }

  addTodo(): void {
    if (this.addTodoForm.invalid) {
      this.invalidForm = true;
      this.addTodoForm.markAllAsTouched();
      this.snackBarService.openSnackBar('Please enter a task with at least 20 characters.', 'error');
      return;
    }

    const formValue = this.addTodoForm.getRawValue();

    const rawDueDate =
      formValue.dueDate ||
      this.formatDate(formValue.dueDate);

    const payload = {
      task: formValue.task,
      status: 'pending',
      priority: formValue.priority as TodoPriority,
      dueDate: new Date(rawDueDate + 'T00:00:00').toISOString()
    };


    this.ngxService.start();

    this.todoService.addTodo(payload).subscribe({
      next: (response: any) => {
        this.addTodoForm.reset();
        this.invalidForm = false;
        this.responseMessage = response?.message;
        this.emitEvent.emit();
        this.snackBarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close();
        this.ngxService.stop();
      },
      error: (error: any) => {
        this.responseMessage = error.error?.message || genericError;
        this.snackBarService.openSnackBar(this.responseMessage, 'error');
        this.ngxService.stop();
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  setPriority(priority: 'LOW' | 'NORMAL' | 'HIGH') {
    this.addTodoForm.patchValue({ priority });
  }

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
}