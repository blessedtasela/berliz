import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-todays-todo-modal',
  templateUrl: './todays-todo-modal.component.html',
  styleUrls: ['./todays-todo-modal.component.css']
})
export class TodaysTodoModalComponent {
  invalidForm: boolean = false;
  responseMessage: any;
  addTodoForm!: FormGroup;
  @Output() emitEvent = new EventEmitter()
  email: any;

  constructor(private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TodaysTodoModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private todoService: TodoService,
    private authService: AuthenticationService,
    private router: Router) { }

  ngOnInit(): void {
    this.email = this.authService.getCurrentUserEmail()
    this.addTodoForm = this.formBuilder.group({
      'task': ['', Validators.compose([Validators.required, Validators.minLength(20)])],
    });
  }

  handleEmitEvent() {
  }

  addTodo(): void {
    if (this.addTodoForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.todoService.addTodo(this.addTodoForm.value)
        .subscribe((response: any) => {
          this.addTodoForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.emitEvent.emit()
          this.snackBarService.openSnackBar(this.responseMessage, "");
          this.dialogRef.close();
          this.ngxService.stop();
        }, (error: any) => {
          this.ngxService.start();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackBarService.openSnackBar(this.responseMessage, "error");
          this.ngxService.stop();
        })
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
