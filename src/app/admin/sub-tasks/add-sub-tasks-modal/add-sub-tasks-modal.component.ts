import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Tasks } from 'src/app/models/tasks.interface';
import { Exercises } from 'src/app/models/exercise.interface';
import { TaskService } from 'src/app/services/task.service';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadActiveTasks } from 'src/app/state/task/task.actions';
import { selectActiveTasks } from 'src/app/state/task/task.selectors';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { genericError } from 'src/validators/form-validators.module';

/**
 * Adds a single sub-task step to an existing task. Rebuilt against the
 * real backend contract (SubTaskRequest: taskId + name + exerciseId) — the
 * previous version posted the same copy-pasted {name, photo, description,
 * likes, tagIds} shape used (wrongly) across several other admin "add"
 * modals.
 */
@Component({
  selector: 'app-add-sub-tasks-modal',
  templateUrl: './add-sub-tasks-modal.component.html',
  styleUrls: ['./add-sub-tasks-modal.component.css']
})
export class AddSubTasksModalComponent implements OnInit {
  onAddSubTaskEmit = new EventEmitter();
  addSubTaskForm!: FormGroup;
  invalidForm = false;
  submitting = false;
  responseMessage: any;

  tasks: Tasks[] = [];
  exercises: Exercises[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private taskService: TaskService,
    private store: Store,
    public dialogRef: MatDialogRef<AddSubTasksModalComponent>,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackBarService,
  ) { }

  ngOnInit(): void {
    this.addSubTaskForm = this.formBuilder.group({
      taskId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(2)]],
      exerciseId: ['', Validators.required],
    });

    this.store.dispatch(loadActiveTasks());
    this.store.dispatch(loadActiveExercises());
    this.store.select(selectActiveTasks).subscribe(tasks => this.tasks = tasks);
    this.store.select(selectActiveExercises).subscribe(exercises => this.exercises = exercises);
  }

  addSubTask(): void {
    if (this.addSubTaskForm.invalid || this.submitting) {
      this.invalidForm = true;
      return;
    }

    this.submitting = true;
    this.ngxService.start();
    this.taskService.addSubTask({
      taskId: Number(this.addSubTaskForm.value.taskId),
      name: this.addSubTaskForm.value.name,
      exerciseId: Number(this.addSubTaskForm.value.exerciseId),
    }).subscribe({
      next: (response: any) => {
        this.ngxService.stop();
        this.submitting = false;
        this.onAddSubTaskEmit.emit();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, '');
        this.dialogRef.close('Sub-task added successfully');
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
    this.dialogRef.close('Dialog closed without adding a sub-task');
  }

  clear(): void {
    this.addSubTaskForm.reset();
    this.invalidForm = false;
  }
}
