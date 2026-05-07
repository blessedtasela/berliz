import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-my-todo-list-form',
  templateUrl: './my-todo-list-form.component.html',
  styleUrls: ['./my-todo-list-form.component.css']
})
export class MyTodoListFormComponent {
  addTodoForm!: FormGroup;
  @Output() emitEvent = new EventEmitter();
  submitted: boolean = false;

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
      priority: ['normal', Validators.required]
    });
  }

  addTodo(): void {
    this.submitted = true;

    if (this.addTodoForm.invalid) {
      this.addTodoForm.markAllAsTouched();
      this.snackbar.openSnackBar('Please fix the errors in the form', 'error');
      return;
    }

    this.loader.start();

    this.todoService.addTodo(this.addTodoForm.value).subscribe({
      next: (res: any) => {
        this.snackbar.openSnackBar(res.message || 'Todo added', '');
        this.addTodoForm.reset({ priority: 'normal' });
        this.emitEvent.emit();
        this.loader.stop();
      },
      error: (err: any) => {
        this.snackbar.openSnackBar(err.error?.message || genericError, 'error');
        this.loader.stop();
      }
    });
    this.submitted = false;
  }

  setPriority(priority: 'low' | 'normal' | 'high') {
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
}
