import { ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, ValidatorFn, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Icons } from 'angular-feather/lib/icons.provider';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Subscription } from 'rxjs';
import { Tasks } from 'src/app/models/tasks.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { TaskStateService } from 'src/app/services/task-state.service';
import { TaskService } from 'src/app/services/task.service';
import { genericError } from 'src/validators/form-validators.module';

@Component({
  selector: 'app-add-sub-tasks-modal',
  templateUrl: './add-sub-tasks-modal.component.html',
  styleUrls: ['./add-sub-tasks-modal.component.css']
})
export class AddSubTasksModalComponent {
  onAddSubTaskEmit = new EventEmitter();
  addSubTaskForm!: FormGroup;
  invalidForm: boolean = false;
  responseMessage: any;
  tasks!: Tasks[];
  subscription = new Subscription;

  constructor(private formBuilder: FormBuilder,
    private taskService: TaskService,
    private taskStateService: TaskStateService,
    public dialogRef: MatDialogRef<AddSubTasksModalComponent>,
    private ngxService: NgxUiLoaderService,
    private cd: ChangeDetectorRef,
    private snackbarService: SnackBarService) {
  }

  ngOnInit(): void {
    this.addSubTaskForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.minLength(2)]],
      'photo': ['', [Validators.required, Validators.minLength(2)]],
      'description': ['', [Validators.required, Validators.minLength(20)]],
      'likes': ['0',],
      'tagIds': this.formBuilder.array([], this.validateCheckbox()),
    });

    this.taskStateService.activeTasksData$.subscribe((cachedData) => {
      if (!cachedData) {
        this.handleEmitEvent();
      } else {
        this.tasks = cachedData
      }
    })
  }

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  handleEmitEvent() {
    console.log("isCached false");
    this.subscription.add(
      this.taskStateService.getActiveTasks().subscribe((tasks) => {
        this.ngxService.start();
        this.tasks = tasks;
        this.taskStateService.setActiveTasksSubject(tasks);
        this.cd.detectChanges(); // Manually trigger change detection
        this.ngxService.stop();
      })
    );
  }


  onCheckboxChanged(event: any) {
    const tasks = this.addSubTaskForm.get('tagIds') as FormArray;
    if (event.target.checked) {
      tasks.push(this.formBuilder.group({ tagIds: event.target.value }));
    } else {
      const index = tasks.controls.findIndex((control) => control.value.tagIds === event.target.value);
      tasks.removeAt(index);
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
    if (this.addSubTaskForm.invalid) {
      this.invalidForm = true
      this.responseMessage = "Invalid form"
      this.ngxService.stop();
    } else {
      // Get the selected tagIds values as an array
      const selectedTagIds = this.addSubTaskForm.value.tagIds.map((tag: any) => tag.tagIds);

      // Convert the array to a comma-separated string
      const tagIdsString = selectedTagIds.join(',');
      const formData = {
        ...this.addSubTaskForm.value,
        tagIds: tagIdsString
      };
      this.taskService.addSubTask(formData)
        .subscribe((response: any) => {
          this.onAddSubTaskEmit.emit();
          this.addSubTaskForm.reset();
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
    this.snackbarService.openSnackBar(this.responseMessage, "error");
  }

  closeDialog() {
    this.dialogRef.close('Dialog closed without adding a category');
  }

  clear() {
    this.addSubTaskForm.reset();
    this.onCheckboxChanged(event)
  }


}

