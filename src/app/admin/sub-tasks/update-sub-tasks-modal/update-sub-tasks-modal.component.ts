import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SubTasks } from 'src/app/models/tasks.interface';
import { TaskService } from 'src/app/services/task.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * The backend's updateSubTask only ever persists `name` — exerciseId is
 * accepted on the request DTO but silently ignored by
 * TaskServiceImplement.updateSubTask, so the linked exercise can't
 * actually be changed after creation. The form reflects that: the
 * exercise is shown read-only, not as an editable picker that would imply
 * a change takes effect.
 */
@Component({
  selector: 'app-update-sub-tasks-modal',
  templateUrl: './update-sub-tasks-modal.component.html',
  styleUrls: ['./update-sub-tasks-modal.component.css']
})
export class UpdateSubTasksModalComponent implements OnInit {
  onUpdateSubTaskEmit = new EventEmitter();
  updateSubTaskForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  subTaskData: SubTasks;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    public dialogRef: MatDialogRef<UpdateSubTasksModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) {
    this.subTaskData = this.data.subTaskData;
  }

  ngOnInit(): void {
    this.updateSubTaskForm = this.formBuilder.group({
      name: [this.subTaskData.name, [Validators.required, Validators.minLength(2)]],
    });
  }

  updateSubTask(): void {
    if (this.updateSubTaskForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.taskService.updateSubTask({
      id: this.subTaskData.id,
      name: this.updateSubTaskForm.value.name,
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onUpdateSubTaskEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Sub-task updated successfully');
      },
      error: (error: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.responseMessage = error.error?.message || genericError;
        this.snackbarService.openSnackBar(this.responseMessage, 'error');
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close('Dialog closed without updating the sub-task');
  }
}
