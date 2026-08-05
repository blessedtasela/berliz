import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { Exercises } from 'src/app/models/exercise.interface';
import { TrainerClients } from 'src/app/models/trainers.interface';
import { SnackBarService } from 'src/app/services/snack-bar.service';
import { loadActiveExercises } from 'src/app/state/exercise/exercise.actions';
import { selectActiveExercises } from 'src/app/state/exercise/exercise.selectors';
import { addTask } from 'src/app/state/task/task.actions';
import { loadTrainerClients } from 'src/app/state/trainer/trainer.actions';
import { selectTrainerClients } from 'src/app/state/trainer/trainer.selector';

@Component({
  selector: 'app-assign-task-modal',
  templateUrl: './assign-task-modal.component.html',
  styleUrls: ['./assign-task-modal.component.css']
})
export class AssignTaskModalComponent implements OnInit, OnDestroy {

  assignTaskForm!: FormGroup;
  invalidForm = false;

  /** Trainer picks from their OWN clients, not the admin's full user list. */
  clients: TrainerClients[] = [];
  exercises: Exercises[] = [];

  readonly priorities = [
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' }
  ];

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private snackbar: SnackBarService,
    public dialogRef: MatDialogRef<AssignTaskModalComponent>
  ) { }

  ngOnInit(): void {
    this.assignTaskForm = this.fb.group({
      userId: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['MEDIUM', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      subTasks: this.fb.array([])
    });

    this.addStep();

    this.subs.push(
      this.store.select(selectTrainerClients).subscribe(c => this.clients = c ?? []),
      this.store.select(selectActiveExercises).subscribe(e => this.exercises = e ?? [])
    );

    this.store.dispatch(loadTrainerClients());
    this.store.dispatch(loadActiveExercises());
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── SUB-STEPS ───────────────────────────────────────────────────────────
  get subTasks(): FormArray {
    return this.assignTaskForm.get('subTasks') as FormArray;
  }

  addStep(): void {
    this.subTasks.push(this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      exerciseId: ['', [Validators.required]]
    }));
  }

  removeStep(index: number): void {
    if (this.subTasks.length <= 1) return;
    this.subTasks.removeAt(index);
  }

  stepGroup(index: number): FormGroup {
    return this.subTasks.at(index) as FormGroup;
  }

  // ── HELPERS ─────────────────────────────────────────────────────────────
  setPriority(value: string): void {
    this.assignTaskForm.get('priority')?.setValue(value);
  }

  isInvalid(field: string): boolean {
    const control = this.assignTaskForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched || this.invalidForm);
  }

  clientLabel(client: TrainerClients): string {
    const name = `${client.firstname ?? ''} ${client.lastname ?? ''}`.trim();
    return name || client.email || `Client #${client.id}`;
  }

  // ── SUBMIT ──────────────────────────────────────────────────────────────
  assign(): void {
    if (this.assignTaskForm.invalid) {
      this.invalidForm = true;
      this.assignTaskForm.markAllAsTouched();
      this.snackbar.openSnackBar('Please complete every field before assigning', '');
      return;
    }

    const value = this.assignTaskForm.value;

    // Payload mirrors the Tasks / SubTasks model field names. trainerId is
    // resolved server-side from the authenticated trainer (same as the other
    // /trainer* endpoints), so it is deliberately not sent here.
    const payload = {
      userId: Number(value.userId),
      description: value.description,
      priority: value.priority,
      startDate: value.startDate,
      endDate: value.endDate,
      subTasks: (value.subTasks ?? []).map((step: any) => ({
        name: step.name,
        exerciseId: Number(step.exerciseId)
      }))
    };

    this.store.dispatch(addTask({ data: payload }));

    this.snackbar.openSnackBar('Task assigned', '');
    this.dialogRef.close('assigned');
  }

  clear(): void {
    this.assignTaskForm.reset({ priority: 'MEDIUM' });
    this.subTasks.clear();
    this.addStep();
    this.invalidForm = false;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
