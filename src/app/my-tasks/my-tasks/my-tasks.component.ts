import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import { SubTasks, Tasks } from 'src/app/models/tasks.interface';
import { loadClientTasks, loadTrainerTasks } from 'src/app/state/task/task.actions';
import {
  selectClientTasks,
  selectTaskLoading,
  selectTrainerTasks
} from 'src/app/state/task/task.selectors';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { AssignTaskModalComponent } from '../assign-task-modal/assign-task-modal.component';

/**
 * Local-only sub-step progress.
 *
 * The backend `SubTasks` entity has no `status` / `completed` field and there is
 * no `updateSubTaskStatus` endpoint (see task.service.ts). `updateStatus(id)` on
 * a Task is an activate/deactivate toggle used by the admin table, NOT a
 * completion flag, so dispatching it from here would deactivate the client's
 * task rather than complete it.
 *
 * Until the API exposes real sub-step completion, ticking a step is persisted
 * to localStorage for this browser only. Swap `toggleSubTask` over to a real
 * dispatch once the endpoint exists.
 */
const PROGRESS_STORAGE_KEY = 'berliz.task.subStepProgress';

@Component({
  selector: 'app-my-tasks',
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit, OnDestroy {

  /**
   * "Things assigned to me" now lives on one page with two tabs. The Workouts
   * tab is `MyAssignedWorkoutsComponent` embedded by selector — it owns all of
   * its own NgRx wiring in ngOnInit, so switching tabs destroys/recreates it
   * and it re-fetches on its own. No workout state is duplicated here.
   */
  activeTab: 'tasks' | 'workouts' = 'tasks';

  role = '';
  loading = false;

  trainerTasks: Tasks[] = [];
  clientTasks: Tasks[] = [];

  expandedTaskId: number | null = null;

  private completedSubTaskIds = new Set<number>();
  private roleResolved = false;
  private subs: Subscription[] = [];

  constructor(private store: Store, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.restoreProgress();

    this.subs.push(
      this.store.select(selectTrainerTasks).subscribe(t => this.trainerTasks = t ?? []),
      this.store.select(selectClientTasks).subscribe(t => this.clientTasks = t ?? []),
      this.store.select(selectTaskLoading).subscribe(l => this.loading = l),
      this.store.select(selectUser).subscribe((user: any) => {
        if (!user) return;
        const role = (user.role ?? '').toLowerCase();
        if (this.roleResolved && role === this.role) return;
        this.role = role;
        this.roleResolved = true;
        this.reload();
      })
    );

    this.store.dispatch(loadUser());
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ── TABS ────────────────────────────────────────────────────────────────
  setTab(tab: 'tasks' | 'workouts'): void {
    this.activeTab = tab;
  }

  // ── ROLE ────────────────────────────────────────────────────────────────
  get isTrainer(): boolean {
    return this.role === 'trainer';
  }

  /** trainerTasks = tasks I assigned; clientTasks = tasks assigned to me. */
  get tasks(): Tasks[] {
    return this.isTrainer ? this.trainerTasks : this.clientTasks;
  }

  reload(): void {
    this.store.dispatch(this.isTrainer ? loadTrainerTasks() : loadClientTasks());
  }

  // ── CARD EXPANSION ──────────────────────────────────────────────────────
  toggleExpanded(task: Tasks): void {
    this.expandedTaskId = this.expandedTaskId === task.id ? null : task.id;
  }

  isExpanded(task: Tasks): boolean {
    return this.expandedTaskId === task.id;
  }

  // ── SUB-STEPS ───────────────────────────────────────────────────────────
  subSteps(task: Tasks): SubTasks[] {
    return task?.subTasks ?? [];
  }

  stepsTotal(task: Tasks): number {
    return this.subSteps(task).length;
  }

  stepsDone(task: Tasks): number {
    return this.subSteps(task).filter(s => this.completedSubTaskIds.has(s.id)).length;
  }

  progressPercent(task: Tasks): number {
    const total = this.stepsTotal(task);
    if (!total) return 0;
    return Math.round((this.stepsDone(task) / total) * 100);
  }

  /**
   * Trainers see the step count only — completion lives on the client's device
   * until the API tracks it, so showing "0/5" to a trainer would be misleading.
   */
  progressLabel(task: Tasks): string {
    const total = this.stepsTotal(task);
    if (!total) return 'No steps';
    if (this.isTrainer) return `${total} step${total === 1 ? '' : 's'}`;
    return `${this.stepsDone(task)}/${total} steps done`;
  }

  isStepDone(sub: SubTasks): boolean {
    return this.completedSubTaskIds.has(sub.id);
  }

  toggleStep(sub: SubTasks, event?: Event): void {
    event?.stopPropagation();
    if (this.isTrainer) return;

    if (this.completedSubTaskIds.has(sub.id)) {
      this.completedSubTaskIds.delete(sub.id);
    } else {
      this.completedSubTaskIds.add(sub.id);
    }
    this.persistProgress();
  }

  /** Derived, local: a task reads as "done" once every step is ticked. */
  isTaskComplete(task: Tasks): boolean {
    const total = this.stepsTotal(task);
    return total > 0 && this.stepsDone(task) === total;
  }

  private restoreProgress(): void {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return;
      const ids = JSON.parse(raw);
      if (Array.isArray(ids)) this.completedSubTaskIds = new Set<number>(ids);
    } catch {
      this.completedSubTaskIds = new Set<number>();
    }
  }

  private persistProgress(): void {
    try {
      localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify(Array.from(this.completedSubTaskIds))
      );
    } catch {
      // storage unavailable (private mode) — progress stays in memory only
    }
  }

  // ── DISPLAY HELPERS ─────────────────────────────────────────────────────
  clientName(task: Tasks): string {
    const name = `${task?.userFirstname ?? ''} ${task?.userLastname ?? ''}`.trim();
    return name || task?.userEmail || 'Unassigned client';
  }

  priorityKey(task: Tasks): 'high' | 'medium' | 'low' | 'none' {
    const p = (task?.priority ?? '').toLowerCase();
    if (p === 'high' || p === 'urgent' || p === 'critical') return 'high';
    if (p === 'medium' || p === 'normal' || p === 'moderate') return 'medium';
    if (p === 'low') return 'low';
    return 'none';
  }

  priorityLabel(task: Tasks): string {
    return task?.priority ? task.priority.toLowerCase() : 'unset';
  }

  /**
   * `status` is stringly-typed on the backend: the admin table treats it as
   * 'true' / 'false' (active / inactive), but word statuses show up too.
   */
  statusLabel(task: Tasks): string {
    const s = (task?.status ?? '').toLowerCase();
    if (s === 'true') return 'Active';
    if (s === 'false') return 'Inactive';
    return s ? s.replace(/[-_]/g, ' ') : 'Unknown';
  }

  isActive(task: Tasks): boolean {
    const s = (task?.status ?? '').toLowerCase();
    return s === 'true' || s === 'active' || s === 'in-progress' || s === 'pending';
  }

  isOverdue(task: Tasks): boolean {
    if (!task?.endDate || this.isTaskComplete(task)) return false;
    return new Date(task.endDate).getTime() < Date.now();
  }

  daysLeft(task: Tasks): number | null {
    if (!task?.endDate) return null;
    const diff = new Date(task.endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  trackByTaskId(_: number, task: Tasks): number {
    return task.id;
  }

  trackBySubTaskId(_: number, sub: SubTasks): number {
    return sub.id;
  }

  // ── TRAINER: ASSIGN A NEW TASK ──────────────────────────────────────────
  openAssignTask(): void {
    const dialogRef = this.dialog.open(AssignTaskModalComponent, {
      width: '640px',
      maxWidth: '95vw',
      autoFocus: false
    });

    this.subs.push(
      dialogRef.afterClosed().subscribe(result => {
        // addTaskSuccess pushes into state.tasks, not state.trainerTasks —
        // re-fetch so this view actually shows the new task.
        if (result === 'assigned') this.reload();
      })
    );
  }
}
