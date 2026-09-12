import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tasks } from 'src/app/models/tasks.interface';
import { TaskService } from 'src/app/services/task.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Edits a task's description/priority/date range (the trainer assignment
 * itself isn't editable — only set at creation, per applyTaskFields on the
 * backend). NOTE: as of this writing, addTask always creates a task with
 * status "true", and updateTask rejects any edit once status is "true" —
 * meaning this form is effectively always locked in practice. That's a
 * backend-side inconsistency (flagged separately), not something to route
 * around here; the isActive check below matches the backend's actual rule.
 */
@Component({
  selector: 'app-update-tasks-modal',
  templateUrl: './update-tasks-modal.component.html',
  styleUrls: ['./update-tasks-modal.component.css']
})
export class UpdateTasksModalComponent implements OnInit {
  onUpdateTaskEmit = new EventEmitter();
  updateTaskForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  taskData: Tasks;

  get isActive(): boolean {
    return this.taskData?.status === 'true';
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    public dialogRef: MatDialogRef<UpdateTasksModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) {
    this.taskData = this.data.taskData;
  }

  ngOnInit(): void {
    this.updateTaskForm = this.formBuilder.group({
      description: [this.taskData.description, [Validators.required, Validators.minLength(10)]],
      priority: [this.taskData.priority || 'NORMAL', Validators.required],
      startDate: [this.toDateInput(this.taskData.startDate), Validators.required],
      endDate: [this.toDateInput(this.taskData.endDate), Validators.required],
    });

    if (this.isActive) this.updateTaskForm.disable();
  }

  private toDateInput(date: any): string {
    if (!date) return '';
    return new Date(date).toISOString().slice(0, 10);
  }

  updateTask(): void {
    if (this.isActive || this.updateTaskForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.taskService.updateTask({
      id: this.taskData.id,
      ...this.updateTaskForm.value,
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onUpdateTaskEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Task updated successfully');
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
    this.dialogRef.close('Dialog closed without updating the task');
  }
}
