import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TodoService } from 'src/app/services/todo.service';
import { selectUsers } from 'src/app/state/user/user.selector';
import { loadActiveUsers } from 'src/app/state/user/user.actions';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-todo-modal',
  templateUrl: './add-todo-modal.component.html',
  styleUrls: ['./add-todo-modal.component.css']
})
export class AddTodoModalComponent {
  onAddTodoList = new EventEmitter()
  addTodoForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  users!: Users[];
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private todoService: TodoService,
    private store: Store,
    public dialogRef: MatDialogRef<AddTodoModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
    this.addTodoForm = this.formBuilder.group({
      'task': ['', Validators.compose([Validators.required, Validators.minLength(20)])],
      'email': ['', [Validators.required]],
    });

    this.store.select(selectUsers).subscribe((cachedData) => {
      if (!cachedData?.length) {
        this.store.dispatch(loadActiveUsers());
        this.handleEmitEvent();
      } else {
        this.users = cachedData
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscription.add(
      this.store.select(selectUsers).subscribe((users) => {
        this.ngxService.start();
        this.users = users;
        this.cd.detectChanges(); // Manually trigger change detection
        this.ngxService.stop();
      })
    );
  }

  addTodoList(): void {
    this.ngxService.start();
    if (this.addTodoForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
      this.snackbarService.openSnackBar(this.responseMessage, "error");
    } else {
      this.todoService.addTodo(this.addTodoForm.value)
        .subscribe((response: any) => {
          this.onAddTodoList.emit();
          this.addTodoForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Todo added successfully');
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
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a Todo');
  }

  clear() {
    this.addTodoForm.reset();
  }

}
