import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { SubTasks, Tasks } from 'src/app/models/tasks.interface';
import { TodoList } from 'src/app/models/todoList.interface';
import { WorkoutAssignmentResponse } from 'src/app/models/workout.interface';

import { RxStompService } from 'src/app/services/rx-stomp.service';
import { TodoDetailsModalComponent } from 'src/app/shared/todo-details-modal/todo-details-modal.component';

import { loadClientTasks, loadTrainerTasks } from 'src/app/state/task/task.actions';
import { selectClientTasks, selectTrainerTasks } from 'src/app/state/task/task.selectors';
import { loadMyTodos } from 'src/app/state/todo/todo.actions';
import { selectMyTodos } from 'src/app/state/todo/todo.selectors';
import { loadUser } from 'src/app/state/user/user.actions';
import { selectUser } from 'src/app/state/user/user.selector';
import { loadMyAssignedWorkouts } from 'src/app/state/workout/workout.actions';
import { selectMyAssignedWorkouts } from 'src/app/state/workout/workout.selector';

/**
 * Same key MyTasksComponent writes to. Sub-step completion has no API yet
 * (see my-tasks.component.ts), so "task complete" is derived from the same
 * device-local set here — read-only, this widget never writes progress.
 */
const PROGRESS_STORAGE_KEY = 'berliz.task.subStepProgress';

type WidgetTab = 'tasks' | 'workouts' | 'todos';

@Component({
  selector: 'app-dashboard-todo-list',
  templateUrl: './dashboard-todo-list.component.html',
  styleUrls: ['./dashboard-todo-list.component.css']
})
export class DashboardTodoListComponent implements OnInit, OnDestroy {

  /**
   * The dashboard now leads with Berliz's core functionality: trainer-assigned
   * Tasks and assigned Workouts. Todos are kept as a third, lower-priority tab
   * (dashboard-main has no other todo surface), but no longer the default.
   */
  activeTab: WidgetTab = 'tasks';

  // ── TODOS (legacy tab) ───────────────────────────────────
  @Input() todoData: TodoList[] = [];

  // ── TASKS ────────────────────────────────────────────────
  role = '';
  trainerTasks: Tasks[] = [];
  clientTasks: Tasks[] = [];
  expandedTaskId: number | null = null;
  private completedSubTaskIds = new Set<number>();
  private roleResolved = false;

  // ── WORKOUTS ─────────────────────────────────────────────
  assignments: WorkoutAssignmentResponse[] = [];

  private subs: Subscription[] = [];
  wsSub!: Subscription;

  constructor(
    private store: Store,
    private rxStomp: RxStompService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.restoreProgress();

    this.subs.push(
      this.store.select(selectMyTodos).subscribe(todos => {
        if (todos) this.todoData = todos;
      }),
      this.store.select(selectTrainerTasks).subscribe(t => this.trainerTasks = t ?? []),
      this.store.select(selectClientTasks).subscribe(t => this.clientTasks = t ?? []),
      this.store.select(selectMyAssignedWorkouts).subscribe(a => this.assignments = a ?? []),
      // Role decides which task bucket is "mine" — same rule as the My Tasks page.
      this.store.select(selectUser).subscribe((user: any) => {
        if (!user) return;
        const role = (user.role ?? '').toLowerCase();
        if (this.roleResolved && role === this.role) return;
        this.role = role;
        this.roleResolved = true;
        this.reloadTasks();
      })
    );

    this.store.dispatch(loadUser());
    this.store.dispatch(loadMyAssignedWorkouts());
    this.loadTodos();
    this.initializeWebSocketListeners();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.wsSub?.unsubscribe();
  }

  // ── TABS ─────────────────────────────────────────────────

  setTab(tab: WidgetTab): void {
    this.activeTab = tab;
  }

  get heading(): string {
    if (this.activeTab === 'workouts') return 'My Workouts';
    if (this.activeTab === 'todos') return 'My Todos';
    return this.isTrainer ? 'Assigned Tasks' : 'My Tasks';
  }

  /**
   * "My assigned workouts" is now a tab inside the Tasks page, so both the
   * Tasks and Workouts CTAs land on the same route.
   */
  get viewAllLink(): string {
    return this.activeTab === 'todos' ? '/dashboard/my-todos' : '/dashboard/my-tasks';
  }

  // ══════════════════ TASKS ══════════════════

  get isTrainer(): boolean {
    return this.role === 'trainer';
  }

  /** trainerTasks = tasks I assigned; clientTasks = tasks assigned to me. */
  get tasks(): Tasks[] {
    return this.isTrainer ? this.trainerTasks : this.clientTasks;
  }

  reloadTasks(): void {
    this.store.dispatch(this.isTrainer ? loadTrainerTasks() : loadClientTasks());
  }

  get displayedTasks(): Tasks[] {
    return this.tasks.slice(0, 8);
  }

  get taskMetrics() {
    const all = this.tasks;
    return {
      total: all.length,
      active: all.filter(t => this.isTaskActive(t)).length,
      completed: all.filter(t => this.isTaskComplete(t)).length,
      overdue: all.filter(t => this.isTaskOverdue(t)).length,
    };
  }

  subSteps(task: Tasks): SubTasks[] {
    return task?.subTasks ?? [];
  }

  stepsTotal(task: Tasks): number {
    return this.subSteps(task).length;
  }

  stepsDone(task: Tasks): number {
    return this.subSteps(task).filter(s => this.completedSubTaskIds.has(s.id)).length;
  }

  isStepDone(sub: SubTasks): boolean {
    return this.completedSubTaskIds.has(sub.id);
  }

  progressPercent(task: Tasks): number {
    const total = this.stepsTotal(task);
    if (!total) return 0;
    return Math.round((this.stepsDone(task) / total) * 100);
  }

  /** Same derivation as MyTasksComponent: done once every step is ticked. */
  isTaskComplete(task: Tasks): boolean {
    const total = this.stepsTotal(task);
    return total > 0 && this.stepsDone(task) === total;
  }

  isTaskActive(task: Tasks): boolean {
    const s = (task?.status ?? '').toLowerCase();
    return s === 'true' || s === 'active' || s === 'in-progress' || s === 'pending';
  }

  isTaskOverdue(task: Tasks): boolean {
    if (!task?.endDate || this.isTaskComplete(task)) return false;
    return new Date(task.endDate).getTime() < Date.now();
  }

  taskStatusLabel(task: Tasks): string {
    if (this.isTaskComplete(task)) return 'Done';
    const s = (task?.status ?? '').toLowerCase();
    if (s === 'true') return 'Active';
    if (s === 'false') return 'Inactive';
    return s ? s.replace(/[-_]/g, ' ') : 'Unknown';
  }

  taskStatusClass(task: Tasks): string {
    if (this.isTaskComplete(task)) return 'bg-green-100 text-green-700';
    if (this.isTaskOverdue(task)) return 'bg-red-100 text-red-600';
    return this.isTaskActive(task) ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600';
  }

  taskTitle(task: Tasks): string {
    return task?.description || 'Task';
  }

  taskPerson(task: Tasks): string {
    if (this.isTrainer) {
      const name = `${task?.userFirstname ?? ''} ${task?.userLastname ?? ''}`.trim();
      return name || task?.userEmail || 'Unassigned client';
    }
    return task?.trainerName || 'Your trainer';
  }

  daysLeft(task: Tasks): number | null {
    if (!task?.endDate) return null;
    const diff = new Date(task.endDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  taskDueLabel(task: Tasks): string {
    const days = this.daysLeft(task);
    if (days === null) return 'No due date';
    if (this.isTaskOverdue(task)) return `${Math.abs(days)} day(s) overdue`;
    if (days === 0) return 'Due today';
    return `${days} day(s) left`;
  }

  /** Matches the My Tasks page: details expand inline, no modal. */
  toggleTaskExpanded(task: Tasks): void {
    this.expandedTaskId = this.expandedTaskId === task.id ? null : task.id;
  }

  isTaskExpanded(task: Tasks): boolean {
    return this.expandedTaskId === task.id;
  }

  trackByTaskId(_: number, task: Tasks): number {
    return task.id;
  }

  trackBySubTaskId(_: number, sub: SubTasks): number {
    return sub.id;
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

  // ══════════════════ WORKOUTS ══════════════════

  normalized(status: string): string {
    return (status ?? '').toUpperCase();
  }

  get workoutTodo(): WorkoutAssignmentResponse[] {
    return this.assignments.filter(a => this.normalized(a.status) === 'ASSIGNED');
  }

  get workoutInProgress(): WorkoutAssignmentResponse[] {
    return this.assignments.filter(a => this.normalized(a.status) === 'IN_PROGRESS');
  }

  get workoutCompleted(): WorkoutAssignmentResponse[] {
    return this.assignments.filter(a => this.normalized(a.status) === 'COMPLETED');
  }

  get workoutMetrics() {
    return {
      total: this.assignments.length,
      assigned: this.workoutTodo.length,
      inProgress: this.workoutInProgress.length,
      completed: this.workoutCompleted.length,
    };
  }

  get displayedWorkouts(): WorkoutAssignmentResponse[] {
    return this.assignments.slice(0, 8);
  }

  workoutName(assignment: WorkoutAssignmentResponse): string {
    return assignment.workout?.name || 'Workout';
  }

  workoutExerciseCount(assignment: WorkoutAssignmentResponse): number {
    return assignment.workout?.exercises?.length ?? 0;
  }

  workoutStatusClass(status: string): string {
    switch (this.normalized(status)) {
      case 'COMPLETED': return 'bg-green-50 text-green-700 border-green-100';
      case 'IN_PROGRESS': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  }

  workoutStatusLabel(status: string): string {
    switch (this.normalized(status)) {
      case 'COMPLETED': return 'Completed';
      case 'IN_PROGRESS': return 'In progress';
      case 'ASSIGNED': return 'Assigned';
      default: return status || 'Unknown';
    }
  }

  trackByAssignmentId(_: number, assignment: WorkoutAssignmentResponse): number {
    return assignment.id;
  }

  // ══════════════════ TODOS (legacy tab) ══════════════════

  loadTodos() {
    this.store.dispatch(loadMyTodos());
  }

  initializeWebSocketListeners() {
    this.wsSub = this.rxStomp.watch('/topic/todos').subscribe(msg => {
      const event = JSON.parse(msg.body);
      switch (event.type) {
        case 'ADD': this.todoData = [event.data, ...this.todoData]; break;
        case 'UPDATE':
        case 'STATUS': this.todoData = this.todoData.map(t => t.id === event.data.id ? event.data : t); break;
        case 'DELETE': this.todoData = this.todoData.filter(t => t.id !== event.data.id); break;
      }
    });
  }

  get overdueTodos(): TodoList[] {
    const now = Date.now();
    return this.todoData.filter(t =>
      new Date(t.dueDate).getTime() < now &&
      t.status !== 'completed' &&
      t.status !== 'cancelled'
    );
  }

  get dueSoonTodos(): TodoList[] {
    const now = Date.now();
    return this.todoData.filter(t => {
      const diff = new Date(t.dueDate).getTime() - now;
      return diff > 0 && diff <= 2 * 24 * 60 * 60 * 1000 &&
        t.status !== 'completed' && t.status !== 'cancelled';
    });
  }

  get displayedTodos(): TodoList[] {
    return this.todoData.slice(0, 12);
  }

  get metrics() {
    const total = this.todoData.length;
    const completed = this.todoData.filter(t => t.status === 'completed').length;
    const inProgress = this.todoData.filter(t => t.status === 'in-progress').length;
    const overdue = this.overdueTodos.length;
    const cancelled = this.todoData.filter(t => t.status === 'cancelled').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, overdue, cancelled, completionRate };
  }

  openTodoDetails(todo: TodoList) {
    this.dialog.open(TodoDetailsModalComponent, {
      data: todo,
      width: '550px',
      maxWidth: '95vw',
      panelClass: 'berliz-dialog'
    }).afterClosed().subscribe(result => {
      if (result) this.loadTodos();
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      'completed': 'Done',
      'in-progress': 'Active',
      'pending': 'Pending',
      'cancelled': 'Cancelled'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      'completed': 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'pending': 'bg-red-100 text-red-600',
      'cancelled': 'bg-gray-200 text-gray-600'
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
  }

  priorityClass(priority: string): string {
    const map: Record<string, string> = {
      'high': 'text-red-600',
      'normal': 'text-blue-600',
      'low': 'text-green-600'
    };
    return map[priority?.toLowerCase()] ?? 'text-gray-500';
  }

  isDueNow(todo: TodoList): boolean {
    return new Date(todo.dueDate) <= new Date();
  }

  isDueSoon(todo: TodoList): boolean {
    const diff = new Date(todo.dueDate).getTime() - Date.now();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }

  getDueColor(todo: TodoList): string {
    if (todo.status === 'completed') return 'text-green-600';
    if (todo.status === 'cancelled') return 'text-gray-400';
    if (this.isDueNow(todo)) return 'text-red-600';
    if (this.isDueSoon(todo)) return 'text-yellow-600';
    if (todo.status === 'in-progress') return 'text-blue-600';
    return 'text-gray-500';
  }

  getDueLabel(todo: TodoList): string {
    const now = new Date();
    const due = new Date(todo.dueDate);
    const diff = due.getTime() - now.getTime();
    const abs = Math.abs(diff);
    const days = Math.floor(abs / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const hours = Math.floor(abs / 3600000);
    const minutes = Math.floor(abs / 60000);
    const p = (v: number, u: string) => `${v} ${u}${v !== 1 ? 's' : ''}`;

    if (diff <= 0) {
      if (hours < 24) return 'Due today';
      if (days < 7) return `Overdue by ${p(days, 'day')}`;
      if (days < 30) return `Overdue by ${p(weeks, 'week')}`;
      return `Overdue by ${p(months, 'month')}`;
    }
    if (minutes < 60) return `Due in ${p(minutes, 'minute')}`;
    if (hours < 24) return `Due in ${p(hours, 'hour')}`;
    if (days < 7) return `Due in ${p(days, 'day')}`;
    if (days < 30) return `Due in ${p(weeks, 'week')}`;
    return `Due in ${p(months, 'month')}`;
  }
}
