import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.component.html',
  styleUrls: ['./todo-form.component.css']
})
export class TodoFormComponent {
  addTodoForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  @Output() emitEvent = new EventEmitter()

  constructor(private formBuilder: FormBuilder,
    private ngxService: NgxUiLoaderService,
    private snackBarService: SnackBarService,
    private todoService: TodoService) { }


  ngOnInit(): void {
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

}
