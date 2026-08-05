import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { SubTasks } from 'src/app/models/tasks.interface';
import { Users } from 'src/app/models/users.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TaskService } from 'src/app/services/task.service';
import { selectUsers } from 'src/app/state/user/user.selector';
import { loadActiveUsers } from 'src/app/state/user/user.actions';
import { loadSubTasks } from 'src/app/state/task/task.actions';
import { selectSubTasks } from 'src/app/state/task/task.selectors';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-tasks-modal',
  templateUrl: './add-tasks-modal.component.html',
  styleUrls: ['./add-tasks-modal.component.css']
})
export class AddTasksModalComponent {
  onAddTaskEmit = new EventEmitter();
  addTaskForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  users: Users[] = [];
  subTasks: SubTasks[] = [];
  selectedIcon: string = '../../../../../assets/icons/gym';
  subscriptions: Subscription[] = [];

  constructor(private formBuilder: FormBuilder,
    private taskService: TaskService,
    private store: Store,
    public dialogRef: MatDialogRef<AddTasksModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) { }

  ngOnInit(): void {
    this.addTaskForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'photo': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
      'likes': ['0',],
      'tagIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.handleEmitEvent();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe())
  }

  handleEmitEvent() {
    this.subscriptions.push(
      this.store.select(selectUsers).subscribe((users) => {
        this.ngxService.start();
        this.users = users;
        this.cd.detectChanges(); // Manually trigger change detection
        this.ngxService.stop();
      }),
      this.store.select(selectSubTasks).subscribe((subTasks) => {
        this.subTasks = subTasks;
        this.cd.detectChanges(); // Manually trigger change detection
      })
    );
    this.store.dispatch(loadActiveUsers());
    this.store.dispatch(loadSubTasks());
  }

  onCheckboxChanged(event: any) {
    const users = this.addTaskForm.get('tagIds') as FormArray;
    if (event.target.checked) {
      users.push(this.formBuilder.group({ tagIds: event.target.value }));
    } else {
      const index = users.controls.findIndex((control) => control.value.tagIds === event.target.value);
      users.removeAt(index);
    }
  }

  validateCheckbox(): ValidatorFn {
    return (formArray: AbstractControl) => {
      const checkboxes = formArray.value;
      const isChecked = checkboxes.length > 0;
      return isChecked ? null : { noCheckboxChecked: true };
    };
  }

  addCategory(): void {
    this.ngxService.start();
    if (this.addTaskForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
      this.snackbarService.openSnackBar(this.responseMessage, "error");
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.addTaskForm.value.tagIds.map((tag: any) => tag.tagIds);

      // Convert the array to a comma-separated string
      const tagIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.addTaskForm.value,
        tagIds: tagIdsString
      };
      this.taskService.addTask(formData)
        .subscribe((response: any) => {
          this.onAddTaskEmit.emit();
          this.addTaskForm.reset();
          this.invalidForm = false;
          this.dialogRef.close('Category added successfully');
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
    this.dialogRef.close('Dialog closed without adding a category');
  }

  clear() {
    this.addTaskForm.reset();
    this.selectedIcon = '../../../../../assets/icons/gym';
    this.onCheckboxChanged(event)
  }


}


