import { Component, EventEmitter, Inject } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { TodoList } from 'src/app/models/todoList.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-update-todo-modal',
  templateUrl: './update-todo-modal.component.html',
  styleUrls: ['./update-todo-modal.component.css']
})
export class UpdateTodoModalComponent {
  onUpdateTodoList = new EventEmitter();
  updateTodoForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  todoData!: TodoList;
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private todoService: TodoService,
    public dialogRef: MatDialogRef<UpdateTodoModalComponent>,
    private ngxService: NgxUiLoaderService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackbarService: SnackBarService) {
    this.todoData = this.data.todoData;
  }

  ngOnInit(): void {
    this.updateTodoForm = this.formBuilder.group({
      'task': new FormControl(this.todoData.task, [Validators.required, Validators.minLength(20)]),
      'id': this.todoData.id,
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  addTodoList(): void {
    this.ngxService.start();
    if (this.updateTodoForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      this.todoService.updateTodoList(this.updateTodoForm.value)
        .subscribe((response: any) => {
          this.onUpdateTodoList.emit();
          this.updateTodoForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Todo task updated successfully');
          this.responseMessage = response?.message;
          this.snackbarService.openSnackBar(this.responseMessage, "");
          this.ngxService.stop();
        }, (error: any) => {
          this.ngxService.stop();
          console.error("error");
          if (error.error?.message) {
            this.responseMessage = error.error?.message;
          } else {
            this.responseMessage = genericError;
          }
          this.snackbarService.openSnackBar(this.responseMessage, "error");
        });
    }
    this.ngxService.stop();
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without updating a Todo');
  }

  clear() {
    this.updateTodoForm.reset();
  }

}

