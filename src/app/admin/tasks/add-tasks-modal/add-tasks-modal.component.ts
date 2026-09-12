import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Users } from 'src/app/models/users.interface';
import { Trainers } from 'src/app/models/trainers.interface';
import { TaskService } from 'src/app/services/task.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { selectUsers } from 'src/app/state/user/user.selector';
import { loadActiveUsers } from 'src/app/state/user/user.actions';
import { selectTrainers } from 'src/app/state/trainer/trainer.selector';
import { loadTrainers } from 'src/app/state/trainer/trainer.actions';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Admin-assigned task: a trainer coaching a client through a description,
 * priority and date range. Rebuilt against the real backend contract
 * (TaskRequest: email + trainerId + description/priority/startDate/
 * endDate) — the previous version of this form posted the same
 * copy-pasted {name, photo, description, likes, tagIds} shape used
 * (wrongly) across several other admin "add" modals; sub-tasks are added
 * afterward from the separate Sub-tasks admin section, not nested here.
 */
@Component({
  selector: 'app-add-tasks-modal',
  templateUrl: './add-tasks-modal.component.html',
  styleUrls: ['./add-tasks-modal.component.css']
})
export class AddTasksModalComponent implements OnInit {
  onAddTaskEmit = new EventEmitter();
  addTaskForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  users: Users[] = [];
  trainers: Trainers[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private store: Store,
    public dialogRef: MatDialogRef<AddTasksModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.addTaskForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      trainerId: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['NORMAL', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });

    this.store.dispatch(loadActiveUsers());
    this.store.dispatch(loadTrainers());
    this.store.select(selectUsers).subscribe(users => this.users = users);
    this.store.select(selectTrainers).subscribe(trainers => this.trainers = trainers);
  }

  addTask(): void {
    if (this.addTaskForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.taskService.addTask({
      ...this.addTaskForm.value,
      trainerId: Number(this.addTaskForm.value.trainerId),
      subTasks: [],
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onAddTaskEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Task added successfully');
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
    this.dialogRef.close('Dialog closed without adding a task');
  }

  clear(): void {
    this.addTaskForm.reset({ priority: 'NORMAL' });
    this.invalidForm = false;
  }
}
