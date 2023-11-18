import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TodoList } from 'src/app/models/todoList.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-edit-todo',
  templateUrl: './edit-todo.component.html',
  styleUrls: ['./edit-todo.component.css']
})
export class EditTodoComponent {
  onUpdateTodo = new EventEmitter()
  updateTodoForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  @Output() emitEvent = new EventEmitter()
  myTodo!: TodoList;

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private todoService: TodoService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<EditTodoComponent>,) {
    this.myTodo = this.data.todoData;
  }


  ngOnInit(): void {
    this.updateTodoForm = this.formBuilder.group({
      'id': this.myTodo.id,
      'task': new FormControl(this.myTodo.task, [Validators.required, Validators.minLength(20)]),
    });
  }

  handleEmitEvent() {
  }

  updateTodo(): void {
    if (this.updateTodoForm.invalid) {
      this.ngxService.start();
      this.invalidForm = true;
      this.responseMessage = "Invalid form. Please complete all sections";
      this.snackBarService.openSnackBar(this.responseMessage, "error");
      this.ngxService.stop();
    } else {
      this.ngxService.start();
      this.todoService.updateTodoList(this.updateTodoForm.value)
        .subscribe((response: any) => {
          this.updateTodoForm.reset();
          this.invalidForm = false;
          this.responseMessage = response?.message;
          this.emitEvent.emit()
          this.onUpdateTodo.emit()
          this.dialogRef.close("task updated successfully")
          this.snackBarService.openSnackBar(this.responseMessage, "");
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
    this.dialogRef.close('Dialog closed without updating myTodo');
  }
}
