import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TodoPriority } from 'src/app/models/todoList.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
    selector: 'app-my-todo-list-form',
    templateUrl: './my-todo-list-form.component.html',
    styleUrls: ['./my-todo-list-form.component.css'],
    standalone: false
})
export class MyTodoListFormComponent {
  addTodoForm!: FormGroup;
  @Output() emitEvent = new EventEmitter();
  submitted: boolean = false;
  /** Inline message above the Add button: validation problem or the server's reason the add failed. */
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private loader: NgxUiLoaderService,
    private snackbar: SnackBarService,
    private todoService: TodoService
  ) { }

  ngOnInit(): void {
    this.addTodoForm = this.fb.group({
      task: ['', [Validators.required, Validators.minLength(20)]],
      dueDate: ['', Validators.required],
      priority: ['NORMAL', Validators.required],
    });
  }

  addTodo(): void {
    this.submitted = true;
    this.submitError = null;

    if (this.addTodoForm.invalid) {
      this.addTodoForm.markAllAsTouched();
      this.submitError = 'Describe the task in at least 20 characters and choose a due date before adding it.';
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

    this.loader.start();

    this.todoService.addTodo(this.addTodoForm.value).subscribe({
      next: (res: any) => {
        this.snackbar.openSnackBar(res.message || 'Task added to your to-do list', '');
        this.addTodoForm.reset({ priority: 'NORMAL' });
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.submitError = err.error?.message || genericError;
        this.loader.stop();
      }
    });
    this.submitted = false;
  }

  setPriority(priority: 'LOW' | 'NORMAL' | 'HIGH') {
    this.addTodoForm.patchValue({ priority });
  }

  isInvalid(controlName: string): boolean {
    const control = this.addTodoForm.get(controlName);

    return !!(
      control &&
      control.invalid &&
      (control.touched || this.submitted)
    );
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
